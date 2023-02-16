import {IReqAddTemplate} from "./interfaces/request";
import {getRequest, IApiResponse, postRequest, putRequest} from "../index";
import {IResOfficialStore} from "./interfaces/response";

function sendUpdateTemplate(shop_id: number, template_id: number, data: IReqAddTemplate): Promise<IApiResponse<any>> {
    return putRequest(`/v1/shops/official/${shop_id}/template/${template_id}`, true, data);
}

function sendCloneTemplate(shop_id: number, template_id: number, name: string): Promise<IApiResponse<any>> {
    return postRequest(`/v1/shops/official/${shop_id}/template/${template_id}/clone`, true, {name: name});
}

function sendAddTemplate(shop_id: number, name: string): Promise<IApiResponse<any>> {
    return postRequest(`/v1/shops/official/${shop_id}/template`, true, {name: name});
}

function getListTemplates(shop_id: number): Promise<IApiResponse<any>> {
    return getRequest(`/v1/shops/official/${shop_id}/templates`);
}

function sendChangeStateTemplate(shop_id: number, template_id: number, state: 'PUBLIC' | 'DRAFT' | 'DELETED'): Promise<IApiResponse<any>> {
    return putRequest(`/v1/shops/official/${shop_id}/template/${template_id}/state`, true, {state: state});
}

function getDetailTemplate(shop_id: number, template_id: number): Promise<IApiResponse<any>> {
    return getRequest(`/v1/shops/official/${shop_id}/templates/${template_id}`);
}

function getCategoryForShop(shop_id: number): Promise<IApiResponse<any>> {
    return getRequest(`/v1/shops/official/${shop_id}/category`);
}

function getProducts(shop_id: number, page: number, size: number): Promise<IApiResponse<any>> {
    return getRequest(`/v1/shops/${shop_id}/products?collection=search&type=NORMAL&state=PUBLIC&size=${size}&page=${page}`);
}

function getOfficialStore(shopId: number): Promise<IApiResponse<IResOfficialStore>> {
    return getRequest(`/v1/shops/${shopId}?type=official_store`)
}

export {
    getProducts,
    getListTemplates,
    getCategoryForShop,
    getDetailTemplate,
    sendChangeStateTemplate,
    sendAddTemplate,
    sendCloneTemplate,
    sendUpdateTemplate,
    getOfficialStore
}
