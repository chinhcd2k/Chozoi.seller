import React from "react";
import {Link} from "react-router-dom";
import $ from "jquery";

export class PopupRedirect extends React.Component<any, any> {
    private ref = React.createRef<HTMLDivElement>();

    public show() {
        $(this.ref.current as any).modal({show: true, backdrop: "static"});
    }

    public hidden() {
        $(this.ref.current as any).modal('hide');
    }

    render() {
        return (<div className="modal fade" id="popup-seller-shipping-redirect" ref={this.ref}>
            <div className="modal-dialog modal-md">
                <div className="modal-content">
                    <div className="modal-body">
                        Bạn chưa cài đặt khu vực tự vận chuyển. Muốn sử dụng hình thức "Người bán tự vận chuyển" bạn cần cài đặt "Quản lý khu vực tự vận chuyển"
                    </div>
                    <div className="modal-footer">
                        <Link
                            onClick={() => this.hidden()}
                            className="btn btn-primary"
                            to="/home/shop/shipping?type=all&page=0" type="button">
                            Đi đến "Quản lý khu vực vận chuyển"
                        </Link>
                        <button className="btn btn-danger ml-3" data-dismiss="modal">Hủy</button>
                    </div>
                </div>
            </div>
        </div>);
    }
}