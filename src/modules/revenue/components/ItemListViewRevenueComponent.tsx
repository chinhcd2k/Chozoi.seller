import React from "react";
import {IRevenueWalletResponse} from "../RevenueServices";
import * as Sentry from "@sentry/browser";
import {convertDateToString, numberWithCommas} from "../../../common/functions/FormatFunc";

interface ItemListViewRevenueComponentProps {
    data: IRevenueWalletResponse
    emitActionShowDetail: (e: any) => void
}

export const ItemListViewRevenueComponent: React.FC<ItemListViewRevenueComponentProps> = (props: ItemListViewRevenueComponentProps) => {
    try {
        return (
            <tr>
                <td>{convertDateToString(props.data.createdAt, true, true)}</td>
                <td>
                    <span className="cursor-pointer text-info"
                          onClick={e => props.emitActionShowDetail(e)}>{props.data.transactionCode}</span>
                </td>
                <td>
                    <p>{props.data.typeDescription}</p>
                    {props.data.description}
                </td>
                <td className="text-center">
                    {(props.data.state === 'PENDING' || props.data.state === 'NEW') &&
                    <span className="label label-warning">Chờ xử lý</span>}
                    {(props.data.state === 'APPROVED' || props.data.state === 'PROCESSING') &&
                    <span className="label label-warning">Đang xử lý</span>}
                    {props.data.state === 'FAILED' &&
                    <span className="label label-danger">Thất bại</span>}
                    {props.data.state === 'SUCCESS' &&
                    <span className="label label-success">Thành công</span>}
                    {props.data.state === 'REJECT' &&
                    <span className="label label-danger">Bị từ chối</span>}
                </td>
                {/*Số tiền*/}
                <td className="text-right">
                    {props.data.type === 'TRANSFERS' && <span
                        className={`${props.data.amount >= 0 ? "text-success" : "text-danger"}`}>{numberWithCommas(props.data.amount, 'đ')}</span>}
                    {/*-------------*/}
                    {props.data.type === 'WITH_DRAWAL' && <div>
                        <div
                            className="text-success">{numberWithCommas(props.data.amount, 'đ')}</div>
                        {props.data.transactionFee && props.data.transactionFee > 0 ? <span className="text-danger">(Phí GD: {numberWithCommas(props.data.transactionFee, 'đ')})</span> : ''}
                    </div>}
                </td>
                <td className="text-right"><span
                    className="text-semibold">{numberWithCommas(props.data.confirmedAmount, 'đ')}</span>
                </td>
            </tr>
        );
    } catch (e) {
        console.log(e);
        Sentry.captureEvent(e);
        return <tr>
            <td colSpan={6}>Render error!</td>
        </tr>
    }
};