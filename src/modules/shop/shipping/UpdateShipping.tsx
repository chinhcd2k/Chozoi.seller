import React from "react";
import Template from "./templates";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store as HomeStore} from "../../home";
import {TEMPLATE_CTRL} from "./templates/controls";

export default class UpdateShipping extends React.Component<any, any> {
    private store = TEMPLATE_CTRL.store;

    async componentDidMount() {
        this.store.init();
        this.store.RouterHistory = this.props.history;
        BreadcrumbsService.loadBreadcrumbs([
            {title: 'Quản lý khu vực tự vận chuyển', goBack: this.store.RouterHistory ? this.store.RouterHistory.goBack : undefined},
            {title: 'Chỉnh sửa'}
        ]);
        HomeStore.menuActive = [1, 8];
        if (this.props.match.params.id && !isNaN(parseInt(this.props.match.params.id)))
            await TEMPLATE_CTRL.GET_getDetailGroupArea(parseInt(this.props.match.params.id), response => {
                this.store.name = response.groupName;
                this.store.listArea = [];
                response.conversionAddresses.map(async value => {
                    const area = {
                        provinceId: value.provinceId,
                        districtId: value.districtIds,
                        districts: undefined
                    };
                    await TEMPLATE_CTRL.GET_getListDistrict(value.provinceId, area);
                    this.store.listArea.push(area);
                    return null;
                });
                this.store.listFee = [];
                response.conversionPrice.map(value => this.store.listFee.push({
                    minWeight: value.from,
                    maxWeight: value.to,
                    fee: value.price
                }));
                this.store.id = response.id;
                this.store.districtsExists = response.districtSelectedIds;
            });
        else this.props.history.goBack();
    }

    render() {
        return <Template type={"UPDATE"}/>;
    }
}