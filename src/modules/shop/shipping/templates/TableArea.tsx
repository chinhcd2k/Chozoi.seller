import React from "react";
import {observer} from "mobx-react";
import {TEMPLATE_CTRL} from "./controls";
import {IArea} from "./store";
import PopupDistrict from "./PopupDistrict";

@observer
export default class TableArea extends React.Component<any, any> {
    private store = TEMPLATE_CTRL.store;
    private PopupDistrictRef = React.createRef<PopupDistrict>();

    protected handlerOnChangeProvince(e: any, item: IArea) {
        const value = e.currentTarget.value;
        if (!isNaN(parseInt(value))) {
            item.provinceId = parseInt(value);
            item.districtId = undefined;
            this.showPopupDistrict(value as number, item).then();
        } else {
            item.provinceId = undefined;
            item.districtId = undefined;
        }
    }

    protected handlerAdd() {
        this.store.listArea.push({provinceId: undefined, districtId: undefined, districts: undefined});
    }

    protected handlerRemove(index: number) {
        this.store.listArea.splice(index, 1);
    }

    protected async showPopupDistrict(provice_id: number, item: IArea) {
        await TEMPLATE_CTRL.GET_getListDistrict(provice_id, item);
        if (this.PopupDistrictRef.current) this.PopupDistrictRef.current.show(item);
    }

    protected isDisabled(item: { id: number, provinceName: string }): boolean {
        return this.store.listArea.findIndex(value => value.provinceId === item.id) !== -1;
    }

    protected getDistrict(district_id: number, area: IArea): React.ReactNode {
        if (area.districts) {
            const index_search = area.districts.findIndex(value => value.id === district_id);
            if (index_search !== -1) {
                const district = area.districts[index_search];
                return <li key={district_id}
                           onClick={() => this.showPopupDistrict(area.provinceId as number, area)}>{district.districtName}</li>
            }
        }
        return null; //default
    }

    render() {
        return <div>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Tỉnh/ Thành phố</th>
                    <th>
                        <button className="btn" onClick={() => this.handlerAdd()}><i className="fas fa-plus"/></button>
                    </th>
                </tr>
                </thead>
                <tbody>
                {this.store.listArea.map((value, index) =>
                    <tr key={index}>
                        <td>
                            <select className="form-control"
                                    value={value.provinceId ? value.provinceId.toString() : 'undefined'}
                                    onChange={e => this.handlerOnChangeProvince(e, value)}>
                                <option value="undefined">---Lựa chọn---</option>
                                {this.store.listProvince.map((value1, index1) =>
                                    <option key={index1} value={value1.id} disabled={this.isDisabled(value1)}>{value1.provinceName}</option>)}
                            </select>
                            {(value.districtId && value.districts) && <div className="list-selected">
                                <h4>Quận/ Huyện đã chọn</h4>
                                <ul>
                                    {value.districtId.map(value1 => this.getDistrict(value1, value))}
                                </ul>
                            </div>}
                        </td>
                        <td>
                            {this.store.listArea.length > 1 && <button className="btn" onClick={() => this.handlerRemove(index)}><i className="fas fa-minus"/></button>}
                        </td>
                    </tr>)}
                </tbody>
            </table>
            <PopupDistrict ref={this.PopupDistrictRef}/>
        </div>;
    }
}