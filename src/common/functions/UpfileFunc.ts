import $ from "jquery";
import {convertBase64ToBlobUrl} from "./ConvertFunc";
import {handlerRequestError} from "../services/BaseService";

const URL_API: string = (window as any).URL_API || '';
const COOKIE_NAME: string = (window as any).COOKIE_NAME || '';

export const uploadImage = (files: FileList | File, path: 'uploadProfile' | 'uploadProduct' | 'uploadCover'): Promise<{ url: string }> => {
    let data = new FormData();
    if ((files as any).length !== undefined)
        data.append('file', (files as any)[0]);
    else data.append('file', files as any);
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${URL_API}/v1/users/storage/${path}`,
            data: data,
            headers: {'x-chozoi-token': localStorage.getItem(COOKIE_NAME)},
            // @ts-ignore
            enctype: 'multipart/form-data',
            type: 'POST',
            processData: false,
            contentType: false,
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                handlerRequestError({
                    status: error.status,
                    body: error.responseJSON
                });
                reject(error);
            }
        });
    })
};

export function getDimensionImg(file: File): Promise<{ width: number, height: number }> {
    return new Promise(resolve => {
        const fr = new FileReader();
        fr.onload = () => {
            const img = new Image();
            img.onload = () => {
                resolve({width: img.width, height: img.height});
            };
            typeof fr.result === "string" && (img.src = fr.result);
        };
        fr.readAsDataURL(file);
    });
}

export function getImageSrcWithFile(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
        try {
            const fr = new FileReader();
            fr.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const {src} = img;
                    resolve(convertBase64ToBlobUrl(src));
                };
                typeof fr.result === "string" && (img.src = fr.result);
            };
            fr.readAsDataURL(file);
        } catch (e) {
            reject(e);
        }
    });
}
