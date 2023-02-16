import {computed, observable} from "mobx";
import {IReqCategoryParent, IReqImage} from "../../../../../../api/offical-store/interfaces/request";

export interface IBanner {
    web: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }
    app: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }
}

export class BannerStore {
    @observable bannerIndex: number = 0;

    @computed get getBannerIndex(): number {
        return this.bannerIndex;
    }

    @observable banner: IBanner[] = [];

    @computed get getBanner(): IBanner[] {
        return this.banner;
    }
}
