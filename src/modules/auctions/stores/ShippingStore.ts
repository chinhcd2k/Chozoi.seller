import {computed, observable} from "mobx";

interface IData {
    weight: number,
    packing_size: number[]
}

export interface IService {
    id: number,
    serviceName: string,
    status: 'ENABLED' | 'DISABLED'
}

export interface IShipping {
    id: number,
    name: string,
    code: string,
    maxValue: number,
    maxWeight: number
    maxSize: number[]
    service: IService[]
}

export default class ShippingStore {
    @observable _listShipping: IShipping[] = [];
    set listShipping(value: IShipping[]) {
        this._listShipping = value;
    }

    @computed get listShipping(): IShipping[] {
        return this._listShipping;
    }

    @observable _data: IData = {weight: 0, packing_size: [0, 0, 0]};
    set data(value: IData) {
        this._data = value;
    }

    @computed get data(): IData {
        return this._data;
    }
}
