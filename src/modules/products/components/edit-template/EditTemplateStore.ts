import CreateTemplateStore from "../create-template/CreateTemplateStore";
import {computed, observable} from "mobx";

export default class EditTemplateStore extends CreateTemplateStore {
    public product_id?: number;

    @observable keyCategories: number = Date.now();

    @computed get getKeyCategories(): number {
        return this.keyCategories;
    }

    @observable keyCategoriesLv1: number = Date.now();

    @computed get getKeyCategoriesLv1(): number {
        return this.keyCategoriesLv1;
    }

    @observable keyCategoriesLv2: number = Date.now();

    @computed get getKeyCategoriesLv2(): number {
        return this.keyCategoriesLv2;
    }

    @observable keyCategoriesLv3: number = Date.now();

    @computed get getKeyCategoriesLv3(): number {
        return this.keyCategoriesLv3;
    }
}
