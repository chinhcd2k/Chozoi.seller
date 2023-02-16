import React from "react";
import {observer} from "mobx-react";
import {store as ProfileStore} from "../../../profile";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {ILineResponse, service} from "../../OrderServices";
import {notify} from "../../../../common/notify/NotifyService";
import {AboutComponent} from "../../components/AboutComponent";
import AddressBuyerComponent from "../../components/AddressBuyerComponent";
import ProductComponent from "../../components/ProductComponent";
import "../containers/DetailOrderStyle.scss";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {Moment} from "../../../../common/functions/Moment";
import {store as HomeStore} from "../../../home";
import * as Sentry from "@sentry/browser";
import CouponSeller from "./CouponSeller";
import {observable} from "mobx";

interface IProcess {
    state: 'DRAFT' | 'NEW' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'FINISHED' | 'CANCELED',
    name: string
}

interface IDetailOrderComponentProps {
    history: { push: (path: string, state?: any) => void }
    match: {
        params: {
            packageId: string,
            lineId: string
        }
    }
}

interface IDetailOrderComponentState {
    keyProcess: number,
    process: IProcess[]
}

@observer
export default class DetailOrderComponent extends React.Component<IDetailOrderComponentProps, IDetailOrderComponentState> {
    protected shopId: number = -1;
    protected packageId: number = -1;
    protected lineId: number = -1;
    private processData: IProcess[] = [
        {
            name: 'Đơn hàng mới',
            state: 'NEW'
        },
        {
            name: 'Cửa hàng xác nhận',
            state: "CONFIRMED"
        },
        {
            name: 'Chờ lấy hàng',
            state: "SHIPPING",
        },
        {
            name: 'Đang giao hàng',
            state: "SHIPPING"
        },
        {
            name: 'Đã giao hàng',
            state: "COMPLETED"
        },
        {
            name: 'Hoàn thành',
            state: "FINISHED"
        },
        {
            name: 'Kết thúc',
            state: "CANCELED"
        }
    ];
    @observable detailLine: ILineResponse | undefined;

    constructor(props: IDetailOrderComponentProps) {
        super(props);
        this.packageId = parseInt(this.props.match.params.packageId);
        this.lineId = parseInt(this.props.match.params.lineId);
        BreadcrumbsService.loadBreadcrumbs([
            {
                title: 'Quản lý đơn hàng',
                path: '/home/orders/state=all'
            },
            {
                title: '#' + this.packageId,
                path: '/home/order/package/' + this.packageId
            },
            {
                title: 'Chi tiết đơn'
            }
        ]);
        this.state = {
            keyProcess: 0,
            process: this.processData
        }
        HomeStore.menuActive = [2, 0];
    }

