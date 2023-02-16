import $ from "jquery";
import {IResponseProduct as IProduct} from "../../../../../products/manager-product/components/ManagerProductComponent";
import {CategoryStore} from "./store";
import {notify} from "../../../../../../common/notify/NotifyService";
import {store as ProfileStore} from "../../../../../profile";
import {PopupCategoryStore} from "../../popup-category/store";
import {POPUP_MANAGER_CTRL} from "../../popup-manager/control";
import {TemplateStore} from "../store";
import {PopupUploadStore} from "../../popup-upload/store";
import {uploadImage} from "../../../../../../common/functions/UpfileFunc";
import {service as productService} from "../../../../../products/ProductServices";
import {
    IReqCategory,
    IReqCategoryParent, IReqImage, IReqPopupManagerRow
} from "../../../../../../api/offical-store/interfaces/request";
import {sendUpdateTemplate, getCategoryForShop, getProducts} from "../../../../../../api/offical-store";
import {IReqAddTemplate, IReqBanner} from "../../../../../../api/offical-store/interfaces/request";

export const MAX_PRODUCTS = 8;
export const CATEGORY_BANNER_WEB = {
    width: 1920,
    height: 460
};
export const CATEGORY_BANNER_APP = {
    width: 375 * 3,
    height: 146 * 3
};

class Control {
    public store = new CategoryStore();

    public FUNC_CONVERT_CATEGORY_TO_TREE(category: { id: number, name: string, level: number, parentId: number | null }[]): IReqCategoryParent[] {
        const FUNC_DE_QUY = (parent_ids: number[], current_index: number, data: IReqCategory[], root: boolean = true) => {
            if (!root) {
                const index = category.findIndex(value => value.id === parent_ids[current_index]);
                data.push({
                    id: category[index].id,
                    name: category[index].name,
                    level: category[index].level
                });
            }
            if (parent_ids.length > 0) {
                let search_index = category.findIndex(value => value.parentId === parent_ids[current_index]);
                if (search_index !== -1) {
                    let child_ids: number[] = [];
                    category.map(value => value.parentId === parent_ids[current_index] && child_ids.push(value.id));
                    if (child_ids.length > 0) {
                        child_ids.map((value, index) => {
                            FUNC_DE_QUY(child_ids, index, data, false);
                            return data;
                        })
                    }
                } else return data;
            } else return data;
        };
        if (category.length === 0) return [];
        else {
            const _return: IReqCategoryParent[] = [];
            category.map(value => {
                if (value.level === 1) {
                    const children: IReqCategory[] = [];
                    FUNC_DE_QUY([value.id], 0, children);
                    _return.push({
                        id: value.id,
                        name: value.name,
                        level: value.level,
                        children: children
                    })
                }
                return null;
            });
            return _return;
        }
    };

    /*Request API*/
    public async getCategoryForShop() {
        const shopId = ProfileStore.profile!.shopId;
        const response = await getCategoryForShop(shopId);
        if (response.status === 200 && Array.isArray(response.body)) {
            TemplateStore.listCategory = this.FUNC_CONVERT_CATEGORY_TO_TREE(response.body);
        }
    }

    public async getProductsForShop(page?: number, isSearch?: boolean, textSearch?: string) {
        if (page !== undefined) this.store.popupProductsData.page = page;
        const shopId = ProfileStore.profile!.shopId;
        if (isSearch) {
            const response = await productService.search(shopId, 'NORMAL', textSearch, "PUBLIC", "", this.store.popupProductsData.size, this.store.popupProductsData.page);
            if (response.status === 200) {
                this.store.popupProductsData.products = response.body.products;
                this.store.popupProductsData.total = response.body.metadata.total;

                // test
                // this.store.category[0].products = this.store.category[0].products.concat(response.body.products.slice(0, 8));
            }
        } else {
            const response = await getProducts(shopId, this.store.popupProductsData.page, this.store.popupProductsData.size);
            if (response.status === 200) {
                this.store.popupProductsData.products = response.body.products;
                this.store.popupProductsData.total = response.body.metadata.total;
            }
        }

    }

