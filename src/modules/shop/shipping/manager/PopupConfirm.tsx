import React from "react";
import $ from "jquery";
import {observable} from "mobx";
import {observer} from "mobx-react";

interface IPopupConfirmProps {
    onConfirm: (value: boolean, id: number, status: 'ENABLED' | 'DISABLED' | 'DELETED') => any
}

@observer
export class PopupConfirm extends React.Component<IPopupConfirmProps, any> {
    private ref = React.createRef<HTMLDivElement>();
    public id?: number;
    @observable status?: 'ENABLED' | 'DISABLED' | 'DELETED';

    public show(id: number, status: 'ENABLED' | 'DISABLED' | 'DELETED') {
        this.id = id;
        this.status = status;
        $(this.ref.current as any).modal({show: true, backdrop: 'static'});
    }

    render() {
        return (<div className="modal fade" id="popup-confirm" ref={this.ref}>
            <div className="modal-dialog modal-md">
                <div className="modal-content">
                    <div className="modal-body">
                        <p>Bạn có chắc chắn thực hiện thao tác này?</p>
                        {this.status === "DELETED" && <p>Lưu ý: Khi xóa thì sẽ không thể khôi phục được dữ liệu đã xóa</p>}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary"
                                data-dismiss="modal"
                                onClick={() => this.props.onConfirm(true, this.id as number, this.status as any)}>Xác nhận
                        </button>
                        <button className="btn btn-danger ml-3" data-dismiss="modal">Hủy</button>
                    </div>
                </div>
            </div>
        </div>);
    }
}