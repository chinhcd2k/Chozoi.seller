import React from "react";
import {observer} from "mobx-react";
import {ILineResponse} from "../../OrderServices";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";

interface ICouponSellerProps {
    detailLineStore: ILineResponse
}

@observer
export default class CouponSeller extends React.Component<ICouponSellerProps, any> {
    private detailLineStore = this.props.detailLineStore as ILineResponse;

    protected hasSellerCoupon(type?: 'ORDER_SHOP' | 'SHIPPING'): boolean {
        let has: boolean = false;
        this.detailLineStore.discounts.map(value => {
            if (!type) value.providedBy === "SELLER" && (has = true);
            else value.providedBy === "SELLER" && (value.couponType === type) && (has = true);
            return null;
        });
        return has;
    }

    protected getDiscount(type: 'ORDER_SHOP' | 'SHIPPING'): number {
        let discount = 0;
        this.detailLineStore.discounts.map(value => value.providedBy === "SELLER" &&
            (value.couponType === type) &&
            (discount += value.discountAmountUnit * (this.detailLineStore.quantity - this.detailLineStore.returnQuantity)));
        return discount;
    }

    protected getDiscountName(type: 'ORDER_SHOP' | 'SHIPPING'): string {
        let name = '';
        this.detailLineStore.discounts.map(value => value.providedBy === "SELLER" &&
            (value.couponType === type) && (name = value.wallet.name));
        return name.toUpperCase();
    }

    render() {
        if (this.hasSellerCoupon())
            return <div className="card" id="coupon-seller">
                <p className="title font-weight-bold"><i className="fas fa-credit-card"/> Mã giảm giá</p>
                <ul>
                    {this.hasSellerCoupon("ORDER_SHOP") && <li className="row">
                        <div className="col-xs-6">Tên chương trình (giảm giá đơn
                            hàng): <span>{this.getDiscountName("ORDER_SHOP")}</span></div>
                        <div className="col-xs-6">Mức giảm: {numberWithCommas(this.getDiscount("ORDER_SHOP"))} đ</div>
                    </li>}
                    {this.hasSellerCoupon("SHIPPING") && <li className="row">
                        <div className="col-xs-6">Tên chương trình (giảm giá vận
                            chuyển): <span>{this.getDiscountName("SHIPPING")}</span></div>
                        <div className="col-xs-6">Mức giảm: {numberWithCommas(this.getDiscount("SHIPPING"))} đ</div>
                    </li>}
                </ul>
            </div>;
        else return null;
    }
}