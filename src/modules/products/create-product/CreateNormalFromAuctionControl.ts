import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {notify} from "../../../common/notify/NotifyService";
import PopupNewAddress from "../../shop/address/components/PopupNewAddress";
import {CREATE_TEMPLATE_CONTROL} from "../components/create-template/CreateTemplateControl";
import {IImage} from "../../auctions/template/components/Gallery";
import {uploadImage} from "../../../common/functions/UpfileFunc";
import {IRequestBodyDataCreateProduct, IResponseDetailProduct, service} from "../ProductServices";
import {store as ProfileStore} from "../../profile";
import {IResProfile} from "../../../api/auth/interfaces/response";
import CreateNormalFromAuction from "./CreateNormalFromAuction";
import {SyntheticEvent} from "react";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {MAX_VARIANT_QUANTITY} from "./CreateProductControl";
import {observable} from "mobx";
import {IResponseAuction} from "../../auctions/DetailAuction";
import DetailProductStore from "../detail-product/DetailProductStore";
import {AppGlobal} from "../../../AppGlobal";
import {ICategories} from "../../auctions/template";

class CreateNormalFromAuctionControl {
  @observable productFromAuction?: IResponseAuction;
  public view: CreateNormalFromAuction = undefined as any;
  public store: DetailProductStore = undefined as any;
  public request_body_data_create_product?: IRequestBodyDataCreateProduct;
  @observable dataCategories:ICategories[]=[];
  public price_and_store?: {
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
    this.initRequestBodyData();
    this.initTempPriceAndStore();
  }

  private initRequestBodyData() {
    this.request_body_data_create_product = {
      name: "",
      attributes: [],
      packing_size: [],
      images: [],
      videos: [],
      description: "",
      description_pickingout: "",
      category: {id: -1},
      shipping_partner_ids: [],
      type: "NORMAL",
      condition: "" as any,
      is_quantity_limited: true,
      weight: -1,
      is_pending: true,
      auto_public: true,
      classifiers: [],
      variants: [],
      free_ship_status: false
    };
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
    this.request_body_data_create_product && (this.request_body_data_create_product.attributes = value);
  }

