import {getRequest, IApiResponse, putRequest, deleteRequest, postRequest} from "../index";
import {IReqChangePass, IReqLogin, IReqRegister} from "./interfaces/request";
import {IResLogin, IResProfile} from "./interfaces/response";

function sendLogin(params: IReqLogin): Promise<IApiResponse<IResLogin>> {
    return postRequest('/v1/auth/login', false, params);
}

function getAccount(): Promise<IApiResponse<IResProfile>> {
    return getRequest("/v1/users/_me/");
}

function sendLogout(fcmToken: string): Promise<IApiResponse<any>> {
    return deleteRequest('/v1/auth/logout', true, {fcmToken: fcmToken})
}

function sendRegister(params: IReqRegister): Promise<IApiResponse<any>> {
    return postRequest('/v1/auth/register', false, params);
}

function sendUpdateRefCode(refCode: string, type: string, regType: string): Promise<IApiResponse<any>> {
    return postRequest(`/v1/users/_me/updateRefCode`, true, {refCode, type, regType});
}

function sendVerifyAccount(params: { username: string, active_code: string }): Promise<IApiResponse<any>> {
    return putRequest('/v1/auth/verify', false, params);
}

function sendReSendOtp(username: string): Promise<IApiResponse<any>> {
    return postRequest('/v1/auth/resend_register_code', false, {username: username})
}

function sendForgetPassword(username: string, captcha: string): Promise<IApiResponse<any>> {
    return getRequest('/v1/auth/forgot_password?username=' + username + '&captcha=' + captcha, false);
}

function sendVerifyOtpForgetPass(username: string, otp: string): Promise<IApiResponse<any>> {
    return getRequest('/v1/auth/check_otp?username=' + username + '&otp=' + otp, false);
}

function sendChangePass(params: IReqChangePass): Promise<IApiResponse<any>> {
    return putRequest('/v1/auth/forgot_password', false, params);
}

function sendReActAccRegister(username: string): Promise<IApiResponse<any>> {
    return postRequest('/v1/auth/resend_register_code', false, {username: username});
}

export {
    sendLogin,
    getAccount,
    sendLogout,
    sendRegister,
    sendUpdateRefCode,
    sendVerifyAccount,
    sendReSendOtp,
    sendForgetPassword,
    sendVerifyOtpForgetPass,
    sendChangePass,
    sendReActAccRegister
}
