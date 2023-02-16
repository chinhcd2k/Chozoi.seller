import React from "react";
import {observer} from "mobx-react";
import {TEMPLATE_CTRL} from "./controls";
import {IFee} from "./store";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {notify} from "../../../../common/notify/NotifyService";

@observer
export default class TableFee extends React.Component<any, any> {
    private store = TEMPLATE_CTRL.store;

    protected handlerAdd() {
        const length = this.store.listFee.length;
        const item_last = this.store.listFee[length - 1];
        if (!item_last.minWeight || !item_last.maxWeight)
            notify.show('Vui lòng hoàn thiện biểu phí hiện tại!', "warning");
        else if (item_last.minWeight && item_last.maxWeight && item_last.minWeight >= item_last.maxWeight)
            notify.show('Biểu phí hiện tại không hợp lệ!', "warning");
        else this.store.listFee.push({
                minWeight: (this.store.listFee[length - 1].maxWeight as number) + 1,
                maxWeight: undefined,
                fee: undefined
            })
    }

    protected handlerRemove(index: number) {
        this.store.listFee.splice(index, 1);
    }

    protected handlerOnChangeInput(event: any, key: 'minWeight' | 'maxWeight' | 'fee', item: IFee) {
        let value: string | number = event.currentTarget.value;
        value = value.toString().replace(/\./g, '');
        value = parseInt(value);
        if (!isNaN(value)) {
            item[key] = value;
        } else item[key] = undefined;
    }

    render() {
        return <table className="table table-striped">
            <thead>
            <tr>
                <th>Cân nặng (gram)</th>
                <th>Giá thành</th>
                <th>
                    <button className="btn" onClick={() => this.handlerAdd()}><i className="fas fa-plus"/></button>
                </th>
            </tr>
            </thead>
            <tbody>
            {this.store.listFee.map((value, index) =>
                <tr key={index}>
                    <td>
                        <div className="d-flex justify-content-center">
                            <div className="input-group">
                                <span className="input-group-btn">
                                    <button className="btn btn-mint" type="button">Từ</button>
                                </span>
                                <input type="text"
                                       className="form-control"
                                       placeholder="Nhập số cân nặng"
                                       disabled={index > 0 || index < this.store.listFee.length - 1}
                                       value={value.minWeight ? numberWithCommas(value.minWeight) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "minWeight", value)}
                                       autoComplete="off"/>
                            </div>
                            <div className="input-group ml-3">
                                <span className="input-group-btn">
                                    <button className="btn btn-mint" type="button">Đến</button>
                                </span>
                                <input type="text"
                                       className="form-control"
                                       placeholder="Nhập số cân nặng"
                                       disabled={index < this.store.listFee.length - 1}
                                       value={value.maxWeight ? numberWithCommas(value.maxWeight) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "maxWeight", value)}
                                       autoComplete="off"/>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div className="d-flex justify-content-center">
                            <input type="text"
                                   className="form-control"
                                   placeholder="Nhập giá thành tương ứng mức cân nặng"
                                   value={value.fee !== undefined ? numberWithCommas(value.fee) : ''}
                                   onChange={e => this.handlerOnChangeInput(e, "fee", value)}
                                   autoComplete="off"/>
                        </div>
                    </td>
                    <td>
                        {this.store.listFee.length > 1 &&
                        <button className="btn" onClick={() => this.handlerRemove(index)}><i className="fas fa-minus"/>
                        </button>}
                    </td>
                </tr>)}
            </tbody>
        </table>;
    }
}