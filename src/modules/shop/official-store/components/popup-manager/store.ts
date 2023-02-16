import {observable} from "mobx";
import {IReqPopupManagerRow} from "../../../../../api/offical-store/interfaces/request";

export class Store {
    @observable data: IReqPopupManagerRow = {web: [], app: []};
    @observable targetDevice: 'web' | 'app' = "web";
    @observable multiple: boolean = false;
    @observable categoryChildrenType: 'checkbox' | 'radio' = "checkbox";
}
