import React from "react";
import {observer} from "mobx-react";
import {HEADER_CTRL, LOGO_APP, LOGO_WEB} from "../control";

@observer
export default class PopupHeader extends React.Component<any, any> {
    private store = HEADER_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="template-header-popup">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header py-0">
                        <h4>Header Official Store</h4>
                    </div>
                    <div className="modal-body pt-0">
                        <p className="title">Upload ảnh logo Store</p>
                        <ol>
                            <li>
                                <p>Upload cho phần hiển thị Web</p>
                                <label>Khuyến nghị sử dụng ảnh có độ phân
                                    giải {LOGO_WEB.width}x{LOGO_WEB.height} (pixel)</label>
                                {!this.store.getPopupHeaderData.web && <div className="add">
                                    <div><i className="fas fa-camera"/> Tải ảnh lên</div>
                                    <p>Chỉ nhận định dạng .png, .jpg</p>
                                    <input type="file" accept="image/png, image/jpeg"
                                           value=""
                                           onChange={e => HEADER_CTRL.handlerOnUploadImage(e, "web")}/>
                                </div>}
                                {this.store.getPopupHeaderData.web &&
                                <div className="image" style={{width: LOGO_WEB.width + 'px'}}>
                                    <img src={this.store.getPopupHeaderData.web.url} alt="log-web"/>
                                    <div className="remove">
                                        <i className="fas fa-trash" onClick={() => HEADER_CTRL.handlerOnRemoveLogo("web")}/>
                                    </div>
                                </div>}
                            </li>
                            <li>
                                <p>Upload cho phần hiển thị App</p>
                                <p>Khuyến nghị sử dụng ảnh có độ phân
                                    giải {LOGO_APP.width}x{LOGO_APP.height} (pixel)</p>
                                {!this.store.getPopupHeaderData.app && <div className="add">
                                    <div><i className="fas fa-camera"/> Tải ảnh lên</div>
                                    <p>Chỉ nhận định dạng .png, .jpg</p>
                                    <input type="file" accept="image/png, image/jpeg"
                                           onChange={e => HEADER_CTRL.handlerOnUploadImage(e, "app")}/>
                                </div>}
                                {this.store.getPopupHeaderData.app &&
                                <div className="image">
                                    <img style={{borderRadius: LOGO_APP.width / 2 + 'px'}} src={this.store.getPopupHeaderData.app.url} alt="log-web"/>
                                    <div className="remove">
                                        <i className="fas fa-trash" onClick={() => HEADER_CTRL.handlerOnRemoveLogo("app")}/>
                                    </div>
                                </div>}
                            </li>
                        </ol>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" data-dismiss='modal'>Hủy</button>
                        <button className="btn btn-primary" onClick={() => HEADER_CTRL.handlerOnSaveLogo()}>Lưu</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}
