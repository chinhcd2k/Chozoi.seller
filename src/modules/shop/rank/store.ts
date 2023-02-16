import {computed, observable} from "mobx";
import {IResponseStatusRank} from "./service";

interface IData extends IResponseStatusRank {
}

export default class ShopRankStore {
    @observable data: IData = undefined as any;

    @computed get getData(): IData {
        return this.data;
    }

    public processPercent: number = 0;
}