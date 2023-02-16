import {getRequest, IApiResponse} from "../index";
import {IProduct, IResProductAuction} from "./interfaces/response";

function getListAuction(shopId:number):Promise<IApiResponse<{products:IProduct[]}>>{
    return getRequest(`/v1/products?collection=filter&shopId=${shopId}&type=AUCTION&size=30&page=0&sortField=salePrice`)
}
export{
    getListAuction
}
