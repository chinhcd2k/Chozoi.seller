import EditTemplate from "./EditTemplate";
import EditTemplateStore from "./EditTemplateStore";
import {service} from "../../ProductServices";
import {notify} from "../../../../common/notify/NotifyService";
import {EDIT_PRODUCT_CTRL} from "../../edit-product/EditProductControl";
import {convertBase64ToBlobUrl} from "../../../../common/functions/ConvertFunc";
import {PRODUCT_IMAGE_DIMENSION, PRODUCT_IMAGE_MAX_DIMENSION, MAX_IMAGE, MAX_SIZE_IMAGE} from "../create-template/CreateTemplateControl";

class EditTemplateControl {
    public view: EditTemplate = undefined as any;
    public store: EditTemplateStore = undefined as any;

    public async getListCategories() {
        const response = await service.getListCategories();
        if (response.status && response.status === 200 && response.body && response.body.categories && Array.isArray(response.body.categories)) {
            if (this.store) {
                this.store.listCategories = response.body.categories;
                this.getListCategoriesLv1();
            } else
                console.log('Not found store');
        }
    }

    public getListCategoriesLv1() {
        if (this.store) {
            this.store.listCategoriesLv1 = this.store.listCategories.reduce((previousValue: any[], currentValue) => {
                if (currentValue.level === 1) previousValue.push(currentValue);
                return previousValue;
            }, []);
            this.store.listCategoriesLv1 = this.store.listCategoriesLv1.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                else return 0;
            });
            this.store.listCategoriesLv2 = [];
            this.store.listCategoriesLv3 = [];

