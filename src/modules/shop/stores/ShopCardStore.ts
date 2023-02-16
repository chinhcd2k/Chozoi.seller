import {computed, observable} from "mobx";

export interface IShopCard {
    id: number
    name: string
    identityCard: string
    accountNumber: string
    branch: string
    branchId: {
        id: number
    }
    bank: any
    province: any
    isDefault: boolean
}

class ShopCardStore {
    @observable _cards: any = [];
    set cards(value: any) {
        this._cards = value;
    }

    @computed get cards(): any {
        return this._cards;
    }

    @observable _banks: any = [];
    set banks(value: any) {
        this._banks = value;
    }

    @computed get banks(): any {
        return this._banks;
    }

    @observable _provinces: any = [];
    set provinces(value: any) {
        this._provinces = value;
    }

    @computed get provinces(): any {
        return this._provinces;
    }
}

export const store = new ShopCardStore();
