import {BaseService, IApiResponse} from "../../common/services/BaseService";

class AnalyticsService extends BaseService {
    public getRevenueOnlyDay(shopId: number, collection: 'hour', type: 'draft' | 'new' | 'done', date: string): Promise<IApiResponse> {
        const GMT = -new Date().getTimezoneOffset() / 60;
        return this.getRequest(`/v1/stats/revenue/${shopId}?collection=${collection}&type=${type}&date=${date}&GMT=${GMT}`, true);
    }

    public getRevenueWithRangeDay(shopId: number, collection: 'betweenDay', type: 'draft' | 'new' | 'done', from: string, to: string): Promise<IApiResponse> {
        return this.getRequest(`/v1/stats/revenue/${shopId}?collection=${collection}&type=${type}&from=${from}&to=${to}`, true);
    }
}

export const service = new AnalyticsService();