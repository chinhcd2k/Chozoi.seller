import {BaseService, IApiResponse} from "../../common/services/BaseService";
import {IRequestAddPass, IRequestChangePass} from "./change-password/stores/changePasswordStores";

export interface ILoginParams {
    username: string,
    password: string
}

export interface IRegisterParams {
    username: string,
    password: string,
    confirm_password: string;
    recaptchaResponse: string;
    type: string;
    refCode: string;
    regType: string;
}

export interface IVerifyParams {
    username: string,
    active_code: string
}

export interface INewPasswordParams {
    username: string;
    password: string;
    confirmPassword: string;
    otp: string
}

export class VerifyParams implements IVerifyParams {
    username: string;
    active_code: string;

    constructor(username: string = '', active_code: string = '') {
        this.username = username;
        this.active_code = active_code;
    }
}

export class LoginParams implements ILoginParams {
    public username: string;
    public password: string;

    constructor(username: string = '', password: string = '') {
        this.username = username;
        this.password = password;
    }
}

export class RegisterParams implements IRegisterParams {
    username: string = '';
    password: string = '';
    name: string = '';
    confirm_password = '';
    recaptchaResponse = '';
    type = 'Seller';
    refCode: string = '';
    regType: string = '';
}

export class NewPasswordParams implements INewPasswordParams {
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
    captcha: string;

    constructor(username: string = '', password: string = '', confirmPassword: string = '', otp: string = '', captcha: string = '') {
        this.username = username;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.otp = otp;
        this.captcha = captcha;
    }
}

class AuthService extends BaseService {
    public login(params: ILoginParams): Promise<IApiResponse> {
        return this.postRequest('/v1/auth/login', params, false);
    }

    public logout(): Promise<IApiResponse> {
        return this.deleteRequest('/v1/auth/logout', {
            fcm_token: localStorage.getItem('fcm-token')
        }, true);
    }

    public register(params: IRegisterParams): Promise<IApiResponse> {
        return this.postRequest('/v1/auth/register', params, false);
    }

    public verify(params: IVerifyParams): Promise<IApiResponse> {
        return this.putRequest('/v1/auth/verify', params, false);
    }

    public forgotPassword(username: string, captcha: string): Promise<IApiResponse> {
        return this.getRequest(`/v1/auth/forgot_password?username=${username}&captcha=${captcha}`, false);
    }

    public newPassword(data: INewPasswordParams): Promise<IApiResponse> {
        return this.putRequest('/v1/auth/forgot_password', data, false);
    }

    public reSendOtpVerifyAccount(username: string): Promise<IApiResponse> {
        return this.postRequest('/v1/auth/resend_register_code', {username: username}, false)
    }

    public checkOTP(username: string, otp: string): Promise<IApiResponse> {
        return this.getRequest(`/v1/auth/check_otp?username=${username}&otp=${otp}`, false);
    }

    public getPolicy(): Promise<IApiResponse> {
        return this.getRequest('/v1/config/policy', false);
    }

    public getOtpChangePassword(): Promise<IApiResponse> {
        return this.getRequest('/v1/users/_me/change_password_code', true)
    }

    public changePassword(data: IRequestChangePass): Promise<IApiResponse> {
        return this.putRequest('/v1/users/_me/password', data, true)
    }
    public addNewPassword(data:IRequestAddPass): Promise<IApiResponse>{
        return this.putRequest('/v1/users/_me/get_new_password',data,true);
    }
}

export const service = new AuthService();
