import React from "react";
import * as Sentry from "@sentry/browser";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {store as ProfileStore} from "../../../profile";
import "../containers/DetailStyle.scss";
import {service, ITimeLine, IDetailOrderReturnLineResponse} from "../../OrderServices";
import OrderReturnStore, {store} from "../store/OrderReturnStore";
import {observer} from "mobx-react";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {AboutComponent} from "../../components/AboutComponent";
import AddressBuyerComponent from "../../components/AddressBuyerComponent";
import ProductComponent from "../../components/ProductComponent";
import {DGetProfile} from "../../../../common/decorators/Auth";
import {Moment} from "../../../../common/functions/Moment";
import {store as HomeStore} from "../../../home";

interface IProcess {
    state: 'DRAFT' | 'NEW' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELED' | 'WAIT_REFUND' | 'FINISHED',
    name: string,
}

interface IDetailComponentProps {
    history: {
        goBack: () => void
    }
    match: {
        params: {
            packageId: string,
            lineId: string
        }
    }
}

interface IDetailComponentState {
    process: IProcess[],
    disableSubmit: boolean,
    keyProcess: number
}

@observer
export default class DetailOrderReturnComponent extends React.Component<IDetailComponentProps, IDetailComponentState> {
    protected packageId: number = -1;
    protected lineId: number = -1;
    protected shopId: number = -1;
    public store: OrderReturnStore = new OrderReturnStore();
    private processData: IProcess[] = [
        {
            state: 'DRAFT',
            name: 'Yêu cầu xử lý'
        },
        {
            state: 'NEW',
            name: ''
        },
        {
            name: 'Xác nhận trả hàng hoàn tiền',
            state: 'CONFIRMED'
        },
        {
            name: 'Người mua chuẩn bị hàng',
            state: 'SHIPPING'
        },
        {
            name: 'ĐVVC đang giao',
            state: 'SHIPPING'
        },
        {
            name: 'ĐVVC đã giao',
            state: 'COMPLETED'
        },
        {
            name: 'Chờ thanh toán',
            state: 'WAIT_REFUND'
        },
        {
            name: 'Hoàn thành',
            state: 'FINISHED'
        },
        {
            name: 'Kết thúc',
            state: 'CANCELED'
        },
    ];

    constructor(props: IDetailComponentProps) {
        super(props);
        HomeStore.menuActive = [2, 1];
        this.packageId = parseInt(this.props.match.params.packageId);
        this.lineId = parseInt(this.props.match.params.lineId);
        const breadcrumbs = [
            {
                title: 'Quản lý đơn hàng hoàn trả',
                path: '/home/order-return/state=request'
            },
            {
                title: '#' + this.packageId,
                path: '/home/order-return/package/' + this.packageId
            },
            {
                title: 'Chi tiết đơn'
            }
        ];
        isNaN(this.packageId) && breadcrumbs.splice(1, 1);
        BreadcrumbsService.loadBreadcrumbs(breadcrumbs);
        this.state = {
            process: this.processData,
            disableSubmit: false,
            keyProcess: Math.random()
        };
    }

