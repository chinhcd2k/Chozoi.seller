import React, {useState} from "react";
import "../containers/HeaderStyle.scss";
import {notify} from "../../../common/notify/NotifyService";

export const HeaderComponent: React.FC = () => {
    const [show, setShow] = useState(true);
    return (
        <>
            {show && <div id="auth-header">
                <div className="container">
                    {/*Mobile*/}
                    <div className="row">
                        <div className="logo col-xs-3">
                            <a href="/"><img src={'./assets/images/login/logo-2.png'} alt="logo"/></a>
                        </div>
                        <div className="introduce_app col-xs-6">
                            <p>Tải app để quản lý gian hàng thuận tiện & hiệu quả hơn</p>
                        </div>
                        <div className="down_app col-xs-3">
                            <button className="btn_app"
                                    onClick={() => notify.show('Chức năng đang xây dựng', "warning")}>Tải App
                            </button>
                            <div className="down_application">
                                <i className="fa fa-mobile"
                                   onClick={() => notify.show('Chức năng đang xây dựng', "warning")}/>
                                <a href="#/">Tải ứng dụng</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="close_header">
                    <button type="button" className="close float-right" aria-label="Close"
                            onClick={() => setShow(false)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>}
        </>
    );
};

export default HeaderComponent;
