import React from "react";
import {observer} from "mobx-react";
import {menu} from "../../home/stores/HomeStore";
import {setBreadcrumb} from "../../../common/breadcrumbs/BreadcrumbsService";
import HeaderCampaign from "../components/HeaderCampaign";
import ListProduct, {IRuleProduct} from "../components/ListProduct";
import {observable} from "mobx";
import {TimeSlot} from "../components/TimeSlot";
import {getRequest, handlerRequestError} from "../../../common/services/BaseService";
import {store as ProfileStore} from "../../profile";
import {IResProfile} from "../../../api/auth/interfaces/response";

export interface IResProduct {
    id: number
    images: string
    name: string
    percent: number
    quantity: number
    variantPrice: number[] | null
    status: "pending" | "approved" | "rejected"
    visible: boolean
}

interface IResCampaign {
    id: number
    banner: string
    campaignState: string,
    description: string
    name: string
    shopCondition: false
    shopStatus: "none" | "qualify" | "pending" | "approve" | "joined"
    status: "finished" | "processing" | "comingsoon" | string
    timeRegisterEnd: string
    timeRegisterStart: string
    timeStartEnd: string
    timeStartStart: string
    ruleProduct: IRuleProduct
    ruleShop: {
        itemsLimit: number
        shopRuleContent: string
    }
    products: IResProduct[]
}

@observer
export default class DetailCampaign extends React.Component<any, any> {
    @observable step: number = 0;
    @observable detailCampaign?: IResCampaign;

    async getDetailCompaingn(id: number) {
        const {shopId} = ProfileStore.profile as IResProfile;
        const response = await getRequest(`/v1/shops/${shopId}/campaign/${id}`);
        if (response.status === 200) {
            this.detailCampaign = response.body;
        } else handlerRequestError(response);
    }

    handlerOnChangeSlotTime() {
        this.step++;
        const {
            id,
            ruleProduct,
            status,
            products,
            ruleShop: {itemsLimit}
        } = this.detailCampaign as IResCampaign;
        ListProduct.show(id, status, products, ruleProduct, itemsLimit);
    }

    render() {
        if (this.detailCampaign) {
            const {
                id,
                name,
                banner,
                status,
                shopStatus,
                timeRegisterStart,
                timeRegisterEnd,
                timeStartStart,
                timeStartEnd,
                description,
                shopCondition,
                ruleProduct: {productRuleContent},
                ruleShop: {shopRuleContent}
            } = this.detailCampaign;
            return <div className="container-fluid" style={style.container}>
                <div className='header-campaign mb-3'>
                    <HeaderCampaign
                        urlImg={banner}
                        contentTabDetail={description}
                        contentTabCondition={[shopRuleContent, productRuleContent]}
                        titleHeaderCampaign={name}
                        timeStartRegister={timeRegisterStart}
                        timeEndRegister={timeRegisterEnd}
                        timeStart={timeStartStart}
                        timeEnd={timeStartEnd}
                        timeSlotStarting={status === "processing" ? 1 : 0}
                        timeSlotRegister={status === "comingsoon" ? 1 : 0}
                        timeSlotRegistered={(shopStatus === "joined" || shopStatus === "pending") ? 1 : 0}
                    />
                </div>
                {
                    this.step === 0 &&
                    <div className="time-slot py-3">
                        <h3 className="text-uppercase">danh sách khung giờ</h3>
                        <hr className="my-0"/>
                        <TimeSlot dataSource={[{
                            id: id,
                            shopCondition: shopCondition,
                            shopStatus: shopStatus,
                            banner: banner,
                            title: name,
                            state: status,
                            timeRegisterBegin: timeRegisterStart,
                            timeRegisterEnd: timeRegisterEnd,
                            timeStartBegin: timeStartStart,
                            timeStartEnd: timeStartEnd,
                        }]}
                                  onChange={() => this.handlerOnChangeSlotTime()}
                        />
                    </div>
                }
                {
                    this.step === 1 &&
                    <div className="select-product py-3">
                        <h3 className="text-uppercase">
                            <i className="fal fa-chevron-left p-2 cursor-pointer"
                               onClick={() => this.step--}/>
                            &nbsp;danh sách sản phẩm
                        </h3>
                        <hr className="mt-0"/>
                        <ListProduct/>
                    </div>
                }
            </div>;
        } else return null;
    }

    @menu(6, 1)
    componentDidMount() {
        window.scrollTo(0, 0);
        try {
            const {id, title} = this.props.location.state;
            setBreadcrumb([{
                title: "Chương trình Chozoi",
                goBack: this.props.history.goBack
            }, {title: title}]);
            this.getDetailCompaingn(id);
        } catch (e) {
            console.error(e);
            this.props.history.goBack();
        }
    }
}

const style = {
    container: {
        backgroundColor: "white",
        minHeight: "100vh",
        margin: "0 16px"
    }
}
