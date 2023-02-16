import {BaseService} from "../../../common/services/BaseService";
import {store} from "..";
import {getAccount} from "../../../api/auth/index"

export const service = new class ProfileService extends BaseService {
    public async getProfile() {
        const response = await getAccount();
        if (response.status === 200) {
            store.profile = response.body;
        }
        return response;
    }
}()
