import DetailProductStore from "./DetailProductStore";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {notify} from "../../../common/notify/NotifyService";
import {IRequestBodyDataUpdateProduct, service, IRequestBodyDataUpdateProductWithStatePublic} from "../ProductServices";
import humps from "humps";
import $ from "jquery";
import DetailProduct from "./DetailProduct";
import {DETAIL_TEMPLATE_CONTROL} from "../components/detail-template/DetailTemplateControl";
import {MAX_VARIANT_QUANTITY} from "../create-product/CreateProductControl";

class DetailProductControl {
    public view: DetailProduct = undefined as any;
    public store: DetailProductStore = undefined as any;
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

    public setView(_view: DetailProduct) {
        this.view = _view;
    };

    public setStore(_store: DetailProductStore) {
        this.store = _store;
    }

    public get getStore(): DetailProductStore | undefined {
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
            const store = DETAIL_TEMPLATE_CONTROL.store;
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

    public async handlerOnSubmit(event: any, callback?: (value: boolean) => any) {
        this.view.setState({disabledSubmit: true});
        const time_out = setTimeout(() => {
            if (this.view) this.view.state.disabledSubmit && this.view.setState({disabledSubmit: false});
        }, 30000);
        if (this.request_body_data_update_product) {
            this.store.getType === "NORMAL" && delete this.request_body_data_update_product.classifiers;
            this.request_body_data_update_product.type = this.store.type;
            this.request_body_data_update_product.is_quantity_limited = this.store.isQuantityLimited;
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
                        const temp_index = index * (this.store as any).listClassifier[1].values.length + index1;
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
                const request_body: IRequestBodyDataUpdateProductWithStatePublic = {} as any;
                Object.assign(request_body, this.request_body_data_update_product);
                if (this.request_body_data_update_product.type === "CLASSIFIER" && this.request_body_data_update_product.variants.length < 2) {
                    notify.show('Sản phẩm phân loại phải có ít nhất 2 phân loại!', "error");
                    callback && callback(false);
                    return;
                }
                const allow_keys = ['id', 'packing_size', 'weight', 'is_quantity_limited', 'classifiers', 'variants', 'free_ship_status'];
                const keys = Object.keys(request_body);
                keys.map(key => {
                    const index = allow_keys.findIndex(value => value === key);
                    index === -1 && delete (request_body as any)[key];
                    return null;
                });
                const response = await service.PUT_UpdateProductWithOption((this.view as DetailProduct).shop_id, request_body.id, request_body);
                if (response.status === 200) {
                    (this.view as DetailProduct).setState({disabledSubmit: false});
                    notify.show('Cập nhật sản phẩm thành công!', "success");
                    this.store.product && (this.store.product.name = this.request_body_data_update_product.name);
                    callback && callback(true);
                    return;
                } else if (response.body && response.body.message && typeof response.body.message === "string")
                    notify.show(response.body.message, "error");
                else
                    notify.show('Đã có lỗi xảy ra', 'error');
                clearTimeout(time_out);
            } else
                this.view.setState({disabledSubmit: false});
        }
        callback && callback(false);
        event && event.preventDefault();
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
            if (this.store.listClassifier.length > 1) {
                this.store.listClassifier.splice(index, 1);
                this.refreshTableVariant();
                this.store.listClassifier.length === 0 && (this.store.type = "NORMAL");
            } else
                notify.show('Phải có tối thiếu 1 phân loại', "error");
        }
    }

    public removeValueClassifier(data: { name: string, values: string[] }, index: number, value_index: number) {
        if (this.store) {
            if (data.values.length > 1) {
                data.values.splice(value_index, 1);
                this.refreshTableVariant();
                // data.values.length === 0 && this.removeClassifier(index);
            } else
                notify.show('Phải có tối thiếu 1 phân loại', "error");
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

    /*Extend for Update*/
    public async getDetailProduct(shop_id: number, product_id: number) {
        const response = await service.getProductById(shop_id, product_id);
        if (response.status === 200 && this.store) {
            this.store.product = response.body;
            if (!this.request_body_data_update_product && this.store.product) this.request_body_data_update_product = {} as any;
            Object.assign(this.request_body_data_update_product, humps.decamelizeKeys((this.store.product as any), {separator: '_'}));
            this.store.productOld = response.body;
        }
    }

    public loadDefaultValue() {
        if (this.store.product) {
            this.store.type = this.store.product.type;
            DETAIL_TEMPLATE_CONTROL.store.freeShip = this.store.product.freeShipStatus;
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
        if (this.view && this.store) {
            this.view.setState({defaultModalVariant: value}, () => $('div.modal#product-modal-popup-container-image').modal({
                show: true,
                backdrop: "static"
            }));
        }
    }

    public getIconEdit(key: 'VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY'): boolean {
        if (this.view) {
            const index = this.view.state.ONLY_FIELD_UPDATE.findIndex((value: any) => value === key);
            if (index !== -1) {
                const index1 = this.view.state.FIELD_ENABLE.findIndex((value: any) => value === key);
                return index1 === -1;
            } else return false;
        }
        return false;
    }

    public handlerOnConfirmEdit(key: 'VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY', value: boolean) {
        if (value) {
            DETAIL_PRODUCT_CTRL.handlerOnSubmit(undefined, success => success && this.view && this.view.setState({FIELD_ENABLE: []}));
        } else {
            if (this.view && this.store && this.store.productOld) {
                const arr = this.view.state.FIELD_ENABLE;
                const index = arr.findIndex(value1 => value1 === key);
                if (index !== -1) {
                    arr.splice(index, 1);
                    this.view.setState({FIELD_ENABLE: arr});
                }
                if (key === "VARIANTS") {
                    if (this.store) {
                        this.store.tableVariantDataOld && (Object.assign(this.store.tableVariantData, this.store.tableVariantDataOld));
                        this.store.listClassifierOld && (Object.assign(this.store.listClassifier, this.store.listClassifierOld));
                    }
                    // $('div#create-product form button.hidden[type="submit"]').trigger('click');
                    return;
                } else {
                    //Rollback data
                    switch (key) {
                        case "PRICE":
                            if (this.view.getPriceRef && this.view.getPriceRef.current && this.store.productOld.variants[0].price) {
                                this.view.getPriceRef.current.value = numberWithCommas(this.store.productOld.variants[0].price);
                                this.price_and_store && (this.price_and_store.price = this.store.productOld.variants[0].price);
                            }
                            break;
                        case "SALE_PRICE":
                            if (this.view.getSalePriceRef && this.view.getSalePriceRef.current) {
                                this.view.getSalePriceRef.current.value = numberWithCommas(this.store.productOld.variants[0].salePrice);
                                this.price_and_store && (this.price_and_store.sale_price = this.store.productOld.variants[0].salePrice);
                            }
                            break;
                        case "SKU":
                            if (this.view.getSkuRef && this.view.getSkuRef.current) {
                                this.view.getSkuRef.current.value = this.store.productOld.variants[0].sku;
                                this.price_and_store && (this.price_and_store.sku = this.store.productOld.variants[0].sku);
                            }
                            break;
                        case "IS_LIMITED_QUANTITY":
                            this.store.isQuantityLimited = this.store.productOld.isQuantityLimited;
                            if (this.store.isQuantityLimited) {
                                if (this.view.getQuantityRef && this.view.getQuantityRef.current) {
                                    this.view.getQuantityRef.current.value = numberWithCommas(this.store.productOld.variants[0].inventory.remainingQuantity);
                                    this.price_and_store && (this.price_and_store.quantity = this.store.productOld.variants[0].inventory.remainingQuantity);
                                }
                            } else
                                this.price_and_store && (this.price_and_store.quantity = 0);
                            break;
                    }
                }
            }
        }
        this.view && this.view.setState({keyTableVariant: Date.now()})
    }

    public handlerOnEditFormField(event: any, key: 'VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY') {
        if (this.view) {
            const arr = this.view.state.FIELD_ENABLE as any;
            const index = arr.findIndex((value: any) => value === key);
            if (index === -1) {
                arr.push(key);
                this.view.setState({FIELD_ENABLE: arr});
                if (key === "VARIANTS" && this.store) {
                    this.store.tableVariantData && (Object.assign(this.store.tableVariantDataOld, this.store.tableVariantData));
                    this.store.listClassifierOld && (Object.assign(this.store.listClassifierOld, this.store.listClassifier));
                }
            }
        }
    }

    public getDisabledFormField(key: 'VARIANTS' | 'PRICE' | 'SALE_PRICE' | 'SKU' | 'IS_LIMITED_QUANTITY'): boolean {
        if (this.view) {
            const index = this.view.state.ONLY_FIELD_UPDATE.findIndex((value: any) => value === key);
            if (index !== -1) {
                const index1 = this.view.state.FIELD_ENABLE.findIndex((value: any) => value === key);
                return index1 === -1;
            } else return true;
        }
        return true;
    }

    public handlerVariantOnChangeImage(id: number | undefined, image_id: number) {
        if (this.store && typeof id === "number") {
            const index = this.store.tableVariantData.findIndex(value => value.id === id);
            index !== -1 && (this.store.tableVariantData[index].image_id = image_id);
        }
    }

    /*Show modal confirm free ship*/
    public showModalConfirmFreeShip(enable: boolean) {
        this.store.dataModalConfirmFreeShip = enable;
        $('div.modal#modal-confirm-freeship').modal({show: true, backdrop: "static"});
    }
}

export const DETAIL_PRODUCT_CTRL = new DetailProductControl();
