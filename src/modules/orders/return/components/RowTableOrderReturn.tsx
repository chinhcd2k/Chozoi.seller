import React from "react";
import {Link} from "react-router-dom";
import {Moment} from "../../../../common/functions/Moment";
import {IOrderReturnLineResponse} from "../../OrderServices";

interface IRowTableOrderReturnProps {
    data: IOrderReturnLineResponse
    /*Emit*/
    EmitOnViewImage: (url: string) => any
}

export const RowTableOrderReturn: React.FC<IRowTableOrderReturnProps> = (props: IRowTableOrderReturnProps) => {
    const getState = (): React.ReactNode => {
        switch (props.data.state) {
            case "DRAFT":
                return <label className="label label-info">Yêu cầu hoàn trả</label>;
            case "CANCELED":
                return <label className="label label-info">Yên cầu hoàn trả bị hủy</label>;
            case "COMPLETED":
                return <label className="label label-info">Đơn hàng đã được giao</label>;
            case "CONFIRMED":
                return <label className="label label-info">Đã xác nhận hoàn trả</label>;
            case "FINISHED":
                return <label className="label label-info">Hoàn thành</label>;
            case "NEW":
                return <label className="label label-info">Đợi Chozoi duyệt</label>;
            case "SHIPPING":
                return <label className="label label-info">Đang giao</label>;
            case "WAIT_REFUND":
                return <label className="label label-info">Đợi thanh toán</label>;
        }
        return null;
    };

    const getReturnType = (): React.ReactNode => {
        switch (props.data.returnType) {
            case "CHOZOI_ARBITRATION":
                return <label className="label label-info">Từ chối trả hàng</label>;
            case "CHOZOI_VIA_RETURN":
                return <label className="label label-info">Trả hàng qua Chozoi</label>;
            case "RETURN_NOT_RECEVIE":
                return <label className="label label-info">Hoàn tiền không cần nhận hàng</label>;
        }
        return null;
    };

    const getShippingName = (): string => {
        if (props.data.shippingPartner) return props.data.shippingPartner.name;
        return "";
    };

    return (<tr>
        <td className="text-center">
            <p><Link className="text-info" style={{cursor: 'pointer'}}
                     to={"/home/order-return/package/" + props.data.id}>{props.data.code}</Link>
            </p>
            <span>{Moment.getDate(props.data.createdAt, 'dd/mm/yyyy')} {Moment.getTime(props.data.createdAt, 'hh:mm')}</span>
        </td>
        <td>
            {Array.isArray(props.data.lineReturns) && props.data.lineReturns.length > 0 &&
            <img src={props.data.lineReturns[0].productImage}
                 onClick={() => props.EmitOnViewImage(props.data.lineReturns[0].productImage)}
                 alt={props.data.lineReturns[0].productName}
                 height={60} className="mr-2 cursor-pointer"/>}
            {props.data.lineReturns[0].productName}
        </td>
        <td className="text-center">{getReturnType()}</td>
        <td className="text-center">{getState()}</td>
        <td className="text-center">{getShippingName()}</td>
        <td className="text-center"/>
    </tr>)
};