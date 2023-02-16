import React from "react";
import {observer} from "mobx-react";
import "./style.scss";
import {TEMPLATE_CTRL} from "./controls";
import TableArea from "./TableArea";
import TableFee from "./TableFee";
import {notify} from "../../../../common/notify/NotifyService";

interface ITemplateProps {
    type: 'CREATE' | 'UPDATE' | 'DETAIL'
}

@observer
export default class Template extends React.Component<ITemplateProps, any> {
    private store = TEMPLATE_CTRL.store;

    componentDidMount() {
        if (this.props.type === "CREATE") {
            TEMPLATE_CTRL.store.init();
            TEMPLATE_CTRL.GET_getListDistricExists().then();
        }
        TEMPLATE_CTRL.GET_getListProvice().then();
    }

    hasValid(): boolean {
        let valid: boolean = true;
        // Check name
        if (!this.store.name.trim()) {
            notify.show('Vui lòng nhập tên nhóm', "error");
            return false;
        }
        // Check area
        this.store.listArea.map(value => {
            if (!value.provinceId || !value.districtId) valid = false;
            return null;
        })
        if (!valid) {
            notify.show('Vui lòng hoàn thành form chi tiết khu vực tự vận chuyển', "error");
            return false;
        } // End
        else {// Check Fee
            this.store.listFee.map(value => {
                if (!value.minWeight || !value.maxWeight || value.fee===undefined) valid = false;
                return null;
            });
            if (!valid) {
                notify.show('Vui lòng nhập mức biểu phí', "error");
                return false;
            }
            if (valid) {
                this.store.listFee.map(value => {
                    if (value.minWeight && value.maxWeight && value.minWeight >= value.maxWeight) valid = false;
                    return null;
                });
                if (!valid) {
                    notify.show('Biểu phí tồn tại cân nặng không hợp lệ!', "error");
                    return false;
                }
            }
        }// End
        return valid;
    }

    protected handlerOnSave() {
        this.store.disabledSubmit = true;
        const timeout = setTimeout(() => this.store.disabledSubmit = false, 20000);
        if (this.hasValid()) {
            if (this.props.type === "CREATE")
                TEMPLATE_CTRL.POST_createArea().finally(() => {
                    clearTimeout(timeout);
                    this.store.disabledSubmit = false;
                });
            else if (this.props.type === "UPDATE")
                TEMPLATE_CTRL.PUT_updateArea(this.store.id).then(() => {
                    clearTimeout(timeout);
                    this.store.disabledSubmit = false;
                });
        } else {
            this.store.disabledSubmit = false;
            clearTimeout(timeout);
        }
    }

    render() {
        return <div id="seller-shipping-template">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                            <label>Tên nhóm</label>
                            <input type="text"
                                   value={this.store.name}
                                   onChange={e => this.store.name = e.currentTarget.value}
                                   className="form-control"
                                   placeholder="Tên nhóm khu vực"
                            />
                            <p>VD: Nhóm miền Bắc Trung Bộ</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <p className="title">1.Chi tiết khu vực (Những khu vực hỗ trợ tự vận chuyển)</p>
                        <div className="table-responsive">
                            <TableArea/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <p className="title">2. Mức biểu phí tương ứng với khối lượng hàng cho khu vực trên (là chi phí khi vận chuyển đến địa chỉ của người mua mà thuộc phạm trù các khuc vực đã chọn
                            ở trên)</p>
                        <div className="table-responsive">
                            <TableFee/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <button className="btn btn-primary"
                                disabled={this.store.disabledSubmit}
                                onClick={() => this.handlerOnSave()}>Lưu
                        </button>
                        <button className="btn btn-default ml-3" onClick={() => this.store.RouterHistory && this.store.RouterHistory.goBack()}>Hủy</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}