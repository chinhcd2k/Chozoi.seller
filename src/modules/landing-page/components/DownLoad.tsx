import React, {Component} from 'react';
import {observer} from "mobx-react";
import {LandingPageService} from "../index";

@observer
export default class DownLoad extends Component {
    render() {
        const {supportConfig} = LandingPageService;
        if (supportConfig) {
            // const item = supportConfig;
            return (
                <div className="download-app"
                     style={{backgroundImage: `url('./assets/images/landing-page/landing_seller/background-download app.png')`}}>
                    <div className="download">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6 col-sm-12">
                                    <img className="position-absolute img_phone"
                                         src="./assets/images/landing-page/landing_seller/mockup-download app.png"
                                         alt="DownLoad app"/>
                                </div>
                                <div className="col-md-6 col-sm-12">
                                    <div className="title">
                                        <h4 className='text-white'>ĐĂNG KÝ NHÀ BÁN NGAY CHỈ TRONG 1 PHÚT! HOÀN TOÀN MIỄN
                                            PHÍ</h4>
                                    </div>
                                    <div className="w-100">
                                        <p className="mt-5 text-white mb-5">Đăng ký trở thành nhà bán hàng trên nền tảng
                                            Đấu giá online Chozoi.vn ngay hôm nay để nhận những ưu đãi đặc biệt</p>
                                        <p className="">- 0đ mở gian hàng</p>
                                        <p className="">- 0% chiết khấu đơn hàng</p>
                                        <p className="text-white">- Hỗ trợ quảng cáo đa kênh tới người tiêu dùng</p>
                                        <p className="text-white">- Chương trình đấu giá với hơn 10.000 sản
                                            phẩm/tháng</p>
                                        <p className="mt-5 text-white mb-3">BÁN HÀNG DỄ DÀNG CÙNG CHOZOI </p>
                                    </div>
                                    <div className="content w-auto d-flex">
                                        <a href={"https://apps.apple.com/vn/app/chozoi-seller-center/id1495609377?l=vi"}
                                           className="app_store d-flex align-items-center">
                                            <i className="fab fa-apple"/>
                                            <div>
                                                <span className="css-01">Tải về trên</span>
                                                <span className="css-02">Apple Store</span>
                                            </div>
                                        </a>
                                        <a href={"https://play.google.com/store/apps/details?id=com.chozoi.sellercenter"}
                                           className="ch_play d-flex align-items-center">
                                            <i className="fab fa-google-play"/>
                                            <div>
                                                <span className="css-01">Tải về trên</span>
                                                <span className="css-02">Google Play</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else return true
    }
}
