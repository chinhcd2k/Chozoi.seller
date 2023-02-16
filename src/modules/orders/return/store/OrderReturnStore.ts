import {computed, observable} from "mobx";
import {
    IDetailOrderReturnLineResponse,
    IOrderReturnLineResponse,
    IPackageOrderReturnResponse
} from "../../OrderServices";

export default class OrderReturnStore {
    @observable _listOrderLine: IOrderReturnLineResponse[] = [];

    set listOrderLine(value: IOrderReturnLineResponse[]) {
        this._listOrderLine = value;
    }

    @computed get listOrderLine(): IOrderReturnLineResponse[] {
        return this._listOrderLine;
    }

    @observable _listPackageOrderReturn: IPackageOrderReturnResponse[] = [];
    set listPackageOrderReturn(value: IPackageOrderReturnResponse[]) {
        this._listPackageOrderReturn = value;
    }

    @computed get listPackageOrderReturn(): IPackageOrderReturnResponse[] {
        return this._listPackageOrderReturn;
    }

    @observable _detailOrderLine: IDetailOrderReturnLineResponse | undefined;
    set detailOrderLine(value: IDetailOrderReturnLineResponse | undefined) {
        this._detailOrderLine = value;
    }

    @computed get detailOrderLine(): IDetailOrderReturnLineResponse | undefined {
        return this._detailOrderLine;
    }

    @observable _detailPackage: IPackageOrderReturnResponse | undefined;
    set detailPackage(value: IPackageOrderReturnResponse | undefined) {
        this._detailPackage = value
    }

    @computed get detailPackage(): IPackageOrderReturnResponse | undefined {
        return this._detailPackage;
    }

    @observable listShipping: { shopId: number, services: { name: string, fee: number, serviceId: number }[] }[] = [];

    @computed get getListShipping(): { shopId: number, services: { name: string, fee: number, serviceId: number }[] }[] {
        return this.listShipping;
    }
}

export const store = new OrderReturnStore();