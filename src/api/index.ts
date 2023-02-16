import Axios, {Method} from "axios";
import humps from "humps";
import $ from "jquery";
import {notify} from "../common/notify/NotifyService";
import {LoadingTopBarService} from "../App";
import {clearAllCookie} from "../common/functions/CookieFunc";

export interface IApiResponse<T> {
    status: number
    body: T
}

export interface IMetadata {
    page: number,
    size: number,
    total: number,
    totalPage: number
}

const baseURL: string = (window as any).URL_API;
const TOKEN_NAME: string = "X-Chozoi-Token";

function getRequest(url: string, isToken: boolean = true): Promise<IApiResponse<any>> {
    const headers: { [key: string]: string } = {};
    headers['Content-Type'] = 'application/json';
    if (isToken) headers[TOKEN_NAME] = localStorage.getItem('token') || "";
    return new Promise<any>(resolve => {
        Axios.get(
            baseURL + url,
            isToken ? {headers: headers} : undefined
        )
            .then(next => {
                resolve({
                    body: humps.camelizeKeys(next.data),
                    status: next.status
                })
            })
            .catch(error => {
                try {
                    resolve({
                        status: error.response.status,
                        body: humps.camelizeKeys(error.response.data)
                    });
                    handleOnErrorRequest(error.response);
                } catch (e) {
                    resolve({
                        status: 500,
                        body: e
                    });
                }
            }).finally(() => {
            LoadingTopBarService && LoadingTopBarService.complete();
        });
    });
}

function apiCall(url: string, method: Method, isToken: boolean = true, data?: { [key: string]: any }): Promise<IApiResponse<any>> {
    const headers: { [key: string]: string } = {};
    headers['Content-Type'] = 'application/json';
    if (isToken) headers[TOKEN_NAME] = localStorage.getItem('token') || "";
    return new Promise<any>(resolve => {
        Axios(
            {
                url: baseURL + url,
                method: method,
                headers: headers,
                data: data ? JSON.stringify(data) : undefined
            }
        )
            .then(next => {
                resolve({
                    body: humps.camelizeKeys(next.data),
                    status: next.status
                })
            })
            .catch(error => {
                try {
                    resolve({
                        status: error.response.status,
                        body: humps.camelizeKeys(error.response.data)
                    });
                    handleOnErrorRequest(error.response);
                } catch (e) {
                    resolve({
                        status: 500,
                        body: e
                    });
                }
            });
    });
}

function postRequest(url: string, isToken: boolean = true, data?: { [key: string]: any }): Promise<IApiResponse<any>> {
    return apiCall(url, "POST", isToken, data);
}

function putRequest(url: string, isToken: boolean = true, data?: { [key: string]: any }) {
    return apiCall(url, "PUT", isToken, data);
}

function deleteRequest(url: string, isToken: boolean = true, data?: { [key: string]: any }) {
    return apiCall(url, "DELETE", isToken, data);
}

function sendUploadImage(files: File, path: 'uploadProfile' | 'uploadProduct' | 'uploadCover'): Promise<string> {
    const headers: { [key: string]: string } = {};
    headers[TOKEN_NAME] = localStorage.getItem('token') || "";
    const data = new FormData();
    data.append('file', files as File);
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${baseURL}/v1/users/storage/${path}`,
            data: data,
            headers: headers,
            enctype: 'multipart/form-data',
            type: 'POST',
            processData: false,
            contentType: false,
            success: function (data) {
                resolve(data.url);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function handleOnErrorRequest(error: { status: number, data: any }) {
    try {
        if (error.status === 401 && (!error.data ||  (error.data && error.data.statusCode !== 1002 && error.data.statusCode !== 1001 && error.data.statusCode !== 1003 && error.data && error.data.statusCode !== 401))) {
            localStorage.removeItem("token");
            clearAllCookie();
            window.location.href = "/login";
        } else {
            const {message} = error.data;
            if (typeof message === "string") notify.show(message, "error");
        }
    } catch (e) {
        console.error('Đã có lỗi xảy ra!');
    }
}

export {
    getRequest,
    postRequest,
    putRequest,
    deleteRequest,
    sendUploadImage
}
