import {computed, observable} from "mobx";
import CreateProductStore from "../create-product/CreateProductStore";
import {IResponseDetailProduct} from "../ProductServices";

export default class EditProductStore extends CreateProductStore {
    @observable product?: IResponseDetailProduct;

    @computed get getProduct(): IResponseDetailProduct | undefined {
        return this.product;
    }

    @observable tableVariantData: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }[] = [];

    @computed get getTableVariantData(): {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }[] {
        return this.tableVariantData;
    }
}
