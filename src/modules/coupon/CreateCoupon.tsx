import React from "react";
import Template from "./templates";
import {BreadcrumbsService} from "../../common/breadcrumbs";
import {store as HomeStore} from "../home";
import {TemplateStore} from "./templates/store";

interface ICreateCouponProps {
    history: {
        push: (path: string) => any
        goBack: () => any
    }
}

export default class CreateCoupon extends React.Component<ICreateCouponProps, any> {
    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Mã giảm giá', goBack: this.props.history.goBack}, {title: 'Tạo mới mã giảm giá'}]);
        HomeStore.menuActive = [6, 0];
        TemplateStore.init();
        TemplateStore.Router = this.props.history;
    }

    componentDidMount() {
        TemplateStore.steep = 0;
    }

    render() {
        return <Template type={"CREATE"}/>;
    }
}