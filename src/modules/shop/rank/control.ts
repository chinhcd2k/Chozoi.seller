import ShopRankStore from "./store";
import {IResponseStatusRank, service} from "./service";
import {store as ProfileStore} from "../../profile";
import {IResProfile} from "../../../api/auth/interfaces/response";

class Control {
    public store = new ShopRankStore();

    public getPercent(data: IResponseStatusRank): Promise<any> {
        return new Promise<any>(resolve => {
            let percent = 0;
            if (data.tag === "FAVOURITE") {
                resolve(100);
                return;
            }
            if (data.countOrderFinished) {
                percent += data.countOrderFinished.current >= data.countOrderFinished.favouriteCondition ? 100 : ((data.countOrderFinished.current / data.countOrderFinished.favouriteCondition) * 100);
            }
            if (data.countBuyerNotDuplicate) {
                percent += data.countBuyerNotDuplicate.current >= data.countBuyerNotDuplicate.favouriteCondition ? 100 : ((data.countBuyerNotDuplicate.current / data.countBuyerNotDuplicate.favouriteCondition) * 100);
            }
            if (data.sumRating) {
                percent += data.sumRating.current >= data.sumRating.favouriteCondition ? 100 : ((data.sumRating.current / data.sumRating.favouriteCondition) * 100);
            }
            if (data.orderFinishedPercent) {
                percent += data.orderFinishedPercent.current >= data.orderFinishedPercent.favouriteCondition ? 100 : ((data.orderFinishedPercent.current / data.orderFinishedPercent.favouriteCondition) * 100);
            }
            if (data.orderRatingPercent) {
                percent += data.orderRatingPercent.current >= data.orderRatingPercent.favouriteCondition ? 100 : ((data.orderRatingPercent.current / data.orderRatingPercent.favouriteCondition) * 100);
            }
            if (data.prepareGoodsOnTimePercent) {
                percent += data.prepareGoodsOnTimePercent.current >= data.prepareGoodsOnTimePercent.favouriteCondition ? 100 : ((data.prepareGoodsOnTimePercent.current / data.prepareGoodsOnTimePercent.favouriteCondition) * 100);
            }
            if (data.tag === "POSITIVE")
                resolve((percent / 600) * 100);
            else if (data.tag === "NORMAL") resolve(((percent / 600) * 100) - 50);
        });
    }

    public async getStatusRank() {
        const shopId = (ProfileStore.profile as IResProfile).shopId;
        const response = await service.GET_getStatusRank(shopId as number);
        if (response.status === 200) {
            this.store.processPercent = await this.getPercent(response.body as IResponseStatusRank);
            this.store.data = response.body;
        }
    }
}

export const SHOP_RANK_CTRL = new Control();