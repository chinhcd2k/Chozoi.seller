import {observable} from "mobx";

export default class CreateTemplateStore {
    @observable listCategories: any[] = [];
    @observable listCategoriesLv1: any[] = [];
    @observable listCategoriesLv2: any[] = [];
    @observable listCategoriesLv3: any[] = [];
    @observable listPropety: {
        id: number
        name: string
        isRequired: boolean
        selectValueId?: number
        values: {
            id: number
            value: string
        }[]
    }[] = [];
    @observable listShipping: {
        id: number
        name: string
        code: string
        maxValue: number
        maxWeight: number
        maxSize: number[]
        service: {
            status: 'ENABLED' | 'DISABLED'
        }[]
    }[] = [];
    @observable listImage: {
        id?: number
        sort: number
        src: string
        file: any
    }[] = [];
    @observable isAutoPublic: boolean = false;
    @observable freeShip: boolean = false;
    @observable key: number = Date.now();
    @observable defaultName?: string;
    @observable defaultCategory?: [number, number] | [number, number, number];
    @observable defaultWeight?: number;
    @observable defaultPackageSize?: [number, number, number];
    @observable defaultDescPickingOut?: string;
}
