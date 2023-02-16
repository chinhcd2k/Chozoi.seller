import {computed, observable} from "mobx";
import {IRevenueWalletResponse} from "../RevenueServices";

class RevenueHistoryStore {
    @observable _transactions: IRevenueWalletResponse[] = [];
    set transactions(value: IRevenueWalletResponse[]) {
        this._transactions = value;
    }

    @computed get transactions(): IRevenueWalletResponse[] {
        return this._transactions;
    }
}

export const store = new RevenueHistoryStore();
