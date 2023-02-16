import CreateTemplate from "./CreateTemplate";
import CreateTemplateStore from "./CreateTemplateStore";
import {service} from "../../ProductServices";
import {notify} from "../../../../common/notify/NotifyService";
import {CREATE_PRODUCT_CTRL} from "../../create-product/CreateProductControl";
import {convertBase64ToBlobUrl} from "../../../../common/functions/ConvertFunc";
import {AppGlobal} from "../../../../AppGlobal";

export const PRODUCT_IMAGE_MAX_DIMENSION: number = 1200;
export const PRODUCT_IMAGE_DIMENSION: number = (window as any).PRODUCT_IMAGE_DIMENSION || 0;
export const MAX_IMAGE: number = 10;
// Max size image upload MB.
export const MAX_SIZE_IMAGE = 3;

export class CreateTemplateControl {
    public view: CreateTemplate = undefined as any;
    public store: CreateTemplateStore = undefined as any;

    public getListCategories() {
        this.store.listCategories = AppGlobal.categoriesRes;
        this.getListCategoriesLv1();
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
        }
        this.view && this.view.setState({keyCategoriesLv2: Date.now(), keyCategoriesLv3: Date.now()});
    }

    public getListCategoriesLv2(parentId: number) {
        if (this.store) {
            this.store.listCategoriesLv2 = this.store.listCategories.reduce((previousValue: any[], currentValue) => {
                if (currentValue.parentId === parentId) previousValue.push(currentValue);
                return previousValue;
            }, []);
            this.store.listCategoriesLv2 = this.store.listCategoriesLv2.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                else return 0;
            });
            this.store.listCategoriesLv3 = [];
        }
        this.view && this.view.setState({keyCategoriesLv2: Date.now()});
    }

    public getListCategoriesLv3(parentId: number) {
        if (this.store) {
            this.store.listCategoriesLv3 = this.store.listCategories.reduce((previousValue: any[], currentValue) => {
                if (currentValue.parentId === parentId) previousValue.push(currentValue);
                return previousValue;
            }, []);
            this.store.listCategoriesLv3 = this.store.listCategoriesLv3.sort((a, b) => {
                if (a.sort < b.sort) return -1;
                else if (a.sort > b.sort) return 1;
                else return 0;
            });
            if (this.store.listCategoriesLv3.length === 0)
                this.getListPropety(parentId);
        }
        this.view && this.view.setState({keyCategoriesLv3: Date.now()});
    }

    public async getListPropety(categories_id: number) {
        this.view && this.view.props.EmitInputOnChange({currentTarget: {value: categories_id}} as any, "category");
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
            CREATE_PRODUCT_CTRL.setAttribute(arr);
        }
    }

    public getListShipping() {
        // @ts-ignore
        service.GET_listShipping(this.view.props.shopId).then(response => {
            if (response.status === 200 && response.body && response.body.selectList && Array.isArray(response.body.selectList) && this.store) {
                this.store.listShipping = response.body.selectList.reduce((pre: any[], cur: any) => {
                    let enable: boolean = false;
                    cur.service.map((value: any) => value.status === "ENABLED" && (enable = true));
                    if (enable) pre.push(cur);
                    return pre;
                }, []);
                CREATE_PRODUCT_CTRL.setValidateShipping(this.store.listShipping.length > 0);
            }
        });
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
                        (this.store as CreateTemplateStore).listImage.length < MAX_IMAGE && (this.store as CreateTemplateStore).listImage.push(null as any);
                        if (value.size <= (MAX_SIZE_IMAGE * 1000000)) asyncLoop.push(new Promise(async (resolve) => {
                            const response: any = await FUNC_PROCESS(value, index);
                            const position: number = length + response.preIndex;
                            if (position < MAX_IMAGE) {
                                (this.store as CreateTemplateStore).listImage[position] = {
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

    /* FETCH DATA */
    public async setDefaultValueCategories(categoryId: number) {
        if (AppGlobal.categories) {
            const cates = AppGlobal.categories[categoryId];
            if (cates) {
                if (cates.length === 2) {
                    this.store.defaultCategory = [cates[0].id, cates[1].id];
                    this.getListCategoriesLv2(cates[0].id);
                } else if (cates.length === 3) {
                    this.store.defaultCategory = [cates[0].id, cates[1].id, cates[2].id];
                    this.getListCategoriesLv2(cates[0].id);
                    this.getListCategoriesLv3(cates[1].id);
                }
                await this.getListPropety(categoryId);
            }
        }
    }

    public setDefaultValuePropety(categoryId: number, attributes: { id: number, valueId: number }[]) {
        attributes.map(value => {
            this.store.listPropety.map(value1 => {
                if (value1.id === value.id)
                    value1.selectValueId = value.valueId;
                return null;
            });
            return null;
        });
        this.view.setState({keyPropety: Date.now()});
    }

    // END
}

export const CREATE_TEMPLATE_CONTROL = new CreateTemplateControl();
