import {BaseService} from "../../../common/services/BaseService";
import {ManagerCouponStore} from "./store";
import {notify} from "../../../common/notify/NotifyService";

class Controls extends BaseService {
    public async GET_getListCoupon(page: number, size: number, status?: 'COMINGSOON' | 'PROCESSING' | 'PAUSING' | 'FINISHED', name?: string) {
        let api = `/v1/promotions/seller?${name ? 'name=' + name : ''}${status ? '&status=' + status : ''}&page=${page}&size=${size}`;
        api = api.replace(/\?&/, '?');
        const response = await this.getRequest(api);
        if (response.status < 300) {
            ManagerCouponStore.listCoupon = response.body.promotions;
            ManagerCouponStore.metadata = {
                total: response.body.metadata.total,
                page: page,
                size: size
            }
        }
    }

    public async POST_changeStateCoupon(coupon_id: number, state: "OPENED" | "CLOSED") {
        const response = await this.postRequest(`/v1/promotions/seller/onOff/${coupon_id}`, {status: state});
        if (response.status < 300) {
            notify.show('Thao tác thành công', "success");
            this.GET_getListCoupon(ManagerCouponStore.getMetadata.page, ManagerCouponStore.getMetadata.size, ManagerCouponStore.getStatus, ManagerCouponStore.getKeyword).then();
        } else if (response.status !== 500) {
            if (response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else notify.show('Đã có lỗi xảy ra!', "error");
        }
    }
}

export const MANAGER_COUPON_CTRL = new Controls();