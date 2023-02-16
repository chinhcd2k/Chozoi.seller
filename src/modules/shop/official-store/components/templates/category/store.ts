import {observable} from "mobx";
import {
    IResCategoryTemp, IResPopupCategoryData,
    IResPopupProductsData,
    IResPopupUploadData
} from "../../../../../../api/offical-store/interfaces/response";


export class CategoryStore {
    @observable category: IResCategoryTemp[] = [];

    @observable popupTargetDevice: 'web' | 'app' = "web";

    @observable categoryIndex: number = 0;

    /*Popup Data*/

    @observable popupUploadData: IResPopupUploadData | null = null;

    @observable popupProductsData: IResPopupProductsData = {
        products: [],
        selected: [],
        page: 0,
        size: 5,
        total: 0
    };

    @observable popupCategoryData: IResPopupCategoryData = {app: null, web: null};
    /*------------------------------------------*/

}
