import React, {Component} from 'react';
import {observer} from "mobx-react";
import Footer from "./components/Footer";
import DownLoad from "./components/DownLoad";
import Business from "./components/Business";
import {css} from "@emotion/core";
import HeaderLanding from "./components/HeaderComponent";
import PopupLogin, {PopupLoginService} from "./components/popup/PopupLogin";
import {
    getRequest,
    handlerRequestError,
    IApiResponse,
    postRequest, putRequest
} from "../../common/services/BaseService";
import {messaging} from "../../init-fcm";
import {service as HomeService} from "../home";
import {service as ProfileService} from "../profile";
import PopupRegister, {IReqBody, PopupRegisterService} from "./components/popup/PopupRegister";
import {notify} from "../../common/notify/NotifyService";
import PopupCode, {PopupCodeService} from "./components/popup/PopupCode";
import PopupActiveSuccess from "./components/popup/PopupActiveSuccess";
import {store as ProfileStore} from "../profile";
import App from "../../App";
import PopupSellerType from "./components/popup/PopupSellerType";
import PopupForgetPassword from "./components/popup/PopupForgetPassword";
import {observable} from "mobx";
import {PopupPresenter} from './components/popup/PopupPresenter';
import {MobileDownload} from "./components/MobileDownload";
import Ga from '../../init-ga';
import {sendLogin} from "../../api/auth";

export interface IConfig {
    id: number,
    emailSupport: string,
    labelEmalSupport: string,
    hotLine1: string,
    hotLine2: string,
    facebook: string,
    youtube: string,
    address1: string,
    address2: string,
    labelHotLine1: string,
    labelHotLine2: string,
    labelSupport: string,
    hotLineSupportTime: string,
    qrCodeUrl: string,
    privacyPolicyUrl: string,
    auctionPolicyUrl: string,
    companyName: string,
    description: string,
    instagram: string,
    androidApp: string,
    iosApp: string,
    createdAt: string,
    updatedAt: string,
    iconPayment: [],
    iconShipping: [],
    paymentView: string,
    shippingView: string,
    helpCenterUrl: string,

}

class LandingPageClass {
    popupSellerTypeInstance?: PopupSellerType;

    @observable public supportConfig?: IConfig;

    public showPopupLogin(username?: string, password?: string) {
        PopupLoginService.show(username, password)
    }

    public showPopupRegister(refCode: string | null) {
        PopupRegisterService.show(refCode ? refCode : undefined);
    }

    public showPopupVerifyCode(username: string, password: string, current: "LOGIN" | "REGISTER") {
        PopupCodeService.show(username, password, current);
    }

    public showSelectSellerType(type?: "normal" | "household" | "company") {
        if (this.popupSellerTypeInstance)
            this.popupSellerTypeInstance.show(type);
    }

    protected async updateFcmTokenForUser() {
        if (messaging && localStorage.getItem('notification-permission') === "1") {
            let fcm_token = localStorage.getItem('fcm-token');
            if (!fcm_token) {
                fcm_token = await messaging.getToken();
                localStorage.setItem('fcm-token', fcm_token);
            }
            HomeService.sendFcmTokenToServer(fcm_token).then();
        }
    }

    async handlerOnLoginSuccess(res: IApiResponse) {
        PopupLoginService.visible = false;
        const {loginCount, accessToken} = res.body as { loginCount: number | null, accessToken: string };
        localStorage.setItem("token", accessToken);
        this.updateFcmTokenForUser().finally();
        if (loginCount === 1) {
            // Nh???p m?? gi???i thi???u
            const instance = LandingPage.getInstance;
            const params = new URLSearchParams(instance.props.location.search);
            PopupPresenter.show(params.get("ref-code"));
        } else await this.handlerGetProfile();
    }

