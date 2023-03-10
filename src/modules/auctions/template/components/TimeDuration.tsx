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
            notify.show('Vui l??ng l???a ch???n th???i gian di???n ra', "error");
            return false;
        }
        if (this.type === "FLASH" && ((this.selectValue === "other" && this.value === 0) || this.selectValue === undefined)) {
            notify.show('Vui l??ng l???a ch???n th???i gian di???n ra', "error");
            return false;
        }
        return true;
    }

    render() {
        if (this.type === "NORMAL"||this.type==="AUCTION_INVERSE"||this.type==="AUCTION_GROUP")
            return <div className="time-auction">
                <h5>Th???i gian di???n ra *</h5>
                <label>(?????u gi?? di???n ra ngay khi s???n ph???m ???????c duy???t khi b???n ch???n "????ng ngay s???n
                    ph???m khi ???????c duy???t" ho???c b???n ph???i b???m "B???t ?????u ?????u gi??" trong m???c Qu???n l?? s???n
                    ph???m
                    ?????u gi??. Th???i gian duy???t t??? 1 - 4 ti???ng ho???c s???m h??n)</label>
                <div className="form-group">
                    <select
                        className="form-control"
                        key={this.selectValue}
                        disabled={this.props.type === "DETAIL"}
                        value={this.selectValue ? this.selectValue : 'undefined'}
                        onChange={e => this.handlerOnChangeSelect(e)}
                        required={true}>
                        <option value="undefined" disabled={true}>-- L???a ch???n --</option>
                        {[1, 2, 3, 6, 12, 24, 2 * 24, 3 * 24, 4 * 24, 5 * 24, 7 * 24, 10 * 24, 15 * 24, 20 * 24, 30 * 24].map((item, index) =>
                            <option
                                key={index}
                                value={item}>
                                {item < 24 && `${item} gi???`}
                                {item >= 24 && `${item / 24} ng??y`}
                            </option>)}
                    </select>
                </div>
            </div>;
        else
            return <div className="time-auction">
                <h5>Th???i gian di???n ra *</h5>
                <label>(?????u gi?? di???n ra ngay khi s???n ph???m ???????c duy???t khi b???n ch???n "????ng ngay s???n
                    ph???m khi ???????c duy???t" ho???c b???n ph???i b???m "B???t ?????u ?????u gi??" trong m???c Qu???n l?? s???n
                    ph???m
                    ?????u gi??. Th???i gian duy???t t??? 1 - 4 ti???ng ho???c s???m h??n)</label>
                <select className="form-control"
                        value={this.selectValue}
                        disabled={this.props.type === "DETAIL"}
                        key={this.selectValue ? this.selectValue : 'undefined'}
                        onChange={e => this.handlerOnChangeSelectFlash(e)}>
                    <option value="undefined">-- L???a ch???n --</option>
                    {this.timeDurationFlash.map((item, index) =>
                        <option key={index} value={item}>{typeof item === "string" ? 'Kh??c' : `${item} ph??t`}</option>)}
                </select>
                {this.selectValue === "other" && <div className="form-group mt-2">
                    <label>Nh???p th???i gian (ph??t) - t???i ??a 2 gi???</label>
                    <input type="text"
                           disabled={this.props.type === "DETAIL"}
                           value={this.value > 0 ? numberWithCommas(this.value) : ''}
                           onChange={e => this.onChangeInput(e)}
                           className="form-control"
                           placeholder="ph??t, <= 2 gi???"
                    />
                </div>}
            </div>;
    }
}