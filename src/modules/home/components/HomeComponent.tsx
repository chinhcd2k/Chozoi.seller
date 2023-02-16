import {observer} from "mobx-react";
import * as React from 'react';
import {HomeRouter} from "../HomeRouter";
import {Link} from "react-router-dom";
import {store as ProfileStore} from "../../profile";
import ProfileWidget from "./ProfileWidget";
import Menu from "./Menu";
import {BreadcrumbsComponent, store as BreadcrumbsStore} from "../../../common/breadcrumbs";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {service as AuthService} from "../../auth/AuthService";
import {notify} from "../../../common/notify/NotifyService";
import NavbarNotificationComponent from "../../notifications/components/NavbarNotificationComponent";
import {messaging} from "../../../init-fcm";
import {service} from "../HomeService";
import "../containers/HomeStyle.scss";
import {setCookie} from "../../../common/functions/CookieFunc";
import {store} from "..";
import {service as ProfileService} from "../../profile/services/ProfileService";
import App from "../../../App";
import PopupNewSeller from "./PopupNewSeller";
import {BtnQuickNewProduct} from "./BtnQuickNewProduct";
import MyChat from "../../seller-chat";
import {getStats} from "../../../api/shop";
import {getListContact} from "../../../api/contact";

const COOKIE_NAME: string = (window as any).COOKIE_NAME || '';
const HOST_DOMAIN_SHARE_TOKEN: string = (window as any).HOST_DOMAIN_SHARE_TOKEN || '';

@observer
export default class HomeComponent extends React.Component<any, any> {

