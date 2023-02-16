import {BaseService, IApiResponse} from "../../common/services/BaseService";

export interface ParamsIRegisterShop {
    email: string,
    phone_number: string,
    name: string,
    contact_name: string,
    warehouse: {
        detail_address: string,
        phone_number: string,
        province_id: number,
        district_id: number,
        ward_id: number,
        name: string
    },
    refund: {
        detail_address: string,
        phone_number: string,
        province_id: number,
        district_id: number,
        ward_id: number,
        name: string
    },
    type: "normal" | "company",
    frontPhotoBusinessLicenseUrl?: string,
    backPhotoBusinessLicenseUrl?: string,
    company_name?: string,
    tax_code?: string,
    business_owner_name?: string
}

export interface ParamsSetEnableShipping {
    state: "ENABLED" | "DISABLED",
    use_insurance: boolean
}

export class ShopService extends BaseService {
    public getListShipping(shopId: string | number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shippings/shops/${shopId}`, true);
    }

    public setEnable(shopId: number | string, partnerId: number | string, data: ParamsSetEnableShipping): Promise<IApiResponse> {
        return this.putRequest(`/v1/shippings/shops/${shopId}/shippings/${partnerId}`, data, true);
    }

    // public registerShop(type: 'normal' | 'company', params: ParamsIRegisterShop): Promise<IApiResponse> {
    //     return this.postRequest(`/v1/shops?type=${type}`, params, true);
    // }

    // Lấy các tỉnh thành
    public async getProvince() {
        const data = await this.getRequest('/v1/provinces', true);
        return data.status === 200 ? data.body : undefined;
    }

    public async getDistricts(province: number) {
        const data = await this.getRequest(`/v1/districts?provinceId=${province}`, true);
        return data.status === 200 ? data.body : undefined;
    }

    public async getWards(district: number) {
        const data = await this.getRequest(`/v1/wards?districtId=${district}`, true);
        return data.status === 200 ? data.body : undefined;
    }

    /*----End----*/

    public getInformationAdvanced(shopId: number, type: 'NORMAL' | 'COMPANY' | 'OFFICIAL_STORE' | "HOUSEHOLD"): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/advancedInfo?type=${type.toLowerCase()}`, true);
    }

    public updateInformationAdvanced(shopId: number, data: any, type: 'NORMAL' | 'COMPANY' | 'OFFICIAL_STORE' | "HOUSEHOLD"): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/advancedInfo?type=${type.toLowerCase()}`, data, true);
    }

    // public updateShopProfile(shopId: number, data: any): Promise<IApiResponse> {
    //     return this.putRequest(`/v1/shops/${shopId}`, data, true);
    // }

    // public async getShopProfile(shopId: number) {
    //     return this.getRequest(`/v1/shops/${shopId}`, true);
    // }

    // public async getShopContacts(shopId: number) {
    //     return this.getRequest(`/v1/shops/${shopId}/contacts`, true);
    // }

    public createContact(shopId: number, data: any): Promise<IApiResponse> {
        return this.postRequest(`/v1/shops/${shopId}/contacts`, data, true);
    }

    public updateContact(shopId: number, contactId: number, data: any): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/contacts/${contactId}`, data, true);
    }

    public deleteContact(shopId: number, contactId: number): Promise<IApiResponse> {
        return this.deleteRequest(`/v1/shops/${shopId}/contacts/${contactId}`, {}, true);
    }

    public getShopCards(): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/payment`, true);
    }

    public getBankBranch(shopId: number, bankId: number, provinceId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/bank/branch?bankId=${bankId}&provinceId=${provinceId}`);
    }

    public getBanks(shopId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/bank`, true);
    }

    public createCard(shopId: number, data: any): Promise<IApiResponse> {
        return this.postRequest(`/v1/shops/${shopId}/bank/card`, data, true);
    }

    public updateCard(shopId: number, cardId: number, data: any): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${shopId}/bank/card/${cardId}`, data, true);
    }

    public deleteCard(shopId: number, cardId: number): Promise<IApiResponse> {
        return this.deleteRequest(`/v1/shops/${shopId}/bank/card/${cardId}`, {}, true);
    }

    // public async getShopCompany() {
    //     return this.getRequest(`/v1/shops?type=company`, true);
    // }

    /*Question and Answer*/
    public async getListQA(shopId: number, state: string, page: number, size: number) {
        return this.getRequest(`/v1/shops/${shopId}/questions?state=${state}&page=${page}&size=${size}`, true);
    }

    public sendAnswer(shopId: number, data: any): Promise<IApiResponse> {
        return this.postRequest(`/v1/answers`, data, true);
    }

    public transformStateQuestion(id_shop: number, params: { ids: number[], state: 'PUBLIC' | 'PENDING' | 'REJECT' }): Promise<IApiResponse> {
        return this.putRequest(`/v1/shops/${id_shop}/questions/_bulk/state`, params, true);
    }

    public deleteAnswer(answers_id: number): Promise<IApiResponse> {
        return this.deleteRequest(`/v1/answers/${answers_id}`, {}, true);
    }

    public updateAnswer(answer_id: number, text: string): Promise<IApiResponse> {
        return this.putRequest(`/v1/answer/${answer_id}`, {text: text}, true);
    }

    public async getDataWarning(id_shop: string): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${id_shop}/shopInfoProcess`);
    }
}

export const service = new ShopService();
