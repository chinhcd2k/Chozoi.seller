import React from "react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {ParamsSetEnableShipping, service} from "../../shop/ShopService";
import {notify} from "../../../common/notify/NotifyService";
import {observer} from "mobx-react";
import {store as ProfileStore} from "../stores/ProfileStore";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {PopupRedirect} from "./PopupRedirect";
import {SHIPPING_CTRL} from "../../shop/shipping/manager/control";
import {observable} from "mobx";
import {IShipping} from "../../auctions/template/components/Shipping";
import {IResProfile} from "../../../api/auth/interfaces/response";

interface IService {
    id: number,
    serviceName: string,
    status: 'ENABLED' | 'DISABLED'
}

@observer
export default class SettingShippingComponent extends React.Component {
    @observable listShipping: IShipping[] = [];
    private PopupRedirectRef = React.createRef<PopupRedirect>();

    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Cài đặt vận chuyển'}]);
        HomeStore.menuActive = [1, 2];
    }

    async componentDidMount() {
        if (ProfileStore.profile) {
            const response = await service.getListShipping(ProfileStore.profile.shopId as number);
            if (response.status === 200) {
                this.listShipping = Array.isArray(response.body.selectList) ? response.body.selectList.reduce((pre: any[], current: any) => {
                    pre.push(current);
                    return pre;
                }, []) : [];
            }
        }
    }

    public async setStatusShipping(data: ParamsSetEnableShipping, item: IService, parentCode: string) {
        if (parentCode === "SELLER_EXPRESS") {
            let length: number = 0;
            await SHIPPING_CTRL.GET_getListArea(res => length = res.length);
            if (length === 0 && this.PopupRedirectRef.current && data.state === "ENABLED") {
                this.PopupRedirectRef.current.show();
                return;
            }
        }
        const response = await service.setEnable((ProfileStore.profile as IResProfile).shopId as number, item.id, data);
        if (response.status === 200) {
            notify.show('Đã lưu thay đổi', "success");
            item.status = data.state === "ENABLED" ? "ENABLED" : "DISABLED";
        } else service.pushNotificationRequestError(response);
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="container">
            <div className="card">
                <div className="card-body">
                    {this.listShipping.length > 0 && this.listShipping.map(value => value.service.map((value1, index) =>
                        <div key={index} className="btn-slider d-flex justify-content-between align-items-center">
                            <div>
                                <label>{value.name} - {value1.serviceName}</label>
                                <ul>
                                    <li>Cân nặng tối
                                        đa: <b>{numberWithCommas(value.maxWeight)} gram</b>
                                    </li>
                                    <li>Kích cỡ tối
                                        đa: <b>{`${value.maxSize[0]}cm x ${value.maxSize[1]}cm x ${value.maxSize[2]}cm`}</b>
                                    </li>
                                    <li>Thu hộ tối
                                        đa: <b>{`${numberWithCommas(value.maxValue)}`}</b>
                                    </li>
                                </ul>
                            </div>
                            {value1.status === "ENABLED" &&
                            <span className='text-success' style={{cursor: "pointer"}}
                                  onClick={() => this.setStatusShipping({
                                      state: "DISABLED",
                                      use_insurance: true
                                  }, value1, value.code)}><i className="fa fa-toggle-on fa-2x"/></span>}

                            {value1.status === "DISABLED" &&
                            <span style={{cursor: "pointer"}}
                                  onClick={(e: any) => this.setStatusShipping({
                                      state: "ENABLED", use_insurance: true
                                  }, value1, value.code)}><i className="fa fa-toggle-off fa-2x"/></span>}
                        </div>))}
                    {/*Popup confirm*/}
                    <PopupRedirect ref={this.PopupRedirectRef}/>
                </div>
            </div>
            <PopupRedirect/>
        </div>;
    }
}
