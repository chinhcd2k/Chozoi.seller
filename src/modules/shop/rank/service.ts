import {BaseService, IApiResponse} from "../../../common/services/BaseService";

export interface IResponseStatusRank {
    month: string
    tag: 'NORMAL' | 'FAVOURITE' | 'POSITIVE'
    countOrderFinished: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
    orderFinishedPercent: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
    countBuyerNotDuplicate: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
    orderRatingPercent: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
    sumRating: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
    prepareGoodsOnTimePercent: {
        current: number
        favouriteCondition: number
        positiveCondition: number
    }
}

class Service extends BaseService {
    public GET_getStatusRank(shopId: number): Promise<IApiResponse> {
        return this.getRequest(`/v1/shops/${shopId}/policies/statistical`);
    }
}

export const service = new Service();