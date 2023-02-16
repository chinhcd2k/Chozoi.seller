import {computed, observable} from "mobx";

export interface ICoupon {
    id: number
    name: string
    amounts: {
        priceMin: number
        discountValue: number
    }[]
    discountType: 'VALUE' | 'PERCENT'
    couponLimit: number
    currentCoupon: number
    productType: 'ALL' | 'PICK'
    timeStart: string
    timeApplyStart: string
    timeApplyEnd: string
    totalCoupon: number
    state: 'COMINGSOON' | 'PROCESSING' | 'PAUSING' | 'FINISHED' | 'CLOSE'
}

class Store {
    @observable status?: 'COMINGSOON' | 'PROCESSING' | 'PAUSING' | 'FINISHED';

    @computed get getStatus() {
        return this.status;
    }

    @observable keyword: string = '';

    @computed get getKeyword() {
        return this.keyword;
    }

    @observable metadata: { total: number, page: number, size: number } = {
        total: 0,
        page: 0,
        size: 10
    }

    @computed get getMetadata() {
        return this.metadata;
    }

    @observable listCoupon: ICoupon[] = [];

    @computed get getListCoupon() {
        return this.listCoupon;
    }


    public init() {
        this.keyword = '';
        this.status = undefined;
        this.metadata = {
            total: 0,
            page: 0,
            size: 10
        };
        this.listCoupon = [];
    }
}

export const ManagerCouponStore = new Store();