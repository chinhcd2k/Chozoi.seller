import React from "react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store as HomeStore} from "../../home";
import "./style.scss";
import Filter from "./Filter";
import ListView from "./ListView";
import {MANAGER_COUPON_CTRL} from "./controls";
import {ManagerCouponStore} from "./store";
import QueryString from "./QueryString";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {css} from "@emotion/core";
import {Link} from "react-router-dom";

interface IManagerCoupontProps {
    history: { push: (path: string) => any }
    location: { search: string }
}

@observer
export default class ManagerCoupont extends React.Component<IManagerCoupontProps, any> {
    @observable visiable: boolean = true;

    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Mã giảm giá'}]);
        HomeStore.menuActive = [6, 0];
    }

    componentDidMount() {
        ManagerCouponStore.init();
        this.ExecQueryString();
        this.ExecRequestAPI();
    }

    componentDidUpdate(prevProps: Readonly<IManagerCoupontProps>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.location.search !== this.props.location.search) {
            this.ExecQueryString();
            this.ExecRequestAPI();
        }
    }

    ExecQueryString() {
        if (this.props.location.search) {
            const query = new QueryString(this.props.location.search);
            ManagerCouponStore.status = query.getType;
            ManagerCouponStore.keyword = query.getKeyword;
            ManagerCouponStore.metadata.page = query.getPage;
        }
    }

    ExecRequestAPI() {
        MANAGER_COUPON_CTRL.GET_getListCoupon(
            ManagerCouponStore.getMetadata.page,
            ManagerCouponStore.getMetadata.size,
            ManagerCouponStore.getStatus,
            ManagerCouponStore.getKeyword ? ManagerCouponStore.getKeyword : undefined)
            .then();
    }

    handlerOnClickFilter() {
        let url = '/home/coupon?';
        url += `type=${ManagerCouponStore.getStatus ? ManagerCouponStore.getStatus : 'all'}`;
        url += ManagerCouponStore.getKeyword ? '&name=' + ManagerCouponStore.getKeyword.trim() : '';
        url += `&page=0`
        this.props.history.push(url);
    }

    render() {
        return <div className="container-fluid" id="manager-coupon-site">
            {this.renderWaring}
            <div className="card">
                <div className="card-header">
                    Mã giảm giá là công cụ khuyến mãi hiệu quả giúp bạn tăng tỷ lệ chuyển đổi một cách nhanh chóng.
                </div>
                <div className="card-body">
                    <Filter OnSearch={() => this.handlerOnClickFilter()}/>
                    <ListView push={this.props.history.push}/>
                </div>
            </div>
        </div>;
    }

    get renderWaring(): React.ReactNode {
        if (ShopStore.shopProfile&&ShopStore.shopStats) {
            const {countProduct} = ShopStore.shopStats;
            if (!countProduct && this.visiable) {
                return <div className='container-fluid' css={warringCss}>
                    <button
                        onClick={() => this.visiable = false}
                        className="close d-flex flex-column align-items-center justify-content-center">
                        <i className="fal fa-times"/></button>
                    <p>Chỉ cần thêm 1 bước nữa thôi sẽ giúp bạn tăng cơ hội có thêm đơn hàng. Đăng sản phẩm của mình
                        ngay để khách hàng có thể tìm kiếm và mua sản phẩm của bạn ngay nhé. <Link
                            to={"/home/product/add"}>Đăng bán ngay</Link></p>
                </div>
            }
        }
        return null;
    }
}
const warringCss = css`
            border: 1px dashed #F54B24;
            background: #FEF3EC 0% 0% no-repeat padding-box;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            position: relative;
            
            button.close {
                position: absolute;
                right: 12px;
                top: 8px;
                width: 24px;
                height: 24px;
                border: 1px solid #F54B24;
                background-color: transparent;
                border-radius: 50%;
                
                &:hover {
                    opacity: 1;
                }
                
                i.fa-times {
                    color: #F54B24;
                }  
            }
            
            p {
                padding-right: 20px;
                margin-bottom: 0;
                color: #000000;
                font-size: 17px;
            }
        `;