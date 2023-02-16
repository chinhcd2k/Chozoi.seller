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
            // Nhập mã giới thiệu
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
                // Tài khoản chưa được kích hoạt
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
            notify.show("Đăng ký thành công", "success");
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
            notify.show('Kích hoạt tài khoản thành công', "success");
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
                            <h2 className="mt-0">ĐẾN VỚI CHOZOI<br/> Sàn ĐẤU GIÁ Online tiên phong tại Việt Nam</h2>
                        </div>
                        <div className="row">
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-10000sapcho.png" alt=""/>
                                </div>
                                <div className="text">
                                    <span>10.000 sạp chợ<br/> đang kinh doanh khắp cả nước</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-100gianhangchinhhang.png"
                                         alt=""/>
                                </div>
                                <div className="text">
                                    <span>100 gian hàng chính hãng</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-3trieukhachhang.png"
                                         alt=""/>

                                </div>
                                <div className="text">
                                    <span>3 triệu khách hàng tiềm năng đa phân khúc thị trường</span>
                                </div>
                            </div>
                            <div className="col-md-3 text-center col-sm-12">
                                <div className="logo">
                                    <img src="./assets/images/landing-page/landing_seller/img-1000sanphamdaugia.png"
                                         alt=""/>
                                </div>
                                <div className="text">
                                    <span>1.000 sản phẩm được đấu giá mỗi tháng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sell_2">
                    <div className="container">
                        <div className="title text-center">
                            <h2 className="mt-0 mb-0">BẠN MUỐN KINH DOANH TRÊN CHOZOI, BẠN LÀ NHÀ BÁN HÀNG NÀO?</h2>
                        </div>

                        <div className="table_sell mb-5 mt-2 d-flex">
                            <div className="css_234">
                                <table className="table mb-0">
                                    <thead css={th}>
                                    <tr>
                                        <th css={tep1} scope="col text-right">Mô hình</th>
                                        <th css={th_green} className="position-relative"
                                            style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg.svg)'}}
                                            scope="col">
                                            <div style={{top: `0px`}} className="position-absolute">
                                                <img src="./assets/images/landing-page/landing_seller/icon-ca-nhan.png"
                                                     alt=""/>
                                                <span>Nhà bán hàng</span>
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
                                                <span>Doanh nghiệp</span>
                                            </div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr style={{fontSize: "13px"}}>
                                        <th css={tep1} style={{borderTop: `none`}} scope="row text-right">Phí mở gian
                                            hàng
                                        </th>
                                        <td css={green} style={{borderTop: `none`}}>Miễn phí</td>
                                        <td css={blue} style={{borderTop: `none`}}>Miễn phí</td>
                                        <td css={purple} style={{borderTop: `none`}}>Miễn phí</td>
                                    </tr>
                                    <tr style={{fontSize: "13px"}}>
                                        <th css={tep1} scope="row text-right">Đối tượng</th>
                                        <td css={green}>Người bán kinh doanh đơn lẻ</td>
                                        <td css={blue}>Shop bán hàng kinh doanh</td>
                                        <td css={purple}>Doanh nghiệp đa dạng hàng hóa</td>
                                    </tr>
                                    <tr>
                                        <th css={tep1} scope="row text-right">Yêu cầu</th>
                                        <td css={green}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không yêu cầu GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không yêu cầu chứng minh thương hiệu
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                                                hiệu tại Chozoi
                                            </p>
                                        </td>
                                        <td css={blue}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không yêu cầu GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Tên shop kinh doanh - tên cửa hàng (nếu có) hoặc kênh Social
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                                                hiệu tại Chozoi
                                            </p>

                                        </td>
                                        <td css={purple}>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Yêu cầu có GPKD
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Cung cấp chứng từ hàng hóa sản phẩm
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                                                hiệu tại Chozoi
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th css={tep1} scope="row text-right">Quyền lợi</th>
                                        <td css={green} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Thỏa thích bán đồ đặc sản của địa phương mình
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Thanh lý đồ dùng cá nhân, đồ cũ, đồ ít dùng
                                            </p>
                                            <p className="pb-3">
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                                            </p>
                                            <button className="btn btn-green" css={bt_green}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("normal");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L1');
                                                    }}>Mở
                                                gian hàng
                                            </button>
                                        </td>
                                        <td css={blue} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Mở "sạp hàng" trên Chozoi, thỏa thích đam mê kinh doanh
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Tiếp cận hàng triệu khách hàng miễn phí từ quảng cáo đa kênh của Chozoi
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Ưu đãi 0% chiết khấu theo từng thời điểm
                                            </p>
                                            <p className="pb-4">
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                                            </p>
                                            <button className="btn" css={bt_blue}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("household");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L2');
                                                    }}>Mở gian
                                                hàng
                                            </button>
                                        </td>
                                        <td css={purple} style={{height: `200px`}} className="position-relative">
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Gian hàng Doanh nghiệp với những gói ưu đãi quảng cáo
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Ưu đãi chiết khấu lớn
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Đa dạng chương trình thu hút khách hàng tiềm năng
                                            </p>
                                            <p>
                                                <i className="fas fa-check-circle"/>
                                                Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                                            </p>
                                            <button className="btn" css={bt_purple}
                                                    onClick={() => {
                                                        this.handlerOnClickCreateSeller("company");
                                                        Ga.pushEventGa('Landing_login', 'Click_register L3');
                                                    }}>Mở
                                                gian hàng
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
                            <img src="./assets/images/landing-page/landing_seller/banner-ưu đãi nhà bán.jpg"
                                 alt="Ưu đãi nhà bán"/>
                        </div>
                    </div>
                </div>
                <Business/>
                <div className="home_sales">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-4 col-sm-12">
                                <h2>Nhà bán hàng luôn luôn được hỗ trợ!</h2>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="images">
                                    <img src="./assets/images/landing-page/landing_seller/img-hotroquangcao-đa kênh.png"
                                         alt="Quảng cáo đa kênh"/>
                                </div>
                                <div className="content">
                                    <p>QUẢNG CÁO ĐA KÊNH</p>
                                    <span>Chozoi quảng cáo sản phẩm của nhà bán trên đa kênh Xã hội - thông tin: Facebook, Instagram, Google, Tiktok, Youtube ...</span>
                                </div>
                            </div>
                            <div className="col-md-4 col-sm-12">
                                <div className="images">
                                    <img
                                        src="./assets/images/landing-page/landing_seller/img-hotroquangcao-hiển thị.png"
                                        alt="Quảng cáo hiển thị"/>


                                </div>
                                <div className="content">
                                    <p>QUẢNG CÁO HIỂN THỊ</p>
                                    <span>Tăng doanh số nhanh chóng với ưu đãi quảng cáo hiển thị CPM và CPC với Chozoi Ads</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-100 d-flex align-items-center justify-content-center">
                            <button onClick={() => {
                                this.handlerOnClickCreateSeller(undefined);
                                Ga.pushEventGa('Landing_login', 'Click_register L5');
                            }} className="stall">Mở gian
                                hàng
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
                                                <h2>GƯƠNG MẶT THÀNH CÔNG</h2>
                                                <p>Kết quả của việc tham gia vào chiến dịch quảng cáo cùng Chozoi lần
                                                    đầu tiên đã vượt quá sự mong đợi của bản thân tôi: Và sau đó doanh
                                                    thu luôn duy trì ở mức gấp đôi với mức doanh thu trước khi tôi tham
                                                    gia chiến dịch của Chozoi.</p>
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
                                                    <p><strong>Mr. Chương</strong></p>
                                                    <span>Mimosa shop</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="partner_1">
                                            <div className="title">
                                                <i className="fas fa-quote-left"/>
                                                <h2>GƯƠNG MẶT THÀNH CÔNG</h2>
                                                <p>Tôi đã tận dụng tất cả những công cụ hỗ trợ của Chozoi, kết hợp với
                                                    việc hiểu rõ tâm lý khách hàng và tôi đã đưa ra những ưu đãi cực kỳ
                                                    hấp dẫn đối với khách hàng. Kết quả là mỗi ngày doanh thu của tôi
                                                    đạt được từ 4-6 triệu đồng.</p>
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
                                                    <p><strong>Mr. Tú</strong></p>
                                                    <span>Lật đật shop</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="partner_1">
                                            <div className="title">
                                                <i className="fas fa-quote-left"/>
                                                <h2>GƯƠNG MẶT THÀNH CÔNG</h2>
                                                <p>Từ ngày đăng ký bán hàng cùng Chozoi, doanh thu cửa hàng tôi tăng lên
                                                    trông thấy. Đơn hàng đến đều đặn từng ngày khiến tôi rất vui.
                                                    Và tôi tin mình đã quyết định rất đúng đắn khi hợp tác cùng
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
                                                    <p><strong>Mrs. Hương</strong></p>
                                                    <span>Mẹ và bé Shop</span>
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
                                <h2>ĐỐI TÁC HÀNG ĐẦU<br/> CỦA CHOZOI!</h2>
                            </div>
                            <div id="list_img_partner" className="list_img_partner carousel slide" data-ride="carousel">
                                <div className="carousel-inner">
                                    <div className="item active">
                                        <div className="tab-1 d-inline-flex justify-content-center flex-wrap">
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20unilever.png"
                                                alt="Đối tác unilever"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20remax.png"
                                                alt="Đối tác remax"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20riobook.png"
                                                alt="Đối tác riobook"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20asus.png"
                                                alt="Đối tác asus"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20logiitech.png"
                                                alt="Đối tác logiitech"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20lock&lock.png"
                                                alt="Đối tác LockBlock"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối%20tác%20VNPay.png"
                                                alt="Đối tác VNPAY"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác viettelpost.png"
                                                alt="Đối tác viettel post"/>
                                            <img src="./assets/images/landing-page/landing_seller/GHTK.png"
                                                 alt="Đối tác GHTK"/>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="tab-1 d-inline-flex justify-content-center flex-wrap">
                                            <img src="./assets/images/landing-page/landing_seller/logo-đối tác acer.png"
                                                 alt="Đối tác acer"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác casper.png"
                                                alt="Đối tác casper"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác ninjavan.png"
                                                alt="Đối tác ninjavan"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác creative.png"
                                                alt="Đối tác creative"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác elmich.png"
                                                alt="Đối tác elmich"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác sharp.png"
                                                alt="Đối tác sharp"/>
                                            <img src="./assets/images/landing-page/landing_seller/logo-đối tác GHN.png"
                                                 alt="Đối tác GHN"/>
                                            <img
                                                src="./assets/images/landing-page/landing_seller/logo-đối tác ngân lượng.png"
                                                alt="Đối tác ngân lượng"/>
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
