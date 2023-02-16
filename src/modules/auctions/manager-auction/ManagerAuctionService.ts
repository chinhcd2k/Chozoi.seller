import {BaseService, IApiResponse} from "../../../common/services/BaseService";
import {IResponseAuction} from "../DetailAuction";

class ManagerAuctionService extends BaseService {

    public getProductById(shop_id: number | string, productId: string | number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shop_id}/products/${productId}`, true);
    }

    public updateImageForProduct(params: { product_id: number, image_url: string, sort: number }): Promise<IApiResponse> {
        return this.postRequest(`/v1/products/${params.product_id}/images`, params, true);
    }

    public updateProduct(shop_id: number, product_id: number, params: IResponseAuction): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shop_id}/products/${product_id}`, params, true);
    }

    public PutChangeStateMulti(shop_id: string | number, data: { ids: number[], state: "PENDING" | "READY" | "DRAFT" | 'PUBLIC' | 'STOPPED' }): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shop_id}/products/_bulk/state`, data, true);
    }

    public DeleteDraftMulti(shop_id: number | string, data: { ids: number[] }): Promise<IApiResponse> {
        return this.deleteRequest(`/v1/shops/${shop_id}/products/_bulk`, data, true);
    }

    public getListCategories(): Promise<IApiResponse> {
        return this.getRequest('/v1/categories', false);
    }

    public getPropertyCategories(id: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/categories/${id}`, false);
    }

    public createProduct(shop_id: number | string, data: IResponseAuction): Promise<IApiResponse> {
        return this.postRequest(`/v1/shops/${shop_id}/products`, data, true);
    }

    public search(shop_id: number,
                  type: 'NORMAL' | 'AUCTION',
                  key_word?: string | '',
                  state?: 'PUBLIC' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | 'BIDING' | 'STOPPED' | 'WAITING' | '',
                  filter_auction?: 'AUCTION' | 'AUCTION_FLASH_BID' | '',
                  size: number = 20,
                  page: number = 0,
                  categoryId?:number
    ): Promise<IApiResponse> {
        if (state && (state === "BIDING" || state === "STOPPED"))
            return this.getRequest(`/v1/shops/${shop_id}/products?collection=search&type=${type}${filter_auction ? '&auction=' + filter_auction : ''}${key_word ? '&key_word=' + key_word.trim().replace(/\s/, '%20') : ''}${state ? '&auction_state=' + state : ''}&page=${page}&size=${size}${categoryId?`&categoryId=${categoryId}`:''}`, true);
        else return this.getRequest(`/v1/shops/${shop_id}/products?collection=search&type=${type}${filter_auction ? '&auction=' + filter_auction : ''}${key_word ? '&key_word=' + key_word.trim().replace(/\s/, '%20') : ''}${state ? '&state=' + state : ''}&page=${page}&size=${size}${categoryId?`&categoryId=${categoryId}`:''}`, true);
    }

    public updateQuantity(shop_id: number, params: {
        productId: number,
        variantId: number,
        quantity: number
    }): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shop_id}/products?collection=changeQuantity`, params, true);
    }

    public deleteImage(product_id: number, ids: number[]): Promise<IApiResponse> {
        return this.deleteRequest(`/v1/products/{product_id}/images`, {ids: ids}, true);
    }
}

export const service = new ManagerAuctionService();
