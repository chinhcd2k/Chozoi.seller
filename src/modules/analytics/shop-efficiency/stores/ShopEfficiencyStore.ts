import {computed, observable} from "mobx";
import {
    IResShopEfficiencyAccess,
    IResShopEfficiencyRevenue,
    IResShopEfficiencyRevenuePie
} from "../../../../api/shop-efficiency/interfaces/response";
import {Moment} from "../../../../common/functions/Moment";

export interface IStatisticalHour {
    revenue: number,
    time: string,
    date: string,
    count: number
}

export interface IStatisticalDay {
    date: string,
    revenue: number,
    count: number
}

export interface ISumStatistical {
    revenue: {
        desc: number
        src: number
    },
    order: {
        desc: number,
        src: number
    }
}

class ShopEfficiencyStore {
    @observable _filterDateValue: string = 'Hôm nay';
    set filterDateValue(value: string) {
        this._filterDateValue = value;
    }

    @computed get filterDateValue(): string {
        return this._filterDateValue;
    }

    @observable _chartType: 'hour' | 'day' = 'hour';
    set chartType(value: 'hour' | 'day') {
        this._chartType = value;
    }

    @computed get chartType(): 'hour' | 'day' {
        return this._chartType;
    }

    @observable _listStatisticalHour: { desc: IStatisticalHour[], src: IStatisticalHour[] } = {desc: [], src: []};
    set listStatisticalHour(value: { desc: IStatisticalHour[], src: IStatisticalHour[] }) {
        this._listStatisticalHour = value;
    }

    @computed get listStatisticalHour(): { desc: IStatisticalHour[], src: IStatisticalHour[] } {
        return this._listStatisticalHour;
    }

    @observable _listStatisticalDay: { desc: IStatisticalDay[], src: IStatisticalDay[] } = {desc: [], src: []};
    set listStatisticalDay(value: { desc: IStatisticalDay[], src: IStatisticalDay[] }) {
        this._listStatisticalDay = value;
    }

    @computed get listStatisticalDay(): { desc: IStatisticalDay[], src: IStatisticalDay[] } {
        return this._listStatisticalDay;
    }

    @observable _statistical: ISumStatistical = {
        revenue: {src: 0, desc: 0},
        order: {src: 0, desc: 0}
    }
    set statistical(value: ISumStatistical) {
        this._statistical = value;
    }

    @computed get statistical(): ISumStatistical {
        return this._statistical;
    }
    @observable sumRevenue:number=0;
    @observable sumRevenueProduct:number=0;
    @observable sumRevenueAuction:number=0;
    @observable sumRevenueFlashBid:number=0;
    @observable calculateAccess?:IResShopEfficiencyAccess;
    @observable shopChart?:IResShopEfficiencyRevenue;
    @observable calculateRevenue?:IResShopEfficiencyRevenuePie;
    @observable today=Moment.getDate(new Date().getTime(),"yyyy-mm-dd",false);

}

export const store = new ShopEfficiencyStore();