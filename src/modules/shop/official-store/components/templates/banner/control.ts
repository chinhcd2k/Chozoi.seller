import {BannerStore} from "./store";
import $ from "jquery";
import {PopupCategoryStore} from "../../popup-category/store";
import {POPUP_MANAGER_CTRL} from "../../popup-manager/control";
import {PopupUploadStore} from "../../popup-upload/store";
import {TemplateStore} from "../store";
import {notify} from "../../../../../../common/notify/NotifyService";
import {uploadImage} from "../../../../../../common/functions/UpfileFunc";
import {IReqCategoryParent, IReqImage, IReqPopupManagerRow} from "../../../../../../api/offical-store/interfaces/request";
import {sendUpdateTemplate} from "../../../../../../api/offical-store";
import {IReqBanner} from "../../../../../../api/offical-store/interfaces/request";

export const BANNER_WEB = {
    width: 680,
    height: 180
};

export const BANNER_APP = {
    width: 351 * 3,
    height: 124 * 3
};

class Control {
    public store = new BannerStore();

    public showPopupManager(banner_index: number) {
        this.store.bannerIndex = banner_index;
        POPUP_MANAGER_CTRL.store.categoryChildrenType = "radio";
        PopupCategoryStore.categoryChildrenType = "radio";
        POPUP_MANAGER_CTRL.store.multiple = false;
        PopupUploadStore.sizeWeb = BANNER_WEB;
        PopupUploadStore.sizeApp = BANNER_APP;
        TemplateStore.currentTarget = "BANNER";
        Object.assign(POPUP_MANAGER_CTRL.store.data, JSON.parse(JSON.stringify(this.store.getBanner)));
        const banner = this.store.getBanner[banner_index];
        POPUP_MANAGER_CTRL.store.data = {
            web: [
                {
                    image: ((): IReqImage | null => {
                        let _return = null;
                        if (banner.web.image) {
                            _return = {} as any;
                            Object.assign(_return, banner.web.image);
                        }
                        return _return;
                    })(),
                    category: ((): IReqCategoryParent | null => {
                        let _return = null;
                        if (banner.web.category) {
                            _return = {} as any;
                            Object.assign(_return, JSON.parse(JSON.stringify(banner.web.category)));
                        }
                        return _return;
                    })()
                }
            ],
            app: [
                {
                    image: ((): IReqImage | null => {
                        let _return = null;
                        if (banner.app.image) {
                            _return = {} as any;
                            Object.assign(_return, banner.app.image);
                        }
                        return _return;
                    })(),
                    category: ((): IReqCategoryParent | null => {
                        let _return = null;
                        if (banner.app.category) {
                            _return = {} as any;
                            Object.assign(_return, banner.app.category);
                        }
                        return _return;
                    })()
                }
            ]
        };
        $('div.templates div.modal#popup-manager').modal({show: true, backdrop: "static"});
    }

    public async handlerOnSaveBanner() {
        if (POPUP_MANAGER_CTRL.store.data) {
            const popupData = POPUP_MANAGER_CTRL.store.data as IReqPopupManagerRow;
            const banner = this.store.getBanner[this.store.getBannerIndex];
            Object.assign(banner.web, {
                image: popupData.web[0].image,
                category: popupData.web[0].category
            });
            Object.assign(banner.app, {
                image: popupData.app[0].image,
                category: popupData.app[0].category,
            });

            const async_upload: Promise<any>[] = [];
            const value = this.store.getBanner[this.store.getBannerIndex];
            if (value.web.image && value.web.image.file) {
                async_upload.push(new Promise((resolve, reject) => {
                    uploadImage((value.web.image as any).file, "uploadCover")
                        .then(response => {
                            if (value.web.image) {
                                value.web.image.url = response.url;
                                delete value.web.image.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                }))
            }
            if (value.app.image && value.app.image.file) {
                async_upload.push(new Promise((resolve, reject) => {
                    uploadImage((value.app.image as any).file, "uploadCover")
                        .then(response => {
                            if (value.app.image) {
                                value.app.image.url = response.url;
                                delete value.app.image.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                }))
            }
            await Promise.all(async_upload)
                .then(() => this.SendRequestUpdate())
                .catch(() => notify.show('Đã có lỗi xảy ra trong quá trình upload ảnh', "error"));
        }
    }

    private async SendRequestUpdate() {
        const detailTemplate = TemplateStore.detailTemplate;
        const response = await sendUpdateTemplate(detailTemplate.shopId, detailTemplate.id, {
            name: null,
            logo: null,
            coupons: null,
            picProducts: null,
            mainBanner: null,
            subBanner: ((): IReqBanner[] => {
                const _return: IReqBanner[] = [];
                this.store.getBanner.map(value => {
                    if (value.web.category && value.web.image && value.app.category && value.app.image)
                        _return.push({
                            destop: [
                                {
                                    categories: ((): number[] => {
                                        let categories: number[] = [];
                                        if (value.web.category && value.web.category.children && value.web.category.children.length > 0)
                                            categories = [value.web.category.children[0].id];
                                        else if (value.web.category) categories = [value.web.category.id];
                                        return categories;
                                    })(),
                                    img: value.web.image ? value.web.image.url : ''
                                }
                            ],
                            mobile: [
                                {
                                    categories: ((): number[] => {
                                        let categories: number[] = [];
                                        if (value.app.category && value.app.category.children && value.app.category.children.length > 0)
                                            categories = [value.app.category.children[0].id];
                                        else if (value.app.category) categories = [value.app.category.id];
                                        return categories;
                                    })(),
                                    img: value.app.image ? value.app.image.url : ''
                                }
                            ]
                        });
                    return value;
                });
                return _return;
            })()
        });
        if (response.status === 200) {
            notify.show('Cập nhật thành công!', "success");
            $('div.templates div.modal#popup-manager').modal("hide");
        } else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else notify.show('Đã có lỗi xảy ra', "error");
    }

    public hasSaveTemplate(): boolean {
        let has: boolean = true;
        this.store.getBanner.map(value => {
            if (!value.web.image || !value.web.category || !value.app.image || !value.app.category) has = false;
        });
        if (!has) {
            notify.show('Vui lòng nhập đủ thông tin cho banner phụ', "error");
            return false;
        }
        return true;
    }
}

export const BANNER_CTRL = new Control();
