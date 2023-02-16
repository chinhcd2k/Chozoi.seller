import {getRequest, IApiResponse, postRequest} from "../index";
import {IResDistrict, IResProvince, IResShopContact, IResWard} from "./interfaces/response";
import {IReqShopContact} from "./interfaces/request";

function getListContact(shopId: number): Promise<IApiResponse<IResShopContact[]>> {
    return getRequest(`/v1/shops/${shopId}/contacts`)
}

function getListProvince(): Promise<IApiResponse<IResProvince>> {
    return getRequest('/v1/provinces', false);
}

function getListDistrict(provinceId: number): Promise<IApiResponse<IResDistrict>> {
    return getRequest('/v1/districts?provinceId=' + provinceId, false);
}

function getListWard(districtId: number): Promise<IApiResponse<IResWard>> {
    return getRequest('/v1/wards?districtId=' + districtId, false);
}

function sendCreateContact(shopId: number, params: IReqShopContact): Promise<IApiResponse<any>> {
    return postRequest(`/v1/shops/${shopId}/contacts/create`, true, params);
}

export {
    getListContact,
    getListDistrict,
    getListProvince,
    getListWard,
    sendCreateContact
}