    async handlerOnLogin(username: string, password: string) {
        try {
            // const response = await postRequest('/v1/auth/login', {
            //     username: username,
            //     password: password,
            //     remember: true
            // }, false);
            const response = await sendLogin({username: username, password: password, remember: true})
            console.log(response)
            PopupLoginService.submitting = false;
            if (response.status === 200) {
                PopupLoginService.keyForm = Date.now();
                await this.handlerOnLoginSuccess(response);
                Ga.pushEventGa('popup_login', 'Click_login');
            } else if (response.status === 401 && response.body.statusCode === 1002) {
                // T??i kho???n ch??a ???????c k??ch ho???t
                PopupLoginService.visible = false;
                await PopupCodeService.show(username, password, "LOGIN", true);
            } else {
                handlerRequestError(response);
            }
        } catch (e) {
            console.error(e)
        }
    }

    async handlerOnRegister(data: IReqBody) {
        const response = await postRequest('/v1/auth/register', data, false);
        PopupRegisterService.submitting = false;
        if (response.status === 200) {
            notify.show("????ng k?? th??nh c??ng", "success");
            PopupRegisterService.visible = false;
            await PopupCodeService.show(data.username, data.password, "REGISTER");
            Ga.pushEventGa('popup_register', 'Click_register');
        } else {
            handlerRequestError(response);
        }
    }

    async handlerActiveAccount(username: string, password: string, code: string, current: "LOGIN" | "REGISTER") {
        const res = await putRequest('/v1/auth/verify', {
            username: username,
            active_code: code
        }, false);
        if (res.status === 200) {
            notify.show('K??ch ho???t t??i kho???n th??nh c??ng', "success");
            PopupCodeService.visible = false;
            if (current === "LOGIN")
                this.showPopupLogin(username);
            else PopupActiveSuccess.getInstance.show(username, password);
            Ga.pushEventGa('popup_otp', 'Click_send_otp');
        } else handlerRequestError(res);
    }

    async handlerGetProfile(isNewSeller?: boolean) {
        await ProfileService.getProfile();
        if (ProfileStore.profile) {
            const {user: {isSeller}} = ProfileStore.profile;
            if (!isSeller) {
                this.showSelectSellerType();
                // Ga.pushEventGa('register', 'open_popup', 'triger_seller_type');
            }
            else if (/(Android|iPhone)/i.test(navigator.userAgent))
                App.history && App.history.push("/app-download");
            else if (App.history) App.history.push('/home', {isNewSeller: isNewSeller});
        }
    }

    async getConfig() {
        const data = await getRequest('/v1/config/footer/support', false);
        if (data.status === 200) {
            this.supportConfig = data.body;
        }
    }
}

@observer
export default class LandingPage extends Component<any, any> {
    private static instance: LandingPage = undefined as any;

