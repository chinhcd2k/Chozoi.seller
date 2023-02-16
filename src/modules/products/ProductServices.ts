import {BaseService, IApiResponse} from "../../common/services/BaseService";

export interface IRequestBodyDataCreateProduct {
  name: string,
  attributes: { id: number, value_id: number }[],
  packing_size: number[],
  images: { sort: number, image_url: string }[],
  videos: string[],
  description: string,
  description_pickingout: string,
  category: { id: number },
  shipping_partner_ids: number[],
  type: "NORMAL" | "CLASSIFIER",
  weight: number,
  is_pending: boolean,
  auto_public: boolean,
  is_quantity_limited: boolean,
  condition: "NEW" | "USED",
  classifiers?: { name: string, values: string[] }[],
  variants: {
    attributes: { name: string, value: string | number }[],
    price?: number,
    sale_price: number,
    sku: string,
    inventory: {
      in_quantity: number
    }
  }[]
  free_ship_status: boolean // update 07-05-2020
}

export interface IRequestBodyDataUpdateProduct extends IRequestBodyDataCreateProduct {
  id: number
  images: { id: number, sort: number, image_url: string }[]
  state: 'DRAFT' | 'PENDING' | 'REJECT' | 'READY' | 'PUBLIC'
  variants: {
    id?: number
    attributes: { name: string, value: string | number }[],
    price?: number,
    sale_price: number,
    sku: string,
    image_id: number | null
    inventory: {
      in_quantity: number
    }
  }[]
}

export interface IRequestBodyDataUpdateProductWithStatePublic {
  id: number
  packing_size: number[],
  images: { id: number, sort: number, image_url: string }[],
  weight: number,
  is_quantity_limited: boolean,
  classifiers?: { name: string, values: string[] }[],
  variants: {
    id?: number
    attributes: { name: string, value: string | number }[],
    price?: number,
    sale_price: number,
    sku: string,
    image_id: number | null
    inventory: {
      in_quantity: number
    }
  }[]
  free_ship_status: boolean // update 07-05-2020
}

export interface IResponseDetailProduct {
  id: number
  name: string
  state: 'PUBLIC' | 'READY' | 'PENDING' | 'DRAFT' | 'REJECT'
  attributes: any[]
  images: {
    id: number
    sort: number
    imageUrl: string
  }[]
  videos: any[]
  shop: {
    id: number
    name: string
  }
  categories: {
    id: number
    level: number
    parentId: number | null
  }[]
  category: {
    id: number
    level: number
  }
  type: 'NORMAL' | 'CLASSIFIER'
  condition: 'NEW' | 'USED'
  description: string
  classifiers?: {
    name: string
    values: string[]
  }[]
  variants: {
    id: number
    attributes: {
      name: string
      value: string|number
    }[]
    inventory: {
      id: number
      inQuantity: number
      remainingQuantity: number
    }
    salePrice: number
    price: number
    sku: string
    imageId: number | null
  }[]
  weight: number
  shippingPartnerIds: number[]
  packingSize: number[]
  isQuantityLimited: boolean
  descriptionPicking: string
  descriptionPickingin: string
  descriptionPickingOut: string
  autoPublic: boolean
  isPending: boolean
  isPublic: boolean | null
  reportIssues: {
    description: string
    solution: string
  } | null
  freeShipStatus: boolean // update 07-05-2020
}

class ProductServices extends BaseService {

  public getProductById(shop_id: number | string, productId: string | number): Promise<IApiResponse> {
    return this.getRequest(`/v1/shops/${shop_id}/products/${productId}`, true);
  }

  public updateImageForProduct(params: { product_id: number, image_url: string, sort: number }): Promise<IApiResponse> {
    return this.postRequest(`/v1/products/${params.product_id}/images`, params, true);
  }

  public updateProduct(shop_id: number, product_id: number, data: IRequestBodyDataUpdateProduct): Promise<IApiResponse> {
    return this.putRequest(`/v1/shops/${shop_id}/products/${product_id}`, data);
  }

  public PUT_UpdateProductWithOption(shop_id: number, product_id: number, data: IRequestBodyDataUpdateProductWithStatePublic): Promise<IApiResponse> {
    return this.putRequest(`/v1/shops/${shop_id}/products/${product_id}/partial`, data);
  }

  public PutChangeStateMulti(shop_id: string | number, data: { ids: number[], state: "PENDING" | "READY" | "PUBLIC" }): Promise<IApiResponse> {
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

  public createProduct(shop_id: number | string, data: IRequestBodyDataCreateProduct): Promise<IApiResponse> {
    return this.postRequest(`/v1/shops/${shop_id}/products`, data, true);
  }

    public search(shop_id: number, type: 'NORMAL' | 'AUCTION', key_word?: string | '', state?: 'PUBLIC' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | '', aspect?: 'selling' | 'soldOff' | '', size: number = 20, page: number = 0,categoryId?:number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shop_id}/products?collection=search&type=${type}${key_word ? '&key_word=' + key_word.trim().replace(/\s/, '%20') : ''}${state ? '&state=' + state : ''}${aspect ? '&aspect=' + aspect : ''}&size=${size}&page=${page}${categoryId?`&categoryId=${categoryId}`:''}`, true);
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

  public GET_listShipping(shopId: number): Promise<IApiResponse> {
    return this.getRequest(`/v1/shippings/shops/${shopId}`);
  }
}

export const service = new ProductServices();
