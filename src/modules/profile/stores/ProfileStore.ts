import {computed, observable} from "mobx";
import {IResProfile} from "../../../api/auth/interfaces/response"

class UserStore {
    @observable public profile?: IResProfile;

    @computed get shopId(): number | null {
        return this.profile ? this.profile.shopId : null;
    }
}

export const store = new UserStore();
