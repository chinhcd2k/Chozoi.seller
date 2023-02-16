import {computed, observable} from "mobx";

export interface ILogo {
    web: {
        url: string
        file: File
    } | null
    app: {
        url: string
        file: File
    } | null
}

interface IPopupHeaderData extends ILogo {

}

export class HeaderStore {
    @observable logo: ILogo = {app: null, web: null};

    @computed get getLogo(): ILogo {
        return this.logo;
    }

    @observable popupHeaderData: IPopupHeaderData = {web: null, app: null};

    @computed get getPopupHeaderData(): IPopupHeaderData {
        return this.popupHeaderData;
    }
}
