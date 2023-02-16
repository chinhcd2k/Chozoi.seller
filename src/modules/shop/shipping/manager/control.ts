import {BaseService} from "../../../../common/services/BaseService";
import {store as ProfileStore} from "../../../profile/stores/ProfileStore";
import {IResponseArea, Store} from "./store";
import {notify} from "../../../../common/notify/NotifyService";
import {IResProfile} from "../../../../api/auth/interfaces/response";

export const SHIPPING_CTRL = new class extends BaseService {
    public store = new Store();

    public async GET_getListArea(callback?: (response: IResponseArea[]) => any) {
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.getRequest(`/v1/shippings/shops/${shopId}/area?page=0&size=30`);
        if (response.status < 300) {
            this.store.listArea = response.body.data;
            callback && callback(response.body.data);
        } else this.pushNotificationRequestError(response);
    }

    public async PUT_changeStateArea(area_id: number, status: 'ENABLED' | 'DISABLED' | 'DELETED') {
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.putRequest(`/v1/shippings/shops/${shopId}/area/${area_id}/state`, {status: status});
        if (response.status < 300) {
            notify.show('Thao tác thực hiện thành công!', "success");
            if (status === "DELETED") {
                const index_search = this.store.listArea.findIndex(value => value.id === area_id);
                index_search !== -1 && this.store.listArea.splice(index_search, 1);
            } else {
                const index_search = this.store.listArea.findIndex(value => value.id === area_id);
                index_search !== -1 && (this.store.listArea[index_search].status = status);
            }
        } else this.pushNotificationRequestError(response);
    }
}();
