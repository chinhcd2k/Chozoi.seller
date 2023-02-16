import React, {Component} from 'react';
import {LandingPageService} from "../index";
import {observer} from "mobx-react";
import {store as ProfileStore} from "../../profile";
import Ga from "../../../init-ga";

@observer
export default class Business extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            step: 1
        }
    }

    public step(e: any) {
        this.setState({
            step: e
        })
    }

    render() {
        const isLogin = !!ProfileStore.profile;
        return (
            <div className="business">
                <div className="container">
                    <div className="title">
                        <h2>KINH DOANH THƯƠNG MẠI ĐIỆN TỬ VỚI CHOZOI THẬT DỄ DÀNG</h2>
                    </div>
                    <div className="content d-lg-flex d-sm-inline-block">
                        <div className="steps step-1">
                            <div className="title-step ">
                                <div className={`icon d-inline-flex justify-content-center align-items-center position-relative`}>
                                    <i className="fal fa-store"/>
                                    <span className="step text-center">1</span>
                                </div>
                                <span className="next-icon d-flex align-items-center">
                                     <span>----------------------</span>
                                </span>
                            </div>
                            <div className="content-step">
                                <div className="title-content">
                                    <h6>Đăng ký nhà bán</h6>
                                </div>
                                <p>- Thông tin kinh doanh<br/> - Tài khoản ngân hàng<br/> - Địa chỉ kho hàng</p>
                            </div>
                        </div>
                        <div className="steps step-2">
                            <div className="title-step ">
                                <div className={`icon d-inline-flex justify-content-center align-items-center position-relative`}>
                                    <i className="fal fa-layer-plus"/>
                                    <span className="step text-center">2</span>
                                </div>
                                <span className="next-icon d-flex align-items-center">
                                        <span>----------------------</span>
                                </span>
                            </div>
                            <div className="content-step">
                                <div className="title-content">
                                    <h6>Đăng tải sản phẩm</h6>
                                </div>
                                <p>- Đăng tải ít nhất 1 sản phẩm để bán hàng<br/> - Tối ưu sản phẩm với hình ảnh và nội
                                    dung</p>
                            </div>
                        </div>
                        <div className="steps step-3">
                            <div className="title-step ">
                                <div className={`icon d-inline-flex justify-content-center align-items-center position-relative`}>
                                    <i className="fal fa-sliders-v"/>
                                    <span className="step text-center">3</span>
                                </div>
                                <span className="next-icon d-flex align-items-center">
                                    <span>----------------------</span>
                                </span>
                            </div>
                            <div className="content-step">
                                <div className="title-content">
                                    <h6>Sử dụng công cụ và bán hàng</h6>
                                </div>
                                <p>- Quản lý gian hàng 24/24 với ứng dụng Chozoi seller<br/> - Sử dụng công cụ tham gia
                                    chương trình khuyến mãi và tăng tỉ lệ đơn hàng</p>
                            </div>
                        </div>
                        <div className="steps step-4">
                            <div className="title-step ">
                                <div className={`icon d-inline-flex  justify-content-center align-items-center position-relative`}>
                                    <i className="fal fa-ballot-check"/>
                                    <span className="step text-center">4</span>
                                </div>
                                <span className="next-icon d-flex align-items-center">
                                    <span>----------------------</span>
                                </span>
                            </div>
                            <div className="content-step">
                                <div className="title-content">
                                    <h6>Xử lý đơn hàng - Giao hàng</h6>
                                </div>
                                <p>- Tiếp nhận đơn hàng, và xử lý đơn hàng<br/> - Giao hàng với Chozoi thông qua các đối
                                    tác vận chuyển<br/> - Ghi nhận doanh số và kiểm tra thông tin đơn hàng</p>
                            </div>
                        </div>
                        <div className="steps step-5">
                            <div className="title-step ">
                                <div className={`icon d-inline-flex  justify-content-center align-items-center position-relative`}>
                                    <i className="fal fa-hand-holding-usd"/>
                                    <span className="step text-center">5</span>
                                </div>

                            </div>
                            <div className="content-step">
                                <div className="title-content">
                                    <h6>Thanh toán - Nhận tiền</h6>
                                </div>
                                <p>- Chozoi tổng kết và thanh toán tới Nhà bán theo tài khoản ngân hàng hoặc ví điện
                                    tử</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-100 d-flex align-items-center justify-content-center">
                        <button
                            onClick={() => {
                                if (isLogin){
                                    LandingPageService.showSelectSellerType(undefined)
                                } else {
                                    LandingPageService.showPopupRegister(null);
                                    Ga.pushEventGa('Landing_login', 'Click_register L4');
                                }
                                // isLogin ? LandingPageService.showSelectSellerType(undefined) : LandingPageService.showPopupRegister(null)
                            }}
                            className="stall">Mở gian
                            hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
