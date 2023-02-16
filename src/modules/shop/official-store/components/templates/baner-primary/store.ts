import {computed, observable} from "mobx";
import {IReqCategoryParent, IReqImage} from "../../../../../../api/offical-store/interfaces/request";

export interface IBanner {
    web: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }[]
    app: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }[]
}

export class BannerPrimaryStore {
    @observable banner: IBanner = {
        web: [],
        app: []
    };

    @computed get getBanner(): IBanner {
        return this.banner;
    }
}
