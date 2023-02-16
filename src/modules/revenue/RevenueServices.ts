import {BaseService, IApiResponse} from "../../common/services/BaseService";

export interface IRevenueWalletResponse {
    id: number
    name: string
    bankAcc: string
    bankCode: string
    confirmedAmount: number
    branch: string
    amount: number
    wallet: {
        id: number
        balance: number
    }
    description: string
    typeDescription: string
    state: 'PENDING' | 'REJECT' | 'SUCCESS' | 'NEW' | 'APPROVED' | 'PROCESSING' | 'FAILED'
    type: 'WITH_DRAWAL' | 'TRANSFERS'
    transactionCode: string
    paymentCode: string
    transactionFee: number
    createdAt: string
    updatedAt: string
    successedAt: string
    reason: string | null
}

export interface IBankCard {
    id: number
    name: string
    bank: any
    isDefault: boolean
    branch: string
    accountNumber: string
}

class RevenueServices extends BaseService {
    public convertDateToString(timeStr: any, time: boolean) {
        var date = new Date(timeStr),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        if (time) {
            var hour = ("0" + (date.getHours())).slice(-2),
                minute = ("0" + (date.getMinutes())).slice(-2),
                second = ("0" + (date.getSeconds())).slice(-2);
            return [date.getFullYear(), mnth, day].join("-") + ' ' + [hour, minute, second].join(":");
        }
        return [date.getFullYear(), mnth, day].join("-");
    }

    public getShopRevenue(shopId: string | number, data: any): Promise<IApiResponse> {
        return this.postRequest(`/v1/stats/revenue/${shopId}?collection=day`, data, true);
    }

    public getShopRevenueToDay(shopId: string | number): Promise<IApiResponse> {
        return this.getRequest(`/v1/stats/revenue/${shopId}?collection=hour`, true);
    }

    public getShopRevenueProduct(shopId: string | number, page: number, size: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/stats/revenue/${shopId}/products?page=${page}&size=${size}`, true);
    }

    public getShopPayment(): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/payment`, true);
    }

    public getOTP(): Promise<IApiResponse> {
        return this.postRequest(`/v1/shops/payment/code`, [], true);
    }

    public confirmRequest(data: any): Promise<IApiResponse> {
        return this.postRequest(`/v1/shops/payment/request`, data, true);
    }

    public getShopTransaction(page: number = 0, size: number = 10, data?: {
        type: 'all' | 'order' | 'cashout' | 'return',
        keyword: string,
        startDate: string,
        endDate: string
    }): Promise<IApiResponse> {
        let queryString: string = '?';
        data && (queryString += `type=${data.type}${data.keyword ? '&keyword=' + data.keyword : ''}${data.startDate ? '&startDate=' + data.startDate : ''}${data.endDate ? '&endDate=' + data.endDate : ''}&`);
        return this.getRequest(`/v1/shops/payment/request${queryString}size=${size}&page=${page}`, true);
    }
}

export const service = new RevenueServices();
