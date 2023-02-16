import {observable} from "mobx";
import {IReqCategoryParent} from "../../../../../api/offical-store/interfaces/request";

export class Store {
    @observable categorySelected: IReqCategoryParent | null = null;
    @observable targetDevice: 'web' | 'app' = "web";
    @observable categoryChildrenType: 'checkbox' | 'radio' = "checkbox";
}

export const PopupCategoryStore = new Store();