            this.store.keyCategoriesLv1 = Date.now();
            this.store.keyCategoriesLv2 = Date.now();
        }

        this.view && this.view.setState({});
    }

    public getListCategoriesLv2(parentId: number) {
        if (this.view) {
            this.view.defaultCategoriesLv1Value = '';
            this.view.defaultCategoriesLv2Value = '';
            this.view.defaultCategoriesLv3Value = '';
        }
        if (this.store) {
            this.store.listCategoriesLv2 = [];
            this.store.listCategoriesLv3 = [];
            this.store.listPropety = [];

            this.store.listCategoriesLv2 = this.store.listCategories.reduce((previousValue: any[], currentValue) => {
                if (currentValue.parentId === parentId) previousValue.push(currentValue);
                return previousValue;
            }, []);
            this.store.listCategoriesLv2.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                else return 0;
            });

            this.store.keyCategoriesLv2 = Date.now();
        }
    }

    public async getListCategoriesLv3(parentId: number) {
        if (this.view) {
            this.view.defaultCategoriesLv1Value = '';
            this.view.defaultCategoriesLv2Value = '';
            this.view.defaultCategoriesLv3Value = '';
        }
        if (this.store) {
            this.store.listPropety = [];
            this.store.listCategoriesLv3 = this.store.listCategories.reduce((previousValue: any[], currentValue) => {
                if (currentValue.parentId === parentId) previousValue.push(currentValue);
                return previousValue;
            }, []);
            this.store.listCategoriesLv3.slice().sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                else return 0;
            });
            this.store.keyCategoriesLv3 = Date.now();
            if (this.store.listCategoriesLv3.length === 0) await this.getListPropety(parentId);
        }
    }

    public async getListPropety(categories_id: number) {
        if (this.view && (categories_id !== this.view.props.defaultValue.category.id))
            EDIT_PRODUCT_CTRL.setAttribute([]);
        this.view && this.view.props.EmitInputOnChange(categories_id, "category");
        const response = await service.getPropertyCategories(categories_id);
        if (response.status === 200 && response.body.category && response.body.category.attributes && Array.isArray(response.body.category.attributes)) {
            this.store && (this.store.listPropety = response.body.category.attributes);
        }
        this.view && this.view.setState({keyPropety: Date.now()});
    }

    public handlerOnChangePropety(event: any, data: any) {
        data.selectValueId = parseInt(event.currentTarget.value);
        if (this.store) {
            const arr: { value_id: number }[] = [];
            this.store.listPropety.map((value: any) => value.selectValueId && arr.push({value_id: value.selectValueId}));
            EDIT_PRODUCT_CTRL.setAttribute(arr);
        }
    }

    public async getListShipping() {
        // @ts-ignore
        const response = await service.GET_listShipping(this.view.props.shopId);
        if (response.status === 200 && response.body && response.body.selectList && Array.isArray(response.body.selectList) && this.store) {
            this.store.listShipping = response.body.selectList.reduce((pre: any[], cur: any) => {
                let enable: boolean = false;
                cur.service.map((value: any) => value.status === "ENABLED" && (enable = true));
                if (enable) pre.push(cur);
                return pre;
            }, []);
            EDIT_PRODUCT_CTRL.setValidateShipping(this.store.listShipping.length > 0);
        }
    }

    /*Xu ly Anh*/
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

    protected autoCropImage(value: { name: string, image: any, width: number, height: number }): Promise<any> {
        return new Promise<any>(resolve => {
            const canvas: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
            const canvas1: HTMLCanvasElement = document.createElement("CANVAS") as HTMLCanvasElement;
            const ctx = canvas.getContext("2d");
            const ctx1 = canvas1.getContext("2d");
            if (ctx && ctx1) {
                // if (ctx) {
                let dx: number = 0;
                let dy: number = 0;
                /*Ảnh có 1 cạnh >= PRODUCT_IMAGE_DIMENSION*/
                if (Math.max(value.width, value.height) >= PRODUCT_IMAGE_DIMENSION) {
                    if (value.width > value.height) dy = (value.width - value.height) / 2;
                    else if (value.width < value.height) dx = (value.height - value.width) / 2;
                    canvas.width = Math.max(value.width, value.height);
                    canvas.height = Math.max(value.width, value.height);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(value.image, 0, 0, value.width, value.height, dx, dy, value.width, value.height);
                } else {
                    dx = (PRODUCT_IMAGE_DIMENSION - value.width) / 2;
                    dy = (PRODUCT_IMAGE_DIMENSION - value.height) / 2;
                    canvas.width = PRODUCT_IMAGE_DIMENSION;
                    canvas.height = PRODUCT_IMAGE_DIMENSION;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(value.image, 0, 0, value.width, value.height, dx, dy, value.width, value.height);
                }
                canvas.toBlob(blob => {
                    if (blob) {
                        const file = new File([blob], value.name, {type: 'image/jpg'});
                        if (file.size / 1000000 > 3) {
                            canvas1.width = Math.max(PRODUCT_IMAGE_MAX_DIMENSION);
                            canvas1.height = Math.max(PRODUCT_IMAGE_MAX_DIMENSION);
                            ctx1.drawImage(canvas, 0, 0, Math.max(value.width, value.height), Math.max(value.width, value.height), 0, 0, PRODUCT_IMAGE_MAX_DIMENSION, PRODUCT_IMAGE_MAX_DIMENSION);
                            canvas1.toBlob(blob1 => {
                                if (blob1) {
                                    const file1 = new File([blob1], value.name, {type: 'image/jpg'});
                                    resolve(file1);
                                } else resolve();
                            });
                        } else
                            resolve(file);
                    } else resolve();
                });
            } else resolve();
        });
    }

    public async uploadLocalImage(files: any) {
        const FUNC_PROCESS = (value: any, index: number): Promise<{}> => {
            return new Promise(async (resolve) => {
                let data = await this.verifyDimensionImage(value);
                // let max_sort = 0;
                // (this.store as CreateTemplateStore).listImage.map(value => value.sort > max_sort && (max_sort = value.sort));
                if (data.width !== data.height || Math.max(data.width, data.height) < PRODUCT_IMAGE_DIMENSION) {
                    const file = await this.autoCropImage(data);
                    data = await this.verifyDimensionImage(file);
                    resolve({
                        file: file,
                        src: data.image.src,
                        preIndex: index
                    });
                } else {
                    resolve({
                        file: value,
                        src: data.image.src,
                        preIndex: index
                    });
                }
            });
        };
        if (this.store && this.store.listImage.length < MAX_IMAGE) {
            this.view && this.view.setState({keyInputFile: Math.random()});
            let invalid_size_image = false;
            files = Object.keys(files).reduce((previousValue: any[], currentValue: any, currentIndex) => {
                if (currentIndex < files.length && files[currentValue].size <= MAX_SIZE_IMAGE * 1000000)
                    previousValue.push(files[currentValue]);
                else invalid_size_image = true;
                return previousValue;
            }, []);
            invalid_size_image && notify.show(`Ảnh không hợp lệ. Vui lòng chọn ảnh có dung lượng tối đa ${MAX_SIZE_IMAGE}MB`, "error", 7);
            if (Array.isArray(files)) {
                if (files.length > 0) {
                    const asyncLoop: any[] = [];
                    const length = this.store.listImage.length;
                    files.map((value, index) => {
                        (this.store as EditTemplateStore).listImage.length < MAX_IMAGE && (this.store as EditTemplateStore).listImage.push(null as any);
                        if (value.size <= (MAX_SIZE_IMAGE * 1000000))
                            asyncLoop.push(new Promise(async (resolve) => {
                                const response: any = await FUNC_PROCESS(value, index);
                                const position: number = length + response.preIndex;
                                if (position < MAX_IMAGE) {
                                    (this.store as EditTemplateStore).listImage[position] = {
                                        file: response.file,
                                        src: convertBase64ToBlobUrl(response.src),
                                        sort: position
                                    };
                                }
                                resolve();
                            }));
                        return asyncLoop;
                    });
                    await Promise.all(asyncLoop);
                }
            }
        } else
            notify.show('Chỉ có thể tối đa 10 ảnh', "error");
    }

    /*public base64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }*/

    /*Extend for update*/
    public async loadDefaultCategories(request_attribute: boolean = true) {
        if (this.view && this.store) {
            const response_category = this.view.props.defaultValue.category;
            const categories = this.view.props.defaultValue.categories.slice().sort((a, b) => {
                if (a.level < b.level) return -1;
                else if (a.level > b.level) return 1;
                return 0;
            });
            const listCategoriesLv1: any[] = [];
            const listCategoriesLv2: any[] = [];
            const listCategoriesLv3: any[] = [];

            this.store.listCategories.map(value => {
                if (this.store) {
                    if (value.level === 1) listCategoriesLv1.push(value);
                    else if (value.level === 2 && value.parentId === categories[0].id) listCategoriesLv2.push(value);
                    else if (value.level === 3 && value.parentId === categories[1].id) listCategoriesLv3.push(value);
                }
                return value;
            });

            /*Sort*/
            this.store.listCategoriesLv1 = listCategoriesLv1.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                return 0;
            });
            this.store.listCategoriesLv2 = listCategoriesLv2.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                return 0;
            });
            this.store.listCategoriesLv3 = listCategoriesLv3.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                return 0;
            });

            let categories_id: number | undefined = undefined;

            if (this.view && response_category.level === 2 && categories.length === 2) {
                if (listCategoriesLv1.findIndex(value => value.id === categories[0].id) !== -1)
                    this.view.defaultCategoriesLv1Value = categories[0].id.toString();
                if (listCategoriesLv2.findIndex(value => value.id === categories[1].id) !== -1)
                    this.view.defaultCategoriesLv2Value = categories[1].id.toString();

                EDIT_PRODUCT_CTRL.request_body_data_update_product && (EDIT_PRODUCT_CTRL.request_body_data_update_product.category = {id: categories[1].id});
                categories_id = categories[1].id;
            }
            //
            else if (this.view && response_category.level === 3 && categories.length === 3) {
                if (listCategoriesLv1.findIndex(value => value.id === categories[0].id) !== -1)
                    this.view.defaultCategoriesLv1Value = categories[0].id.toString();
                if (listCategoriesLv2.findIndex(value => value.id === categories[1].id) !== -1)
                    this.view.defaultCategoriesLv2Value = categories[1].id.toString();
                if (listCategoriesLv3.findIndex(value => value.id === categories[2].id) !== -1)
                    this.view.defaultCategoriesLv3Value = categories[2].id.toString();

                EDIT_PRODUCT_CTRL.request_body_data_update_product && (EDIT_PRODUCT_CTRL.request_body_data_update_product.category = {id: categories[2].id});
                categories_id = categories[2].id;
            }
            if (request_attribute && categories_id) {
                await this.getListPropety(categories_id);
                (this.store as EditTemplateStore).keyCategories = Date.now();
                this.loadDefaultPropety();
            }
        }
    }

    public loadDefaultPropety() {
        if (this.store && this.view) {
            const attributes = this.view.props.defaultValue.attributes;
            this.store.listPropety.map(value => {
                attributes.map(value1 => value.id === value1.id && (value.selectValueId = value1.valueId));
                return value;
            });
            this.view.setState({keyPropety: Date.now()});
        }
    }

    public loadDefaultImage() {
        if (this.store && this.view) {
            const arr = this.view.props.defaultValue.images.reduce((previousValue: any[], currentValue) => {
                previousValue.push({
                    id: currentValue.id,
                    sort: currentValue.sort,
                    src: currentValue.imageUrl
                });
                return previousValue;
            }, []);
            this.store.listImage = arr.sort((a, b) => {
                if (a.sort && b.sort) {
                    if (a.sort < b.sort) return -1;
                    else if (a.sort > b.sort) return 1;
                    else return 0;
                } else return 0;
            });
        }
    }

    public loadDefaultAutoPublic() {
        if (this.store && this.view) {
            this.store.isAutoPublic = this.view.props.defaultValue.autoPublic;
        }
    }
}

export const EDIT_TEMPLATE_CONTROL = new EditTemplateControl();