    constructor(props: any) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        if (params.get("token")) localStorage.setItem("token", params.get("token") as string);
        LandingPage.instance = this;
        if (params.get('ref-code') === 'CHOLINHT10') {
            Ga.pushEventGa('Home_page', 'Click_redirect_seller', 'https://seller.chozoi.vn/login?ref-code=CHOLINHT10');
        }
    }

    handlerOnForgetPassword() {
        PopupLoginService.visible = false;
        PopupForgetPassword.getInstance.show();
    }

    handlerOnClickShowPopupLogin() {
        LandingPageService.showPopupLogin()
    }

    handlerOnClickShowPopupRegister(registered?: boolean) {
        if (registered)
            LandingPageService.showSelectSellerType();
        else {
            const params = new URLSearchParams(this.props.location.search);
            LandingPageService.showPopupRegister(params.get("ref-code"));
        }
    }

    get renderPopupComponent(): React.ReactNode {
        const {
            handlerOnLogin,
            handlerOnRegister,
            handlerActiveAccount,
            handlerOnLoginSuccess,
            handlerGetProfile
        } = LandingPageService;
        return <>
            <PopupLogin linkForgetPassOnClick={() => this.handlerOnForgetPassword()}
                        onLogin={data => handlerOnLogin.bind(LandingPageService)(data.username as string, data.password as string)}
                        onLoginWithSocialSuccess={res => handlerOnLoginSuccess.bind(LandingPageService)(res)}/>
            <PopupRegister onLoginWithSocialSuccess={res => handlerOnLoginSuccess.bind(LandingPageService)(res)}
                           onRegister={data => handlerOnRegister.bind(LandingPageService)(data)}/>
            <PopupCode onFinish={(username, password, code, current) =>
                handlerActiveAccount.bind(LandingPageService)(username, password, code, current)}/>
            <PopupActiveSuccess onFinish={res => handlerOnLoginSuccess.bind(LandingPageService)(res)}/>
            <PopupSellerType ref={(value: PopupSellerType) => LandingPageService.popupSellerTypeInstance = value}
                             onFinish={() => handlerGetProfile.bind(LandingPageService)(true)}/>
            <PopupForgetPassword/>
            <PopupPresenter onFinish={() => handlerGetProfile.bind(LandingPageService)(true)}/>
        </>
    }

    handlerOnClickCreateSeller(type?: "normal" | "household" | "company") {
        const isLogin = !!ProfileStore.profile;
        if (!isLogin) {
            LandingPageService.showPopupRegister(null);
        } else LandingPageService.showSelectSellerType(type);
    }

    render() {
        return (
            <div id="landing_page">
                <MobileDownload/>
                <HeaderLanding account={ProfileStore.profile}
                               btnLoginOnClick={() => this.handlerOnClickShowPopupLogin()}
                               btnRegisterOnClick={registered => this.handlerOnClickShowPopupRegister(registered)}/>
                <div className="banner d-flex justify-content-center align-items-center w-100">
                    <div id="list_banner" className="list_banner carousel w-100 slide" data-ride="carousel">
                        <div className="carousel-inner d-flex w-100">
                            <div className="item pt-0">
                                <div className="d-flex">
                                    <div className="banner_left">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head3.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_center">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_right">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head2.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                </div>
                            </div>
                            <div className="item pt-0 active">
                                <div className="d-flex">
                                    <div className="banner_left">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_center">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head2.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_right">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head3.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                </div>
                            </div>
                            <div className="item pt-0">
                                <div className="d-flex">
                                    <div className="banner_left">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head2.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_center">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head3.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                    <div className="banner_right">
                                        <img src="./assets/images/landing-page/landing_seller/banner-head.jpg"
                                             alt="Seller Chozoi landing"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex h-100 align-items-center">
                            <a className="left carousel-control" href="#list_banner" role="button" data-slide="prev">
                                <span className="fal fa-chevron-left" aria-hidden="true"/>
                                <span className="sr-only">Previous</span>
                            </a>
                        </div>
                        <a className="right carousel-control" href="#list_banner" role="button"
                           data-slide="next">
                            <span className="fal fa-chevron-right" aria-hidden="true"/>
                            <span className="sr-only">Next</span>
                        </a>
                    </div>
                </div>
                <div className="sell">
                    <div className="container">
                        <div className="title text-center">
                            <h2 className="mt-0">?????N V???I CHOZOI<br/> S??n ?????U GI?? Online ti??n phong t???i Vi???t Nam</h2>
                        </div>
                        <div className="row">
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-10000sapcho.png" alt=""/>
                                </div>
                                <div className="text">
                                    <span>10.000 s???p ch???<br/> ??ang kinh doanh kh???p c??? n?????c</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-100gianhangchinhhang.png"
                                         alt=""/>
                                </div>
                                <div className="text">
                                    <span>100 gian h??ng ch??nh h??ng</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-3trieukhachhang.png"
                                         alt=""/>

                                </div>
                                <div className="text">
                                    <span>3 tri???u kh??ch h??ng ti???m n??ng ??a ph??n kh??c th??? tr?????ng</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-1000sanphamdaugia.png"
                                         alt=""/>
                                </div>
                                <div className="text">
                                    <span>1.000 s???n ph???m ???????c ?????u gi?? m???i th??ng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sell_2">
                    <div className="container">
                        <div className="title text-center">
                            <h2 className="mt-0 mb-0">B???N MU???N KINH DOANH TR??N CHOZOI, B???N L?? NH?? B??N H??NG N??O?</h2>
                        </div>

                        <div className="table_sell mb-5 mt-2 d-flex">
                            <div className="css_234">
                                <table className="table mb-0">
                                    <thead css={th}>
                                    <tr>
                                        <th css={tep1} scope="col text-right">M?? h??nh</th>
                                        <th css={th_green} className="position-relative"
                                            style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg.svg)'}}
                                            scope="col">
                                            <div style={{top: `0px`}} className="position-absolute">
                                                <img src="./assets/images/landing-page/landing_seller/icon-ca-nhan.png"
                                                     alt=""/>
                                                <span>Nh?? b??n h??ng</span>
                                            </div>
                                        </th>
                                        <th css={th_blue} className="position-relative"
                                            style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg1.svg)'}}
                                            scope="col">
                                            <div style={{top: `0px`}} className="position-absolute">
                                                <img
                                                    src="./assets/images/landing-page/landing_seller/icon-shop kinh doanh.png"
                                                    alt=""/>
                                                <span>Shop kinh doanh</span>
                                            </div>
                                        </th>
                                        <th css={th_purple} className="position-relative"
                                            style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg2.svg)'}}
                                            scope="col">
                                            <div style={{top: `0px`}} className="position-absolute">
                                                <img
                                                    src="./assets/images/landing-page/landing_seller/icon-doanh-nghiep.png"
                                                    alt=""/>
                                                <span>Doanh nghi???p</span>
                                            </div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr style={{fontSize: "13px"}}>
                                        <th css={tep1} style={{borderTop: `none`}} scope="row text-right">Ph?? m??? gian
                                            h??ng
                                        </th>
                                        <td css={green} style={{borderTop: `none`}}>Mi???n ph??</td>
                                        <td css={blue} style={{borderTop: `none`}}>Mi???n ph??</td>
                                        <td css={purple} style={{borderTop: `none`}}>Mi???n ph??</td>
                                    </tr>
                                    <tr style={{fontSize: "13px"}}>
                                        <th css={tep1} scope="row text-right">?????i t?????ng</th>
                                        <td css={green}>Ng?????i b??n kinh doanh ????n l???</td>
                                        <td css={blue}>Shop b??n h??ng kinh doanh</td>
                                        <td css={purple}>Doanh nghi???p ??a d???ng h??ng h??a</td>
                                    </tr>
                                    <tr>
                                        <th css={tep1} scope="row text-right">Y??u c???u</th>
                                        <td css={green}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng y??u c???u GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng y??u c???u ch???ng minh th????ng hi???u
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                                                hi???u t???i Chozoi
                                            </p>
                                        </td>
                                        <td css={blue}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng y??u c???u GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                T??n shop kinh doanh - t??n c???a h??ng (n???u c??) ho???c k??nh Social
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                                                hi???u t???i Chozoi
                                            </p>

                                        </td>
                                        <td css={purple}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Y??u c???u c?? GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Cung c???p ch???ng t??? h??ng h??a s???n ph???m
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                                                hi???u t???i Chozoi
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th css={tep1} scope="row text-right">Quy???n l???i</th>
                                        <td css={green} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Th???a th??ch b??n ????? ?????c s???n c???a ?????a ph????ng m??nh
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Thanh l?? ????? d??ng c?? nh??n, ????? c??, ????? ??t d??ng
                                            </p>
                                            <p className="pb-3">
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - ????ng b??n s???n ph???m ?????U GI??
                                            </p>
                                            <button className="btn btn-green" css={bt_green}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("normal");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L1');
                                                    }}>M???
                                                gian h??ng
                                            </button>
                                        </td>
                                        <td css={blue} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                M??? "s???p h??ng" tr??n Chozoi, th???a th??ch ??am m?? kinh doanh
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Ti???p c???n h??ng tri???u kh??ch h??ng mi???n ph?? t??? qu???ng c??o ??a k??nh c???a Chozoi
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                ??u ????i 0% chi???t kh???u theo t???ng th???i ??i???m
                                            </p>
                                            <p className="pb-4">
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - ????ng b??n s???n ph???m ?????U GI??
                                            </p>
                                            <button className="btn" css={bt_blue}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("household");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L2');
                                                    }}>M??? gian
                                                h??ng
                                            </button>
                                        </td>
                                        <td css={purple} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Gian h??ng Doanh nghi???p v???i nh???ng g??i ??u ????i qu???ng c??o
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                ??u ????i chi???t kh???u l???n
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                ??a d???ng ch????ng tr??nh thu h??t kh??ch h??ng ti???m n??ng
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - ????ng b??n s???n ph???m ?????U GI??
                                            </p>
                                            <button className="btn" css={bt_purple}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("company");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L3');
                                                    }}>M???
                                                gian h??ng
                                            </button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="banner_uu" onClick={() => {
                    this.handlerOnClickCreateSeller(undefined);
                }}>
                    <div className="container">
                        <div className="banner_2">
                            <img src="./assets/images/landing-page/landing_seller/banner-??u ????i nh?? b??n.jpg"
                                 alt="??u ????i nh?? b??n"/>
                        </div>
                    </div>
                </div>
                <Business/>
                <div className="home_sales">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-4 col-sm-12">
                                <h2>Nh?? b??n h??ng lu??n lu??n ???????c h??? tr???!</h2>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="images">
                                    <img src="./assets/images/landing-page/landing_seller/img-hotroquangcao-??a k??nh.png"
                                         alt="Qu???ng c??o ??a k??nh"/>
                                </div>
                                <div className="content">
                                    <p>QU???NG C??O ??A K??NH</p>
                                    <span>Chozoi qu???ng c??o s???n ph???m c???a nh?? b??n tr??n ??a k??nh X?? h???i - th??ng tin: Facebook, Instagram, Google, Tiktok, Youtube ...</span>
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="images">
                                    <img
                                        src="./assets/images/landing-page/landing_seller/img-hotroquangcao-hi???n th???.png"
                                        alt="Qu???ng c??o hi???n th???"/>


                                </div>
                                <div className="content">
                                    <p>QU???NG C??O HI???N TH???</p>
                                    <span>T??ng doanh s??? nhanh ch??ng v???i ??u ????i qu???ng c??o hi???n th??? CPM v?? CPC v???i Chozoi Ads</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-100 d-flex align-items-center justify-content-center">
                            <button onClick={() => {
                                this.handlerOnClickCreateSeller(undefined);
                                Ga.pushEventGa('Landing_login', 'Click_register L5');
                            }} className="stall">M??? gian
                                h??ng
                            </button>
                        </div>
                    </div>
                </div>
                <DownLoad/>
                <div className="partner w-100 d-md-flex d-sm-inline-block">
                    <div className="partner_left d-md-flex d-sm-inline-block justify-content-between">
                        <div/>
                        <div className="w-50 text-center">
                            <div id="list_partner" className="list_partner carousel slide" data-ride="carousel">
                                <div className="carousel-inner">
                                    <div className="item active">
                                        <div className="partner_1">
                                            <div className="title">
                                                <i className="fas fa-quote-left"/>
                                                <h2>G????NG M???T TH??NH C??NG</h2>
                                                <p>K???t qu??? c???a vi???c tham gia v??o chi???n d???ch qu???ng c??o c??ng Chozoi l???n
                                                    ?????u ti??n ???? v?????t qu?? s??? mong ?????i c???a b???n th??n t??i: V?? sau ???? doanh
                                                    thu lu??n duy tr?? ??? m???c g???p ????i v???i m???c doanh thu tr?????c khi t??i tham
                                                    gia chi???n d???ch c???a Chozoi.</p>
                                            </div>
                                            <div className="content text-center">
                                                <div className="d-flex w-100 align-items-center justify-content-center">
                                                    <div className="img d-inline-block">
                                                        <span>H</span>
                                                    </div>
                                                    <div className="img active mr-5 ml-5 d-inline-block">
                                                        <span>C</span>
                                                    </div>
                                                    <div className="img d-inline-block">
                                                        <span>T</span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p><strong>Mr. Ch????ng</strong></p>
                                                    <span>Mimosa shop</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="partner_1">
                                            <div className="title">
                                                <i className="fas fa-quote-left"/>
                                                <h2>G????NG M???T TH??NH C??NG</h2>
                                                <p>T??i ???? t???n d???ng t???t c??? nh???ng c??ng c??? h??? tr??? c???a Chozoi, k???t h???p v???i
                                                    vi???c hi???u r?? t??m l?? kh??ch h??ng v?? t??i ???? ????a ra nh???ng ??u ????i c???c k???
                                                    h???p d???n ?????i v???i kh??ch h??ng. K???t qu??? l?? m???i ng??y doanh thu c???a t??i
                                                    ?????t ???????c t??? 4-6 tri???u ?????ng.</p>
                                            </div>
                                            <div className="content text-center">
                                                <div className="d-flex w-100 align-items-center justify-content-center">
                                                    <div className="img d-inline-block">
                                                        <span>C</span>
                                                    </div>
                                                    <div className="img active mr-5 ml-5 d-inline-block">
                                                        <span>T</span>
                                                    </div>
                                                    <div className="img d-inline-block">
                                                        <span>H</span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p><strong>Mr. T??</strong></p>
                                                    <span>L???t ?????t shop</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="partner_1">
                                            <div className="title">
                                                <i className="fas fa-quote-left"/>
                                                <h2>G????NG M???T TH??NH C??NG</h2>
                                                <p>T??? ng??y ????ng k?? b??n h??ng c??ng Chozoi, doanh thu c???a h??ng t??i t??ng l??n
                                                    tr??ng th???y. ????n h??ng ?????n ?????u ?????n t???ng ng??y khi???n t??i r???t vui.
                                                    V?? t??i tin m??nh ???? quy???t ?????nh r???t ????ng ?????n khi h???p t??c c??ng
                                                    Chozoi.</p>
                                            </div>
                                            <div className="content text-center">
                                                <div className="d-flex w-100 align-items-center justify-content-center">
                                                    <div className="img d-inline-block">
                                                        <span>T</span>
                                                    </div>
                                                    <div className="img active mr-5 ml-5 d-inline-block">
                                                        <span>H</span>
                                                    </div>
                                                    <div className="img d-inline-block">
                                                        <span>C</span>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p><strong>Mrs. H????ng</strong></p>
                                                    <span>M??? v?? b?? Shop</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="partner_right">
                        <div className="w-50 text-lg-right text-md-right text-sm-center">
                            <div className="title">
                                <h2>?????I T??C H??NG ?????U<br/> C???A CHOZOI!</h2>
                            </div>
                            <div id="list_img_partner" className="list_img_partner carousel slide" data-ride="carousel">
                                <div className="carousel-inner">
                                    <div className="item active">
                                        <div className="tab-1 d-inline-flex justify-content-center flex-wrap">
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20unilever.png"
                                                alt="?????i t??c unilever"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20remax.png"
                                                alt="?????i t??c remax"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20riobook.png"
                                                alt="?????i t??c riobook"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20asus.png"
                                                alt="?????i t??c asus"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20logiitech.png"
                                                alt="?????i t??c logiitech"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20lock&lock.png"
                                                alt="?????i t??c LockBlock"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i%20t??c%20VNPay.png"
                                                alt="?????i t??c VNPAY"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c viettelpost.png"
                                                alt="?????i t??c viettel post"/>
                                            <img src="./assets/images/landing-page/landing_seller/GHTK.png"
                                                 alt="?????i t??c GHTK"/>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="tab-1 d-inline-flex justify-content-center flex-wrap">
                                            <img src="./assets/images/landing-page/landing_seller/logo-?????i t??c acer.png"
                                                 alt="?????i t??c acer"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c casper.png"
                                                alt="?????i t??c casper"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c ninjavan.png"
                                                alt="?????i t??c ninjavan"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c creative.png"
                                                alt="?????i t??c creative"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c elmich.png"
                                                alt="?????i t??c elmich"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c sharp.png"
                                                alt="?????i t??c sharp"/>
                                            <img src="./assets/images/landing-page/landing_seller/logo-?????i t??c GHN.png"
                                                 alt="?????i t??c GHN"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-?????i t??c ng??n l?????ng.png"
                                                alt="?????i t??c ng??n l?????ng"/>
                                        </div>
                                    </div>
                                </div>
                                <a className="left carousel-control" href="#list_img_partner" role="button"
                                   data-slide="prev">
                                    <span className="fal fa-chevron-left" aria-hidden="true"/>
                                    <span className="sr-only">Previous</span>
                                </a>
                                <a className="right carousel-control" href="#list_img_partner" role="button"
                                   data-slide="next">
                                    <span className="fal fa-chevron-right" aria-hidden="true"/>
                                    <span className="sr-only">Next</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>

                {/*Popup Login*/}
                {this.renderPopupComponent}
            </div>
        );
    }

    static get getInstance(): LandingPage {
        return LandingPage.instance;
    }

    componentDidMount() {
        window.scroll(0, 0)
        const token = localStorage.getItem("token");
        if (token) {
            LandingPageService.handlerGetProfile();
        } else {
            const params = new URLSearchParams(this.props.location.search);
            if (params.get("ref-code")) LandingPageService.showPopupRegister(params.get("ref-code"));
        }
        if (this.props.history.length === 2) Ga.pushEventGa('Home_page', 'Click_redirect_seller', 'https://seller.chozoi.vn/');

        LandingPageService.getConfig();
    }
}

