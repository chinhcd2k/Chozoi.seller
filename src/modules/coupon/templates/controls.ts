import {BaseService} from "../../../common/services/BaseService";
import {store as UserStore} from "../../profile";
import {TemplateStore} from "./store";
import {Moment} from "../../../common/functions/Moment";
import {notify} from "../../../common/notify/NotifyService";
import {IResProfile} from "../../../api/auth/interfaces/response";

export interface IRequestCreateCoupon {
    code: string
    timeApplyStart: number
    timeApplyEnd: number
    codeLimit: number
    codeNumber: number
    discountType: 'VALUE' | 'PERCENT'
    productType: 'ALL' | 'PICK'
    orderTotalMin: number
    timeStart?: number
    discountValue?: number
    discountPercent?: number
    discountMax?: number
    products?: number[]
}

class Controls extends BaseService {
    public async GET_getListProduct(page: number, size: number, category_id?: number, search?: string) {
        let shop_id = (UserStore.profile as IResProfile).shopId;
        const response = await this.getRequest(`/v1/shops/${shop_id}/products?collection=coupon${search ? '&name=' + search : ''}${category_id ? '&categoryIds=' + category_id : ''}&size=${size}&page=${page}`);
        if (response.status < 300) {
            TemplateStore.listProductPopup = response.body.products;
            TemplateStore.metadataPopup = {
                total: response.body.metadata.total,
                size: size,
                page: page
            }
        }
    }

    private generateRequestBody(): IRequestCreateCoupon {
        const request_body: IRequestCreateCoupon = {
            code: TemplateStore.name,
            timeApplyStart: TemplateStore.fromDate * 1000,
            timeApplyEnd: TemplateStore.toDate * 1000,
            codeLimit: TemplateStore.limited,
            codeNumber: TemplateStore.amount,
            discountType: TemplateStore.type === "SOILD" ? 'VALUE' : 'PERCENT',
            productType: TemplateStore.typeProduct === "ALL" ? 'ALL' : 'PICK',
            orderTotalMin: TemplateStore.minPrice
        };
        if (TemplateStore.acceptDate > 0) request_body.timeStart = TemplateStore.acceptDate * 1000;
        if (TemplateStore.type === "SOILD") {
            request_body.discountValue = TemplateStore.discount;
        } else {
            request_body.discountPercent = TemplateStore.discount;
            if (TemplateStore.maxDiscount > 0) request_body.discountMax = TemplateStore.maxDiscount;
        }
        if (TemplateStore.typeProduct === "OPTIONS") {
            let product_ids: number[] = [];
            TemplateStore.listProductSelected.map(value => product_ids.push(value.id));
            request_body.products = product_ids;
        }
        return request_body;
    }

    public async POST_createCoupon() {
        TemplateStore.disabledSubmit = true;
        setTimeout(() => TemplateStore.disabledSubmit = false, 15000);
        const response = await this.postRequest('/v1/promotions/seller/create', this.generateRequestBody());
        TemplateStore.disabledSubmit = false;
        if (response.status < 300) {
            notify.show('Tạo mã khuyến mại thành công!', "success");
            TemplateStore.Router && TemplateStore.Router.goBack();
        } else {
            if (response.status === 500) notify.show('Máy chủ đang bận vui lòng thử lại sau', "error");
            else if (response.body && response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else notify.show('Đã có lỗi xảy ra', "error");
        }
    }

    public async POST_updateCoupon(promotion_id: number) {
        TemplateStore.disabledSubmit = true;
        setTimeout(() => TemplateStore.disabledSubmit = false, 15000);
        const response = await this.postRequest('/v1/promotions/seller/update/' + promotion_id, this.generateRequestBody());
        TemplateStore.disabledSubmit = false;
        if (response.status < 300) {
            notify.show('Cập nhật thành công!', "success");
            TemplateStore.Router && TemplateStore.Router.goBack();
        } else {
            if (response.status === 500) notify.show('Máy chủ đang bận vui lòng thử lại sau', "error");
            else if (response.body && response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else notify.show('Đã có lỗi xảy ra', "error");
        }
    }

    public async GET_getListCategoryLevel1() {
        const response = await this.getRequest(`/v1/shops/${(UserStore.profile as IResProfile).shopId}/products/categories/level/1`);
        if (response.status < 300) {
            TemplateStore.listCategory = response.body;
        }
    }

    public async GET_getListProductSelected(product_ids: number[]) {
        if (Array.isArray(product_ids) && product_ids.length > 0) {
            const response = await this.getRequest('/v1/products?ids=' + product_ids.join(','));
            if (response.status < 300) {
                TemplateStore.listProductSelected = [];
                response.body.map((value: any) => {
                    value.inserted = true;
                    TemplateStore.listProductSelected.push(value);
                    return null;
                });
                TemplateStore.listProduct = TemplateStore.listProductSelected.slice(0, TemplateStore.metadata.size);
                TemplateStore.metadata = {
                    total: TemplateStore.listProductSelected.length,
                    size: TemplateStore.metadata.size,
                    page: 0
                }
            }
        }
    }

    public async GET_getDetailCoupon(coupon_id: number) {
        const response = await this.getRequest(`/v1/promotions/seller/${coupon_id}`);
        if (response.status < 300) {
            const coupon = response.body.promotion;
            TemplateStore.promotionTemp = {} as any;
            Object.assign(TemplateStore.promotionTemp, coupon);
            TemplateStore.name = coupon.name;
            TemplateStore.fromDate = Moment.LocalDatetime(coupon.timeApplyStart);
            if (coupon.timeStart) TemplateStore.acceptDate = Moment.LocalDatetime(coupon.timeStart);
            TemplateStore.toDate = Moment.LocalDatetime(coupon.timeApplyEnd);
            TemplateStore.amount = coupon.totalCoupon;
            TemplateStore.limited = coupon.couponLimit;
            if (coupon.discountType === "VALUE")
                TemplateStore.type = "SOILD";
            else if (coupon.discountType === "PERCENT") {
                TemplateStore.type = "PERCENT";
                if (coupon.discountMax) TemplateStore.maxDiscount = coupon.discountMax;
            }
            TemplateStore.discount = coupon.amounts[0].discountValue;
            TemplateStore.minPrice = coupon.amounts[0].priceMin;
            if (coupon.productType === "ALL") TemplateStore.typeProduct = "ALL";
            else if (coupon.productType === "PICK") {
                TemplateStore.typeProduct = "OPTIONS";
                this.GET_getListProductSelected(coupon.products).then();
            }
        }
    }
}

export const TEMPLATE_CTRL = new Controls();