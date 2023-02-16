import EditProduct from "./EditProduct";
import EditProductStore from "./EditProductStore";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {EDIT_TEMPLATE_CONTROL} from "../components/edit-template/EditTemplateControl";
import {notify} from "../../../common/notify/NotifyService";
import {IRequestBodyDataUpdateProduct, service} from "../ProductServices";
import humps from "humps";
import $ from "jquery";
import EditTemplateStore from "../components/edit-template/EditTemplateStore";
import {uploadImage} from "../../../common/functions/UpfileFunc";
import {MAX_VARIANT_QUANTITY} from "../create-product/CreateProductControl";

class EditProductControl {
    public view: EditProduct = null as any;
    public store: EditProductStore = null as any;
    public request_body_data_update_product?: IRequestBodyDataUpdateProduct;
    public price_and_store?: {
        id?: number
        price: number | null
        sale_price: number
        quantity: number
        sku: string
    };
    public variant_data: {
        price?: number
        sale_price: number
        quantity: number
        sku: string
    } = {sale_price: 0, quantity: 0, sku: ''};

    constructor() {
        this.initTempPriceAndStore();
    }

    public get getStore(): EditProductStore | undefined {
        return this.store;
    }

    private initTempPriceAndStore() {
        this.price_and_store = {
            price: null,
            quantity: 0,
            sale_price: 0,
            sku: ''
        };
    }

    public initTableVariantData() {
        if (this.store) {
            this.store.tableVariantData = [];
            for (let i = 0; i < 100; i++) this.store.tableVariantData.push({
                sale_price: 0,
                quantity: 0,
                sku: ''
            });
        }
    }

    public refreshTableVariant() {
        if (this.store) {
            let total: number = -1;
            this.store.listClassifier.map(value => {
                total === -1 && value.values.length > 0 && (total = 1);
                total *= value.values.length;
                return total;
            });
            this.store.tableVariantData.map((value, index) => {
                if (index >= total)
                    (this.store as any).tableVariantData[index] = {
                        sale_price: 0,
                        quantity: 0,
                        sku: ''
                    };
                return value;
            });
        }
    }

    public setValidateShipping(value: boolean) {
        this.store && (this.store.VALIDATE_SHIPPING = value);
    }

    public setAttribute(value: any[]) {
        this.request_body_data_update_product && (this.request_body_data_update_product.attributes = value);
    }

