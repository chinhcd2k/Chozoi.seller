import {observable} from "mobx";

export interface IResponseArea {
    id: number
    groupName: string
    conversionAddresses: {
        districtIds: number[]
        provinceId: number
    }[]
    conversionPrice: {
        from: number
        to: number
        price: number
    }[]
    status: 'DISABLED' | 'ENABLED'
    districtSelectedIds: number[]
}

export class Store {
    @observable listArea: IResponseArea[] = [];

    init() {
        this.listArea = [];
    }
}