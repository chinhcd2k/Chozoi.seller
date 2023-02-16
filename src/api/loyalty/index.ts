import { getRequest, IApiResponse, postRequest } from "../index";
import { IResCheckIn, IResHistoryCoin, IResLoyalty } from "./interfaces/response";

function getCheckInLoyalty(): Promise<IApiResponse<IResCheckIn>> {
  return getRequest(`v1/users/_me/checkIn`);
}

function sendCheckInLoyalty(): Promise<IApiResponse<any>> {
  return postRequest("v1/users/_me/checkIn");
}

function getHistoryLoyalty(userId: number, type: string, page: number, size: number): Promise<IApiResponse<IResLoyalty>> {
  return getRequest(`v1/orders/${userId}/loyalty?collection=log&type=${type}&page=${page}&size=${size}`);
}

function getHistoryCoin(id: number, page: number, size: number): Promise<IApiResponse<IResHistoryCoin>> {
  return getRequest("v1/orders/" + id + "/loyalty?collection=log&type=point&size=" + size + "&page=" + page);
}

export {
  getCheckInLoyalty,
  sendCheckInLoyalty,
  getHistoryLoyalty,
  getHistoryCoin
};
