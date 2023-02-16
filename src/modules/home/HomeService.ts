import {BaseService, IApiResponse} from "../../common/services/BaseService";

export class HomeService extends BaseService {
  public sendFcmTokenToServer(token: string): Promise<IApiResponse> {
    return this.getRequest(`/v1/users/_me/fcm?fcm_token=${token}&type=SELLER`, true);
  }

  public getListInfoMustUpdate(id_shop: string): Promise<IApiResponse> {
    return this.getRequest(`/v1/shops/${id_shop}/shopInfoProcess`);
  }
}

export const service = new HomeService();