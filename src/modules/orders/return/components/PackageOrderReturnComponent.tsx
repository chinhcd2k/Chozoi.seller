import React from "react";
import {DGetProfile} from "../../../../common/decorators/Auth";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {store as HomeStore} from "../../../home";
import {store as ProfileStore} from "../../../profile";
import {service} from "../../OrderServices";
import OrderReturnStore from "../store/OrderReturnStore";
import {observer} from "mobx-react";
import * as Sentry from "@sentry/browser";
import {AboutComponent} from "../../components/AboutComponent";
import "../containers/PackageStyle.scss";
import AddressBuyerComponent from "../../components/AddressBuyerComponent";
import ProductComponent from "../../components/ProductComponent";
import {notify} from "../../../../common/notify/NotifyService";
import {IApiResponse} from "../../../../common/services/BaseService";

interface IPackageComponentProps {
    history: {
        push: (path: string, state?: any) => void
    }
    match: {
        params: {
            id: string
        }
    }
}

interface IPackageComponentState {
    loadding: boolean
}

@observer
export default class PackageOrderReturnComponent extends React.Component<IPackageComponentProps, IPackageComponentState> {
    protected packageId: number = -1;
    protected shopId: number = -1;
    public shipping_service_id?: number;
    public store = new OrderReturnStore();

    state = {
        loadding: false
    };

    constructor(props: IPackageComponentProps) {
        super(props);
        HomeStore.menuActive = [2, 1];
    }

    @DGetProfile
    async componentDidMount() {
        this.packageId = parseInt(this.props.match.params.id);
        BreadcrumbsService.loadBreadcrumbs([{
            path: '/home/order-return/state=request',
            title: 'Quản lý đơn hàng hoàn trả'
        }, {title: 'Chi tiết kiện'}]);
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        await this.getDetailPackage();
        this.store.detailPackage && (this.packageId = this.store.detailPackage.id);
        this.store.detailPackage && this.store.detailPackage.state === "DRAFT" && await this.getShippingFee();
    }

    private async getDetailPackage() {
        const response = await service.getDetailPackage(this.shopId, this.packageId);
        if (response.status === 200 && response.body.data) {
            this.store.detailPackage = response.body.data;
            BreadcrumbsService.loadBreadcrumbs([{
                path: `/home/order-return/state=${this.store.detailPackage && this.store.detailPackage.state === "FINISHED" ? 'finished' : 'processing'}`,
                title: 'Quản lý đơn hàng hoàn trả'
            }, {title: 'Chi tiết kiện'}]);
        }
    }

    private async getShippingFee() {
        if (this.store.detailPackage) {
            this.setState({loadding: true});
            const response = await service.getShippingFee(this.shopId, this.store.detailPackage.id);
            if (response.status === 200 && response.body.data && Array.isArray(response.body.data)) {
                this.store.listShipping = response.body.data;
                this.setState({loadding: false});
            }
        }
    }

    private async onSubmit(type: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION') {
        if (!this.shipping_service_id && type !== "RETURN_NOT_RECEVIE") {
            notify.show('Vui lòng chọn đơn vị vận chuyển', "warning");
            return;
        } else {
            const response: IApiResponse = await service.putRequestOrderReturn(this.shopId, this.packageId, {
                return_type: type,
                shipping_service_id: (this.shipping_service_id as number)
            });
            if (response.status === 200) {
                if (type === "CHOZOI_ARBITRATION") {
                    (this.store.detailPackage as any).state = "NEW";
                } else
                    (this.store.detailPackage as any).state = "CONFIRMED";
                notify.show('Yêu cầu xử lý đã được ghi nhận!', "success");
            } else if (response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else
                notify.show('Đã có lỗi xảy ra!', "error");
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return <div id="order-return-package">
                {this.store.detailPackage && <div className="container-fluid">
                    {/*Kiện*/}
                    <div className="card" id="secction-1">
                        <AboutComponent
                            type={"return"}
                            title="Kiện hàng"
                            createdAt={this.store.detailPackage.createdAt}
                            state={this.store.detailPackage.state}
                            code={this.store.detailPackage.code}
                            packageId={this.store.detailPackage.shopOrderId}
                            emitActionOrderReturn={type => this.onSubmit(type)}
                        />
                    </div>
                    {/*Địa chỉ nhận hàng*/}
                    <div className="card" id="secction-2">
                        <AddressBuyerComponent
                            type={"return"}
                            name={this.store.detailPackage.buyerContactName}
                            phoneNumber={this.store.detailPackage.buyerContactPhone}
                            state={this.store.detailPackage.state}
                            detailAddress={this.store.detailPackage.buyerContactAddress.detailAddress}
                            districtName={this.store.detailPackage.buyerContactAddress.districtName}
                            wardName={this.store.detailPackage.buyerContactAddress.wardName}
                            provinceName={this.store.detailPackage.buyerContactAddress.provinceName}
                            listShipping={this.store.listShipping}
                            shippingName={this.store.detailPackage.shippingPartner ? this.store.detailPackage.shippingPartner.name : ''}
                            loadding={this.state.loadding}
                            shippingCode={this.store.detailPackage.shippingCode}
                            shippingOnChange={value => this.shipping_service_id = value}
                        />
                    </div>
                    {/*Sản phẩm*/}
                    {this.store.detailPackage.lineReturns.map((value, index: number) =>
                        <div className="card product" key={index}>
                            <ProductComponent
                                type={"return"}
                                action={true}
                                orderLineId={value.id}
                                state={(this.store.detailPackage as any).state}
                                note={value.reasonDetail}
                                priceUnit={value.priceUnit}
                                productImage={value.productImage}
                                productName={value.productName}
                                productAttributes={value.productAttributes ? value.productAttributes : undefined}
                                quantity={value.quantity}
                                reason={value.reason}
                                images={value.images}
                                isFreeShip={false}
                                emitAction={(lineId: number) => this.props.history.push(`/home/order-return/package/${this.packageId}/detail/${lineId}`)}
                            />
                        </div>)}
                </div>}
            </div>;
            // eslint-disable-next-line no-unreachable
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return "";
        }
    }
}
