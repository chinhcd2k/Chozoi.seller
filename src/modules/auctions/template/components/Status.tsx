import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";

@observer
export default class Status extends React.Component<{ type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N' }, object> {
    @observable autoPublic: boolean | undefined = undefined;

    public hasValidate(): boolean {
        if (this.autoPublic === undefined) {
            notify.show('Vui lòng chọn hiển thị ngay', "error");
            return false;
        }
        return true;
    }

    render() {
        return <div className="card-body">
            <h5>Hiển thị ngay *</h5>
            <ul style={{paddingLeft: '16px'}}>
                <li>Khi bạn chọn <b>"Có"</b>: sản phẩm sẽ được đấu giá ngay sau khi được duyệt</li>
                <li>Khi bạn chọn <b>"Không"</b>: Bạn có thể "Bắt đầu đấu giá" trong mục "<Link
                    style={{color: '#1976d2'}} to="/home/auctions?page=0&size=10">Quản lý sản phẩm đấu
                    giá</Link>" ngay sau khi sản phẩm được duyệt.
                </li>
            </ul>
            <div className='d-flex justify-content-between mx-5'>
                <div><input id="infomation-radio-3"
                            className="magic-radio"
                            readOnly={true}
                            disabled={this.props.type === "DETAIL"}
                            checked={this.autoPublic === true}
                            onClick={() => this.autoPublic = true}
                            type="radio"
                            name="inline-form-radio-auto-public"
                /><label
                    htmlFor="infomation-radio-3">Có</label>
                </div>
                <div><input id="infomation-radio-4"
                            className="magic-radio"
                            readOnly={true}
                            disabled={this.props.type === "DETAIL"}
                            checked={this.autoPublic === false}
                            onClick={() => this.autoPublic = false}
                            type="radio"
                            name="inline-form-radio-auto-public"
                /><label
                    htmlFor="infomation-radio-4">Không</label>
                </div>
            </div>
        </div>;
    }
}