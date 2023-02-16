import {observable} from "mobx";

interface IPopupUploadData {
    url: string,
    file: File
}

interface ISize {
    width: number,
    height: number
}

export class Store {
    @observable data: IPopupUploadData | null = null;
    @observable sizeWeb: ISize = {width: 0, height: 0};
    @observable sizeApp: ISize = {width: 0, height: 0};
    @observable device: 'web' | 'app' = "web";
}

export const PopupUploadStore = new Store();
