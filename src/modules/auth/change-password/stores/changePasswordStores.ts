import {computed, observable} from "mobx";

export interface IRequestChangePass {
    old_password: string,
    new_password: string,
    confirm_password: string,
    code: string,
}

export interface IRequestAddPass {
    new_password: string,
    confirm_password: string,
    code: string
}

export interface IRequestCodeChangePass {
    statusCode: number,
    message: string
}

export class Store {
    @observable _changePass: IRequestChangePass[] = [];

    set changePass(value: IRequestChangePass[]) {
        this._changePass = value;
    }

    @computed get changePass(): IRequestChangePass[] {
        return this._changePass
    }

    @observable _codeChangePass: IRequestCodeChangePass[] = [];

    set codeChangePass(value: IRequestCodeChangePass[]) {
        this._codeChangePass = value;
    }

    @computed get codeChangePass(): IRequestCodeChangePass[] {
        return this._codeChangePass;
    }
}

export const store = new Store();