    async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        this.getDetailOrderLine().finally();
    }

    public async getDetailOrderLine() {
        const response = await service.getOrderLine(this.shopId, this.packageId, this.lineId);
        if (response.status === 200) {
            this.detailLine = response.body;
            this.detailLine && this.processData.splice(this.detailLine.state === "CANCELED" ? 5 : 6, 1);
            this.setState({keyProcess: Math.random()});
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('Đã có lỗi xảy ra', "error");
    }

    public getProcessWidth(): number {
        if (this.detailLine && this.detailLine.state) {
            if (this.detailLine.state === "DRAFT")
                return 1 / this.state.process.length * 100;
            else if (this.detailLine.state === "SHIPPING" && this.detailLine.shippingState !== null) {
                let index: number = -1;
                if (this.detailLine.shippingState === "READYTOPIC" || this.detailLine.shippingState === "PICKING")
                    index = this.state.process.findIndex(value => value.name === "Chờ lấy hàng");
                else if (this.detailLine.shippingState === "RECEVIED" || this.detailLine.shippingState === "SHIPPING")
                    index = this.state.process.findIndex(value => value.name === "Đang giao hàng");
                return index !== -1 ? (index < this.state.process.length - 1 ? index + 1 : index) / this.state.process.length * 100 : 0;
            } else {
                // @ts-ignore
                const index: number = this.state.process.findIndex(value => value.state === this.detailLine.state);
                return index !== -1 ? (index < this.state.process.length - 1 ? index + 1 : index) / this.state.process.length * 100 : 0;
            }
        }
        return 0;
    }

    protected getDescriptionProcess(data: any): string {
        if (this.detailLine) {
            switch (data.messageCode) {
                case "ORDER_DRAFT":
                    return "Khách hàng tạo đơn";
                case "ORDER_NEW":
                    return "Hệ thống xác nhận đơn hàng";
                case "ORDER_CONFIRM":
                    return "Cửa hàng xác nhận đơn hàng, chờ vận chuyển";
                case "ORDER_CANCELED":
                    return "Đơn hàng hủy bỏ";
                case "ORDER_CANCELED_CANCELED":
                    return "Đơn vị vận chuyển từ chối giao hàng";
                case "ORDER_CANCELED_LOST":
                    return "Đơn bị hủy do đơn vị vận chuyển làm mất hàng";
                case "ORDER_CANCELED_RETURN":
                    return "Đơn bị hủy do giao hàng thất bại. Đang trả hàng cho người bán.";
                case "ORDER_CANCELED_RECEVIE_FAILED":
                    return "Đơn hàng bị hủy do đơn vị vận chuyển không lấy được hàng";
                case "ORDER_CANCELED_SHIPPING_FAILED":
                    return "Đơn hàng bị hủy do không giao được hàng";
                case "BUYER_ORDER_CANCELED":
                    return "Đơn hàng bị hủy bởi người mua";
                case "ADMIN_ORDER_CANCELED":
                    return "Đơn hàng bị hủy bởi Admin";
                case "SELLER_ORDER_CANCELED":
                    return "Đơn hàng bị hủy bởi người bán";
                case "CHOZOI_ORDER_CANCELED":
                    return "Đơn hàng bị hủy tự động";
                case "ORDER_CANCELED_RETURNED":
                    return "Đơn hàng đã được hoàn trả cho người bán";
                case "ORDER_WAITING":
                    return "Đơn hàng đang chờ xử lý";
                case "ORDER_SHIPPING":
                    return "Thông tin đơn hàng đã được gửi cho đơn vị vận chuyển";
                case "ORDER_SHIPPINFG_PICKING":
                    return "Đơn vị vận chuyển đang đi lấy hàng";
                case "ORDER_SHIPPING_SHIPPING":
                    return "Đơn vị vận chuyển đang đi giao hàng";
                case "ORDER_SHIPPINFG_READYTOPIC":
                    return "Đơn vị vận chuyển đã tiếp nhận";
                case "ORDER_COMPLETED_SHIPPED":
                    return "Đơn vị vận chuyển đã giao";
                case "ORDER_SHIPPINFG_RECEVIED":
                    return "Đơn vị vận chuyển đã mang hàng về kho";
                case "ORDER_FINISHED":
                    return "Kết thúc đơn hàng";
                case "PAYMENT_PAID":
                    return "Gửi yêu cầu thanh toán";
                case "PAYMENT_PAID_SUCCESS":
                    return "Đơn hàng đã được thanh toán thành công";
                case "PAYMENT_PAID_CANCELED":
                    return "Hủy yêu cầu thanh toán";
                case "SHIPPING_DONE":
                    return "Đơn hàng vận chuyển đã đối soát";
                default:
                    return "null";
            }
        }
        return "null";
    }

    protected getStateOrderReturn(value: IProcess) {
        const line = this.detailLine;
        if (line) {
            if (line.state === "DRAFT" && value.state === "NEW") return true;
            else if (line.state === "SHIPPING" && line.shippingState !== null) {
                let index: number = -1;
                switch (line.shippingState) {
                    case "READYTOPIC":
                    case "PICKING":
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "Chờ lấy hàng"));
                        return index !== -1 && JSON.stringify(this.processData[index]) === JSON.stringify(value);
                    case "RECEVIED":
                    case "SHIPPING":
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "Đang giao hàng"));
                        return index !== -1 && JSON.stringify(this.processData[index]) === JSON.stringify(value);
                }
            } else
                return value.state === line.state;
        }
        return false;
    }

    protected get renderSellerShipingWithPaymentCOD(): React.ReactNode {
        if (this.detailLine && this.detailLine.shippingPartnerCode === "SELLER_EXPRESS" && this.detailLine.paymentType === "COD")
            return <div className="card detail-revenue">
                <p className="font-weight-bold m-0">
                    <a data-parent="#accordion" data-toggle="collapse" href="#collapseTwo"
                       aria-expanded="true" className="collapsed p-0"><i className="fas fa-money-check"/> Chi
                        tiết tiền thu được</a>
                    <b className="payment">{numberWithCommas(0)}</b>
                    <p style={{fontWeight: "normal"}}>(Tiền người mua thanh toán khi nhận hàng)</p>
                </p>
                <div className="collapse in" id="collapseTwo">
                    <div className="content">
                        <ul>
                            <li>Phí vận chuyển</li>
                            <li>Mã giảm giá người bán cung cấp</li>
                            <li>Mã giảm giá từ sàn</li>
                            <li className="text-info">Tổng tiền</li>
                        </ul>
                        <ul>
                            <li>{numberWithCommas(this.detailLine.shippingFee, 'đ')}</li>
                            <li>{numberWithCommas(this.detailLine.discountShop, 'đ')}</li>
                            <li>{numberWithCommas(this.detailLine.discountChozoi * -1, 'đ')}</li>
                            <li className="text-info">{numberWithCommas(this.detailLine.buyerPay, 'đ')}</li>
                        </ul>
                    </div>
                </div>
            </div>;
        else return null;
    }

    protected get renderTotalRevenueSellerShippingWithPaymentCOD(): React.ReactNode {
        if (this.detailLine && this.detailLine.shippingPartnerCode === "SELLER_EXPRESS" && this.detailLine.paymentType === "COD")
            return <div className="card">
                <div className=" d-flex justify-content-between">
                    <p className="font-weight-bold m-0">Tổng tiền thanh toán</p>
                    <span className="font-weight-bold text-info"
                          style={{paddingRight: '26px'}}>{numberWithCommas(this.detailLine.finalRevenue, 'đ')}</span>
                </div>
            </div>;
        return null;
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            if (this.detailLine) {
                return <div id="order-detail">
                    <div className="container-fluid">
                        {/*Kiện*/}
                        <div className="card" id="secction-1">
                            <AboutComponent
                                type={"normal"}
                                title="Sản phẩm"
                                createdAt={this.detailLine.createdAt}
                                state={this.detailLine.state}
                                code={this.detailLine.code}/>
                        </div>
                        {/*Mã giảm giá của Seller*/}
                        <CouponSeller detailLineStore={this.detailLine}/>
                        {/*Địa chỉ nhận hàng*/}
                        <div className="card" id="secction-2">
                            <AddressBuyerComponent
                                type={"normal"}
                                hiddenShipping={this.detailLine.state === "DRAFT"}
                                name={this.detailLine.buyerName}
                                phoneNumber={this.detailLine.buyerContactPhone}
                                state={this.detailLine.state}
                                detailAddress={this.detailLine.buyerAddress.detailAddress}
                                districtName={this.detailLine.buyerAddress.districtName}
                                wardName={this.detailLine.buyerAddress.wardName}
                                provinceName={this.detailLine.buyerAddress.provinceName}
                                shippingName={this.detailLine.shippingPartnerName !== null ? this.detailLine.shippingPartnerName : ''}
                                shippingCode={this.detailLine.shippingCode}
                            />
                        </div>
                        {/*Sản phẩm*/}
                        <div className="card product" id="secction-3">
                            <ProductComponent
                                type={"normal"}
                                productId={this.detailLine.productId}
                                history={this.props.history}
                                action={false}
                                orderLineId={this.detailLine.id}
                                state={this.detailLine.state}
                                note={''}
                                priceUnit={this.detailLine.priceUnit}
                                productImage={this.detailLine.productImage}
                                productName={this.detailLine.productName}
                                productAttributes={this.detailLine.productAttributes ? this.detailLine.productAttributes : undefined}
                                quantity={this.detailLine.quantity - this.detailLine.returnQuantity}
                                reason={''}
                                images={[]}
                                isFreeShip={this.detailLine.isFreeShip}
                            />
                        </div>
                        {/*Chi tiết doanh thu*/}
                        <div className="card detail-revenue" id="secction-4">
                            <p className="font-weight-bold m-0">
                                <a data-parent="#accordion" data-toggle="collapse" href="#collapseOne"
                                   aria-expanded="true" className="collapsed p-0"><i
                                    className="fas fa-money-check"/> Chi
                                    tiết doanh thu</a>
                                <b className="payment">{numberWithCommas(this.detailLine.revenue, 'đ')}</b>
                            </p>
                            <div className="collapse in" id="collapseOne">
                                <div className="content">
                                    <ul>
                                        <li>Phí vận chuyển chênh lệch</li>
                                        <li>Phí bảo hiểm vận chuyển</li>
                                        <li>Phí thanh toán</li>
                                        <li>Phí chiết khấu</li>
                                        <li>Phí vận chuyển</li>
                                        <li>Mã giảm giá</li>
                                        <li className="text-info">Doanh thu</li>
                                    </ul>
                                    <ul>
                                        <li>{numberWithCommas(this.detailLine.shippingExtraFee, 'đ')}</li>
                                        <li>{numberWithCommas(this.detailLine.insuranceFee, 'đ')}</li>
                                        <li>{numberWithCommas(this.detailLine.paymentFee, 'đ')}</li>
                                        <li>{numberWithCommas(this.detailLine.commissionCateFee, 'đ')}</li>
                                        <li>{numberWithCommas(this.detailLine.shippingFee, 'đ')}</li>
                                        <li>{numberWithCommas(this.detailLine.discountShop, 'đ')}</li>
                                        <li className="text-info">{numberWithCommas(this.detailLine.revenue, 'đ')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/*Chi tiết tiền thu được*/}
                        {this.renderSellerShipingWithPaymentCOD}
                        {/*Tổng tiền thanh toán*/}
                        {this.renderTotalRevenueSellerShippingWithPaymentCOD}
                        {/*Tiến trình*/}
                        <div className="card process" id="secction-5">
                            <p className="title font-weight-bold m-0"><i className="fas fa-clock"/> Tiến trình</p>
                            <hr/>
                            <div className="wz-heading wz-w-label progress-line" key={this.state.keyProcess}>
                                <div className="progress progress-xs">
                                    <div style={{
                                        width: `${this.getProcessWidth()}%`,
                                        margin: `0px ${100 / this.state.process.length / 2}%`
                                    }}
                                         className="progress-bar"/>
                                </div>
                                <ul className="wz-steps wz-icon-bw wz-nav-off text-lg w-100">
                                    {this.state.process.map((value, index: number) =>
                                        <li key={index} style={{width: `${100 / this.state.process.length}%`}}
                                            className={`float-left ${this.getStateOrderReturn(value) ? 'active' : ''}`}>
                                            <a>
					                                <span
                                                        className="icon-wrap icon-wrap-xs icon-circle mar-ver">
					                                    <span className="wz-icon icon-txt text-bold">{++index}</span>
					                                </span>
                                                <small className="wz-desc box-block text-semibold">{value.name}</small>
                                            </a>
                                        </li>)}
                                </ul>
                            </div>
                            <div className="content" style={{margin: `0 ${100 / this.state.process.length / 2}%`}}>
                                < div className="collapse" id="about" aria-expanded="false">
                                    {this.detailLine.timeLine && Array.isArray(this.detailLine.timeLine) &&
                                    <ul>
                                        {this.detailLine.timeLine.map((value, index: number) =>
                                            <li key={index}>
                                            <span
                                                className="font-weight-bold">{Moment.getDate(value.createdAt, 'dd/mm/yyyy')} {Moment.getTime(value.createdAt, 'hh:mm:ss')}</span>
                                                <span
                                                    className="ml-5">{this.getDescriptionProcess(value)}</span>
                                            </li>)}
                                    </ul>}
                                </div>
                                <div className="w-100 d-flex justify-content-center">
                                    <a href="#about" data-toggle="collapse" aria-expanded="false"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>;
            } else return null;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }
}