    async updateFcmToken() {
        try {
            if (messaging && localStorage.getItem('notification-permission') === "1") {
                const fcm_token: string | null = await messaging.getToken();
                if (fcm_token) {
                    setCookie('fcm-token', fcm_token);
                    await service.sendFcmTokenToServer(fcm_token);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async getShopStats(shopId: number) {
        try {
            const response = await getStats(shopId);
            if (response.status === 200) {
                ShopStore.shopStats = response.body;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async getListShopContact(shopId: number) {
        try {
            const {status, body} = await getListContact(shopId);
            if (status === 200) ShopStore.contacts = body;
        } catch (e) {
            console.error(e);
        }
    }

    public async componentDidMount() {
        try {
            await ProfileService.getProfile();
            if (ProfileStore.profile) {
                const {user: {isSeller}, shopId} = ProfileStore.profile;
                if (!isSeller && App.history) {
                    App.history.push('/login');
                } else {
                    await ShopStore.getShopProfileNow();
                    if (ShopStore.shopProfile) {
                        const {shopType} = ShopStore.shopProfile;
                        this.updateFcmToken().then();
                        ShopStore.getShopInfoAdvancedNow(shopType).then();
                        this.getShopStats(shopId).then();
                        this.getListShopContact(shopId).then();
                        await ShopStore.getCategoriesShop(shopId)
                    }

                    const {state} = this.props.location;
                    if (state && state.isNewSeller) {
                        delete this.props.location.state.isNewSeller;
                        PopupNewSeller.show();
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    protected async logout() {
        const response = await AuthService.logout();
        if (response.status === 200) {
            localStorage.removeItem(COOKIE_NAME);
            document.cookie = `tokenSeller=;domain=${HOST_DOMAIN_SHARE_TOKEN}`;
            ProfileStore.profile = undefined;
            window.location.href = "/login";
        } else if (response.body.message && typeof response.body.message === "string") notify.show(response.body.message, 'error');
        else notify.show('Đã có lỗi xảy ra!', 'error');
    }

    public render() {
        if (ProfileStore.profile && ShopStore.shopProfile)
            return <div id="home">
                <BtnQuickNewProduct/>
                <div id="container" className="effect aside-float aside-bright mainnav-lg navbar-fixed">
                    <header id="navbar">
                        <div id="navbar-container" className="boxed">
                            <div className="navbar-header">
                                <Link to="/home" className="navbar-brand">
                                    <div className="brand-title">
                                        <img aria-hidden src='/assets/images/logo.png' alt="Chozoi Logo"/>
                                    </div>
                                </Link>
                            </div>
                            <div className="navbar-content">
                                {store.actionNavbar === null && <div>
                                    <ul className="nav navbar-top-links">
                                        <li className="tgl-menu-btn">
                                            <a className="mainnav-toggle">
                                                <i className="fa fa-bars" aria-hidden="true"/>
                                            </a>
                                        </li>
                                        {/*<li>
                                    <div className="custom-search-form">
                                        <label className="btn btn-trans" htmlFor="search-input" data-toggle="collapse"
                                               data-target="#nav-searchbox">
                                            <i className="demo-pli-magnifi-glass"></i>
                                        </label>
                                        <form>
                                            <div className="search-container collapse" id="nav-searchbox">
                                                <input id="search-input" type="text" className="form-control"
                                                       placeholder="Type for search..."/>
                                            </div>
                                        </form>
                                    </div>
                                </li>*/}
                                    </ul>
                                    <ul className="nav navbar-top-links">
                                        {/*Thông báo*/}
                                        <NavbarNotificationComponent history={this.props.history}/>
                                        {/*Profile Nav Top*/}
                                        <li id="dropdown-user" className="dropdown">
                                            <a data-toggle="dropdown"
                                               className="dropdown-toggle cursor-pointer text-right">
								<span className="ic-user pull-right">
                                    <i className="fas fa-user-circle"/>
								</span>
                                            </a>
                                            <div
                                                className="dropdown-menu dropdown-menu-sm dropdown-menu-right panel-default">
                                                <ul className="head-list">
                                                    <li>
                                                        <Link to="/home/shop"><i
                                                            className="fas fa-user pr-3"/> Quản lý thông
                                                            tin</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/home/change-password"><i
                                                            className="fas fa-lock pr-3"/> Đổi mật khẩu</Link>
                                                    </li>
                                                    <li onClick={() => this.logout()}>
                                                        <Link to="#"><i
                                                            className="fas fa-sign-out pr-3"/> Đăng xuất</Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                </div>}
                                {store.actionNavbar && <div className="action-navbar">{store.actionNavbar}</div>}
                            </div>
                        </div>
                    </header>
                    <div className="boxed">
                        {/*CONTENT*/}
                        <div id="content-container">
                            {
                                store.isShowBreadcrumbs &&
                                <div className={store.pageHeaderClass}
                                     style={{padding: `${store.pageHeaderClass === "container-fuild" ? '0 15px' : 'auto'}`}}
                                     id="page-head">
                                    <div className="px-0" id="page-title">
                                        <h1 className="page-header text-overflow">
                                            {store.titlePage ? store.titlePage : Array.isArray(BreadcrumbsStore.breadcrumbs) && BreadcrumbsStore.breadcrumbs[BreadcrumbsStore.breadcrumbs.length - 1].title}
                                            {store.tagLiveProduct &&
                                            <span className="live-product">{store.tagLiveProduct}</span>}
                                        </h1>
                                    </div>
                                    <BreadcrumbsComponent/>
                                </div>
                            }
                            <div className="px-0" id="page-content">
                                {!!ProfileStore.profile && !!ShopStore.shopProfile && <HomeRouter/>}
                            </div>
                        </div>
                        {/*MAIN NAVIGATION*/}
                        <nav id="mainnav-container">
                            <div id="mainnav">
                                <div id="mainnav-menu-wrap">
                                    <div className="nano">
                                        <div className="nano-content">
                                            {/*Profile Widget*/}
                                            <ProfileWidget/>
                                            <Menu/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
                <MyChat
                    sellerId={ProfileStore.profile.id.toString()}
                    token={localStorage.getItem('token') || ''}/>
                <PopupNewSeller/>
            </div>
        else return null;
    }
}
