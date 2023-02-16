import Axios, {Method} from "axios";
import {notify} from "../notify/NotifyService";
import humps from "humps";
import {LoadingTopBarService} from "../../App";
import {clearAllCookie} from "../functions/CookieFunc";
import {useEffect, useRef} from "react";

export interface IApiResponse {
    readonly status: number;
    readonly body: any
}

const COOKIE_NAME: string = (window as any).COOKIE_NAME || '';
const HEADER_TOKEN_NAME: string = (window as any).HEADER_TOKEN_NAME || '';

export class BaseService {
    public loadding: boolean = false;
    private apiRootUrl: string | undefined = (window as any).URL_API;

    public getRequest(path: string, isNeedAuthen: boolean = true): Promise<IApiResponse> {
        const _headers = {};
        // @ts-ignore
        _headers['Content-Type'] = 'application/json';
        if (isNeedAuthen) {
            // @ts-ignore
            _headers[HEADER_TOKEN_NAME] = localStorage.getItem(COOKIE_NAME) || '';
        }
        return new Promise<IApiResponse>((resolve) => {
            if (!this.loadding) {
                this.loadding = true;
                LoadingTopBarService && LoadingTopBarService.staticStart();
            }
            Axios.get(this.apiRootUrl + path, {headers: _headers})
                .then((success: any) => {
                    resolve({
                        body: humps.camelizeKeys(success.data),
                        status: success.status
                    })
                })
                .catch((error: any) => {
                    try {
                        const resError: IApiResponse = {
                            body: error.response.data,
                            status: error.response.status
                        };
                        this.handleCommonError(resError, isNeedAuthen);
                        resolve(resError);
                    } catch (e) {
                        notify.show('Đã có lỗi xảy ra.', 'error');
                        resolve({
                            status: 0,
                            body: {}
                        })
                    }
                }).finally(() => {
                LoadingTopBarService && LoadingTopBarService.complete();
                this.loadding = false;
            });
        });
    }

    public async postRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
        return this.apiCall(path, "POST", params, isNeedAuthen);
    }

    async putRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
        return this.apiCall(path, "PUT", params, isNeedAuthen);
    }

    async deleteRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
        return this.apiCall(path, "DELETE", params, isNeedAuthen);
    }

    protected handleCommonError(response: IApiResponse, auth = false) {
        if (response.status === 401 && auth) {
            localStorage.removeItem(COOKIE_NAME);
            clearAllCookie();
            window.location.href = "/login";
        }
        if (response.status !== 200 && response.status !== 201) {
            console.error(response);
        }
        return;
    }

    // tslint:disable-next-line:variable-name
    private apiCall(path: string, _method: Method = "POST", _params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
        const _headers = {};
        // @ts-ignore
        _headers['Content-Type'] = 'application/json';
        if (isNeedAuthen) {
            // @ts-ignore
            _headers[HEADER_TOKEN_NAME] = localStorage.getItem(COOKIE_NAME) || '';
        }
        return new Promise<IApiResponse>((resolve) => {
            if (!this.loadding) {
                this.loadding = true;
                LoadingTopBarService && LoadingTopBarService.staticStart();
            }
            Axios({
                data: JSON.stringify(_params),
                headers: _headers,
                method: _method,
                url: this.apiRootUrl + path
            }).then((success: any) => {
                resolve({
                    body: humps.camelizeKeys(success.data),
                    status: success.status
                });

            })
                .catch((error: any) => {
                    try {
                        const resError: IApiResponse = {
                            body: error.response.data,
                            status: error.response.status
                        };
                        this.handleCommonError(resError, isNeedAuthen);
                        resolve(resError);
                    } catch (e) {
                        // notify.show('Vui lòng kiểm tra lại kết nối mạng của bạn', 'error');
                        console.log(e);
                        resolve({
                            status: 0,
                            body: {}
                        })
                    }
                })
                .finally(() => {
                    LoadingTopBarService && LoadingTopBarService.complete();
                    this.loadding = false;
                });
        });
    }

    public pushNotificationRequestError(response: IApiResponse) {
        try {
            if (response.body && response.body.message && typeof response.body.message === "string")
                notify.show(response.body.message, "error");
            else if (response.body && response.body.message !== null && typeof response.body.message === "object" && Object.keys(response.body.message).length > 0) {
                const value = response.body.message[Object.keys(response.body.message)[0]];
                if (typeof value === "string")
                    notify.show(value, "error");
            } else notify.show('Máy chủ đang bận. Vui lòng thử lại sau', "error");
        } catch (e) {
            console.error(e);
            notify.show("Đã có lỗi xảy ra!", "error");
        }
    }
}

const baseService = new BaseService();

export function getRequest(path: string, isNeedAuthen: boolean = true): Promise<IApiResponse> {
    return baseService.getRequest(path, isNeedAuthen);
}

export function postRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
    return baseService.postRequest(path, params, isNeedAuthen);
}

export function putRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
    return baseService.putRequest(path, params, isNeedAuthen);
}

export function deleteRequest(path: string, params: object, isNeedAuthen: boolean = true): Promise<IApiResponse> {
    return baseService.deleteRequest(path, params, isNeedAuthen);
}

export function handlerRequestError(response: IApiResponse) {
    baseService.pushNotificationRequestError(response);
}

export function usePrevious(value: any): any {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}