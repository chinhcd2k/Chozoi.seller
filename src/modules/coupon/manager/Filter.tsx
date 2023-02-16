import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {ManagerCouponStore} from "./store";

interface IFilterProps {
    OnSearch: () => any
}

@observer
export default class Filter extends React.Component<IFilterProps, any> {
    public ArrStatus = [
        {
            name: 'Tất cả',
            value: ''
        },
        {
            name: 'Sắp diễn ra',
            value: 'COMINGSOON'
        },
        {
            name: 'Đang diễn ra',
            value: 'PROCESSING'
        },
        {
            name: 'Tạm ngưng',
            value: 'PAUSING'
        },
        {
            name: 'Đã kết thúc',
            value: 'FINISHED'
        },
    ]

    render() {
        return <div className="filter d-flex">
            <select className="form-control w-auto"
                    value={ManagerCouponStore.getStatus ? ManagerCouponStore.getStatus : ''}
                    onChange={e => ManagerCouponStore.status = e.currentTarget.value ? (e.currentTarget.value as any) : undefined}>
                {this.ArrStatus.map((value, index) =>
                    <option key={index} value={value.value}>{value.name}</option>)}
            </select>
            <div className="input-group mar-btm">
                <input type="text"
                       placeholder="Tìm kiếm"
                       className="form-control"
                       onChange={e => ManagerCouponStore.keyword = e.currentTarget.value}
                       value={ManagerCouponStore.getKeyword}/>
                <span className="input-group-btn">
                    <button className="btn btn-primary"
                            type="button"
                            onClick={() => this.props.OnSearch()}
                    ><i className="fal fa-search"/></button>
                </span>
            </div>
            <div className="input-group group-btn">
                <Link type="button" to={"/home/coupon/create"} className="btn btn-primary"><i className="fal fa-plus"/> Tạo mã giảm giá</Link>
            </div>
        </div>;
    }
}