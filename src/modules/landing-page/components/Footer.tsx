import React, {Component} from 'react';
import {observer} from "mobx-react";
import {LandingPageService} from "../index";

@observer
export default class Footer extends Component {
    render() {
        const {supportConfig} = LandingPageService;
        if (supportConfig) {
            const item = supportConfig;
            return (
                <footer className="footer">
                    <div className="container">
                        <div className="content d-flex">
                            <div className="logo">
                                <img src={'./assets/images/logo-1.png'} alt="logo"/>
                            </div>
                            <div className="css_footer">
                                <p className="email">Email: {item.emailSupport}</p>
                                <p className="hot_line">Hotline: {item.hotLine1}</p>
                                <p className="time">Thời gian làm việc: Thứ 2 - Thứ 7: 8h00 - 18h00 (CN & Ngày lễ:
                                    Nghỉ)</p>
                            </div>
                            <div className="connect text-right">
                                <span>Kết nối với Chozoi</span>
                                <a href={item.facebook}>
                                    <i className="fab fa-facebook-f"/>
                                </a>
                                <a href={item.youtube}>
                                    <i className="fab fa-youtube"/>
                                </a>
                                {/*<a href={item.facebook}>*/}
                                {/*    <i className="fab fa-instagram"/>*/}
                                {/*</a>*/}
                            </div>
                        </div>
                        <div className="copyright w-100 text-center">
                            <p>Copyrights © 2019. All rights reserved by <span>Chozoi</span></p>
                        </div>
                    </div>
                </footer>
            );
        } else return true
    }
}

