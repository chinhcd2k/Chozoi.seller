import {getRequest, IApiResponse, putRequest} from "../index";
import {
  IInfoAdvancedCompany,
  IInfoAdvancedNormalOfficialHousehold,
  IResShopStats, IResShopProfile
} from "./interfaces/response";
import {IResCategory} from "../../AppGlobal";

function getShopProfile(shopId: number, userId: number): Promise<IApiResponse<IResShopProfile>> {
  return getRequest(`/v1/shops/${shopId}?userid=${userId}`, true);
}

function getShopInfoAdvancedNowTypeCompany(shop_id: string): Promise<IApiResponse<IInfoAdvancedCompany>> {
  return getRequest(`/v1/shops/${shop_id}/advancedInfo?type=company`, true);
}

function getStats(shopId: number): Promise<IApiResponse<IResShopStats>> {
  return getRequest(`/v1/shops/${shopId}/stats`, false);
}

function getShopInfoAdvancedNowTypeNormalOfficialHousehold(shop_id: string, type: 'COMPANY' | 'NORMAL' | 'OFFICIAL_STORE' | 'HOUSEHOLD'): Promise<IApiResponse<IInfoAdvancedNormalOfficialHousehold>> {
  return getRequest(`/v1/shops/${shop_id}/advancedInfo?type=${type.toLowerCase()}`, true);
}
function sendUnActiveShop(status:'ON'|'OFF'):Promise<IApiResponse<any>>{
    return putRequest(`/v1/shops/changeStatus?status=${status}`,true)
}
function getShopCategories(shopId: number): Promise<IApiResponse<{categories:IResCategory[]}>> {
    return getRequest(`/v1/search/shops/${shopId}/categories`, true);
}

export {
    getShopProfile,
    getStats,
    getShopInfoAdvancedNowTypeNormalOfficialHousehold,
    getShopInfoAdvancedNowTypeCompany,
    sendUnActiveShop,
    getShopCategories
}
