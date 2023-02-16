import {BaseService, IApiResponse} from "../../common/services/BaseService";

export class NotificationService extends BaseService {
    public getListNotifications(page: number, size: number, type: string): Promise<IApiResponse> {
        if (type === 'ALL') type = '';
        return this.getRequest(`/v1/notifications/SELLER?${type ? 'type=' + type + '&' : ''}page=${page}&size=${size}`, true);
    }

    public putReadAll(): Promise<IApiResponse> {
        return this.putRequest('/v1/notifications/SELLER/readAll', {});
    }

    public putViewed(ids: string[]): Promise<IApiResponse> {
        return this.putRequest('/v1/notifications/SELLER/view', ids);
    }

    public putReaded(notificationId: string): Promise<IApiResponse> {
        return this.putRequest(`/v1/notifications/SELLER/read/${notificationId}`, {});
    }
}

export const service = new NotificationService();
