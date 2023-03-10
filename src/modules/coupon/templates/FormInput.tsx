import React from "react";
import {observer} from "mobx-react";
import {TemplateStore} from "./store";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import "bootstrap-datepicker";
import MyDatePicker from "./MyDatePicker";
import {notify} from "../../../common/notify/NotifyService";
import {TEMPLATE_CTRL} from "./controls";
import {ICoupon} from "../manager/store";

interface IFormInputProps {
    type: 'CREATE' | 'UPDATE',
}

@observer
export default class FormInput extends React.Component<IFormInputProps, any> {
    protected handlerOnChangeType() {
        TemplateStore.minPrice = 0;
        TemplateStore.discount = 0;
        TemplateStore.maxDiscount = 0;
    }

    protected handlerOnChangeInput(event: any, key: 'name' | 'amount' | 'limited' | 'minPrice' | 'discount' | 'maxDiscount' | 'fromDate' | 'toDate' | 'acceptDate') {
        let value: string | number = event.currentTarget.value || '';
        switch (key) {
            case "name":
                value.toString().length < 50 && (TemplateStore[key] = value.toString());
                break;
            case "amount":
            case "limited":
            case "minPrice":
            case "maxDiscount":
            case "discount":
                value = value.toString().replace(/\./gm, '');
                value = parseInt(value);
                if (!isNaN(value)) {
                    if (key === "discount")
                        TemplateStore[key] = TemplateStore.type === "PERCENT" && value > 100 ? 100 : value;
                    else if (key === "amount")
                        TemplateStore[key] = value < 1000000 ? value : 999999;
                    else TemplateStore[key] = value;
                } else TemplateStore[key] = 0;
                break;
            case "fromDate":
                value = typeof value === "string" ? parseInt(value) : value;
                const date_selected: Date = new Date(value * 1000);
                const now = new Date();
                now.setMonth(now.getMonth() + 3);
                if (date_selected.getTime() > now.getTime()) {
                    TemplateStore[key] = Math.floor(Date.now() / 1000);
                    notify.show('Th???i gian b???t ?????u ch??? ???????c ?????t tr?????c t???i ??a 3 th??ng', "error");
                } else TemplateStore[key] = value;
                break;
            case "toDate":
                value = typeof value === "string" ? parseInt(value) : value;
                const date_selected1: Date = new Date(value * 1000);
                const now1 = new Date();
                now1.setFullYear(now1.getFullYear() + 1);
                if (date_selected1.getTime() > now1.getTime()) {
                    TemplateStore[key] = Math.floor(Date.now() / 1000);
                    notify.show('Th???i gian k???t th??c ch??? ???????c ?????t tr?????c t???i ??a 1 n??m', "error");
                } else {
                    let date = new Date(value * 1000);
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
                    TemplateStore[key] = Math.floor(date.getTime() / 1000);
                }
                break;
            case "acceptDate":
                TemplateStore[key] = typeof value === "string" ? parseInt(value) : value;
                break;
        }
    }

    protected validateForm(): boolean {
        if (!TemplateStore.name) {
            notify.show('Vui l??ng nh???p m?? gi???m gi??', "error");
            return false;
        }
        if (TemplateStore.fromDate === 0 || TemplateStore.toDate === 0) {
            notify.show('Vui l??ng nh???p ?????y ????? th???i gian ??p d???ng', "error");
            return false;
        }
        if (TemplateStore.fromDate >= TemplateStore.toDate) {
            notify.show('Kho???ng th???i gian kh??ng h???p l???', "error");
            return false;
        }
        if (TemplateStore.fromDate > 0) {
            if (this.props.type === "CREATE") {
                const date = new Date(Date.now());
                const date_00h00p00s: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                const now_utc0 = Math.floor(date_00h00p00s.getTime() / 1000);
                if (TemplateStore.fromDate < now_utc0) {
                    notify.show('Vui l??ng ch???n th???i gian b???t ?????u ??p d???ng ??? ng??y hi???n t???i ho???c trong t????ng lai!', "error")
                    return false;
                }
            }
        }
        if (TemplateStore.acceptDate > 0 && TemplateStore.acceptDate > TemplateStore.fromDate) {
            notify.show('Vui l??ng ch???n th???i gian thu nh???p tr?????c th???i gian b???t ?????u s??? d???ng m??', "error");
            return false;
        }
        if (TemplateStore.amount === 0) {
            notify.show('Vui l??ng nh???p s??? l?????ng m?? gi???m gi??', "error");
            return false;
        } //
        else if (this.props.type === "UPDATE" && TemplateStore.promotionTemp && TemplateStore.amount < (TemplateStore.promotionTemp.totalCoupon - TemplateStore.promotionTemp.currentCoupon)) {
            notify.show('Kh??ng th??? thay ?????i s??? l?????ng m?? nh??? h??n s??? l?????ng c??n l???i', "error");
            return false;
        }
        if (TemplateStore.limited === 0) {
            notify.show('Vui l??ng nh???p gi???i h???n s??? l?????t s??? d???ng c???a kh??ch h??ng', "error");
            return false;
        }
        if (TemplateStore.minPrice === 0) {
            notify.show('Vui l??ng nh???p gi?? tr??? ????n h??ng t???i thi???u', "error");
            return false;
        } else if (TemplateStore.minPrice % 1000 !== 0) {
            notify.show('Vui l??ng nh???p gi?? tr??? ????n h??ng l?? b???i s??? c???a 1000', "error");
            return false;
        }
        if (TemplateStore.discount === 0) {
            notify.show(`Vui l??ng nh???p ${TemplateStore.type === "SOILD" ? 's??? ti???n gi???m' : 'ph???n tr??m gi???m'}`, "error");
            return false;
        } else if (TemplateStore.type === "SOILD" && TemplateStore.discount % 1000 !== 0) {
            notify.show(`Vui l??ng nh???p s??? ti???n gi???m l?? b???i s??? c???a 1000`, "error");
            return false;
        }
        return true;
    }

