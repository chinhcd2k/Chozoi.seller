import React from "react";
import {observer} from "mobx-react";
import ga from '../../../../init-ga';

interface IActionFormProps {
    disabled: boolean
    type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N'
    OnSubmit: (type: 'CREATE' | 'DRAFT' | 'UPDATE' | 'REPLAY_QUICK') => any
    goBack: () => any
}

@observer
export default class ActionForm extends React.Component<IActionFormProps, any> {
    render() {
        if (this.props.type === "CREATE"||this.props.type==="CREATE_F_N")
            return <div className="form-group d-flex">
                <button className="btn btn-default" type={"submit"}
                        disabled={this.props.disabled}
                        onClick={() => {
                            this.props.OnSubmit("DRAFT");
                            ga.pushEventGa('submit_auction_product_s2', 'Click_save_draft');
                        }}>Lưu Nháp
                </button>
                <button className="btn btn-primary mx-3" type={"submit"}
                        disabled={this.props.disabled}
                        onClick={() => {
                            this.props.OnSubmit("CREATE");
                            ga.pushEventGa('submit_auction_product_s2', 'Click_save_submit');
                        }}>Lưu và Đăng
                </button>
                <button className="btn btn-danger" type={"reset"} onClick={() => {
                    window.location.reload();
                    ga.pushEventGa('submit_auction_product_s2', 'Click_cancel');
                }}>Hủy</button>
            </div>;
        else if (this.props.type === "REPLAY")
            return <div className="form-group d-flex">
                <button className="btn btn-default" type={"submit"}
                        disabled={this.props.disabled}
                        onClick={() => this.props.OnSubmit("DRAFT")}>Lưu Nháp
                </button>
                <button className="btn btn-primary mx-3"
                        disabled={this.props.disabled}
                        type={"submit"} onClick={() => this.props.OnSubmit("CREATE")}>Lưu và Đăng
                </button>
                <button className="btn btn-danger" type={"reset"} onClick={() => window.location.reload()}>Hủy</button>
            </div>;
        else if (this.props.type === "UPDATE")
            return <div className="form-group d-flex">
                <button className="btn btn-primary mr-3" type={"submit"}
                        disabled={this.props.disabled}
                        onClick={() => this.props.OnSubmit("UPDATE")}>Cập nhật
                </button>
                <button className="btn btn-danger" type={"reset"} onClick={() => this.props.goBack()}>Hủy</button>
            </div>;
        else if (this.props.type === "REPLAY_QUICK")
            return <div className="form-group d-flex">
                <button className="btn btn-primary mr-3" type={"submit"}
                        disabled={this.props.disabled}
                        onClick={() => this.props.OnSubmit("REPLAY_QUICK")}>Lưu
                </button>
                <button className="btn btn-danger" type={"reset"} onClick={() => this.props.goBack()}>Hủy</button>
            </div>;
        else return null;
    }
}