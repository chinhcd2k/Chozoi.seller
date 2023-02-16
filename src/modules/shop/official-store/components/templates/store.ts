import {observable} from "mobx";
import {IResTemplate} from "../../../../../api/offical-store/interfaces/response";
import {IReqCategoryParent} from "../../../../../api/offical-store/interfaces/request";

class Store {
    public templateId: number = 0;
    public currentTarget: 'BANNER_PRIMARY' | 'CATEGORY' | 'BANNER' = 'BANNER_PRIMARY';
    public detailTemplate: IResTemplate = null as any;

    @observable listCategory: IReqCategoryParent[] = [];

    @observable type: 'CREATE' | 'RENAME' | 'CLONE' | 'DELETE' | 'UPDATE' = "CREATE";
}

export const TemplateStore = new Store();
