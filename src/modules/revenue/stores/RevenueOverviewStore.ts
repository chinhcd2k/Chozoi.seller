import {computed, observable} from "mobx";

class RevenueOverviewStore {
  @observable _ranks: any = [];
  set ranks(value: any) {
      this._ranks = value;
  }

  @computed get ranks(): any {
      return this._ranks;
  }

  @observable _revenues: any;
  set revenues(value: any) {
      this._revenues = value;
  }

  @computed get revenues(): any {
      return this._revenues;
  }

  @observable _revenueToDay: any;
  set revenueToDay(value: any) {
      this._revenueToDay = value;
  }

  @computed get revenueToDay(): any {
      return this._revenueToDay;
  }

  @observable _growth: any;
  set growth(value: any) {
      this._growth = value;
  }

  @computed get growth(): any {
      return this._growth;
  }
}

export const store = new RevenueOverviewStore();