    @DGetProfile
    async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        const response = await service.getDetailLine(this.shopId, this.packageId, this.lineId);
        if (response.status === 200) {
            response.body && (this.store.detailOrderLine = response.body);
        }
        const line = this.store.detailOrderLine;
        if (line) {
            if (line.shopOrderReturn.returnType === null) {
                this.processData = this.processData.reduce((previousValue: IProcess[], currentValue) => {
                    if (currentValue.state !== "NEW" && currentValue.state !== "CANCELED")
                        previousValue.push(currentValue);
                    return previousValue;
                }, []);
            }
            //
            else if (line.shopOrderReturn.returnType === "CHOZOI_VIA_RETURN") {
                this.processData = this.processData.reduce((previousValue: IProcess[], currentValue) => {
                    if (currentValue.state !== "NEW" && currentValue.state !== "CANCELED")
                        previousValue.push(currentValue);
                    return previousValue;
                }, []);
            }
            //
            else if (line.shopOrderReturn.returnType === "RETURN_NOT_RECEVIE") {
                this.processData = this.processData.reduce((previousValue: IProcess[], currentValue) => {
                    if (currentValue.state === "DRAFT" || currentValue.state === "WAIT_REFUND" || currentValue.state === "FINISHED")
                        previousValue.push(currentValue);
                    return previousValue;
                }, []);
            }
            //
            else if (line.shopOrderReturn.returnType === "CHOZOI_ARBITRATION") {
                const state_NEW = line.timeLines.findIndex(value => value.state === "NEW");
                this.processData = this.processData.reduce((previousValue: IProcess[], currentValue) => {
                    if (state_NEW !== -1) {
                        if (currentValue.state !== "NEW" && currentValue.state !== "CANCELED")
                            previousValue.push(currentValue);
                    } else if (currentValue.state === "DRAFT" || currentValue.state === "CANCELED")
                        previousValue.push(currentValue);
                    return previousValue;
                }, []);
            }
            this.setState({
                process: this.processData,
                keyProcess: Math.random()
            });
        }
    }

    public async getListShipping() {
        const response = await service.getListShipping();
        response.status === 200 && (store.listShipping = response.body.shippingPartners);
    };

    public getProcessWidth(): number {
        const line = this.store.detailOrderLine as IDetailOrderReturnLineResponse;
        const shippingState = line.shopOrderReturn.shippingState;
        if (line) {
            if (line.state === "SHIPPING" && shippingState !== null) {
                let index: number = -1;
                switch (line.shopOrderReturn.shippingState) {
                    case "READYTOPIC":
                    case "PICKING":
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "Người mua chuẩn bị hàng"));
                        break;
                    case "RECEVIED":
                    case "SHIPPING":
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "ĐVVC đang giao"));
                        break;
                }
                if (index !== -1)
                    return (index < this.state.process.length - 1 ? index + 1 : index) / this.state.process.length * 100;
            } else {
                const index: number = this.processData.findIndex(value => value.state === line.state || (line.state === "NEW" && value.state === "CONFIRMED"));
                if (index !== -1)
                    return (index < this.state.process.length - 1 ? index + 1 : index) / this.state.process.length * 100;
            }
        }
        return 0;
    }

    protected getDescriptionProcess(data: ITimeLine) {
        if (this.store.detailOrderLine) {
            if (data.state === "DRAFT") return "Yêu cầu trả hàng hoàn tiền";
            else if (data.state === "NEW") return "Cửa hàng từ chối yêu cầu trả hàng hoàn tiền";
            else if (data.state === "CONFIRMED") {
                const state_NEW = this.store.detailOrderLine.timeLines.findIndex(value => value.state === "NEW");
                return state_NEW !== -1 ? 'Đơn hàng được Chozoi quyết định đồng ý hoàn trả' : "Cửa hàng đồng ý yêu cầu trả hàng hoàn tiền";
            } else if (data.state === "SHIPPING") {
                switch (data.shippingState) {
                    case null:
                        return "Thông tin đơn hàng đã được gửi cho đơn vị vận chuyển";
                    case "READYTOPIC":
                        return "Đơn vị vận chuyển đã tiếp nhận";
                    case "PICKING":
                        return "Đơn vị vận chuyển đang đi lấy hàng";
                    case "RECEVIED":
                        return "Đơn vị vận chuyển đã lấy hàng";
                    case "SHIPPING":
                        return "Đơn vị vận chuyển đang giao hàng";
                    case "CANCELED":
                        return "Đơn vị vận chuyển tự chối nhận hàng";
                    case "RETURN":
                        return "Giao hàng thất bại,đang trả hàng cho người bán";
                    case "RETURNED":
                        return "Đã trả lại hàng cho người bán";
                    case "LOST":
                        return "Đơn vị vận chuyển làm mất hàng"
                }
            } else if (data.state === "COMPLETED") return "Giao hàng thành công";
            else if (data.state === "WAIT_REFUND") {
                if (!data.shippingState) return "Chờ hoàn tiền.";
                else if (data.shippingState === "RETURNED")
                    return "Đã trả lại hàng cho người gửi. Chờ hoàn tiền.";
                else if (data.shippingState === "LOST")
                    return "Làm mất hàng chờ hoàn tiền.";
                else if (data.shippingState === "SHIPPED")
                    return "Giao hành thành công chờ hoàn tiền.";
            } else if (data.state === "FINISHED") return "Đơn hàng hoàn thành";
            else if (data.state === "CANCELED") {
                if (data.actor === 'BUYER') return "Người dùng hủy yêu cầu trả hàng hoàn tiền";
                else if (data.actor === 'SELLER') return "Cửa hàng từ chối yêu cầu trả hàng hoàn tiền";
                else if (data.actor === 'CHOZOI') return "Đơn hàng bị hủy";
                else if (data.actor === 'ADMIN') return "Đơn bị hủy do Admin";
                else switch (data.shippingState) {
                        case "RETURN":
                            return "Giao hàng thất bại.";
                        case "RETURNED":
                            return "Đã trả lại hàng cho người mua.";
                        case "LOST":
                            return "Đơn vị vận chuyển làm mất hàng.";
                        case "CANCELED":
                            return "Đơn vị vận chuyển tự chối nhận hàng. Yêu cầu hoàn trả bị hủy.";
                    }
            }
        }
        return "null";
    }

    protected getStateOrderReturn(value: IProcess): boolean {
        const line = this.store.detailOrderLine;
        if (line) {
            if (line.state === "SHIPPING") {
                let index: number = -1;
                switch (line.shopOrderReturn.shippingState) {
                    case "READYTOPIC":
                    case "PICKING":
                    case null:
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "Người mua chuẩn bị hàng"));
                        return index !== -1 && JSON.stringify(this.processData[index]) === JSON.stringify(value);
                    case "RECEVIED":
                    case "SHIPPING":
                        index = this.processData.findIndex(value1 => (value1.state === "SHIPPING" && value1.name === "ĐVVC đang giao"));
                        return index !== -1 && JSON.stringify(this.processData[index]) === JSON.stringify(value);
                }
            } else {
                return value.state === line.state || (line.state === "NEW" && value.state === "CONFIRMED");
            }
        }
        return false;
    }

    protected getDiscountSellerCoupon(): number {
        let discount = 0;
        const data = this.store.detailOrderLine;
        if (data && Array.isArray(data.orderLine.discounts))
            data.orderLine.discounts.map(value => {
                if (value.providedBy === "SELLER") discount += (value.discountAmountUnit * data.quantity);
                return null;
            })
        return discount;
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            if (this.store.detailOrderLine) {
                return <div id="order-return-detail">
                    {this.store.detailOrderLine && <div className="container-fluid">
                        {/*Sản phẩm*/}
                        <div className="card" id="secction-1">
                            <AboutComponent
                                type={"return"}
                                title="Sản phẩm"
                                createdAt={this.store.detailOrderLine.createdAt}
                                state={this.store.detailOrderLine.state}
                                packageId={this.store.detailOrderLine.shopOrderReturn.shopOrderId}
                                code={this.store.detailOrderLine.productName}/>
                        </div>
                        {/*Địa chỉ nhận hàng*/}
                        <div className="card" id="secction-2">
                            <AddressBuyerComponent
                                type={"return"}
                                state={this.store.detailOrderLine.state}
                                detailAddress={this.store.detailOrderLine.shopOrderReturn.buyerContactAddress.detailAddress}
                                districtName={this.store.detailOrderLine.shopOrderReturn.buyerContactAddress.districtName}
                                wardName={this.store.detailOrderLine.shopOrderReturn.buyerContactAddress.wardName}
                                provinceName={this.store.detailOrderLine.shopOrderReturn.buyerContactAddress.provinceName}
                                listShipping={store.listShipping}
                                hiddenShipping={this.store.detailOrderLine.state === "DRAFT"}
                                name={this.store.detailOrderLine.shopOrderReturn.buyerContactName}
                                phoneNumber={this.store.detailOrderLine.shopOrderReturn.buyerContactPhone}
                                shippingName={this.store.detailOrderLine.shopOrderReturn.shippingPartner ? this.store.detailOrderLine.shopOrderReturn.shippingPartner.name : ''}
                                shippingCode={this.store.detailOrderLine.shopOrderReturn.shippingCode ? this.store.detailOrderLine.shopOrderReturn.shippingCode : ''}
                            />
                        </div>
                        {/*Thông tin người mua*/}
                        <div className="card">
                            <div className="d-flex justify-content-between align-items-center">
                                <p><i
                                    className="fas fa-user-circle"/> {this.store.detailOrderLine.shopOrderReturn.buyerContactName}
                                </p>
                                <button className="btn btn-default"><i className="fas fa-comment"/> Chat ngay</button>
                            </div>
                        </div>
                        {/*Sản phẩm*/}
                        <div className="card product">
                            <ProductComponent
                                type={"return"}
                                orderLineId={this.store.detailOrderLine.id}
                                state={this.store.detailOrderLine.state}
                                note={this.store.detailOrderLine.shopOrderReturn.note}
                                priceUnit={this.store.detailOrderLine.priceUnit}
                                productImage={this.store.detailOrderLine.productImage}
                                productName={this.store.detailOrderLine.productName}
                                quantity={this.store.detailOrderLine.quantity}
                                reason={this.store.detailOrderLine.shopOrderReturn.reason}
                                productAttributes={this.store.detailOrderLine.productAttributes ? this.store.detailOrderLine.productAttributes : undefined}
                                images={this.store.detailOrderLine.images}
                                isFreeShip={false}
                            />
                        </div>
                        {/*Chi tiết doanh thu*/}
                        <div className="card" id="detail-revenue">
                            <p className="font-weight-bold m-0">
                                <a data-parent="#accordion" data-toggle="collapse" href="#collapseOne"
                                   aria-expanded="true" className="collapsed p-0"><i
                                    className="fas fa-money-check"/> Chi
                                    tiết doanh thu (đơn đi)</a>
                                <b className="payment">{numberWithCommas(this.getRevenue(), 'đ')}</b>
                            </p>
                            <div className="collapse in" id="collapseOne">
                                <div className="content">
                                    <ul>
                                        <li>Thành tiền</li>
                                        <li>Phí giao dịch</li>
                                        {this.store.detailOrderLine.orderLine.isFreeShip && <li>Phí vận chuyển</li>}
                                        <li>Phí chênh lệch vận chuyển</li>
                                        <li>Phí bảo hiểm vận chuyển</li>
                                        <li>Phí chiết khấu</li>
                                        <li>Phí thanh toán</li>
                                        {this.getDiscountSellerCoupon() > 0 && <li>Mã giảm giá người bán cung cấp</li>}
                                        <li>Doanh thu</li>
                                    </ul>
                                    <ul>
                                        <li>{numberWithCommas(this.getIntoMoney(), 'đ')}</li>
                                        <li/>
                                        {this.store.detailOrderLine.orderLine.isFreeShip && <li>-{numberWithCommas(this.getShippingFee('order'), 'đ')}</li>}
                                        <li>{numberWithCommas(-this.getShippingExtraFee(), 'đ')}</li>
                                        <li>{numberWithCommas(-this.getInsuranceFee(), 'đ')}</li>
                                        <li>{numberWithCommas(-this.getCommissionCateFee(), 'đ')}</li>
                                        <li>{numberWithCommas(-this.getPaymentFee(), 'đ')}</li>
                                        {this.getDiscountSellerCoupon() > 0 && <li>{numberWithCommas(-this.getDiscountSellerCoupon(), 'đ')}</li>}
                                        <li>{numberWithCommas(this.getRevenue(), 'đ')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/*Số tiền hoàn trả tạm tính*/}
                        <div className="card" id="detail-revenue-temp">
                            <p className="font-weight-bold m-0">
                                <a data-parent="#accordion" data-toggle="collapse" href="#collapseTow"
                                   aria-expanded="false" className="collapsed pl-4">Số tiền hoàn trả tạm tính</a>
                                <b className="payment">-{numberWithCommas(this.getRevenue('return'), 'đ')}</b>
                            </p>
                            <div className="collapse" id="collapseTow">
                                <div className="content">
                                    <ul>
                                        <li>Thành tiền</li>
                                        <li>Phí giao dịch</li>
                                        <li>Phí chiết khấu</li>
                                        {!this.store.detailOrderLine.orderLine.isFreeShip && <li>Phí vận chuyển (đơn gốc)</li>}
                                        <li>Phí vận chuyển (tạm tính)</li>
                                        <li>Phí bảo hiểm vận chuyển</li>
                                        {this.getDiscountSellerCoupon() > 0 && <li>Mã giảm giá người bán cung cấp</li>}
                                        <li>Doanh thu</li>
                                    </ul>
                                    <ul>
                                        <li>-{numberWithCommas(this.getIntoMoney(), 'đ')}</li>
                                        <li/>
                                        <li>+{numberWithCommas(this.getCommissionCateFee('order'), 'đ')}</li>
                                        {!this.store.detailOrderLine.orderLine.isFreeShip && <li>-{numberWithCommas(this.getShippingFee('order'), 'đ')}</li>}
                                        <li>-{numberWithCommas(this.getShippingFee('return'), 'đ')}</li>
                                        <li>-{numberWithCommas(this.getInsuranceFee('return'), 'đ')}</li>
                                        {this.getDiscountSellerCoupon() > 0 && <li>+{numberWithCommas(this.getDiscountSellerCoupon(), 'đ')}</li>}
                                        <li>-{numberWithCommas(this.getRevenue('return'), 'đ')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/*Thanh toán*/}
                        <div className="card">
                            <div className="d-flex justify-content-between">
                                <p className="title font-weight-bold m-0 pl-4">Thanh toán</p>
                                <p className="font-weight-bold m-0">{numberWithCommas(this.store.detailOrderLine ? this.store.detailOrderLine.finalRevenue : 0, 'đ')}</p>
                            </div>
                        </div>
                        {/*Tiến trình*/}
                        {Array.isArray(this.store.detailOrderLine.timeLines) && <div className="card" id="process">
                            <p className="title font-weight-bold m-0"><i className="fas fa-clock"/> Tiến trình</p>
                            <hr/>
                            <div className="wz-heading wz-w-label progress-line" key={this.state.keyProcess}>
                                <div className="progress progress-xs">
                                    <div style={{
                                        width: `${this.getProcessWidth()}%`,
                                        margin: `0px ${100 / this.state.process.length / 2}%`
                                    }}
                                         className="progress-bar progress-bar-dark"/>
                                </div>
                                <ul className="wz-steps wz-icon-bw wz-nav-off text-lg w-100">
                                    {this.state.process.map((value, index: number) =>
                                        <li key={index} style={{width: `${100 / this.state.process.length}%`}}
                                            className={`float-left ${this.getStateOrderReturn(value) ? 'active' : ''}`}>
                                            <a>
					                                <span
                                                        className="icon-wrap icon-wrap-xs icon-circle bg-dark mar-ver">
					                                    <span className="wz-icon icon-txt text-bold">{++index}</span>
					                                </span>
                                                <small className="wz-desc box-block text-semibold">{value.name}</small>
                                            </a>
                                        </li>)}
                                </ul>
                            </div>
                            <div className="content" style={{margin: `0 ${100 / this.state.process.length / 2}%`}}>
                                < div className="collapse" id="about" aria-expanded="false">
                                    {Array.isArray(this.store.detailOrderLine.timeLines) && this.store.detailOrderLine.timeLines.length > 0 && <ul>
                                        {this.store.detailOrderLine.timeLines.map((value, index) =>
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
                        </div>}
                    </div>}
                </div>
            } else return null;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return "Render error!";
        }
    }

    // Thành tiền
    public getIntoMoney(): number {
        return this.store.detailOrderLine ? this.store.detailOrderLine.priceUnit * this.store.detailOrderLine.quantity : 0;
    }

    // Phí chênh lệch vận chuyển
    public getShippingExtraFee(): number {
        return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.shippingExtraFeeTotal : 0;
    }

    // Phí bảo hiểm vận chuyển
    public getInsuranceFee(type: 'order' | 'return' = "order"): number {
        if (type === "order")
            return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.insuranceFeeTotal : 0;
        else
            return this.store.detailOrderLine ? this.store.detailOrderLine.insuranceFeeTotal : 0;
    }

    // Phí chiết khấu
    public getCommissionCateFee(type: 'order' | 'return' = 'order'): number {
        if (type === "order")
            return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.commissionCateFeeTotal : 0;
        else
            return this.store.detailOrderLine ? this.store.detailOrderLine.commissionCateFeeTotal : 0;
    }

    // Phí thanh toán
    public getPaymentFee(): number {
        return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.paymentFeeTotal : 0;
    }

    // Phí giao dịch
    public getTransactionFee(type: 'order' | 'return' = 'order'): number {
        if (type === "order")
            return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.totalFee : 0;
        else
            return this.store.detailOrderLine ? this.store.detailOrderLine.totalFee : 0;
    }

    // Doanh thu
    public getRevenue(type: 'order' | 'return' = 'order'): number {
        if (type === 'order')
            return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.revenue : 0;
        else
            return this.store.detailOrderLine ? this.store.detailOrderLine.revenue : 0;
    }

    // Phí vận chuyển
    public getShippingFee(type: 'order' | 'return' = 'order'): number {
        if (type === "order")
            return this.store.detailOrderLine ? this.store.detailOrderLine.orderLine.shippingFeeTotal : 0;
        else if (type === "return")
            return this.store.detailOrderLine ? this.store.detailOrderLine.shippingFeeTotal : 0;
        else
            return this.store.detailOrderLine ? this.store.detailOrderLine.shippingFeeTotal : 0;
    }
}
