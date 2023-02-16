import {computed, observable} from "mobx";
import {IRevenueWalletResponse, IBankCard} from "../RevenueServices";

class RevenueWalletStore {
    @observable _wallet: { balance: number } = {balance: 0};
    set wallet(value: { balance: number }) {
        this._wallet = value;
    }

    @computed get wallet(): { balance: number } {
        return this._wallet;
    }

    @observable _banks: IBankCard[] = [];
    set banks(value: IBankCard[]) {
        this._banks = value;
    }

    @computed get banks(): IBankCard[] {
        return this._banks;
    }

    @observable _transactions: IRevenueWalletResponse[] = [];
    set transactions(value: IRevenueWalletResponse[]) {
        this._transactions = value;
    }

    @computed get transactions(): IRevenueWalletResponse[] {
        return this._transactions;
    }
}

export const store = new RevenueWalletStore();
