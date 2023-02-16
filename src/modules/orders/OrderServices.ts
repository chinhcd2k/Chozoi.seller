import {BaseService, IApiResponse} from "../../common/services/BaseService";

export interface IItemListOrder {
    id: number
    shippingCode: string
    shippingPartnerName: string
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'FINISHED'
    shippingState: 'READYTOPIC' | 'PICKING' | 'RECEVIED' | 'SHIPPING' | 'SHIPPED' | null
    order: {
        paymentType: 'COD' | 'PAY',
    }
    orderLines: {
        productName: string
        productImage: string
        isFreeShip: boolean // update 11-05-2020
    }[]
    code: string
    createdAt: string
    shippingPartnerCode: 'SELLER_EXPRESS' | string
}

export interface IPackageOrderResponse {
    id: number
    code: string
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'FINISHED'
    shippingState: 'READYTOPIC' | 'PICKING' | 'RECEVIED' | 'SHIPPING' | 'SHIPPED' | null
    order: {
        id: number
        avatar: string | null;
        buyerContactName: string
        buyerEmail: string
        buyerContactPhone: string
        buyerContactAddress: {
            id: number
            detailAddress: string
            wardName: string
            districtName: string
            provinceName: string
        }
    }
    orderLines: {
        id: number
        returns: {
            id: number
            quantity: number
            shopOrderReturnId: number
        }[]
        productAttributes?: { name: string, value: string }[]
        productId: number
        priceUnit: number
        productImage: string
        productName: string
        quantity: number
        returnQuantity: number
        isFreeShip: boolean // update 11-05-2020
    }[]
    shippingFeeTotal: number
    shopName: string
    shopContactPhone: string
    shopContactName: string
    shopEmail: string
    shopContactAddress: {
        detailAddress: string
        wardName: string
        districtName: string
        provinceName: string
    }
    shippingPartnerName: string
    shippingCode: string
    note: string
    shippingNoteCode: string
    shopNote: string
    adminNote: string
    createdAt: string
    rate: {
        done: number
        total: number
    }
    shippingPartnerCode: 'SELLER_EXPRESS' | string
    shippingProof: {
        agencyName: string
        shippingCode: string
    } | null
    reviewShop: {
        cancelOrderRate: number
        sellerPositiveRate: number
        review: {
            avatar: string
            content: string
            likeStatus: boolean
            name: number
        } | null
    } | null
}

export interface ILineResponse {
    id: number,
    shopName: string,
    buyerName: string,
    buyerContactPhone: string
    code: string,
    shippingCode: string,
    shippingState: 'READYTOPIC' | 'PICKING' | 'RECEVIED' | 'SHIPPING' | 'SHIPPED' | null
    shippingPartnerName: string,
    state: 'DRAFT' | 'NEW' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'FINISHED' | 'CANCELED',
    productId: number,
    quantity: number,
    returnQuantity: number,
    productName: string,
    productImage: string,
    shippingFeeUnit: number,
    priceUnit: number,
    paymentFee: number,
    insuranceFee: number,
    returnFeeUnit: number,
    commissionCateFee: number,
    timeLine: {
        messageCode: 'ORDER_DRAFT' | 'ORDER_NEW' | 'ORDER_CONFIRM' | 'ORDER_CANCELED' | 'ORDER_CANCELED_CANCELED' | 'ORDER_CANCELED_LOST' | 'ORDER_CANCELED_RETURN' | 'ORDER_CANCELED_RETURNED' | 'ORDER_SHIPPING' | 'ORDER_SHIPPINFG_PICKING' | 'ORDER_SHIPPING_SHIPPING' | 'ORDER_SHIPPINFG_READYTOPIC' | 'ORDER_COMPLETED_SHIPPED' | 'ORDER_SHIPPINFG_RECEVIED' | 'ORDER_FINISHED' | 'PAYMENT_PAID' | 'PAYMENT_PAID_SUCCESS' | 'PAYMENT_PAID_CANCELED' | 'SHIPPING_DONE'
        state: 'DRAFT' | 'NEW' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'FINISHED' | 'CANCELED'
        createdAt: string
    }[],
    buyerAddress: {
        detailAddress: string,
        wardName: string,
        districtName: string,
        provinceName: string
    },
    revenue: number,
    shippingExtraFee: number,
    productAttributes?: { name: string, value: string }[]
    createdAt: number
    isFreeShip: boolean
    freeShip: number
    discounts: {
        discountAmountUnit: number
        providedBy: "SELLER" | string
        couponType: 'ORDER_SHOP' | 'SHIPPING'
        wallet: {
            id: number
            name: string
        }
    }[]
    shippingPartnerCode: 'SELLER_EXPRESS' | string
    paymentType: 'COD' | 'PAY'
    shippingFee: number
    finalRevenue: number
    discountShop: number
    discountChozoi: number
    buyerPay: number
}

export interface IOrderReturnLineResponse {
    id: number
    lineReturns: {
        id: number
        productName: string
        productImage: string
    }[]
    code: string
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED'
    returnType: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION' | null
    shippingPartner: {
        name: string
    } | null
    createdAt: string
}

