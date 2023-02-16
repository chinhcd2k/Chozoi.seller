import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {store as HomeStore} from "../../../home";
import "./style.scss";
import {Link} from "react-router-dom";
import ListView from "./ListView";
import {SHIPPING_CTRL} from "./control";

export default class SellerShipping extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý khu vực tự vận chuyển'}]);
        HomeStore.menuActive = [1, 8];
    }

    componentDidMount() {
        SHIPPING_CTRL.store.init();
        SHIPPING_CTRL.GET_getListArea().then();
    }

    render() {
        return <div id="manager-seller-shipping">
            <div className="container">
                <div className="card">
                    <div className="card-header d-flex justify-content-end">
                        <Link to="/home/shop/shipping/create">
                            <button className="btn btn-primary">Tạo nhóm</button>
                        </Link>
                    </div>
                    <div className="card-body">
                        <ListView/>
                    </div>
                </div>
            </div>
        </div>;
    }
}