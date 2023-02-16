import {observable} from "mobx";
import {handlerRequestError} from "../../../common/services/BaseService";
import {store as ProfileStore} from "../../profile";
import {IInfoAdvancedNormalOfficialHousehold, IInfoAdvancedCompany} from "../../../api/shop/interfaces/response";
import {
    getShopProfile,
    getShopInfoAdvancedNowTypeCompany,
    getShopInfoAdvancedNowTypeNormalOfficialHousehold, getShopCategories
} from "../../../api/shop";
import {IResContact, IResProfile} from "../../../api/auth/interfaces/response";
import {IResShopProfile, IResShopStats} from "../../../api/shop/interfaces/response";
import {AppGlobal} from "../../../AppGlobal";

export interface IDataWarning {
    type: string,
    task: string,
    description: string,
    percent: number,
    status: boolean
}

class ShopInfomationStore {
    @observable infoAdvancedCompany?: IInfoAdvancedCompany;
    @observable infoAdvancedNormal?: IInfoAdvancedNormalOfficialHousehold;
    @observable shopProfile?: IResShopProfile;
    @observable contacts?: IResContact[];
    @observable shopStats?: IResShopStats;
    @observable shopVerifyAdvanced?: "NON_VERIFIED" | "VERIFIED" | "WAIT_CONFIRMED" | "NONE" | "REJECT";
    @observable dataWarning: IDataWarning [] = [];

    public hasNumberPhone(): boolean {
        if (this.shopProfile)
            return this.shopProfile.phoneNumber !== null;
        else return false;
    }

    public hasContact(): boolean {
        if (this.contacts)
            return this.contacts && this.contacts.length > 0;
        else return false;
    }

    public hasInformationAdvanced(): boolean {
        return this.shopVerifyAdvanced !== "NONE";
    }

    public async getShopProfileNow() {
        try {
            const {shopId, user: {id}} = ProfileStore.profile as IResProfile;
            const res = await getShopProfile(shopId as number, id);
            if (res.status === 200) {
                this.shopProfile = res.body;
            } else handlerRequestError(res);
        } catch (e) {
            console.error(e);
        }
    }
    public async getCategoriesShop(shopId:number){
        try {
            const {shopId} = ProfileStore.profile as IResProfile;
            const res = await getShopCategories(shopId as number);
            if (res.status===200){
                await AppGlobal.getDataCategorise(res.body.categories)
            }else {
                handlerRequestError(res)
            }

        }catch (e) {
            console.error(e);
        }
    }

    public async getShopInfoAdvancedNow(type: 'COMPANY' | 'NORMAL' | 'OFFICIAL_STORE' | 'HOUSEHOLD') {
        try {
            if (ProfileStore.profile) {
                const {shopId} = ProfileStore.profile;
                if (type === 'COMPANY') {
                    const res = await getShopInfoAdvancedNowTypeCompany(shopId!.toString())
                    if (res.status === 200) this.infoAdvancedCompany = res.body
                    else handlerRequestError(res)
                } else {
                    const res = await getShopInfoAdvancedNowTypeNormalOfficialHousehold(shopId!.toString(), type);
                    if (res.status === 200) this.infoAdvancedNormal = res.body
                    else handlerRequestError(res)
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export const store = new ShopInfomationStore();