  public ValidateShipping(): boolean {
    if (this.request_body_data_create_product) {
      const store = CREATE_TEMPLATE_CONTROL.store;
      // check Weight
      const listValidWeight = store.listShipping.reduce((previousValue: any[], currentValue: any) => {
        if (this.request_body_data_create_product && currentValue.maxWeight >= this.request_body_data_create_product.weight) {
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
        let tempSize: number[] = this.request_body_data_create_product.packing_size;
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

  public async handlerOnSubmit(event: any) {
    if (!ShopStore.hasContact()) {
      notify.show("Vui lòng thêm địa chỉ của Cửa hàng", "error");
      PopupNewAddress.show();
    } else {
      this.view && this.view.setState({disabledSubmit: true});
      const time_out = setTimeout(() => {
        if (this.view) this.view.state.disabledSubmit && this.view.setState({disabledSubmit: false});
      }, 30000);
      if (this.request_body_data_create_product) {
        this.store.getType === "NORMAL" && delete this.request_body_data_create_product.classifiers;
        this.request_body_data_create_product.type = this.store.type;
        this.request_body_data_create_product.is_quantity_limited = this.store.isQuantityLimited;
        const temp_store = CREATE_TEMPLATE_CONTROL.store;
        this.request_body_data_create_product.free_ship_status = temp_store.freeShip;
        if (!this.request_body_data_create_product.condition) {
          notify.show('Vui lòng chọn tình trạng sản phẩm!', "error");
          this.view && this.view.setState({disabledSubmit: false});
          return;
        }
        /*Upload anh*/
        if (temp_store.listImage.length === 0) {
          notify.show('Vui lòng thêm ít nhất 1 ảnh sản phẩm!', "error");
          this.view && this.view.setState({disabledSubmit: false});
          return;
        }//
        else {
          this.request_body_data_create_product.images = [];
          const asyncUpload: Promise<any>[] = temp_store.listImage.reduce((previousValue: Promise<any>[], currentValue: IImage, currentIndex: number) => {
            const promise = new Promise<any>(async (resolve) => {
              if (currentValue.file) {
                const {url} = await uploadImage(currentValue.file, "uploadProduct");
                (this.request_body_data_create_product as IRequestBodyDataCreateProduct).images.push({
                  image_url: url,
                  sort: currentIndex
                });
              } else {
                (this.request_body_data_create_product as IRequestBodyDataCreateProduct).images.push({
                  image_url: currentValue.src,
                  sort: currentIndex
                });
              }
              resolve();
            });
            previousValue.push(promise);
            return previousValue;
          }, []);
          await Promise.all(asyncUpload);
        }
        if (this.request_body_data_create_product && (!this.request_body_data_create_product.description_pickingout || this.request_body_data_create_product.description_pickingout.length === 0)) {
          notify.show('Vui lòng thêm nội dung mô tả chi tiết sản phẩm!', "error");
          this.view && this.view.setState({disabledSubmit: false});
          return;
        }
        /*Lay list shipping*/
        this.request_body_data_create_product.shipping_partner_ids = [];
        temp_store.listShipping.map((value: any) => (this.request_body_data_create_product as any).shipping_partner_ids.push(value.id));
        /*Variant*/
        if (this.request_body_data_create_product.type === "NORMAL" && this.price_and_store) {
          this.request_body_data_create_product.variants = [{
            attributes: [],
            // @ts-ignore
            price: this.price_and_store.price,
            sale_price: this.price_and_store.sale_price,
            sku: this.price_and_store.sku,
            inventory: {
              in_quantity: this.price_and_store.quantity,
            }
          }];
        }
        //
        else if (this.request_body_data_create_product.type === "CLASSIFIER") {
          this.request_body_data_create_product.variants = [];
          this.request_body_data_create_product.classifiers = this.store.listClassifier;
          if (this.store.listClassifier.length === 1) {
            const name = this.store.listClassifier[0].name;
            this.store.listClassifier[0].values.map((value, index) => {
              if (this.store && this.request_body_data_create_product) {
                const variant = {
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
                this.request_body_data_create_product.variants.push(variant);
              }
              return null;
            });
          } else if (this.store.listClassifier.length === 2) {
            const name = this.store.listClassifier[0].name;
            const name1 = this.store.listClassifier[1].name;
            this.store.listClassifier[0].values.map((value, index) =>
              this.store && this.store.listClassifier[1].values.map((value1, index1) => {
                const temp_index = index * (this.store as any).listClassifier[1].values.length + index1;
                if (this.store && this.request_body_data_create_product) {
                  const variant = {
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
                  this.request_body_data_create_product.variants.push(variant);
                }
                return value1;
              }));
          }
          if (this.request_body_data_create_product.variants.length <= 1) {
            notify.show('Sản phẩm phân loại phải có ít nhất 2 phân loại', "error");
            this.view.setState({disabledSubmit: false});
            return false;
          }
        }

        if (this.ValidateShipping()) {
          const response = await service.createProduct((ProfileStore.profile as IResProfile).shopId as number, this.request_body_data_create_product);
          if (response.status === 200) {
            this.view && this.view.setState({disabledSubmit: false});
            notify.show('Thêm sản phẩm thành công!', "success");
            this.view && response.body.id && this.view.props.history.push(`/home/product/detail/${response.body.id}`);
            if (ShopStore.shopStats && !ShopStore.shopStats.countProduct)
              ShopStore.shopStats.countProduct = 1;
          } else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
          else notify.show('Đã có lỗi xảy ra', 'error');
          clearTimeout(time_out);
        } else
          this.view && this.view.setState({disabledSubmit: false});
      }
    }
    event.preventDefault();
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

  public handlerOnChangeFormField(event: SyntheticEvent<HTMLInputElement>, key: 'name' | 'condition' | 'description' | 'description_pickingout' | 'category' | 'weight' | 'C' | 'D' | 'R' | 'auto_public') {
    if (this.request_body_data_create_product) {
      switch (key) {
        case "category":
          this.request_body_data_create_product.category.id = parseInt(event.currentTarget.value);
          break;
        case "auto_public":
          this.request_body_data_create_product.auto_public = !this.request_body_data_create_product.auto_public;
          break;
        case "weight":
        case "C":
        case "D":
        case "R":
          let value: string = event.currentTarget.value + '';
          value = value.replace(/([^0-9]|^0)/g, '');
          if (key === "weight")
            this.request_body_data_create_product.weight = parseInt(value);
          else {
            key === "D" && (this.request_body_data_create_product.packing_size[0] = parseInt(value));
            key === "R" && (this.request_body_data_create_product.packing_size[1] = parseInt(value));
            key === "C" && (this.request_body_data_create_product.packing_size[2] = parseInt(value));
          }
          event.currentTarget.value = numberWithCommas(value);
          break;
        case "description_pickingout":
          this.request_body_data_create_product.description_pickingout = event.currentTarget.value;
          break;
        case "description":
          let value1 = event.currentTarget.value;
          value1 = value1.replace(/^-\s/gm, '');
          this.request_body_data_create_product.description = value1;
          value1 = value1.replace(/^(?=.+)/gm, "- ");
          value1 = value1.replace(/-$/gm, '');
          event.currentTarget.value = value1;
          break;
        default:
          this.request_body_data_create_product[key] = event.currentTarget.value as ("NEW" | "USED");
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

  public handlerBtnOnSubmit(flag: 0 | 1 | 2) {
    if (this.request_body_data_create_product)
      switch (flag) {
        case 0:
          this.request_body_data_create_product.is_pending = false;
          break;
        case 1:
          this.request_body_data_create_product.is_pending = true;
          break;
        case 2:
          window.location.reload();
          break;
      }
  }

  public removeClassifier(index: number) {
    if (this.store) {
      this.store.listClassifier.splice(index, 1);
      this.refreshTableVariant();
      this.store.listClassifier.length === 0 && (this.store.type = "NORMAL");
      console.log(JSON.stringify(this.store.tableVariantData));
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
  protected findCategories(dataLv3:ICategories,index:number){
    this.dataCategories.push(dataLv3)
    let index1=index
    if (index1>=1){
      AppGlobal.categoriesRes.map((value,i)=>{
        if (value.level===index){
          if (value.id===dataLv3.parentId){
            this.findCategories(value,1)
          }
        }
      })
    }
    if (dataLv3.level===1){
      return false
    }
  }
  public async loadDefaultValueCreateFromAuction() {
    if (this.productFromAuction) {
      const category:{
        id: number
        level: number
      }={
        id: this.productFromAuction.category.id,
        level: 3
      }
      await this.findCategories(this.productFromAuction.category,2)
      let dataProduct:IResponseDetailProduct={
        id: this.productFromAuction.id,
        name: this.productFromAuction.name,
        state: 'PUBLIC' ,
        attributes: this.productFromAuction.attributes,
        images: this.productFromAuction.images,
        videos: [],
        shop: this.productFromAuction.shop,
        categories:this.dataCategories,
        category:category,
        type: 'NORMAL' ,
        condition: this.productFromAuction.condition,
        description: this.productFromAuction.description,
        variants: this.productFromAuction.variants,
        weight: this.productFromAuction.weight,
        shippingPartnerIds: [],
        packingSize: this.productFromAuction.packingSize,
        isQuantityLimited: this.productFromAuction.isQuantityLimited,
        descriptionPicking: '',
        descriptionPickingin: '',
        descriptionPickingOut: this.productFromAuction.descriptionPickingOut,
        autoPublic: this.productFromAuction.autoPublic,
        isPending:false,
        isPublic: this.productFromAuction.isPublic,
        reportIssues:this.productFromAuction.reportIssues,
        freeShipStatus: this.productFromAuction.freeShipStatus ,// update 07-05-2020
      }
      console.log(dataProduct)
      this.store.product = dataProduct

    }
    this.view.setState({keyTableVariant: Date.now()});
  }
}

export const CREATE_NORMAL_FROM_AUCTION = new CreateNormalFromAuctionControl();