    protected handerOnAgree() {
        if (this.validateForm()) {
            if (TemplateStore.typeProduct === "ALL") {
                if (this.props.type === "CREATE") TEMPLATE_CTRL.POST_createCoupon().then()
                else if (this.props.type === "UPDATE") TEMPLATE_CTRL.POST_updateCoupon((TemplateStore.promotionTemp as ICoupon).id).then();
            } else {
                this.props.type === "UPDATE" && (TemplateStore.forceRenderBtnSave = true);
                TemplateStore.steep = 1;
            }
        }
    }

    protected isDisabled(key: 'name' | 'fromDate' | 'toDate' | 'acceptDate' | 'amount' | 'limited' | 'type'): boolean {
        if (this.props.type === "UPDATE" && TemplateStore.promotionTemp) {
            switch (key) {
                case "name":
                case "limited":
                case "type":
                case "fromDate":
                case "acceptDate":
                    return TemplateStore.promotionTemp.state !== "COMINGSOON";
                case "toDate":
                    return /^(FINISHED|CLOSE|PAUSING|)$/.test(TemplateStore.promotionTemp.state);
                case "amount":
                    return !/^(COMINGSOON|PROCESSING|)$/.test(TemplateStore.promotionTemp.state);
                default:
                    return false;
            }
        }
        return false;
    }

