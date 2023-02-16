import React from "react";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {css} from "@emotion/core";

const Barcode = require('react-barcode');

export interface IPrintData {
    code: string,
    note: string,
    shopNote: string,
    shippingCode: string,
    shippingNoteCode: string,
    shippingSortCode: string,
    shippingPartnerName: string,
    shopName: string,
    shopContactPhone: string,
    shopContactName: string,
    shopEmail: string,
    shopContactAddress: {
        detailAddress: string,
        wardName: string,
        districtName: string,
        provinceName: string
    },
    buyerEmail: string,
    buyerContactName: string,
    buyerContactPhone: string,
    buyerContactAddress: {
        detailAddress: string,
        wardName: string,
        districtName: string,
        provinceName: string
    },
    orderLines: [
        {
            productName: string,
            priceUnit: number,
            quantity: number,
            discountUnit: number
        }
    ],
    shippingFeeTotal: number,
    paymentType: 'PAY' | 'COD',
    totalPayment: number,
    totalDiscount: number,
    totalPrice: number
    shippingPartnerCode: 'SELLER_EXPRESS' | string
}

interface IOrderPrintComponentProps {
    order: IPrintData | null
}

export default class OrderPrintComponent extends React.Component<IOrderPrintComponentProps> {
    render() {
        if (this.props.order) {
            const orderDetail: IPrintData = this.props.order as IPrintData;
            let shippingCode: string = '';
            let arrString = [];
            if (orderDetail.shippingPartnerCode !== "SELLER_EXPRESS") {
                arrString = orderDetail.shippingCode.split('.');
                shippingCode = arrString[arrString.length - 1];
            }
            return (<div css={style}>
                <div className="header d-flex">
                    <div>
                        <img className="mb-2"
                             src='/assets/images/login/logo.png'
                             alt="Chozoi" height={60}/>
                        <div className="text-center">Hotline<br/>1900 6094</div>
                    </div>
                    <div>
                        {orderDetail.shippingPartnerCode !== "SELLER_EXPRESS" &&
                        <Barcode value={shippingCode}
                                 width={2}
                                 height={40}
                                 displayValue={false}
                                 margin={0}/>}
                        {orderDetail.shippingPartnerCode !== "SELLER_EXPRESS" && <div>Mã vận đơn: {shippingCode}</div>}
                        <div>Đơn vị vận chuyển: {orderDetail.shippingPartnerName}</div>
                        <div>Mã đơn hàng: {orderDetail.code}</div>
                    </div>
                </div>
                <table className="table">
                    <tbody>
                    <tr>
                        <td className="w-50">
                            <div style={{padding: '4px 16px'}}>
                                <div>
                                    <div className="mb-1">Người gửi</div>
                                    <div><b>{orderDetail.shopName}</b></div>
                                    <div>Số điện thoại: {orderDetail.shopContactPhone}</div>
                                    <div about="address">Địa
                                        chỉ: {orderDetail.shopContactAddress.detailAddress}
                                        &nbsp;-&nbsp;{orderDetail.shopContactAddress.wardName}
                                        &nbsp;-&nbsp;{orderDetail.shopContactAddress.districtName}
                                        &nbsp;-&nbsp;{orderDetail.shopContactAddress.provinceName}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="w-50" style={{borderLeft: '1px solid'}}>
                            <div style={{padding: '4px 16px'}}>
                                <div>
                                    <div className="mb-1">Người nhận</div>
                                    <div><b>{orderDetail.buyerContactName}</b></div>
                                    <div>Số điện thoại: {orderDetail.buyerContactPhone}</div>
                                    <div about="address">Địa chỉ: {orderDetail.buyerContactAddress.detailAddress}
                                        &nbsp;-&nbsp;{orderDetail.buyerContactAddress.wardName}
                                        &nbsp;-&nbsp;{orderDetail.buyerContactAddress.districtName}
                                        &nbsp;-&nbsp;{orderDetail.buyerContactAddress.provinceName}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="shipping-and-products d-flex">
                    {arrString.length > 1 && <div className="shipping">
                        <p>Tuyến giao</p>
                        {orderDetail.shippingSortCode}
                    </div>}
                    <div className="list-products">
                        <p className="font-weight-bold mb-0">Danh sách đơn hàng</p>
                        <ol>
                            {orderDetail.orderLines.map((value, index) => index < 8 && <li
                                key={index}>{`${index + 1}. ${value.productName} - ${value.quantity}`}</li>)}
                        </ol>
                        {orderDetail.orderLines.length > 8 && <i>Một số sản phẩm có thể bị ẩn do danh sách quá dài.</i>}
                    </div>
                </div>
                <div className="footer d-flex">
                    <div>
                        <p>Tiền thu người nhận:</p>
                        <p className="font-weight-bold"
                           style={{fontSize: '1.2em'}}>{orderDetail.paymentType === 'COD' ? numberWithCommas(orderDetail.totalPayment) : 0} VND</p>
                        <div>
                            <p>Ghi chú:</p>
                            <div about="note">
                                {this.props.order && orderDetail.note && <span>- {orderDetail.note}</span>}
                                {orderDetail.note && <p>Người mua: {orderDetail.note}</p>}
                                {orderDetail.shopNote && <p>Cửa hàng: {orderDetail.shopNote}</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="box">
                            <div><b>Chữ ký người nhận</b></div>
                            <i>(Xác thực hàng nguyên vẹn)</i>
                        </div>
                    </div>
                </div>
            </div>);
        } else return null;
    }
}

const style = css`
    width: 105mm;
    height: 148mm;
    border: solid 1px black;
    margin: 20px 0 16px 20px;
    * {
        font-size: 11px;
      };
    div.header {
        padding: 10px 16px;
        & > div:nth-of-type(1) {
            margin-right: 16px;
            img {
               width: 80px;
               height: 33px;
            }
        }
    }  
    table {
        margin-bottom: 0;
    }
    table:nth-of-type(1) td {
        border-top: dashed 1px #cccccc !important;
        border-bottom: dashed 1px #cccccc;
        padding: 0 !important;
        vertical-align: top;
        div[about="address"] {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
        }
    }
    div.footer {
        padding: 0 16px;
        & > div:nth-of-type(1) {
            margin-top: 10px;
            margin-right: 16px;
            width: 320px;
            p {
                margin-bottom: 0;
            }
            div[about="note"]{
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
            }
        }
        & > div:nth-of-type(2) {
            width: 100%;
            margin-top: 16px;
            div.box {
                width: 100%;
                min-height: 110px;
                text-align: center;
                border: solid 1px black;
            }
        }
    }
    div.shipping-and-products{
        padding: 16px;
        border-bottom: dashed 1px #cccccc;
        min-height: 192px;
        div.shipping {
            width: 106px;
            height: 160px;
            border: solid 1px black;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.5em;
            font-weight: 700;
            margin-right: 16px;
            position: relative;
            p {
                margin-bottom: 0;
                position: absolute;
                top: 4px;
            }
        }
        div.list-products {
            ol {
                margin-bottom: 0;
                padding-left: 0;
                list-style: none;
                li {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 260px;
                }
            }
        }
    }
`;