    /*=====================*/

    /*Show Popup*/
    public showPopupManager(category_index: number) {
        this.store.categoryIndex = category_index;
        const category = this.store.category[category_index];
        POPUP_MANAGER_CTRL.store.categoryChildrenType = "checkbox";
        PopupCategoryStore.categoryChildrenType = "checkbox";
        POPUP_MANAGER_CTRL.store.multiple = false;
        PopupUploadStore.sizeWeb = CATEGORY_BANNER_WEB;
        PopupUploadStore.sizeApp = CATEGORY_BANNER_APP;
        TemplateStore.currentTarget = "CATEGORY";
        POPUP_MANAGER_CTRL.store.data = {
            web: [
                {
                    image: ((): IReqImage | null => {
                        let _return = null;
                        if (category.web.image) {
                            _return = {} as any;
                            Object.assign(_return, category.web.image);
                        }
                        return _return;
                    })(),
                    category: ((): IReqCategoryParent | null => {
                        let _return = null;
                        if (category.web.category) {
                            _return = {} as any;
                            Object.assign(_return, JSON.parse(JSON.stringify(category.web.category)));
                        }
                        return _return;
                    })()
                }
            ],
            app: [
                {
                    image: ((): IReqImage | null => {
                        let _return = null;
                        if (category.app.image) {
                            _return = {} as any;
                            Object.assign(_return, category.app.image);
                        }
                        return _return;
                    })(),
                    category: ((): IReqCategoryParent | null => {
                        let _return = null;
                        if (category.app.category) {
                            _return = {} as any;
                            Object.assign(_return, category.app.category);
                        }
                        return _return;
                    })()
                }
            ]
        };
        $('div.templates div.modal#popup-manager').modal({show: true, backdrop: "static"});
    }

    public showPopupSelectProducts(category_index: number) {
        this.store.categoryIndex = category_index;
        const category = this.store.category[category_index];
        this.store.popupProductsData.selected = [];
        Object.assign(this.store.popupProductsData.selected, category.products);
        $('div.template-category div.modal#popup-products').modal({show: true, backdrop: "static"});
    }

    /*===============*/

    public handlerOnRemoveCategory(index: number) {
        this.store.category.splice(index, 1);
    }

    public handlerOnAddCategory() {
        this.store.category.push({
            web: {
                image: null,
                category: null
            },
            app: {
                image: null,
                category: null
            },
            products: []
        });
    }

    public handlerOnChangeSelectProduct(product: IProduct, check: boolean) {
        if (check) {
            const find = this.store.popupProductsData.selected.findIndex(value => value.id === product.id);
            if (find !== -1) this.store.popupProductsData.selected.splice(find, 1);
        } else if (this.store.popupProductsData.selected.length < MAX_PRODUCTS) this.store.popupProductsData.selected.push(product);
        else notify.show(`Bạn chỉ được chọn tối đa ${MAX_PRODUCTS} sản phẩm`, "error");
    }

    public handlerOnSaveSelectProduct() {
        if (this.store.popupProductsData.selected.length > 0) this.SendRequestUpdate("product").finally();
        else notify.show('Bạn phải chọn ít nhất 1 sản phẩm', "error");
    }

    public handlerOnRemoveProduct(category_index: number, product_index: number) {
        const category = this.store.category[category_index];
        if (category.products.length > 1)
            category.products.splice(product_index, 1);
        else notify.show('Danh mục phải có ít nhất 1 sản phẩm', "error");
    }

    public hasSaveCategory(): boolean {
        let invalid_image = false;
        let invalid_category = false;
        POPUP_MANAGER_CTRL.store.data.web.map(value => {
            if (!value.image) invalid_image = true;
            if (!value.category) invalid_category = true;
            return null;
        });
        POPUP_MANAGER_CTRL.store.data.app.map(value => {
            if (!value.image) invalid_image = true;
            if (!value.category) invalid_category = true;
            return null;
        });
        if (invalid_image) {
            notify.show('Vui lòng chọn ảnh cho banner', "error");
            return false;
        } else if (invalid_category) {
            notify.show('Vui lòng chọn danh mục', "error");
            return false;
        }
        return true;
    }

