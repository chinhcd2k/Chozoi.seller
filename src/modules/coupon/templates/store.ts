import {observable} from "mobx";
import {ICoupon} from "../manager/store";

export interface IProduct {
    id: number
    name: string
    imageVariants: {
        image180: string
    }[]
    variants: {
        price: number
        salePrice: number
    }[]
    type: 'NORMAL' | 'CLASSIFIER' | 'AUCTION' | 'AUCTION_SALE'
    auction: {
        startPrice: number
    } | null
    inserted?: boolean
    selected?: boolean
}

class Store {
    @observable name: string = '';

    @observable amount: number = 0;

    @observable limited: number = 0;

    @observable type: 'SOILD' | 'PERCENT' = "SOILD";

    @observable minPrice: number = 0;

    @observable discount: number = 0;

    @observable maxDiscount: number = 0;

    @observable typeProduct: 'ALL' | 'OPTIONS' = "ALL";

    @observable steep: number = 0;

    @observable listProduct: IProduct[] = [];

    @observable listProductPopup: IProduct[] = [];

    @observable listProductSelected: IProduct[] = [];

    @observable metadata = {total: 0, page: 0, size: 7};

    @observable metadataPopup = {total: 0, page: 0, size: 5};

    public listProductTemp: IProduct[] = [];

    @observable fromDate: number = 0;

    @observable toDate: number = 0;

    @observable acceptDate: number = 0;

    @observable categoryId?: number;

    @observable keyword?: string;

    @observable keywordPopup?: string;

    @observable disabledSubmit: boolean = false;

    public Router?: {
        push: (path: string) => any
        goBack: () => any
    };

    @observable listCategory: { id: number, name: string }[] = [];

    public promotionTemp?: ICoupon;

    @observable forceRenderBtnSave: boolean = false;

    public init() {
        this.name = '';
        this.amount = 0;
        this.limited = 0;
        this.type = "SOILD";
        this.minPrice = 0;
        this.discount = 0;
        this.maxDiscount = 0;
        this.typeProduct = "ALL";
        this.steep = 0;
        this.listProduct = [];
        this.listProductTemp = [];
        this.listProductSelected = [];
        this.listProductPopup = [];
        this.metadata = {total: 0, page: 0, size: 7};
        this.metadataPopup = {total: 0, page: 0, size: 5};
        this.fromDate = 0;
        this.toDate = 0;
        this.acceptDate = 0;
        this.categoryId = undefined;
        this.keyword = undefined;
        this.keywordPopup = undefined;
        this.disabledSubmit = false;
        this.Router = undefined;
        this.promotionTemp = undefined;
        this.forceRenderBtnSave = false;
    }
}

export const TemplateStore = new Store();
