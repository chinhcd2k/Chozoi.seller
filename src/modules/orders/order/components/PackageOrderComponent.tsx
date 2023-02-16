import React from "react";
import {observer} from "mobx-react";
import {store as ProfileStore} from "../../../profile";
import {store as HomeStore} from "../../../home";
import {IPackageOrderResponse, IRequestChangeStateSellerShipping, service} from "../../OrderServices";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {AboutComponent} from "../../components/AboutComponent";
import AddressBuyerComponent from "../../components/AddressBuyerComponent";
import ProductComponent from "../../components/ProductComponent";
import * as Sentry from "@sentry/browser";
import {notify} from "../../../../common/notify/NotifyService";
import "../containers/PackageOrderStyle.scss";
import $ from "jquery";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import ReactToPrint from "react-to-print";
import OrderPrintComponent, {IPrintData} from "../../components/OrderPrintComponent";
import PopupShipping from "./PopupShipping";
import {observable} from "mobx";
import ReviewBuyer from "./ReviewBuyer";
import {IResProfile} from "../../../../api/auth/interfaces/response";

interface IPackageOrderComponentProps {
    history: { push: (path: string, state?: any) => void },
    match: {
        params: {
            id: string
        }
    }
}

interface IPackageOrderComponentState {
    note: string,
    reason: "Hết hàng" | "Người bán tự giao hàng" | "Không thể liên lạc với người mua" | "Người mua đặt trùng đơn" | "Khác" | "",
    reasons: string[],
    orderPrint: IPrintData | null
}

@observer
export default class PackageOrderComponent extends React.Component<IPackageOrderComponentProps, IPackageOrderComponentState> {
    private shopId: number = -1;
    private packageId: number = -1;
    public componentRef: any;
    private PopupShipingRef = React.createRef<PopupShipping>();
    @observable detailPackage: IPackageOrderResponse | undefined;

    constructor(props: IPackageOrderComponentProps) {
        super(props);
        HomeStore.menuActive = [2, 0];
        this.state = {
            note: '',
            reason: "",
            reasons: [
                "Hết hàng",
                "Người bán tự giao hàng",
                "Không thể liên lạc với người mua",
                "Người mua đặt trùng đơn",
                "Khác"
            ],
            orderPrint: null
        };
        /*Bind*/
        this.handlerActionOrder = this.handlerActionOrder.bind(this);
        this.showReviewPrint = this.showReviewPrint.bind(this);
    }

