import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {SHIPPING_CTRL} from "./control";
import {PopupConfirm} from "./PopupConfirm";

@observer
export default class ListView extends React.Component<any, any> {
    private store = SHIPPING_CTRL.store;
    private PopupConfirmRef = React.createRef<PopupConfirm>();

    protected showPopupConfirm(id: number, status: 'ENABLED' | 'DISABLED' | 'DELETED') {
        if (this.PopupConfirmRef.current)
            this.PopupConfirmRef.current.show(id, status);
    }

    render() {
        return <div className="table-responsive">
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Tên nhóm</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {this.store.listArea.length === 0 && <tr>
                    <td colSpan={3}><p className="text-center mt-3">Không có cài đặt khu vực nào.</p></td>
                </tr>}
                {this.store.listArea.map((value, index) => <tr key={index}>
                    <td>{value.groupName}</td>
                    <td>
                        {value.status === "DISABLED" && <button onClick={() => this.showPopupConfirm(value.id, "ENABLED")}><i className="fa fa-toggle-off fa-2x"/></button>}
                        {value.status === "ENABLED" && <button onClick={() => this.showPopupConfirm(value.id, "DISABLED")}><i className="fa fa-toggle-on fa-2x text-success"/></button>}
                    </td>
                    <td>
                        <Link to={"/home/shop/shipping/update/" + value.id}>
                            <button><i className="fas fa-pencil"/></button>
                        </Link>
                        <button onClick={() => this.showPopupConfirm(value.id, "DELETED")}><i className="fas fa-trash"/></button>
                    </td>
                </tr>)}
                </tbody>
            </table>
            <PopupConfirm
                ref={this.PopupConfirmRef}
                onConfirm={(value, id, status) => value && SHIPPING_CTRL.PUT_changeStateArea(id, status)}/>
        </div>;
    }
}