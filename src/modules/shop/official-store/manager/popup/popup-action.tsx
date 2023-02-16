import React from "react";
import {notify} from "../../../../../common/notify/NotifyService";
import $ from "jquery";

interface IPopupActionProps {
    type: 'CREATE' | 'RENAME' | 'CLONE' | 'DELETE'
    OnAccept: (type: 'CREATE' | 'RENAME' | 'CLONE', name: string) => any
    OnDelete: (id: number) => any
}

interface IPopupActionState {
    name: string
    id: number
    name_old: string
}

export class PopupAction extends React.Component<IPopupActionProps, IPopupActionState> {

    state = {
        id: 0,
        name: '',
        name_old: ''
    };

    componentDidUpdate(prevProps: Readonly<IPopupActionProps>, prevState: Readonly<IPopupActionState>, snapshot?: any): void {
        if (prevProps.type !== this.props.type) {
            if (this.props.type === "CREATE") this.setState({name: ''});
            else if (this.props.type !== "DELETE") this.setState({name: this.state.name_old});
        }
        if (prevState.name_old !== this.state.name_old) this.setState({name: this.state.name_old});
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="modal fade" id="popup-action">
            <div className="modal-dialog" style={{maxWidth: '500px'}}>
                <div className="modal-content">
                    <div className="modal-header pb-0">
                        <h4>
                            {(this.props.type === "CREATE" || this.props.type === "CLONE") && "Tên phiên bản"}
                            {this.props.type === "RENAME" && "Cập nhật tên phiên bản"}
                            {this.props.type === "DELETE" && "Xóa"}
                        </h4>
                    </div>
                    <div className="modal-body pt-0">
                        {this.props.type !== "DELETE" && <div>
                            <p>Tên phiên bản</p>
                            <input className="form-control" type="text" value={this.state.name}
                                   onChange={e => this.setState({name: e.currentTarget.value})}/>
                        </div>}
                        {this.props.type === "DELETE" && <div>
                            <p><i className="fas fa-exclamation-circle"/> Bạn có chắc chắn muốn xóa phiên bản này?</p>
                            <i className="text-warning">Lưu ý: Không thể khôi phục lại phiên bản khi đã xóa.</i>
                        </div>}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-danger" data-dismiss="modal">Hủy
                        </button>
                        {this.props.type === "CREATE" &&
                        <button className="btn btn-primary" onClick={() => this.handlerOnCreate()}>Xác nhận</button>}
                        {this.props.type === "RENAME" &&
                        <button className="btn btn-primary" onClick={() => this.handlerOnRename()}>Xác nhận</button>}
                        {this.props.type === "CLONE" &&
                        <button className="btn btn-primary" onClick={() => this.handlerOnClone()}>Xác nhận</button>}
                        {this.props.type === "DELETE" &&
                        <button className="btn btn-primary" onClick={() => this.handlerOnRemove()}>Xác
                            nhận</button>}
                    </div>
                </div>
            </div>
        </div>
    }

    public validateNameLength = (src: string): boolean => {
        if (src.trim().length < 8) {
            notify.show('Tên phiên bản phải có tối thiểu 8 ký tự', "error");
            $('div.modal#popup-action input')[0].focus();
            return false;
        }
        return true;
    };

    public handlerOnCreate = () => {
        if (this.validateNameLength(this.state.name)) {
            this.props.OnAccept("CREATE", this.state.name);
            $('div.modal#popup-action').modal("hide");
        }
    };

    public handlerOnRename = () => {
        if (this.validateNameLength(this.state.name)) {
            if (this.state.name.trim() === this.state.name_old) {
                notify.show('Tên phiên bản mới phải khác với tên trước đó', "error");
                return false;
            }
            $('div.modal#popup-action').modal("hide");
            this.props.OnAccept("RENAME", this.state.name);
        }
    };

    public handlerOnClone = () => {
        if (this.validateNameLength(this.state.name)) {
            if (this.state.name.trim() === this.state.name_old) {
                notify.show('Tên phiên bản mới phải khác với tên trước đó', "error");
                return false;
            }
            $('div.modal#popup-action').modal("hide");
            this.props.OnAccept("CLONE", this.state.name);
        }
    };

    public handlerOnRemove = () => {
        this.props.OnDelete(this.state.id);
        $('div.modal#popup-action').modal("hide");
    };
}
