import React from "react";
import {observer} from "mobx-react";
import {ManagerCouponStore} from "./store";
import PaginationComponent from "../../../common/pagination/PaginationComponent";
import {Moment} from "../../../common/functions/Moment";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import * as Sentry from "@sentry/browser";
import {Link} from "react-router-dom";
import {MANAGER_COUPON_CTRL} from "./controls";

interface IListViewProps {
    push: (path: string) => any
}

@observer
export default class ListView extends React.Component<IListViewProps, any> {
    handlerOnChangePage(page: number) {
        let url = '/home/coupon?';
        url += `type=${ManagerCouponStore.getStatus ? ManagerCouponStore.getStatus : 'all'}`;
        url += ManagerCouponStore.getKeyword ? '&name=' + ManagerCouponStore.getKeyword.trim() : '';
        url += `&page=${page}`
        this.props.push(url);
    }

    render() {
        try {
            return <div className="list-coupon table-responsive">
                <table className="table table-sm table-striped">
                    <thead>
                    <tr>
                        <th>Tên mã giảm giá</th>
                        <th>Thời gian</th>
                        <th>Áp dụng với</th>
                        <th>Đã sử dụng</th>
                        <th>Nội dung</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ManagerCouponStore.getListCoupon.length === 0 && <tr>
                        <td colSpan={7} className="text-center pt-3">Không tìm thấy dữ liệu nào</td>
                    </tr>}
                    {ManagerCouponStore.getListCoupon.map((value, index) => <tr key={index}>
                        <td>{value.name}</td>
                        <td>
                            <p className="m-0">{Moment.getDate(value.timeStart, 'dd-mm-yyyy')} {Moment.getTime(value.timeStart, "hh:mm:ss")}</p>
                            <p className="m-0">{Moment.getDate(value.timeApplyEnd, 'dd-mm-yyyy')} {Moment.getTime(value.timeApplyEnd, "hh:mm:ss")}</p>
                        </td>
                        <td>
                            {value.productType === "ALL" && 'Tất cả sản phẩm'}
                            {value.productType === "PICK" && 'Sản phẩm đã chọn'}
                        </td>
                        <td>
                            {numberWithCommas(value.totalCoupon - value.currentCoupon)}/{numberWithCommas(value.totalCoupon)}
                        </td>
                        <td>
                            <p>Mức giảm: {numberWithCommas(value.amounts[0].discountValue)} {value.discountType === "VALUE" ? 'đ' : '%'}</p>
                        </td>
                        <td>
                            {value.state === "COMINGSOON" && 'Sắp diễn ra'}
                            {value.state === "PROCESSING" && 'Đang diễn ra'}
                            {value.state === "PAUSING" && 'Đang dừng'}
                            {value.state === "FINISHED" && 'Đã kết thúc'}
                        </td>
                        <td>
                            {(value.productType === "PICK" && value.state !== "FINISHED") &&
                            <Link className="m-0 cursor-pointer" to={`/home/coupon/update/${value.id}?steep=1`}>{value.state !== "PROCESSING" ? 'Quản lý' : 'Xem'} sản phẩm</Link>}
                            {value.state !== "FINISHED" && <Link className="m-0 cursor-pointer" to={'/home/coupon/update/' + value.id}>Chỉnh sửa</Link>}
                            {value.state === "PROCESSING" &&
                            <p className="m-0 cursor-pointer pause" onClick={() => MANAGER_COUPON_CTRL.POST_changeStateCoupon(value.id, "CLOSED")}>Dừng</p>}
                            {value.state === "PAUSING" && <p className="m-0 cursor-pointer enable" onClick={() => MANAGER_COUPON_CTRL.POST_changeStateCoupon(value.id, "OPENED")}>Kích hoạt</p>}
                        </td>
                    </tr>)}
                    </tbody>
                    {(ManagerCouponStore.getMetadata.total > 0 && ManagerCouponStore.getListCoupon.length > 0) && <tfoot>
                    <tr>
                        <td colSpan={7}>
                            <div className="d-flex justify-content-end">
                                <PaginationComponent
                                    total={ManagerCouponStore.getMetadata.total}
                                    number={ManagerCouponStore.getMetadata.size}
                                    defaultActive={ManagerCouponStore.getMetadata.page}
                                    emitOnChangePage={page => this.handlerOnChangePage(page - 1)}
                                />
                            </div>
                        </td>
                    </tr>
                    </tfoot>}
                </table>
            </div>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return null;
        }
    }
}