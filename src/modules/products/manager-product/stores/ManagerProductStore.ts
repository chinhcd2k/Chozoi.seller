import {computed, observable} from "mobx";
import {IResponseProduct} from "../components/ManagerProductComponent";

interface IModalConfirm {
  show: boolean;
  message: string,
  type?: 'UPDATE_QUANTITY' | 'PUBLIC' | 'READY' | 'PENDING' | 'DELETE',
  /*Update Quantity*/
  product?: IResponseProduct,
  variant_id?: number,
  quantity?: number,
  responseUpdateQuantity?: (variantId?: number) => void
  /*---- END ----*/
}

export class ManagerProductStore {
  @observable _actionBar: boolean = false;
  set actionBar(value: boolean) {
    this._actionBar = value;
  }

  @computed get actionBar(): boolean {
    return this._actionBar;
  }

  @observable _selectAll: boolean = false;

  set selectAll(value: boolean) {
    this._selectAll = value;
  }

  @computed get selectAll(): boolean {
    return this._selectAll;
  }

  @observable _listProduct: IResponseProduct[] = [];

  set listProduct(value: IResponseProduct[]) {
    this._listProduct = value;
  }

  @computed get listProduct(): IResponseProduct[] {
    return this._listProduct;
  }

  @observable _modalData: IModalConfirm = {message: '', show: true};

  set modalData(value: IModalConfirm) {
    this._modalData = value;
  }

  @computed get modalData(): IModalConfirm {
    return this._modalData;
  }

  @observable dataCreateAuction?: IResponseProduct
}

export const store = new ManagerProductStore();
