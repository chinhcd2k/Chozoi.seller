import {computed, observable} from "mobx";
import {
	IResShopDashboardAuction,
	IResShopDashboardRevenue,
	IResShopDashboardValue
} from "../../../api/shop-efficiency/interfaces/response";


export interface IRevenueHour {
	 revenue: number,
	 time: string,
	 date: string
}

export interface IStatistical {
	 revenue: {
			src: number,
			desc: number
	 },
	 order: {
			src: number,
			desc: number
	 }
}

export interface IlistInfoMustUpdate {
	 type: string,
	 task: string,
	 description: string,
	 percent: number,
	 status: boolean
}

 class DashboardStore {
	 @observable shopDashboard: IResShopDashboardRevenue | null = null;
	 @observable shopDashboardValue:IResShopDashboardValue|null=null;
	 @observable shopDashboardAuction:IResShopDashboardAuction|null=null;
	 @observable _statistical: IStatistical = {
			revenue: {src: 0, desc: 0},
			order: {src: 0, desc: 0}
	 };
	 set statistical(value: IStatistical) {
			this._statistical = value;
	 }

	 @computed get statistical(): IStatistical {
			return this._statistical;
	 }

	 @observable listInfoUpdate: IlistInfoMustUpdate [] = [];
}
export const dashboardStore=new DashboardStore();