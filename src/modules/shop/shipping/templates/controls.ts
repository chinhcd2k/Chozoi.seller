import {IArea, Store} from "./store";
import {BaseService} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import {store as ProfileStore} from "../../../profile";
import {IResponseArea} from "../manager/store";
import {IResProfile} from "../../../../api/auth/interfaces/response";

export interface IRequestBodyCreateArea {
    groupName: string
    districtIds: number[]
    conversionPrice: {
        from: number
        to: number
        price: number
    }[]
}

export const TEMPLATE_CTRL = new class extends BaseService {
    public store = new Store();

    public async GET_getListProvice() {
        const response = await this.getRequest('/v1/provinces');
        if (response.status < 300) this.store.listProvince = response.body.provinces;
        else this.pushNotificationRequestError(response);
    }

    public async GET_getListDistrict(province_id: number, item: IArea) {
        const response = await this.getRequest('/v1/districts?provinceId=' + province_id);
        if (response.status < 300) item.districts = response.body.districts;
        else {
            item.districts = undefined;
            this.pushNotificationRequestError(response);
        }
    }

    public async POST_createArea() {
        const body: IRequestBodyCreateArea = {
            groupName: this.store.name.trim(),
            districtIds: this.store.listArea.reduce((previousValue: number[], currentValue) => {
                (currentValue.districtId as number[]).map(value => previousValue.push(value));
                return previousValue;
            }, []),
            conversionPrice: this.store.listFee.reduce((previousValue: { from: number, to: number, price: number }[], currentValue) => {
                previousValue.push({
                    from: currentValue.minWeight as number,
                    to: currentValue.maxWeight as number,
                    price: currentValue.fee || 0
                })
                return previousValue;
            }, [])
        };
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.postRequest(`/v1/shippings/shops/${shopId}/area`, body);
        if (response.status < 300) {
            notify.show('Thao tác thành công!', "success");
            this.store.RouterHistory && this.store.RouterHistory.goBack();
        } else this.pushNotificationRequestError(response);
    }

    public async PUT_updateArea(group_id: number) {
        const body: IRequestBodyCreateArea = {
            groupName: this.store.name.trim(),
            districtIds: this.store.listArea.reduce((previousValue: number[], currentValue) => {
                (currentValue.districtId as number[]).map(value => previousValue.push(value));
                return previousValue;
            }, []),
            conversionPrice: this.store.listFee.reduce((previousValue: { from: number, to: number, price: number }[], currentValue) => {
                previousValue.push({
                    from: currentValue.minWeight as number,
                    to: currentValue.maxWeight as number,
                    price: currentValue.fee as number
                })
                return previousValue;
            }, [])
        };
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.putRequest(`/v1/shippings/shops/${shopId}/area/${group_id}`, body);
        if (response.status < 300) {
            notify.show('Thao tác thành công!', "success");
            this.store.RouterHistory && this.store.RouterHistory.goBack();
        } else this.pushNotificationRequestError(response);
    }

    public async GET_getDetailGroupArea(group_id: number, callback: (response: IResponseArea) => any) {
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.getRequest(`/v1/shippings/shops/${shopId}/area/${group_id}`);
        if (response.status < 300) callback(response.body);
        else this.pushNotificationRequestError(response);
    }

    public async GET_getListDistricExists() {
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await this.getRequest(`/v1/shippings/shops/${shopId}/area/exists_district`);
        if (response.status < 300) {
            this.store.districtsExists = response.body;
        } else {
            this.pushNotificationRequestError(response);
        }
    }
}();
