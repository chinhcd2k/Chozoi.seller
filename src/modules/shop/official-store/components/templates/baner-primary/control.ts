import $ from "jquery";
import {BannerPrimaryStore} from "./store";
import {POPUP_MANAGER_CTRL} from "../../popup-manager/control";
import {PopupUploadStore} from "../../popup-upload/store";
import {TemplateStore} from "../store";
import {PopupCategoryStore} from "../../popup-category/store";
import {notify} from "../../../../../../common/notify/NotifyService";
import {uploadImage} from "../../../../../../common/functions/UpfileFunc";
import {sendUpdateTemplate} from "../../../../../../api/offical-store";

export const BANNER_PRIMARY_WEB = {
    width: 1920,
    height: 640
};
export const BANNER_PRIMARY_APP = {
    width: 375 * 3,
    height: 148 * 3
};

class Control {
    public store = new BannerPrimaryStore();

    public showPopupManager() {
        POPUP_MANAGER_CTRL.store.categoryChildrenType = "radio";
        PopupCategoryStore.categoryChildrenType = "radio";
        POPUP_MANAGER_CTRL.store.multiple = true;
        PopupUploadStore.sizeWeb = BANNER_PRIMARY_WEB;
        PopupUploadStore.sizeApp = BANNER_PRIMARY_APP;
        TemplateStore.currentTarget = "BANNER_PRIMARY";
        Object.assign(POPUP_MANAGER_CTRL.store.data, JSON.parse(JSON.stringify(this.store.getBanner)));
        $('div.templates div.modal#popup-manager').modal({show: true, backdrop: "static"});
    }

    public async handlerOnSaveBanner() {
        this.store.banner.web = [...POPUP_MANAGER_CTRL.store.data.web];
        this.store.banner.app = [...POPUP_MANAGER_CTRL.store.data.app];
        const async_upload: Promise<any>[] = [];
        BANNER_PRIMARY_CTRL.store.banner.web.map(value => {
            if (value.image && value.image.file)
                async_upload.push(new Promise((resolve, reject) => {
                    uploadImage((value.image as any).file, "uploadCover")
                        .then(response => {
                            if (value.image) {
                                value.image.url = response.url;
                                delete value.image.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                }));
            return null;
        });
        BANNER_PRIMARY_CTRL.store.banner.app.map(value => {
            if (value.image && value.image.file)
                async_upload.push(new Promise((resolve, reject) => {
                    (value.image as any).file && uploadImage((value.image as any).file, "uploadCover")
                        .then(response => {
                            if (value.image) {
                                value.image.url = response.url;
                                delete value.image.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                }));
        });
        await Promise.all(async_upload)
            .then(() => this.SendRequestUpdate())
            .catch(() => notify.show('Đã có lỗi xảy ra trong quá trình upload ảnh', "error"));
    }

    private async SendRequestUpdate() {
        const templateDetail = TemplateStore.detailTemplate;
        const response = await sendUpdateTemplate(templateDetail.shopId, templateDetail.id, {
            name: null,
            logo: null,
            mainBanner: {
                destop: ((): { categories: number[], img: string }[] => {
                    const _return: { categories: number[], img: string }[] = [];
                    this.store.getBanner.web.map((value, index) => {
                        _return.push({
                            img: (value.image as any).url,
                            categories: ((): number[] => {
                                let categories: number[] = [];
                                if (value.category && value.category.children && value.category.children.length > 0) categories = [value.category.children[0].id];
                                else if (value.category) categories = [value.category.id];
                                return categories;
                            })()
                        });
                    });
                    return _return;
                })(),
                mobile: ((): { categories: number[], img: string }[] => {
                    const _return: { categories: number[], img: string }[] = [];
                    this.store.getBanner.app.map((value, index) => {
                        _return.push({
                            img: (value.image as any).url,
                            categories: ((): number[] => {
                                let categories: number[] = [];
                                if (value.category && value.category.children && value.category.children.length > 0) categories = [value.category.children[0].id];
                                else if (value.category) categories = [value.category.id];
                                return categories;
                            })()
                        });
                    });
                    return _return;
                })()
            },
            coupons: null,
            picProducts: null,
            subBanner: null
        });
        if (response.status === 200) {
            notify.show('Cập nhật thành công!', "success");
            $('div.templates div.modal#popup-manager').modal("hide");
        } else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else notify.show('Đã có lỗi xảy ra', "error");
    }

    public hasSaveTemplate(): boolean {
        const check_web = this.store.getBanner.web.findIndex(value => !value.image || !value.category);
        const check_app = this.store.getBanner.app.findIndex(value => !value.image || !value.category);
        if (check_web !== -1 || check_app !== -1) {
            notify.show(`Vui lòng cập nhật đủ thông tin cho Banner chính`, "error");
            return false;
        }
        return true;
    }
}

export const BANNER_PRIMARY_CTRL = new Control();