    public async handlerOnSaveCategory() {
        const popupData = POPUP_MANAGER_CTRL.store.data as IReqPopupManagerRow;
        if (this.hasSaveCategory()) {
            const async_upload: Promise<any>[] = [];
            this.store.category.map(value => {
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
                return null;
            });
            popupData.web.map(value => value.image && value.image.file && async_upload.push(new Promise<any>((resolve, reject) => {
                if (value.image && value.image.file) uploadImage(value.image.file, "uploadCover")
                    .then(response => {
                        if (value.image && value.image.file) {
                            value.image.url = response.url;
                            delete value.image.file;
                        }
                        resolve();
                    })
                    .catch(e => reject(e));
                else resolve();
            })));
            popupData.app.map(value => value.image && value.image.file && async_upload.push(new Promise<any>((resolve, reject) => {
                if (value.image && value.image.file) uploadImage(value.image.file, "uploadCover")
                    .then(response => {
                        if (value.image && value.image.file) {
                            value.image.url = response.url;
                            delete value.image.file;
                        }
                        resolve();
                    })
                    .catch(e => reject(e));
                else resolve();
            })));
            if (async_upload.length > 0) {
                await Promise.all(async_upload)
                    .then(() => this.SendRequestUpdate("category"))
                    .catch(e => {
                        notify.show('Đã có lỗi trong quá trình upload ảnh', "error");
                        console.error(e);
                    });
            } else await this.SendRequestUpdate("category");
        }
    }

