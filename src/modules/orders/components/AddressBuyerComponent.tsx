import React from "react";
import "../containers/AddressBuyerStyle.scss";
import {numberWithCommas} from "../../../common/functions/FormatFunc";

interface IAddressBuyerComponentProps {
    type: 'normal' | 'return',
    name: string,
    phoneNumber: string,
    detailAddress: string,
    wardName: string,
    districtName: string,
    provinceName: string,
    hiddenShipping?: boolean,
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED',
    note?: {
        type: 'ADMIN' | 'SELLER' | 'BUYER',
        text: string
    }[]
    loadding?: boolean
    /*Emit Action*/
    shippingOnChange?: (id: number) => void,
    shippingName?: string,
    shippingCode?: string,
    listShipping?: { shopId: number, services: { name: string, fee: number, serviceId: number }[] }[],
    shippingPartnerCode?: string

    emitPrint?: () => void
}

export const AddressBuyerComponent: React.FC<IAddressBuyerComponentProps> = (props: IAddressBuyerComponentProps) => {
    const getNote = (value: { type: 'ADMIN' | 'SELLER' | 'BUYER', text: string }): string => {
        const EnumType = {
            'ADMIN': 'Chozoi',
            'SELLER': 'Người bán',
            'BUYER': 'Người mua'
        };
        return `${EnumType[value.type]}: ${value.text}.`;
    };

    const renderBtnPrint = (): React.ReactNode => {
        if (props.type === "normal" && (props.shippingPartnerCode === "SELLER_EXPRESS" || props.shippingCode) && props.emitPrint) {
            return <button className="mt-3 btn btn-sm btn-warning"
                           onClick={() => props.emitPrint && props.emitPrint()}>In phiếu giao</button>;
        } else return null;
    }

    return (<div className="row" id="order-return-address-buyer">
        <div className="col-xs-6">
            <p className="title"><i className="fas fa-map-marker-alt"/> Địa chỉ nhận hàng</p>
            <ul>
                <li>Tên khách hàng: {props.name}</li>
                <li>Điện thoại: {props.phoneNumber}</li>
                <li>Địa
                    chỉ: {`${props.detailAddress} - ${props.wardName} - ${props.districtName} - ${props.provinceName}`}</li>
            </ul>
        </div>
        {!props.hiddenShipping && <div className="col-xs-6">
            <p className="title"><i className="fas fa-shipping-fast"/> Thông tin vận chuyển</p>
            {props.loadding &&
            <div className="loadding"><img src='/assets/images/gif/loading_data.gif' alt="loading"/></div>}
            {!props.loadding && <div>
                {/*Đơn chờ xử lý*/}
                {props.state !== "DRAFT" && <ul>
                    <li>Đơn vị: {props.shippingName ? props.shippingName : 'Chưa có'}</li>
                    <li>Mã vận đơn: {props.shippingCode ? props.shippingCode : 'Chưa có'}</li>
                </ul>}
                {renderBtnPrint()}
                {/*Đơn đã được xử lý*/}
                {props.state === "DRAFT" &&
                <div className="input-group mar-btm">
                    <span className="input-group-addon" style={{width: '70px'}}>Đơn vị</span>
                    <select
                        defaultValue=""
                        onChange={(e: any) => props.shippingOnChange && props.shippingOnChange(parseInt(e.currentTarget.value))}
                        className="form-control" style={{width: 'auto'}}>
                        <option value="" disabled={true}>----- Lựa chọn -----</option>
                        {props.listShipping && props.listShipping.map(value => value.services.map((value1, index) =>
                            <option key={index}
                                    value={value1.serviceId}>{value1.name} ({numberWithCommas(value1.fee)} đ)</option>))}
                    </select>
                </div>}
            </div>}
        </div>}
        {props.note && props.note.length > 0 && <div className="col-xs-12">
            <p>Ghi chú:</p>
            <ul>
                {props.note.map((value, index) => <li key={index}>{getNote(value)}</li>)}
            </ul>
        </div>}
    </div>);
};

export default AddressBuyerComponent;
