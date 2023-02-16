import {observable} from "mobx";

export interface IArea {
    provinceId: number | undefined,
    districtId: number[] | undefined,
    districts: {
        id: number
        districtName: string
    }[] | undefined
}

export interface IFee {
    minWeight: number | undefined,
    maxWeight: number | undefined,
    fee: number | undefined
}

export class Store {
    public id: number = undefined as any;

    @observable listProvince: { id: number, provinceName: string }[] = [];

    @observable listArea: IArea[] = [{
        provinceId: undefined,
        districtId: undefined,
        districts: undefined
    }];

    @observable name: string = '';

    @observable listFee: IFee[] = [
        {
            minWeight: undefined,
            maxWeight: undefined,
            fee: undefined
        }
    ];

    public RouterHistory?: {
        push: (path: string) => any,
        goBack: () => any
    };

    @observable disabledSubmit: boolean = false;

    public districtsExists: number[] | undefined;

    public init() {
        this.id = undefined as any;
        this.name = '';
        this.disabledSubmit = false;
        this.districtsExists = undefined;
        this.listProvince = [];
        this.listArea = [{
            provinceId: undefined,
            districtId: undefined,
            districts: undefined
        }];
        this.listFee = [{
            minWeight: undefined,
            maxWeight: undefined,
            fee: undefined
        }];
    }
}