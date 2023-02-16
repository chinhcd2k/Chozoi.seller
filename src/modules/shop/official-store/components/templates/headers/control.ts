import {HeaderStore} from "./store";
import $ from "jquery";
import {notify} from "../../../../../../common/notify/NotifyService";
import {convertBase64ToBlobUrl} from "../../../../../../common/functions/ConvertFunc";
import {uploadImage} from "../../../../../../common/functions/UpfileFunc";
import {TemplateStore} from "../store";
import {sendUpdateTemplate} from "../../../../../../api/offical-store";

export const LOGO_WEB = {
    width: 220,
    height: 60
};

export const LOGO_APP = {
    width: 40 * 3,
    height: 40 * 3
};

class Control {
    public store = new HeaderStore();

    public showPopupUpload() {
        this.store.popupHeaderData = {web: null, app: null};
        Object.assign(this.store.popupHeaderData, this.store.logo);
        $('div.templates-header div.modal#template-header-popup').modal({show: true, backdrop: "static"});
    }

    private verifyDimensionImage(file: File): Promise<{ name: string, image: any, width: number, height: number }> {
        return new Promise((resolve, reject) => {
            try {
                const fr = new FileReader();
                fr.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({name: file.name, image: img, width: img.width, height: img.height});
                    };
                    typeof fr.result === "string" && (img.src = fr.result);
                };
                fr.readAsDataURL(file);
            } catch (e) {
                reject(e);
            }
        });
    }

    public async handlerOnUploadImage(e: any, type: 'web' | 'app') {
        if (e.currentTarget.files.length === 1) {
            let files_list: FileList = {} as any;
            Object.assign(files_list, e.currentTarget.files);
            const files = await this.verifyDimensionImage(e.currentTarget.files[0]);
            if (type === "web") {
                /*if ((files.width !== files.height) !== (LOGO_WEB.width + LOGO_WEB.height)) {
                    notify.show(`Vui lòng chọn đúng kích thước hình ảnh ${LOGO_WEB.width} x ${LOGO_WEB.height} (pixel)`, "error");
                    return;
                }*/
                this.store.popupHeaderData.web = {
                    url: convertBase64ToBlobUrl(files.image.src),
                    file: files_list[0]
                }
            } else if (type === "app") {
                if (files.width !== files.height) {
                    notify.show(`Vui lòng chọn ảnh vuông!`, "error");
                    return;
                }
                this.store.popupHeaderData.app = {
                    url: convertBase64ToBlobUrl(files.image.src),
                    file: files_list[0]
                }
            }
        }
    }

    public async handlerOnSaveLogo() {
        if (this.store.getPopupHeaderData.web === null) {
            notify.show('Vui lòng upload logo cho Web', "error");
            return;
        } else if (this.store.getPopupHeaderData.app === null) {
            notify.show('Vui lòng upload logo cho App', "error");
            return;
        }
        const popupData = this.store.getPopupHeaderData;
        await Promise.all([
            new Promise((resolve, reject) => {
                if (popupData.web && popupData.web.file)
                    uploadImage(popupData.web.file, "uploadCover")
                        .then(next => {
                            if (popupData.web && popupData.web.file) {
                                popupData.web.url = next.url;
                                delete popupData.web.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                else resolve();
            }),
            new Promise((resolve, reject) => {
                if (popupData.app && popupData.app.file)
                    uploadImage(popupData.app.file, "uploadCover")
                        .then(next => {
                            if (popupData.app && popupData.app.file) {
                                popupData.app.url = next.url;
                                delete popupData.app.file;
                            }
                            resolve();
                        })
                        .catch(e => reject(e));
                else resolve();
            })
        ]).then(() => this.SendRequestUpload()).catch(e => notify.show('Đã có lỗi xảy ra trong khi upload ảnh', "error"));
    }

    private async SendRequestUpload() {
        if (this.store.getPopupHeaderData.web && this.store.getPopupHeaderData.app) {
            const detailTemplate = TemplateStore.detailTemplate;
            const response = await sendUpdateTemplate(detailTemplate.shopId, detailTemplate.id, {
                logo: {
                    destop: this.store.getPopupHeaderData.web.url,
                    mobile: this.store.getPopupHeaderData.app.url
                },
                name: null,
                coupons: null,
                mainBanner: null,
                picProducts: null,
                subBanner: null
            });
            if (response.status === 200) {
                this.store.logo = {
                    app: {url: this.store.getPopupHeaderData.app.url} as any,
                    web: {url: this.store.getPopupHeaderData.web.url} as any
                };
                notify.show('Cập nhật thành công!', "success");
                $('div.templates-header div.modal#template-header-popup').modal("hide");
            } else if (response.body && response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else notify.show('Đã có lỗi xảy ra', "error");
        } else notify.show('Đã có lỗi xảy ra', "error");
    }

    public handlerOnRemoveLogo(target: 'web' | 'app') {
        this.store.getPopupHeaderData[target] = null;
    }

    public hasSaveTemplate(): boolean {
        if (!this.store.logo.web || !this.store.logo.app) {
            notify.show(`Vui lòng cập nhật ảnh logo cho ${!this.store.logo.web ? 'Web' : 'App'}`, "error");
            return false;
        }
        return true;
    }
}

export const HEADER_CTRL = new Control();