export interface ITimeLine {
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED'
    actor: 'BUYER' | 'SELLER' | 'ADMIN' | 'CHOZOI'
    shippingState: string | null
    createdAt: string
}

export interface IDetailOrderReturnLineResponse {
    id: number
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED'
    shopOrderReturn: {
        shopOrderId: number
        returnType: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION' | null
        shippingState: 'READYTOPIC' | 'PICKING' | 'RECEVIED' | 'SHIPPING' | 'SHIPPED' | null
        buyerContactAddress: {
            detailAddress: string
            wardName: string
            districtName: string
            provinceName: string
        }
        buyerContactName: string
        buyerEmail: string
        buyerContactPhone: string
        shippingPartner: {
            name: string
        } | null
        shippingCode: string
        note: string
        reason: string
    }
    images: {
        url: string
    }[]
    productName: string
    priceUnit: number
    productImage: string
    quantity: number
    productAttributes: {
        name: string
        value: string
    }[] | null
    finalRevenue: number
    orderLine: {
        shippingFeeTotal: number
        insuranceFeeTotal: number
        commissionCateFeeTotal: number
        shippingExtraFeeTotal: number
        paymentFeeTotal: number
        totalPrice: number
        revenue: number
        totalFee: number
        isFreeShip: boolean // update 18-05-2020
        discounts: {
            discountAmountUnit: number
            providedBy: 'SELLER' | string
        }[] // update 22/06/2020
    }
    timeLines: ITimeLine[]
    insuranceFeeTotal: number
    commissionCateFeeTotal: number
    shippingFeeTotal: number
    totalPrice: number
    totalFee: number
    revenue: number
    createdAt: string
}

export interface IPackageOrderReturnResponse {
    id: number
    shopOrderId: number
    lineReturns: {
        id: number
        reason: string
        quantity: number
        productId: number
        productName: string
        productImage: string
        priceUnit: number
        images: {
            url: string
        }[]
        productAttributes: {
            name: string
            value: string
        }[] | null
        note: string
        reasonDetail: string
        createdAt: string
    }[]
    shippingPartner: {
        id: number
        name: string
    } | null
    code: string
    buyerContactPhone: string
    buyerContactName: string
    state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED'
    buyerEmail: string
    buyerContactAddress: {
        detailAddress: string
        wardName: string
        districtName: string
        provinceName: string
    }
    shopId: number
    shippingCode: string
    note: string
    createdAt: string
}

export interface IRequestChangeStateSellerShipping {
    orderCode: string
    state: 'SHIPPING' | 'SHIPPED' | 'CANCELED'
    agencyName?: string
    shippingCode?: string
    proofImages?: string[]
}

export const service = new class OrderServices extends BaseService {
    public getListOrder(shop_id: string | number, state: string, size: number, page: number, keyword: string, timeStart: string, timeEnd: string): Promise<IApiResponse> {
        let queryString = `?status=${state}${keyword ? '&orderCode=' + keyword : ''}${timeStart ? '&timeStart=' + timeStart : ''}${timeEnd ? '&timeEnd=' + timeEnd : ''}`;
        return this.getRequest(`/v1/shops/${shop_id}/orders${queryString}&size=${size}&page=${page}`, true);
    }

    public getOrderDetail(shopId: number, code: any): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/orders/${code}`, true);
    }

    public getOrderDetailPrint(shopId: number, code: any): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/orders/${code}/print`, true);
    }

    public updateOrderState(shopId: number, packageId: number, data: { action: 'CONFIRMED' | 'CANCELED', note: string }): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/orders/${packageId}`, data, true);
    }

    public getOrderLine(shopId: number, packageId: number, lineId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/orders/${packageId}/line/${lineId}?type=normal`, true);
    };

    /*Order Return*/
    public getShippingFee(shop_id: number, package_id: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shop_id}/orderReturns/${package_id}/shipPrice`);
    }

    public getListReturnOrder(shopId: number, collection: 'request' | 'processing' | 'finished' = "request", size: number = 10, page: number = 0, data: {
        keyword: string,
        from: string,
        to: string
    }): Promise<IApiResponse> {
        const queryString = `${data.keyword ? '&keyword=' + data.keyword : ''}${data.from ? '&from=' + data.from : ''}${data.to ? '&to=' + data.from : ''}`;
        return this.getRequest(`/v1/shops/${shopId}/orderReturns?collection=${collection}${queryString}&page=${page}&size=${size}`, true);
    }

    public getDetailLine(shopId: number, packageId: number, lineId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/orderReturns/${packageId}/lines/${lineId}`, true);
    }

    public getDetailPackage(shopId: number, packageId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/orderReturns/${packageId}`, true);
    }

    public putRequestOrderReturn(shopId: number, lineId: number, params: {
        return_type: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION',
        shipping_service_id: number,
        note?: string
    }): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/orderReturns/${lineId}/state`, params, true);
    }

    public getListShipping(): Promise<IApiResponse> {
        return this.getRequest(`/v1/shipping/partners`, true);
    }

    public changeStateSellerShiping(shopId: number, shopOrderId: number, data: IRequestChangeStateSellerShipping): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/orders/${shopOrderId}/shipping_state`, data);
    }
}();
