import {getRequest, IApiResponse} from "../index";

function getConfigPolicy(): Promise<IApiResponse<{ privacyPolicyRegisterUrl: string }>> {
    return getRequest('v1/config/policy', false);
}

export {getConfigPolicy}