const bt_green = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #5BBF1B;

  &:hover {
    color: #000000 !important;
  }
`;

const bt_blue = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #218BE7;

  &:hover {
    color: #000000 !important;
  }
`;

const bt_purple = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #971BBF;

  &:hover {
    color: #000000 !important;
  }
`;

const blue = css`
  width: 304px;
  color: #000000;
  background-color: #E8F3FD;

  i {
    margin-right: 5px;
    color: #218be7 !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const green = css`
  width: 304px;
  color: #000000;
  background-color: #E6F6DC;

  i {
    margin-right: 5px;
    color: #5bbf1b !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const th = css`
  th {
    border-bottom-width: 0 !important;
  }
`;

const purple = css`
  width: 304px;
  color: #000000;
  background-color: #F8E9FA;

  i {
    margin-right: 5px;
    color: #971bbf !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const tep1 = css`
  color: #000000;
  font-size: 15px;
  padding-right: 20px !important;
  text-align: right !important;
`;

const th_blue = css`
  color: white;
  height: 120px;
  background-color: #E8F3FD;

  span {
    font-size: 17px !important;
  }

`;

const th_green = css`
  color: white;
  height: 120px;
  background-color: #E6F6DC;

  span {
    font-size: 17px !important;
  }
`;

const th_purple = css`
  color: white;
  height: 120px;
  background-color: #F8E9FA;

  span {
    font-size: 17px !important;
  }
`;

export const LandingPageService = new LandingPageClass();
