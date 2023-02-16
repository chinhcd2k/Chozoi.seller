import React from "react";
import Template from "./templates";
import {BreadcrumbsService} from "../../common/breadcrumbs";
import {store as HomeStore} from "../home";
import {TemplateStore} from "./templates/store";
import {TEMPLATE_CTRL} from "./templates/controls";

interface IUpdateCouponProps {
    match: { params: { id: string } }
    location: { search: string }
    history: { push: (path: string) => any, goBack: () => any }
}

export default class UpdateCoupon extends React.Component<IUpdateCouponProps, any> {
    public id: number = parseInt(this.props.match.params.id);

    constructor(props: IUpdateCouponProps) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Mã giảm giá', goBack: this.props.history.goBack}, {title: 'Chỉnh sửa mã giảm giá'}]);
        HomeStore.menuActive = [6, 0];
        TemplateStore.init();
        TemplateStore.Router = this.props.history;
    }

    componentDidMount() {
        if (!isNaN(this.id)) {
            if (this.props.location.search) {
                const queryString = new URLSearchParams(this.props.location.search);
                const steep = parseInt(queryString.get('steep') || '');
                if (!isNaN(steep)) TemplateStore.steep = steep > 1 ? 1 : steep;
            }
            TEMPLATE_CTRL.GET_getDetailCoupon(this.id).then();
        }
    }

    render() {
        if (!isNaN(this.id))
            return <Template type={"UPDATE"}/>;
        else return null;
    }
}