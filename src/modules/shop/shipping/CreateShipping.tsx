import React from "react";
import Template from "./templates";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store as HomeStore} from "../../home";
import {TEMPLATE_CTRL} from "./templates/controls";

export default class CreateShipping extends React.Component<any, any> {
    componentDidMount() {
        TEMPLATE_CTRL.store.RouterHistory = this.props.history;
        BreadcrumbsService.loadBreadcrumbs([{title: 'Tạo nhóm khu vực tự vận chuyển'}]);
        HomeStore.menuActive = [1, 8];
    }

    render() {
        return <Template type={"CREATE"}/>;
    }
}