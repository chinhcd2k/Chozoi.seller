import {getRequest, IApiResponse, postRequest} from "../index";
import {IResNotification} from "./interfaces/response";

function getNotifications(type: string, size: number, page: number): Promise<IApiResponse<IResNotification>> {
    return getRequest(`v1/notifications/BUYER?page=${page}&size=${size}${type !== 'all' ? `&type=${type}` : ""}`);
}

function sendFcmToken(fcmToken: string): Promise<IApiResponse<any>> {
    return getRequest(`v1/users/_me/fcm?fcm_token=${fcmToken}&type=BUYER`);
}

export {
    getNotifications,
    sendFcmToken
}
