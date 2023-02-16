import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";

@observer
export default class TimeDuration extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    private timeDurationFlash = [1, 2, 5, 10, 30, 'other'];
    @observable type: 'NORMAL' | 'FLASH'| 'AUCTION_INVERSE'|'AUCTION_GROUP' = "NORMAL";
    @observable selectValue: number | 'other' | undefined;
    @observable value: number = 0;

    public changeAuctionType(type: 'NORMAL' | 'FLASH'|'AUCTION_INVERSE'|'AUCTION_GROUP') {
        this.selectValue = undefined;
        this.type = type;
        this.value = 0;
    }

    protected onChangeInput(event: SyntheticEvent<HTMLInputElement>) {
        let value: string | number = event.currentTarget.value;
        value = value.replace(/[^0-9]/, '');
        value = parseInt(value);
        this.value = !isNaN(value) ? Math.min(120, value) : 0;
    }

    protected handlerOnChangeSelect(e: SyntheticEvent<HTMLSelectElement>) {
        const value = e.currentTarget.value;
        if (value === 'undefined') this.selectValue = undefined;
        else this.selectValue = parseInt(value);
    }

    protected handlerOnChangeSelectFlash(e: SyntheticEvent<HTMLSelectElement>) {
        const value = e.currentTarget.value;
        if (value === 'undefined') this.selectValue = undefined;
        else if (value === "other") {
            this.selectValue = 'other';
            this.value = 0;
        } else this.selectValue = parseInt(value);
    }

    public setTimeDurationStore(time: number, type: 'NORMAL' | 'FLASH'|'AUCTION_INVERSE'|"AUCTION_GROUP") {
        if (type === "NORMAL"||type==='AUCTION_INVERSE'||type==='AUCTION_GROUP') this.selectValue = time;
        else {
            const index_search = this.timeDurationFlash.findIndex(value1 => value1 === time);
            if (index_search !== -1)
                this.selectValue = time;
            else {
                this.selectValue = "other";
                this.value = time;
            }
        }
    }

    public hasValidate(): boolean {
        if ((this.type === "NORMAL"||this.type==="AUCTION_GROUP"||this.type==='AUCTION_INVERSE') && this.selectValue === undefined) {
            notify.show('Vui lòng lựa chọn thời gian diễn ra', "error");
            return false;
        }
        if (this.type === "FLASH" && ((this.selectValue === "other" && this.value === 0) || this.selectValue === undefined)) {
            notify.show('Vui lòng lựa chọn thời gian diễn ra', "error");
            return false;
        }
        return true;
    }

    render() {
        if (this.type === "NORMAL"||this.type==="AUCTION_INVERSE"||this.type==="AUCTION_GROUP")
            return <div className="time-auction">
                <h5>Thời gian diễn ra *</h5>
                <label>(Đấu giá diễn ra ngay khi sản phẩm được duyệt khi bạn chọn "Đăng ngay sản
                    phẩm khi được duyệt" hoặc bạn phải bấm "Bắt đầu đấu giá" trong mục Quản lý sản
                    phẩm
                    đấu giá. Thời gian duyệt từ 1 - 4 tiếng hoặc sớm hơn)</label>
                <div className="form-group">
                    <select
                        className="form-control"
                        key={this.selectValue}
                        disabled={this.props.type === "DETAIL"}
                        value={this.selectValue ? this.selectValue : 'undefined'}
                        onChange={e => this.handlerOnChangeSelect(e)}
                        required={true}>
                        <option value="undefined" disabled={true}>-- Lựa chọn --</option>
                        {[1, 2, 3, 6, 12, 24, 2 * 24, 3 * 24, 4 * 24, 5 * 24, 7 * 24, 10 * 24, 15 * 24, 20 * 24, 30 * 24].map((item, index) =>
                            <option
                                key={index}
                                value={item}>
                                {item < 24 && `${item} giờ`}
                                {item >= 24 && `${item / 24} ngày`}
                            </option>)}
                    </select>
                </div>
            </div>;
        else
            return <div className="time-auction">
                <h5>Thời gian diễn ra *</h5>
                <label>(Đấu giá diễn ra ngay khi sản phẩm được duyệt khi bạn chọn "Đăng ngay sản
                    phẩm khi được duyệt" hoặc bạn phải bấm "Bắt đầu đấu giá" trong mục Quản lý sản
                    phẩm
                    đấu giá. Thời gian duyệt từ 1 - 4 tiếng hoặc sớm hơn)</label>
                <select className="form-control"
                        value={this.selectValue}
                        disabled={this.props.type === "DETAIL"}
                        key={this.selectValue ? this.selectValue : 'undefined'}
                        onChange={e => this.handlerOnChangeSelectFlash(e)}>
                    <option value="undefined">-- Lựa chọn --</option>
                    {this.timeDurationFlash.map((item, index) =>
                        <option key={index} value={item}>{typeof item === "string" ? 'Khác' : `${item} phút`}</option>)}
                </select>
                {this.selectValue === "other" && <div className="form-group mt-2">
                    <label>Nhập thời gian (phút) - tối đa 2 giờ</label>
                    <input type="text"
                           disabled={this.props.type === "DETAIL"}
                           value={this.value > 0 ? numberWithCommas(this.value) : ''}
                           onChange={e => this.onChangeInput(e)}
                           className="form-control"
                           placeholder="phút, <= 2 giờ"
                    />
                </div>}
            </div>;
    }
}