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
                    notify.show('Thời gian bắt đầu chỉ được đặt trước tối đa 3 tháng', "error");
                } else TemplateStore[key] = value;
                break;
            case "toDate":
                value = typeof value === "string" ? parseInt(value) : value;
                const date_selected1: Date = new Date(value * 1000);
                const now1 = new Date();
                now1.setFullYear(now1.getFullYear() + 1);
                if (date_selected1.getTime() > now1.getTime()) {
                    TemplateStore[key] = Math.floor(Date.now() / 1000);
                    notify.show('Thời gian kết thúc chỉ được đặt trước tối đa 1 năm', "error");
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
            notify.show('Vui lòng nhập mã giảm giá', "error");
            return false;
        }
        if (TemplateStore.fromDate === 0 || TemplateStore.toDate === 0) {
            notify.show('Vui lòng nhập đầy đủ thời gian áp dụng', "error");
            return false;
        }
        if (TemplateStore.fromDate >= TemplateStore.toDate) {
            notify.show('Khoảng thời gian không hợp lệ', "error");
            return false;
        }
        if (TemplateStore.fromDate > 0) {
            if (this.props.type === "CREATE") {
                const date = new Date(Date.now());
                const date_00h00p00s: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
                const now_utc0 = Math.floor(date_00h00p00s.getTime() / 1000);
                if (TemplateStore.fromDate < now_utc0) {
                    notify.show('Vui lòng chọn thời gian bắt đầu áp dụng ở ngày hiện tại hoặc trong tương lai!', "error")
                    return false;
                }
            }
        }
        if (TemplateStore.acceptDate > 0 && TemplateStore.acceptDate > TemplateStore.fromDate) {
            notify.show('Vui lòng chọn thời gian thu nhập trước thời gian bắt đầu sử dụng mã', "error");
            return false;
        }
        if (TemplateStore.amount === 0) {
            notify.show('Vui lòng nhập số lượng mã giảm giá', "error");
            return false;
        } //
        else if (this.props.type === "UPDATE" && TemplateStore.promotionTemp && TemplateStore.amount < (TemplateStore.promotionTemp.totalCoupon - TemplateStore.promotionTemp.currentCoupon)) {
            notify.show('Không thể thay đổi số lượng mã nhỏ hơn số lượng còn lại', "error");
            return false;
        }
        if (TemplateStore.limited === 0) {
            notify.show('Vui lòng nhập giới hạn số lượt sử dụng của khách hàng', "error");
            return false;
        }
        if (TemplateStore.minPrice === 0) {
            notify.show('Vui lòng nhập giá trị đơn hàng tối thiểu', "error");
            return false;
        } else if (TemplateStore.minPrice % 1000 !== 0) {
            notify.show('Vui lòng nhập giá trị đơn hàng là bội số của 1000', "error");
            return false;
        }
        if (TemplateStore.discount === 0) {
            notify.show(`Vui lòng nhập ${TemplateStore.type === "SOILD" ? 'số tiền giảm' : 'phần trăm giảm'}`, "error");
            return false;
        } else if (TemplateStore.type === "SOILD" && TemplateStore.discount % 1000 !== 0) {
            notify.show(`Vui lòng nhập số tiền giảm là bội số của 1000`, "error");
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
                            <label className="control-label">Mã giảm giá *</label>
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
                            <label className="control-label">Thời gian áp dụng *</label>
                            <p className="text-info">Là thời gian khách hàng có thể sử dụng mã giảm giá này</p>
                            <div className="d-flex align-items-center">
                                <MyDatePicker
                                    id={'fromDate'}
                                    placeholder={'Từ ngày'}
                                    disabled={this.isDisabled("fromDate")}
                                    setDate={TemplateStore.fromDate !== 0 ? TemplateStore.fromDate : undefined}
                                    OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "fromDate")}/>
                                <div className="mx-2">-</div>
                                <MyDatePicker
                                    id={'toDate'}
                                    placeholder={'Đến ngày'}
                                    disabled={this.isDisabled("toDate")}
                                    setDate={TemplateStore.toDate !== 0 ? TemplateStore.toDate : undefined}
                                    OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "toDate")}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">Thời gian thu nhập mã giảm giá <i className="fal fa-info-circle"
                                                                                               data-toggle="tooltip"
                                                                                               data-placement="top"
                                                                                               title="Thời gian thu thập mã giảm giá phải trước thời gian áp dụng"
                            /></label>
                            <p className="text-info">Khách hàng có thể thu thập mã giảm giá sau thời gian này</p>
                            <MyDatePicker
                                id={'acceptDate'}
                                placeholder={'Từ ngày'}
                                disabled={this.isDisabled("acceptDate")}
                                setDate={TemplateStore.acceptDate !== 0 ? TemplateStore.acceptDate : undefined}
                                OnChangeDate={timestamp => this.handlerOnChangeInput({currentTarget: {value: timestamp}}, "acceptDate")}/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-6">
                        <div className="form-group">
                            <label className="control-label">Số lượng mã giảm giá của chương trình *</label>
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
                            <label className="control-label">Số lượng sử dụng tối đa của một khách hàng *</label>
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
                        <label className="control-label">Loại giảm giá *</label>
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
                            <label htmlFor="demo-form-radio-1">Mã giảm giá theo số tiền cố định</label>
                        </div>
                        {TemplateStore.type === "SOILD" && <div>
                            <div className="form-group">
                                <label className="control-label">Giá trị đơn hàng tối thiểu *</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.minPrice ? numberWithCommas(TemplateStore.minPrice) : ''}
                                       onChange={(e) => this.handlerOnChangeInput(e, "minPrice")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Số tiền giảm *</label>
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
                            <label htmlFor="demo-form-radio-2">Mã giảm giá theo phần trăm</label>
                        </div>
                        {TemplateStore.type === "PERCENT" && <div>
                            <div className="form-group">
                                <label className="control-label">Giá trị đơn hàng tối thiểu *</label>
                                <input type="text"
                                       className="form-control"
                                       disabled={this.isDisabled("type")}
                                       value={TemplateStore.minPrice ? numberWithCommas(TemplateStore.minPrice) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "minPrice")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Phần trăm giảm *</label>
                                <input type="text"
                                       disabled={this.isDisabled("type")}
                                       className="form-control"
                                       value={TemplateStore.discount ? numberWithCommas(TemplateStore.discount) : ''}
                                       onChange={e => this.handlerOnChangeInput(e, "discount")}
                                />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Mức giảm tối đa cho mỗi đơn hàng</label>
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
                        <label className="control-label">Áp dụng cho *</label>
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
                            <label htmlFor="demo-form-radio-3">Toàn bộ sản phẩm</label>
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
                            <label htmlFor="demo-form-radio-4">Danh sách sản phẩm áp dụng</label>
                        </div>
                    </div>
                </div>
                <div className="action">
                    <button className="btn btn-primary mr-3"
                            disabled={TemplateStore.disabledSubmit}
                            onClick={() => this.handerOnAgree()}>Xác nhận
                    </button>
                    <button className="btn btn-default" onClick={() => TemplateStore.Router && TemplateStore.Router.goBack()}>Hủy</button>
                </div>
            </div>;
        else return null;
    }
}