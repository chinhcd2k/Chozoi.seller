import {Store} from "./store";
import {PopupUploadStore} from "../popup-upload/store";
import {PopupCategoryStore} from "../popup-category/store";
import $ from "jquery";
import PopupManager from "./index";
import {notify} from "../../../../../common/notify/NotifyService";
import {IReqCategoryParent, IReqImage} from "../../../../../api/offical-store/interfaces/request";

export class PopupManagerControl {
    public store = new Store();
    public view: PopupManager = {} as any;

    private popup_upload_data_index: number = 0;
    private popup_category_data_index: number = 0;

    public handlerOnShowPopupUpload(target: 'web' | 'app', item: IReqImage | null, index: number) {
        this.store.targetDevice = target;
        this.popup_upload_data_index = index;
        PopupUploadStore.device = target;
        if (item) {
            PopupUploadStore.data = {} as any;
            Object.assign(PopupUploadStore.data, JSON.parse(JSON.stringify(item)));
        } else PopupUploadStore.data = null;
        $(`div.templates div.modal#popup-upload`).modal({show: true, backdrop: "static"});
    }

    public handlerOnShowPopupSelectCategory(target: 'web' | 'app', item: IReqCategoryParent | null, index: number) {
        this.store.targetDevice = target;
        PopupUploadStore.device = target;
        this.popup_category_data_index = index;
        if (item) {
            PopupCategoryStore.categorySelected = {} as any;
            Object.assign(PopupCategoryStore.categorySelected, JSON.parse(JSON.stringify(item)));
        } else PopupCategoryStore.categorySelected = null;
        $(`div.templates div.modal#popup-category`).modal({show: true, backdrop: "static"});
    }

    public handlerOnSaveImage() {
        if (!PopupUploadStore.data) {
            notify.show('Vui lòng upload ảnh trước khi lưu', "error");
            return;
        }
        let temp = this.store.data[this.store.targetDevice][this.popup_upload_data_index].image;
        if (!temp) this.store.data[this.store.targetDevice][this.popup_upload_data_index].image = {} as any;
        Object.assign(this.store.data[this.store.targetDevice][this.popup_upload_data_index].image, PopupUploadStore.data);
        $(`div.templates div.modal#popup-upload`).modal("hide");
    }

    public handlerOnSaveCategory() {
        if (!PopupCategoryStore.categorySelected) {
            notify.show('Vui lòng chọn danh mục trước khi lưu', "error");
            return;
        }
        let temp = this.store.data[this.store.targetDevice][this.popup_category_data_index].category;
        if (!temp) this.store.data[this.store.targetDevice][this.popup_category_data_index].category = {} as any;
        Object.assign(this.store.data[this.store.targetDevice][this.popup_category_data_index].category, PopupCategoryStore.categorySelected);
        $(`div.templates div.modal#popup-category`).modal("hide");
    }

    public handlerOnAddRow(target: 'web' | 'app') {
        if (this.store.data) this.store.data[target].push({image: null, category: null});
    }

    public handlerOnDeleteRow(target: 'web' | 'app', index: number) {
        if (this.store.data && this.store.data[target].length > 1)
            this.store.data[target].splice(index, 1);
    }

    public handlerOnSave() {
        const check_image: boolean = ((): boolean => {
            let _return: boolean = true;
            this.store.data.web.map((value: any) => !value.image && (_return = false));
            _return && this.store.data.app.map((value: any) => !value.image && (_return = false));
            return _return;
        })();
        const check_category: boolean = ((): boolean => {
            let _return: boolean = true;
            this.store.data.web.map((value: any) => !value.category && (_return = false));
            _return && this.store.data.app.map((value: any) => !value.category && (_return = false));
            return _return;
        })();
        if (!check_image) {
            notify.show('Vui lòng upload đủ ảnh banner', "error");
            return;
        }
        if (!check_category) {
            notify.show('Vui lòng chọn đủ danh mục', "error");
            return;
        }
        this.view.props.OnSave();
    }
}

export const POPUP_MANAGER_CTRL = new PopupManagerControl();
