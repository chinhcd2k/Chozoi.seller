import React, {ReactNode} from "react";
import {IRevenueWalletResponse} from "../RevenueServices";
import * as Sentry from "@sentry/browser";
import $ from "jquery";
import "../containers/ModalDetailStyle.scss";
import {Moment} from "../../../common/functions/Moment";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {observable} from "mobx";
import {observer} from "mobx-react";

@observer
export default class ModalDetailRevenueComponent extends React.Component<any> {
    @observable data?: IRevenueWalletResponse;

    constructor(props: any) {
        super(props);
        this.state = {data: null}
    }

    public show(data: IRevenueWalletResponse) {
        this.data = data;
        setTimeout(() => $('div.modal#modal-detail-revenue').modal('show'));
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return (
                <div className="modal fade" id="modal-detail-revenue">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="d-flex justify-content-between">
                                    <p className="title m-0">{this.getState}</p>
                                    <span>{this.data ? `${Moment.getDate(this.data.createdAt, "dd/mm/yyyy")} ${Moment.getTime(this.data.createdAt, "hh:mm")}` : ''}</span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <tbody>
                                    <tr>
                                        <td>Mã giao dịch</td>
                                        <td>{this.data ? this.data.transactionCode : ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Nội dung</td>
                                        <td>{this.data ? this.data.description : ''}</td>
                                    </tr>
                                    {this.data && this.data.transactionFee > 0 && <tr>
                                        <td>Phí giao dịch</td>
                                        <td>{this.data ? numberWithCommas(this.data.transactionFee, 'đ') : ''}</td>
                                    </tr>}
                                    {/*<tr>
                                        <td>Thời gian hoàn thành</td>
                                        <td/>
                                    </tr>*/}
                                    <tr>
                                        <td>Số tiền</td>
                                        <td>{this.data ? numberWithCommas(this.data.amount, 'đ') : 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Còn lại</td>
                                        <td>{this.data ? numberWithCommas(this.data.confirmedAmount, 'đ') : 0}</td>
                                    </tr>
                                    <tr>
                                        <td>Ghi chú</td>
                                        <td>{this.data ? this.data.reason : ''}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer d-flex justify-content-center">
                                <button className="btn btn-sm btn-primary" data-dismiss="modal">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return "Render error!";
        }
    }

    get getState(): ReactNode | string {
        if (this.data) {
            if (this.data.state === "PENDING" || this.data.state === "NEW") return <div
                className="text-warning">Chờ xử lý <i
                className="fal fa-clock"/></div>;
            else if (this.data.state === "PROCESSING" || this.data.state === "APPROVED") return <div
                className="text-warning">Đang xử lý <i
                className="fa fa-refresh"/></div>;
            else if (this.data.state === "FAILED") return <div className="text-danger">Thất bại</div>
            else if (this.data.state === "REJECT") return <div>Thât bại <i className="fa fa-info"/></div>;
            else if (this.data.state === "SUCCESS") return <div className="text-success">Thành công <i
                className="fa fa-check-circle"/></div>;
        }
        return "";
    }

}