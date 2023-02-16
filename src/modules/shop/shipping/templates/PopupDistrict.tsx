import React from "react";
import {observer} from "mobx-react";
import $ from "jquery";
import {observable} from "mobx";
import {IArea} from "./store";
import {TEMPLATE_CTRL} from "./controls";
import {notify} from "../../../../common/notify/NotifyService";

@observer
export default class PopupDistrict extends React.Component<any, any> {
    private ref = React.createRef<HTMLDivElement>();
    @observable AreaData: IArea = undefined as any;
    private store = TEMPLATE_CTRL.store;

    public show(data?: IArea) {
        data && (this.AreaData = data);
        $(this.ref.current as any).modal({show: true, backdrop: "static"});
    }

    handlerOnChangeCheckbox(e: any, id: number) {
        const checked: boolean = e.currentTarget.checked;
        if (checked && !this.AreaData.districtId)
            this.AreaData.districtId = [id];
        else if (this.AreaData.districtId) {
            const index_search = this.AreaData.districtId.findIndex(value => value === id);
            if (checked && index_search === -1) {
                this.AreaData.districtId.push(id);
            } else if (!checked && index_search !== -1)
                this.AreaData.districtId.splice(index_search, 1);
            if (this.AreaData.districtId.length === 0)
                this.AreaData.districtId = undefined;
        }
    }

    protected isChecked(item: { id: number, districtName: string }): boolean {
        if (this.AreaData && this.AreaData.districtId)
            return this.AreaData.districtId.findIndex(value => value === item.id) !== -1;
        else return false;
    }

    protected isDisabled(item: { id: number, districtName: string }): boolean {
        let disabled: boolean = false;
        if (this.store.districtsExists) {
            const index_search = this.store.districtsExists.findIndex(value => value === item.id);
            disabled = index_search !== -1;
        }
        return disabled;
    }

    protected handlerOnAgree() {
        if (!this.AreaData.districtId)
            notify.show('Vui lòng lựa chọn ít nhất 1 Quận/ huyện', "error");
        else $(this.ref.current as any).modal("hide");
    }

    protected handlerOnCancer() {
        if (this.AreaData) {
            this.AreaData.provinceId = undefined;
            this.AreaData.districtId = undefined;
        }
        $(this.ref.current as any).modal("hide");
    }

    render() {
        if (this.AreaData && Array.isArray(this.AreaData.districts)) {
            return <div className="modal fade" id="popup-district" ref={this.ref}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header pb-0 text-center">
                            <h4>Chọn Quận/ Huyện</h4>
                        </div>
                        <div className="modal-body">
                            {this.AreaData.districts.length === 0 && <p className="mt-3">Không tìm thấy quận huyện nào phù hợp</p>}
                            {this.AreaData.districts.length > 0 && <ul>
                                {this.AreaData.districts.map((value, index) =>
                                    <li key={index}>
                                        <div className="checkbox">
                                            <input id={'popup-checkbox-' + index}
                                                   checked={this.isChecked(value)}
                                                   disabled={this.isDisabled(value)}
                                                   onChange={e => this.handlerOnChangeCheckbox(e, value.id)}
                                                   className="magic-checkbox"
                                                   type="checkbox"
                                            />
                                            <label htmlFor={'popup-checkbox-' + index}>{value.districtName}</label>
                                        </div>
                                    </li>)}
                            </ul>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => this.handlerOnAgree()}>Xác nhận</button>
                            <button className="btn btn-default" onClick={() => this.handlerOnCancer()}>Hủy</button>
                        </div>
                    </div>
                </div>
            </div>;
        } else return null;
    }
}