    async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        this.packageId = parseInt(this.props.match.params.id);
        this.getPackageOrder().finally();
        BreadcrumbsService.loadBreadcrumbs([{
            path: '/home/orders/state=all',
            title: 'Quản lý đơn hàng'
        }, {title: 'Chi tiết kiện'}]);
    }

    private async getPackageOrder() {
        const response = await service.getOrderDetail(this.shopId, this.packageId);
        if (response.status === 200 && response.body.shopOrder) {
            this.detailPackage = response.body.shopOrder;
            const getPreventState = () => {
                if (this.detailPackage)
                    switch (this.detailPackage.state) {
                        case "NEW":
                        case "CONFIRMED":
                            return "processing";
                        case "SHIPPING":
                        case "COMPLETED":
                            return "shipping";
                        case "FINISHED":
                            return "finished";
                        case "CANCELED":
                            return "canceled";
                    }
                return "all";
            };
            BreadcrumbsService.loadBreadcrumbs([{
                path: `/home/orders/state=${getPreventState()}`,
                title: 'Quản lý đơn hàng'
            }, {title: 'Chi tiết kiện'}]);
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('Đã có lỗi xảy ra', "error");
    }

    public handlerActionOrder(type: 'CONFIRMED' | 'CANCELED') {
        $(`div#order-package .modal#${type.toLowerCase()}`
        ).modal({show: true, backdrop: 'static'});
    }

    protected async handleUpdateState(state: 'CONFIRMED' | 'CANCELED') {
        const data: { action: 'CONFIRMED' | 'CANCELED', note: string } = {action: state, note: this.state.note};
        state === "CANCELED" && (data.note = this.state.reason === "Khác" ? this.state.note : this.state.reason);
        const response = await service.updateOrderState(this.shopId, this.packageId, data);
        if (response.status === 200) {
            this.detailPackage && (this.detailPackage.state = state);
            notify.show('Thao tác thành công', 'success');
            this.setState({
                note: '',
                reason: ''
            });
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('Đã có lỗi xảy ra', "error");
    }

    private async showReviewPrint() {
        const response = await service.getOrderDetailPrint(this.shopId, this.packageId);
        if (response.status === 200) {
            let orderDetail = response.body;
            if (orderDetail) {
                this.setState({
                    orderPrint: orderDetail,
                });
                $('#order-package .modal#delivery').modal('show');
            }
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('Đã có lỗi xảy ra', "error");
    }

    protected showPopupSellerShiping(value: 'SHIPPING' | 'SHIPPED' | 'CANCELED') {
        const detailData = this.detailPackage as IPackageOrderResponse;
        if (value === "SHIPPING" || value === "CANCELED")
            (this.PopupShipingRef.current as PopupShipping).show(value);
        else if (detailData.shippingProof)
            (this.PopupShipingRef.current as PopupShipping).show(
                value,
                detailData.shippingProof.agencyName,
                detailData.shippingProof.shippingCode
            );
    }

    protected async handlerOnSellerShippingAction(data: { state: 'SHIPPING' | 'SHIPPED' | 'CANCELED', agencyName?: string, shippingCode?: string | null, proofImages?: string[] }) {
        const request_body: IRequestChangeStateSellerShipping = {} as IRequestChangeStateSellerShipping;
        Object.assign(request_body, data);
        request_body.orderCode = (this.detailPackage as IPackageOrderResponse).code;
        const response = await service.changeStateSellerShiping((ProfileStore.profile as IResProfile).shopId as number, (this.detailPackage as IPackageOrderResponse).id, request_body);
        if (response.status < 300) {
            notify.show('Thao tác thục hiện thành công', "success");
            this.getPackageOrder().finally();
            (this.PopupShipingRef.current as PopupShipping).hidden();
        } else service.pushNotificationRequestError(response);
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return <div id="order-package">
                {this.detailPackage && <div className="container-fluid">
                    {/*Kiện*/}
                    <div className="card" id="secction-1">
                        <AboutComponent
                            type={"normal"}
                            emitActionOrder={this.handlerActionOrder}
                            title="Kiện hàng"
                            createdAt={this.detailPackage.createdAt}
                            state={this.detailPackage.state}
                            code={this.detailPackage.code}
                            sellerShipping={this.detailPackage.shippingPartnerCode === "SELLER_EXPRESS"}
                            emitActionSellerShipping={state => this.showPopupSellerShiping(state)}
                        />
                    </div>
                    {/*Đánh giá người mua*/}
                    <div className="card mt-3 px-0" id="review-buyer"><ReviewBuyer data={this.detailPackage}/></div>
                    {/*Địa chỉ nhận hàng*/}
                    <div className="card" id="secction-2">
                        <AddressBuyerComponent
                            type={"normal"}
                            hiddenShipping={this.detailPackage.state === "DRAFT"}
                            name={this.detailPackage.order.buyerContactName}
                            phoneNumber={this.detailPackage.order.buyerContactPhone}
                            state={this.detailPackage.state}
                            detailAddress={this.detailPackage.order.buyerContactAddress.detailAddress}
                            districtName={this.detailPackage.order.buyerContactAddress.districtName}
                            wardName={this.detailPackage.order.buyerContactAddress.wardName}
                            provinceName={this.detailPackage.order.buyerContactAddress.provinceName}
                            shippingName={this.detailPackage.shippingPartnerName}
                            shippingCode={this.detailPackage.shippingCode}
                            note={this.getNote}
                            shippingPartnerCode={this.detailPackage.shippingPartnerCode}
                            emitPrint={!/^(CANCELED|FINISHED)$/.test(this.detailPackage.state) ? this.showReviewPrint : undefined}
                        />
                    </div>
                    {/*Sản phẩm*/}
                    {this.detailPackage.orderLines.map((value, index: number) =>
                        <div className="card product" id="secction-3" key={index}>
                            <ProductComponent
                                type={"normal"}
                                action={true}
                                history={this.props.history}
                                productId={value.productId}
                                orderLineId={value.id}
                                state={(this.detailPackage as any).state}
                                note={(this.detailPackage as any).note}
                                priceUnit={value.priceUnit}
                                productImage={value.productImage}
                                productName={value.productName}
                                productAttributes={value.productAttributes ? value.productAttributes : undefined}
                                quantity={value.quantity - value.returnQuantity}
                                isFreeShip={value.isFreeShip}
                                reason={''}
                                images={[]}
                                emitAction={(lineId => this.props.history.push(`/home/order/package/${this.packageId}/detail/${lineId}`))}
                            >
                                {value.returnQuantity > 0 && value.returns.map((value1, index1) => <tr key={index1}>
                                    <td>
                                        <img src={value.productImage} alt=""/>
                                        <div className="product-name">
                                            <p className="">{value.productName} <small
                                                className="text-warning">(Hoàn
                                                trả)</small></p>
                                            {value.productAttributes && <ul>
                                                {value.productAttributes.map((value2, index2) => <li
                                                    key={index2}>{value2.name} : {value2.value}</li>)}
                                            </ul>}
                                        </div>
                                    </td>
                                    <td>{numberWithCommas(value.priceUnit, 'đ')}</td>
                                    <td>{value1.quantity}</td>
                                    <td>{numberWithCommas(value.priceUnit * value1.quantity, 'đ')}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning float-right"
                                                onClick={() => this.props.history.push(`/home/order-return/package/${value1.shopOrderReturnId}/detail/${value1.id}`)}>Xem
                                            chi tiết
                                        </button>
                                    </td>
                                </tr>)}
                            </ProductComponent>
                        </div>)}
                </div>}
                <div className="modal fade" id="confirmed">
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thông tin lấy hàng</h5>
                                <button type="button" className="close" data-dismiss="modal"><i
                                    className="pci-cross pci-circle"/></button>
                            </div>
                            <div className="modal-body table-responsive">
                                <table className='table table-sm table-striped mb-0'>
                                    <thead>
                                    <tr className="text-center">
                                        <td>Sản phẩm</td>
                                        <td>Số lượng</td>
                                        <td>Thành tiền</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.detailPackage && this.detailPackage.orderLines.map((line, index: number) =>
                                        <tr key={index}>
                                            <td style={{verticalAlign: 'middle'}}>
                                                {line.productImage &&
                                                <img src={line.productImage} alt={line.productName} height={40}
                                                     className="mr-2"/>}
                                                {line.productName}
                                            </td>
                                            <td style={{verticalAlign: 'middle'}}
                                                className="text-center">{numberWithCommas(line.quantity)}</td>
                                            <td style={{verticalAlign: 'middle'}}
                                                className="text-center">{numberWithCommas(line.priceUnit * line.quantity)}</td>
                                        </tr>)}
                                    </tbody>
                                </table>
                                <hr className="mt-0"/>
                                <div className="row mb-4">
                                    <div className="col-md-4 text-right"><span
                                        className="text-semibold">Đơn vị vận chuyển:</span></div>
                                    <div
                                        className="col-md-8">{this.detailPackage ? this.detailPackage.shippingPartnerName : ''}</div>
                                </div>
                                <div className="row mb-4">
                                    <div className="col-md-4 text-right"><span
                                        className="text-semibold">Địa chỉ lấy hàng:</span></div>
                                    {this.detailPackage && <div className="col-md-8">
                                        <div
                                            className="shop-name text-dark text-semibold m-1">{this.detailPackage.shopContactName}</div>
                                        <div
                                            className="shop-phone text-dark m-1">{this.detailPackage.shopContactPhone}</div>
                                        <div className="shop-address text-dark m-1">
                                            {this.detailPackage.shopContactAddress.detailAddress}
                                            <span> - {this.detailPackage.shopContactAddress.wardName}</span>
                                            <span> - {this.detailPackage.shopContactAddress.districtName}</span>
                                            <span> - {this.detailPackage.shopContactAddress.provinceName}</span>
                                        </div>
                                    </div>}
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-4 text-right"><span className="text-semibold">Lưu ý:</span>
                                    </div>
                                    <div className="col-md-8">
                                        <textarea className="form-control" rows={3}
                                                  onChange={(e: any) => this.setState({note: e.currentTarget.value})}
                                                  placeholder="Nhập lưu ý cho đơn hàng"/>
                                    </div>
                                </div>
                                <p>Để tránh bị chậm trễ giao hàng thì khi bạn bấm "Xác nhận", hãy chắc chắn rằng hàng
                                    của bạn đã được đóng gói sẵn sàng để giao cho đơn vị vận chuyển</p>
                                <div className="mb-4">
                                    <button className="btn btn-primary btn-outline mr-3"
                                            data-dismiss="modal"
                                            onClick={() => this.handleUpdateState("CONFIRMED")}>Xác nhận
                                    </button>
                                    <button className="btn btn-default" data-dismiss="modal">Đóng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="canceled">
                    <div className='modal-dialog'>
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="reason">
                                    <p>Lý do hủy đơn *</p>
                                    <div className="radio">
                                        {this.state.reasons.map((item: string, index: number) =>
                                            <div key={index} className="mb-2">
                                                <input id={"reason-" + index}
                                                       onClick={(e: any) => this.setState({reason: (item as any)})}
                                                       className="magic-radio" type="radio"
                                                       name="reason"/>
                                                <label htmlFor={"reason-" + index}>{item}</label>
                                            </div>
                                        )}
                                        {this.state.reason === 'Khác' &&
                                        <textarea className="form-control" rows={3}
                                                  required={true}
                                                  placeholder="Nhập lý do hủy đơn của bạn"
                                                  onChange={(e: any) => this.setState({note: e.currentTarget.value})}/>}
                                    </div>
                                </div>
                                <div className="mb-4">Thao tác không thể phục hồi. Bạn có chắc muốn hủy đơn hàng này?
                                </div>
                                <div>
                                    <button className="btn btn-danger mr-3"
                                            data-dismiss="modal"
                                            onClick={() => this.handleUpdateState('CANCELED')}>Hủy đơn
                                    </button>
                                    <button className="btn btn-default"
                                            data-dismiss="modal">Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id='delivery'>
                    <div className='modal-dialog modal-lg'>
                        <div className="modal-content">
                            <div className="modal-body">
                                <div>
                                    <OrderPrintComponent ref={el => (this.componentRef = el)}
                                                         order={this.state.orderPrint}/>
                                    <ReactToPrint
                                        trigger={() => <button className="btn btn-sm btn-primary">In phiếu</button>}
                                        content={() => this.componentRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <PopupShipping
                    ref={this.PopupShipingRef}
                    onSubmit={data => this.handlerOnSellerShippingAction(data)}
                />
            </div>;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }

    get getNote(): { type: 'ADMIN' | 'SELLER' | 'BUYER', text: string }[] {
        const arr: { type: 'ADMIN' | 'SELLER' | 'BUYER', text: string }[] = [];
        if (this.detailPackage) {
            this.detailPackage.note && arr.push({type: 'BUYER', text: this.detailPackage.note});
            this.detailPackage.shopNote && arr.push({type: 'SELLER', text: this.detailPackage.shopNote});
            this.detailPackage.adminNote && arr.push({type: 'ADMIN', text: this.detailPackage.adminNote});
            return arr;
        } else
            return [];
    }
}
