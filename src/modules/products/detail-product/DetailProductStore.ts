import EditProductStore from "../edit-product/EditProductStore";
import {IResponseDetailProduct} from "../ProductServices";
import {computed, observable} from "mobx";

export default class DetailProductStore extends EditProductStore {
    productOld?: IResponseDetailProduct;
    tableVariantDataOld: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }[] = [];
    listClassifierOld: {
        name: string,
        values: string[]
    }[] = []

    @observable dataModalConfirmFreeShip: boolean = false;

    @computed get getDataModalConfirmFreeShip(): boolean {
        return this.dataModalConfirmFreeShip;
    }
}
