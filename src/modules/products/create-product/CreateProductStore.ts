import {computed, observable} from "mobx";

export default class CreateProductStore {
    @observable type: 'NORMAL' | 'CLASSIFIER' = 'NORMAL';

    @computed get getType(): 'NORMAL' | 'CLASSIFIER' {
        return this.type;
    }

    @observable isQuantityLimited: boolean = true;

    @computed get getIsQuantityLimited(): boolean {
        return this.isQuantityLimited;
    }

    @observable VALIDATE_SHIPPING: boolean = true;

    @computed get GET_VALIDATE_SHIPPING(): boolean {
        return this.VALIDATE_SHIPPING;
    }

    @observable listClassifier: {
        name: string,
        values: string[]
    }[] = [];

    @computed get getListClassifier(): {
        name: string,
        values: string[]
    }[] {
        return this.listClassifier
    }

    @observable tableVariantData: {
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }[] = [];

    @computed get getTableVariantData(): {
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }[] {
        return this.tableVariantData;
    }
}