    render() {
        if (TemplateStore.steep === 0)
            return <div className="container form-input">
                <div className="row">
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">M?? gi???m gi?? *</label>
                            <input type="text"
                                   className="form-control"
                                   value={TemplateStore.name}
                                   onChange={e => this.handlerOnChangeInput(e, "name")}
                                   disabled={this.isDisabled("name")}
                            />
                        </div>
                    </div>
                </div>
                <div className="row datetime">
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">Th???i gian ??p d???ng *</label>
                            <p className="text-info">L?? th???i gian kh??ch h??ng c?? th??? s??? d???ng m?? gi???m gi?? n??y</p>
                            <div className="d-flex align-items-center">
                                <MyDatePicker
                                    id={'fromDate'}
                                    placeholder={'T??? ng??y'}
                                    disabled={this.isDisabled("fromDate")}
                                    setDate={TemplateStore.fromDate !== 0 ? TemplateStore.fromDate : undefined}
                                    OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "fromDate")}/>
                                <div className="mx-2">-</div>
                                <MyDatePicker
                                    id={'toDate'}
                                    placeholder={'?????n ng??y'}
                                    disabled={this.isDisabled("toDate")}
                                    setDate={TemplateStore.toDate !== 0 ? TemplateStore.toDate : undefined}
                                    OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "toDate")}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">Th???i gian thu nh???p m?? gi???m gi?? <i className="fal fa-info-circle"
                                                                                               data-toggle="tooltip"
                                                                                               data-placement="top"
                                                                                               title="Th???i gian thu th???p m?? gi???m gi?? ph???i tr?????c th???i gian ??p d???ng"
                            /></label>
                            <p className="text-info">Kh??ch h??ng c?? th??? thu th???p m?? gi???m gi?? sau th???i gian n??y</p>
                            <MyDatePicker
                                id={'acceptDate'}
                                placeholder={'T??? ng??y'}
                                disabled={this.isDisabled("acceptDate")}
                                setDate={TemplateStore.acceptDate !== 0 ? TemplateStore.acceptDate : undefined}
                                OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "acceptDate")}/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">S??? l?????ng m?? gi???m gi?? c???a ch????ng tr??nh *</label>
                            <input type="text"
                                   className="form-control"
                                   disabled={this.isDisabled("amount")}
                                   value={TemplateStore.amount ? numberWithCommas(TemplateStore.amount) : ''}
                                   onChange={e => this.handlerOnChangeInput(e, "amount")}
                            />
                        </div>
                    </div>
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">S??? l?????ng s??? d???ng t???i ??a c???a m???t kh??ch h??ng *</label>
                            <input type="text"
                                   className="form-control"
                                   disabled={this.isDisabled("limited")}
                                   value={TemplateStore.limited ? numberWithCommas(TemplateStore.limited) : ''}
                                   onChange={e => this.handlerOnChangeInput(e, "limited")}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <label className="control-label">Lo???i gi???m gi?? *</label>
                    </div>
                    <div className="col-xs-6">
                        <div className="radio">
                            <input id="demo-form-radio-1"
                                   className="magic-radio"
                                   type="radio"
                                   disabled={this.isDisabled("type")}
                                   name="form-radio-button"
                                   checked={TemplateStore.type === "SOILD"}
                                   onChange={() => this.handlerOnChangeType()}
                                   onClick={() => TemplateStore.type = "SOILD"}
                            />
                            <label htmlFor="demo-form-radio-1">M?? gi???m gi?? theo s??? ti???n c??? ?????nh</label>
                        </div>
                        {TemplateStore.type === "SOILD" && <div>
                            <div className="form-group">
                                <label className="control-label">Gi?? tr??? ????n h??ng t???i thi???u *</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.minPrice ? numberWithCommas(TemplateStore.minPrice) : ''}
                                       onChange={(e) => this.handlerOnChangeInput(e, "minPrice")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">S??? ti???n gi???m *</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.discount ? numberWithCommas(TemplateStore.discount) : ''}
                                       onChange={(e) => this.handlerOnChangeInput(e, "discount")}
                                />
                            </div>
                        </div>}
                    </div>
                    <div className="col-xs-6">
                        <div className="radio">
                            <input id="demo-form-radio-2"
                                   className="magic-radio"
                                   type="radio"
                                   disabled={this.isDisabled("type")}
                                   name="form-radio-button"
                                   checked={TemplateStore.type === "PERCENT"}
                                   onChange={(e) => this.handlerOnChangeType()}
                                   onClick={() => TemplateStore.type = "PERCENT"}
                            />
                            <label htmlFor="demo-form-radio-2">M?? gi???m gi?? theo ph???n tr??m</label>
                        </div>
                        {TemplateStore.type === "PERCENT" && <div>
                            <div className="form-group">
                                <label className="control-label">Gi?? tr??? ????n h??ng t???i thi???u *</label>
                                <input type="text"
                                       className="form-control"
                                       disabled={this.isDisabled("type")}
                                       value={TemplateStore.minPrice ? numberWithCommas(TemplateStore.minPrice) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "minPrice")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Ph???n tr??m gi???m *</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.discount ? numberWithCommas(TemplateStore.discount) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "discount")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">M???c gi???m t???i ??a cho m???i ????n h??ng</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.maxDiscount ? numberWithCommas(TemplateStore.maxDiscount) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "maxDiscount")}
                                />
                            </div>
                        </div>}
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="control-label">??p d???ng cho *</label>
                    </div>
                    <div className="col-xs-6">
                        <div className="radio">
                            <input id="demo-form-radio-3"
                                   className="magic-radio"
                                   type="radio"
                                   name="radio-products"
                                   readOnly
                                   disabled={this.isDisabled("type")}
                                   checked={TemplateStore.typeProduct === "ALL"}
                                   onClick={() => TemplateStore.typeProduct = "ALL"}
                            />
                            <label htmlFor="demo-form-radio-3">To??n b??? s???n ph???m</label>
                        </div>
                    </div>
                    <div className="col-xs-6">
                        <div className="radio">
                            <input id="demo-form-radio-4"
                                   className="magic-radio"
                                   type="radio"
                                   name="radio-products"
                                   readOnly
                                   disabled={this.isDisabled("type")}
                                   checked={TemplateStore.typeProduct === "OPTIONS"}
                                   onClick={() => TemplateStore.typeProduct = "OPTIONS"}
                            />
                            <label htmlFor="demo-form-radio-4">Danh s??ch s???n ph???m ??p d???ng</label>
                        </div>
                    </div>
                </div>
                <div className="action">
                    <button className="btn btn-primary mr-3"
                            disabled={TemplateStore.disabledSubmit}
                            onClick={() => this.handerOnAgree()}>X??c nh???n
                    </button>
                    <button className="btn btn-default" onClick={() => TemplateStore.Router && TemplateStore.Router.goBack()}>H???y</button>
                </div>
            </div>;
        else return null;
    }
}