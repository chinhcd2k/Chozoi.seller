import {computed, observable} from "mobx";

class RevenueCashoutStore {
  @observable _wallet: any;
  set wallet(value: any) {
      this._wallet = value;
  }

  @computed get wallet(): any {
      return this._wallet;
  }

  @observable _banks: any = [];
  set banks(value: any) {
      this._banks = value;
  }

  @computed get banks(): any {
      return this._banks;
  }

  @observable _transactionFee: any;
  set transactionFee(value: any) {
      this._transactionFee = value;
  }

  @computed get transactionFee(): any {
      return this._transactionFee;
  }
}

export const store = new RevenueCashoutStore();