    public ValidateShipping(): boolean {
        if (this.request_body_data_update_product) {
            const store = EDIT_TEMPLATE_CONTROL.store;
            // check Weight
            const listValidWeight = store.listShipping.reduce((previousValue: any[], currentValue: any) => {
                if (this.request_body_data_update_product && currentValue.maxWeight >= this.request_body_data_update_product.weight) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []);
            if (listValidWeight.length === 0) {
                notify.show('Cân nặng không hợp lệ!', "error");
                return false;
            }
            // Check Package Size
            const listValidPackageSize: any[] = listValidWeight.reduce((previousValue: any[], currentValue: any) => {
                // @ts-ignore
                let tempSize: number[] = this.request_body_data_update_product.packing_size;
                tempSize = tempSize.sort();
                tempSize = tempSize.reverse();
                currentValue.maxSize = currentValue.maxSize.sort();
                currentValue.maxSize = currentValue.maxSize.reverse();
                if (tempSize[0] <= currentValue.maxSize[0] &&
                    tempSize[1] <= currentValue.maxSize[1] &&
                    tempSize[2] <= currentValue.maxSize[2]) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []);
            if (listValidPackageSize.length === 0) {
                notify.show('Kích thước không hợp lệ!', "error");
                return false;
            }
            return true;
        }
        return false;
    }

    public async handlerOnSubmit() {
        this.view.setState({disabledSubmit: true});
        const time_out = setTimeout(() => {
            if (this.view) this.view.state.disabledSubmit && this.view.setState({disabledSubmit: false});
        }, 30000);
        if (this.request_body_data_update_product) {
            this.store.getType === "NORMAL" && delete this.request_body_data_update_product.classifiers;
            this.request_body_data_update_product.type = this.store.type;
            this.request_body_data_update_product.is_quantity_limited = this.store.isQuantityLimited;
            const temp_store: EditTemplateStore = EDIT_TEMPLATE_CONTROL.store;
            this.request_body_data_update_product.free_ship_status = temp_store.freeShip;
            this.request_body_data_update_product.videos = [];
            /*Upload anh*/
            if (temp_store.listImage.length === 0) {
                notify.show('Vui lòng thêm ít nhất 1 ảnh sản phẩm!', "error");
                this.view && this.view.setState({disabledSubmit: false});
                return;
            } else {
                const images: { id?: number, sort: number, image_url: string, file?: File }[] = temp_store.listImage.reduce((previousValue: any[], currentValue) => {
                    const data = {
                        id: currentValue.id,
                        sort: currentValue.sort,
                        image_url: currentValue.src,
                        file: currentValue.file ? currentValue.file : undefined
                    };
                    !data.id && delete data.id;
                    !data.file && delete data.file;
                    previousValue.push(data);
                    return previousValue;
                }, []);
                const asynUpload: Promise<{ url: string, sort: number } | null>[] = [];
                images.map((value, index) => {
                    value.sort = index;
                    if (isNaN(parseInt(value.id + '')) && value.file) {
                        asynUpload.push(new Promise<{ url: string, sort: number } | null>(resolve => {
                            uploadImage(value.file as File, "uploadProduct")
                                .then((response: any) => resolve({url: response.url, sort: value.sort}))
                                .catch(e => resolve(null));
                        }));
                    }
                    return true;
                });
                await Promise.all(asynUpload).then(response => {
                    images.map(value => value.file && response.map(value1 => {
                        if (value1 && value.sort === value1.sort) {
                            value.image_url = value1.url;
                            delete value.file;
                        }
                        return value1;
                    }))
                });
                this.request_body_data_update_product.images = images as any;
            }
            if (this.request_body_data_update_product && (!this.request_body_data_update_product.description_pickingout || this.request_body_data_update_product.description_pickingout.length === 0)) {
                notify.show('Vui lòng thêm nội dung mô tả chi tiết sản phẩm!', "error");
                this.view && this.view.setState({disabledSubmit: false});
                return;
            }
            /*Lay list shipping*/
            this.request_body_data_update_product.shipping_partner_ids = [];
            temp_store.listShipping.map((value: any) => (this.request_body_data_update_product as any).shipping_partner_ids.push(value.id));
            this.request_body_data_update_product.free_ship_status = EDIT_TEMPLATE_CONTROL.store.freeShip;
            /*Variant*/
            if (this.request_body_data_update_product.type === "NORMAL" && this.price_and_store) {
                const variant = {
                    id: -1,
                    attributes: [],
                    // @ts-ignore
                    price: this.price_and_store.price,
                    sale_price: this.price_and_store.sale_price,
                    sku: this.price_and_store.sku,
                    inventory: {
                        in_quantity: this.price_and_store.quantity,
                    }
                };
                !this.store.isQuantityLimited && (variant.inventory.in_quantity = 0);
                this.price_and_store.id && (variant.id = this.price_and_store.id);
                variant.id === -1 && delete variant.id;
                this.request_body_data_update_product.variants = [variant as any];
            }
            //
            else if (this.request_body_data_update_product.type === "CLASSIFIER") {
                this.request_body_data_update_product.classifiers = this.store.listClassifier;
                this.request_body_data_update_product.variants = [];
                if (this.store.listClassifier.length === 1) {
                    const name = this.store.listClassifier[0].name;
                    this.store.listClassifier[0].values.map((value, index) => {
                        if (this.store && this.request_body_data_update_product) {
                            const variant = {
                                id: this.store.tableVariantData[index].id,
                                image_id: this.store.tableVariantData[index].image_id as any,
                                attributes: [
                                    {
                                        name: name,
                                        value: value
                                    }
                                ],
                                price: this.store.tableVariantData[index].price,
                                sale_price: this.store.tableVariantData[index].sale_price,
                                sku: this.store.tableVariantData[index].sku,
                                inventory: {
                                    in_quantity: this.store.tableVariantData[index].quantity,
                                }
                            };
                            if (!variant.price) delete variant.price;
                            this.request_body_data_update_product.variants.push(variant);
                        }
                        return null;
                    });
                } else if (this.store.listClassifier.length === 2) {
                    const name = this.store.listClassifier[0].name;
                    const name1 = this.store.listClassifier[1].name;
                    this.store.listClassifier[0].values.map((value, index) => this.store && this.store.listClassifier[1].values.map((value1, index1) => {
                        const temp_index: number = index * (this.store as any).listClassifier[1].values.length + index1;
                        if (this.store && this.request_body_data_update_product) {
                            const variant = {
                                id: this.store.tableVariantData[temp_index].id,
                                image_id: this.store.tableVariantData[temp_index].image_id as any,
                                attributes: [
                                    {
                                        name: name,
                                        value: value
                                    },
                                    {
                                        name: name1,
                                        value: value1
                                    }
                                ],
                                price: this.store.tableVariantData[temp_index].price,
                                sale_price: this.store.tableVariantData[temp_index].sale_price,
                                sku: this.store.tableVariantData[temp_index].sku,
                                inventory: {
                                    in_quantity: this.store.tableVariantData[temp_index].quantity,
                                }
                            };
                            if (!variant.price) delete variant.price;
                            this.request_body_data_update_product.variants.push(variant);
                        }
                        return value1;
                    }));
                }
                if (this.request_body_data_update_product.variants.length <= 1) {
                    notify.show('Sản phẩm phân loại phải có ít nhất 2 phân loại', "error");
                    this.view.setState({disabledSubmit: false});
                    return false;
                }
            }

            if (this.ValidateShipping()) {
                this.request_body_data_update_product.is_pending = true; //default yêu cầu duyệt sau khi sửa.
                const response = await service.updateProduct((this.view as any).shop_id, this.request_body_data_update_product.id, this.request_body_data_update_product);
                if (response.status === 200) {
                    (this.view as EditProduct).setState({disabledSubmit: false});
                    notify.show('Cập nhật sản phẩm thành công!', "success");
                    this.store && this.store.product && (this.store.product.name = this.request_body_data_update_product.name);
                    let add_image_flag: boolean = false;
                    this.request_body_data_update_product.images.map(value => !value.id && (add_image_flag = true));
                    // Có thêm ảnh
                    if (this.view && add_image_flag) await this.view.componentDidMount();
                } else if (response.body && response.body.message && typeof response.body.message === "string")
                    notify.show(response.body.message, "error");
                else notify.show('Đã có lỗi xảy ra', 'error');
                clearTimeout(time_out);
            } else
                this.view.setState({disabledSubmit: false});
        }
    }

    public handlerOnChangeFormField(event: any, key: 'name' | 'condition' | 'description' | 'description_pickingout' | 'category' | 'weight' | 'C' | 'D' | 'R' | 'auto_public') {
        if (this.request_body_data_update_product) {
            switch (key) {
                case "category":
                    this.request_body_data_update_product.category.id = event;
                    break;
                case "auto_public":
                    this.request_body_data_update_product.auto_public = !this.request_body_data_update_product.auto_public;
                    break;
                case "weight":
                case "C":
                case "D":
                case "R":
                    let value: string = event.currentTarget.value + '';
                    value = value.replace(/([^0-9]|^0)/g, '');
                    if (key === "weight")
                        this.request_body_data_update_product.weight = parseInt(value);
                    else {
                        key === "D" && (this.request_body_data_update_product.packing_size[0] = parseInt(value));
                        key === "R" && (this.request_body_data_update_product.packing_size[1] = parseInt(value));
                        key === "C" && (this.request_body_data_update_product.packing_size[2] = parseInt(value));
                    }
                    event.currentTarget.value = numberWithCommas(value);
                    break;
                case "description_pickingout":
                    this.request_body_data_update_product.description_pickingout = event;
                    break;
                case "description":
                    let value1 = event.currentTarget.value;
                    value1 = value1.replace(/^-\s/gm, '');
                    this.request_body_data_update_product.description = value1;
                    value1 = value1.replace(/^(?=.+)/gm, "- ");
                    value1 = value1.replace(/-$/gm, '');
                    event.currentTarget.value = value1;
                    break;
                default:
                    this.request_body_data_update_product[key] = event.currentTarget.value;
                    break;
            }
        }
    }

    public handlerOnChangePriceAndStore(event: any, key: 'price' | 'sale_price' | 'quantity' | 'sku') {
        if (this.price_and_store) {
            if (key === "sku") {
                this.price_and_store.sku = event.currentTarget.value;
            } else {
                let value: any = event.currentTarget.value + '';
                value = value.replace(/([^0-9]|^0)/g, '');
                value = parseInt(value);
                if (!isNaN(value)) {
                    if (key === "quantity" && value > MAX_VARIANT_QUANTITY) value = MAX_VARIANT_QUANTITY;
                    this.price_and_store[key] = value;
                    event.currentTarget.value = numberWithCommas(value);
                } else {
                    this.price_and_store[key] = 0;
                    event.currentTarget.value = '';
                }
            }
        }
    }

    public removeClassifier(index: number) {
        if (this.store) {
            this.store.listClassifier.splice(index, 1);
            this.refreshTableVariant();
            if (this.store.listClassifier.length === 0) this.store.type = "NORMAL";
        }
    }

    public removeValueClassifier(data: { name: string, values: string[] }, index: number, value_index: number) {
        if (this.store) {
            data.values.splice(value_index, 1);
            data.values.length === 0 && this.store.listClassifier.splice(index, 1);
            this.refreshTableVariant();
            this.store.listClassifier.length === 0 && (this.store.type = "NORMAL");
        }
    }

    public handlerOnChangeDefaultValueVariant(event: any, key: 'price' | 'sale_price' | 'quantity' | 'sku') {
        if (key === "sku")
            this.variant_data.sku = event.currentTarget.value;
        else {
            let value: any = (event.currentTarget.value + '').trim();
            value = value.replace(/([^0-9]|^0)/g, '');
            value = parseInt(value);
            if (!isNaN(value)) {
                if (key === "quantity" && value > MAX_VARIANT_QUANTITY) value = MAX_VARIANT_QUANTITY;
                this.variant_data[key] = value;
                event.currentTarget.value = numberWithCommas(value);
            } else {
                this.variant_data[key] = 0;
                event.currentTarget.value = '';
            }

        }
    }

    public handlerApplyDefaultValueVariant() {
        if (this.store && this.store.tableVariantData && this.store.listClassifier.length > 0) {
            if (this.store.listClassifier.length === 1) {
                this.store.listClassifier[0].values.map((value, index) => (this.store as any).tableVariantData[index] = this.variant_data);
            } else if (this.store.listClassifier.length === 2) {
                this.store.listClassifier[0].values.map((value, index) => (this.store as any).listClassifier[1].values.map((value1: any, index1: number) => {
                    const index_temp = index * (this.store as any).listClassifier[1].values.length + index1;
                    (this.store as any).tableVariantData[index_temp] = this.variant_data;
                    return value1;
                }));
            } else console.log("Other Case");
        }
        this.view && this.view.setState({keyTableVariant: Date.now()});
    }

    /*Extend for Update*/
    public async getDetailProduct(shop_id: number, product_id: number) {
        const response = await service.getProductById(shop_id, product_id);
        if (response.status === 200 && this.store) {
            this.store.product = response.body;
            if (!this.request_body_data_update_product && this.store.product) this.request_body_data_update_product = {} as any;
            Object.assign(this.request_body_data_update_product, humps.decamelizeKeys((this.store.product as any), {separator: '_'}));
        }
    }

    public loadDefaultValue() {
        if (this.store && this.view && this.store.product) {
            this.store.type = this.store.product.type;
            EDIT_TEMPLATE_CONTROL.store.freeShip = this.store.product.freeShipStatus;
            if (this.store.type === "NORMAL") {
                this.store.isQuantityLimited = this.store.product.isQuantityLimited;
                this.price_and_store = {
                    id: this.store.product.variants[0].id,
                    price: this.store.product.variants[0].price,
                    sale_price: this.store.product.variants[0].salePrice,
                    quantity: this.store.product.variants[0].inventory.remainingQuantity,
                    sku: this.store.product.variants[0].sku
                }
            } else if (this.store.type === "CLASSIFIER") {
                this.store.listClassifier = this.store.product.classifiers as any;
                this.initTableVariantData();
                if (this.store.listClassifier.length === 1 && this.store.tableVariantData) {
                    this.store.listClassifier[0].values.map((value, index) => {
                        if (this.store && this.store.tableVariantData && this.store.product) {
                            this.store.tableVariantData[index].id = this.store.product.variants[index].id;
                            this.store.tableVariantData[index].image_id = this.store.product.variants[index].imageId !== null ? (this.store.product.variants[index].imageId as number) : undefined;
                            this.store.tableVariantData[index].price = this.store.product.variants[index].price !== null ? (this.store.product.variants[index].price as number) : undefined;
                            this.store.tableVariantData[index].sale_price = this.store.product.variants[index].salePrice;
                            this.store.tableVariantData[index].quantity = this.store.product.variants[index].inventory.remainingQuantity;
                            this.store.tableVariantData[index].sku = this.store.product.variants[index].sku;
                        }
                        return value;
                    });
                } else if (this.store.listClassifier.length === 2) {
                    this.store.getListClassifier[0].values.map((value, index) => this.store && this.store.getListClassifier[1].values.map((value1, index1) => {
                        // @ts-ignore
                        const index_tmp = index * this.store.listClassifier[1].values.length + index1;
                        if (this.store && this.store.tableVariantData && this.store.product) {
                            this.store.tableVariantData[index_tmp].id = this.store.product.variants[index_tmp].id;
                            this.store.tableVariantData[index_tmp].image_id = this.store.product.variants[index_tmp].imageId !== null ? (this.store.product.variants[index_tmp].imageId as number) : undefined;
                            this.store.tableVariantData[index_tmp].price = this.store.product.variants[index_tmp].price !== null ? (this.store.product.variants[index_tmp].price as number) : undefined;
                            this.store.tableVariantData[index_tmp].sale_price = this.store.product.variants[index_tmp].salePrice;
                            this.store.tableVariantData[index_tmp].quantity = this.store.product.variants[index_tmp].inventory.remainingQuantity;
                            this.store.tableVariantData[index_tmp].sku = this.store.product.variants[index_tmp].sku;
                        }
                        return value1;
                    }));
                }
                this.view.setState({keyTableVariant: Date.now()});
            }
        }
    }

    public handlerOnShowModalImageVariant(value: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }) {
        this.view.setState({defaultModalVariant: value}, () => $('div.modal#product-modal-popup-container-image').modal({
            show: true,
            backdrop: "static"
        }));
    }

    public handlerVariantOnChangeImage(id: number, image_id: number) {
        if (this.store) {
            const index = this.store.tableVariantData.findIndex(value => value.id === id);
            index !== -1 && (this.store.tableVariantData[index].image_id = image_id);
        }
    }
}

export const EDIT_PRODUCT_CTRL = new EditProductControl();