    private async SendRequestUpdate(type: 'category' | 'product') {
        try {
            const templateDetail = TemplateStore.detailTemplate;
            let request_body: IReqAddTemplate = {} as any;
            if (type === "category") {
                request_body = {
                    name: null,
                    logo: null,
                    coupons: null,
                    mainBanner: null,
                    picProducts: ((): { banner: IReqBanner, products: number[] | null }[] => {
                        let _return: { banner: IReqBanner, products: number[] | null }[] = [];
                        const popupData = POPUP_MANAGER_CTRL.store.data;
                        this.store.category.map((value, index) => {
                            if (index === this.store.categoryIndex) {
                                if (popupData.web.length === popupData.app.length) {
                                    for (let i = 0; i < popupData.web.length; i++)
                                        _return.push({
                                            banner: {
                                                destop: [{
                                                    categories: ((): number[] => {
                                                        let return_catgory: number[] = [];
                                                        let catgory = popupData.web[i].category;
                                                        if (catgory && catgory.children && catgory.children.length > 0) {
                                                            return_catgory.push(catgory.id);
                                                            catgory.children.map(value => return_catgory.push(value.id));
                                                        } else if (catgory) return_catgory.push(catgory.id);
                                                        return return_catgory;
                                                    })(),
                                                    img: (popupData.web[i].image as any).url
                                                }],
                                                mobile: [{
                                                    categories: ((): number[] => {
                                                        let return_catgory: number[] = [];
                                                        let catgory = popupData.app[i].category;
                                                        if (catgory && catgory.children && catgory.children.length > 0) {
                                                            return_catgory.push(catgory.id);
                                                            catgory.children.map(value => return_catgory.push(value.id));
                                                        } else if (catgory) return_catgory.push(catgory.id);
                                                        return return_catgory;
                                                    })(),
                                                    img: (popupData.app[i].image as any).url
                                                }]
                                            },
                                            products: null
                                        });
                                }
                            } else {
                                _return.push({
                                    banner: {
                                        destop: [{
                                            categories: ((): number[] => {
                                                let return_catgory: number[] = [];
                                                let catgory = value.web.category;
                                                if (catgory && catgory.children && catgory.children.length > 0) {
                                                    return_catgory.push(catgory.id);
                                                    catgory.children.map(value => return_catgory.push(value.id));
                                                } else if (catgory) return_catgory.push(catgory.id);
                                                return return_catgory;
                                            })(),
                                            img: (value.web.image as IReqImage).url
                                        }],
                                        mobile: [{
                                            categories: ((): number[] => {
                                                let return_catgory: number[] = [];
                                                let catgory = value.app.category;
                                                if (catgory && catgory.children && catgory.children.length > 0) {
                                                    return_catgory.push(catgory.id);
                                                    catgory.children.map(value => return_catgory.push(value.id));
                                                } else if (catgory) return_catgory.push(catgory.id);
                                                return return_catgory;
                                            })(),
                                            img: (value.app.image as IReqImage).url
                                        }]
                                    },
                                    products: null
                                })
                            }
                            return value;
                        })
                        return _return;
                    })(),
                    subBanner: null
                };
            } //
            else if (type === "product") request_body = {
                name: null,
                logo: null,
                coupons: null,
                mainBanner: null,
                picProducts: ((): { banner: IReqBanner | null, products: number[] | null }[] => {
                    let _return: { banner: IReqBanner | null, products: number[] | null }[] = [];
                    this.store.category.map((value, index) => _return.push({
                        banner: ((): IReqBanner | null => {
                            if (!value.web.image && !value.web.category && !value.app.image && !value.app.category) return null;
                            else return {
                                destop: [
                                    {
                                        img: value.web.image ? value.web.image.url : '',
                                        categories: ((): number[] => {
                                            let categorie_ids: number[] = [];
                                            if (value.web.category) {
                                                categorie_ids.push(value.web.category.id);
                                                if (Array.isArray(value.web.category.children)) value.web.category.children.map(value1 => categorie_ids.push(value1.id))
                                            }
                                            return categorie_ids;
                                        })()
                                    }
                                ],
                                mobile: [
                                    {
                                        img: value.app.image ? value.app.image.url : '',
                                        categories: ((): number[] => {
                                            let categorie_ids: number[] = [];
                                            if (value.app.category) {
                                                categorie_ids.push(value.app.category.id);
                                                if (Array.isArray(value.app.category.children)) value.app.category.children.map(value1 => categorie_ids.push(value1.id))
                                            }
                                            return categorie_ids;
                                        })()
                                    }
                                ]
                            };
                        })(),
                        products: ((): number[] | null => {
                            let product_ids: number[] = [];
                            if (index === this.store.categoryIndex) this.store.popupProductsData.selected.map(value1 => product_ids.push(value1.id));
                            else value.products.map(value1 => product_ids.push(value1.id));
                            return product_ids.length > 0 ? product_ids : null;
                        })()
                    }))
                    return _return;
                })(),
                subBanner: null
            };
            const response = await sendUpdateTemplate(templateDetail.shopId, templateDetail.id, request_body);
            if (response.status === 200) {
                if (type === "category") {
                    const popupData = POPUP_MANAGER_CTRL.store.data as IReqPopupManagerRow;
                    const category = this.store.category[this.store.categoryIndex];
                    Object.assign(category.web, {
                        image: popupData.web[0].image,
                        category: popupData.web[0].category
                    });
                    Object.assign(category.app, {
                        image: popupData.app[0].image,
                        category: popupData.app[0].category,
                    });
                } else if (type === "product") {
                    const category = this.store.category[this.store.categoryIndex];
                    category.products = [];
                    Object.assign(category.products, this.store.popupProductsData.selected);
                    $('div.template-category div.modal#popup-products').modal("hide");
                }
                notify.show('Cập nhật thành công!', "success");
                $('div.templates div.modal#popup-manager').modal("hide");
            } //
            else if (response.body && response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else notify.show('Đã có lỗi xảy ra', "error");
        } catch (e) {
            notify.show('Đã có lỗi xảy ra!', "error");
            console.error(e);
            return;
        }
    }
}

export const CATEGORY_CTRL = new Control();
