import {computed, observable} from "mobx";

export interface IShopQA {
    id: number,
}

export interface IQuestion {
    id: number,
    user: {
        id: number,
        name: string,
    },
    state: 'PENDING' | 'PUBLIC' | 'REJECT',
    text: string,
    product: {
        id: number,
        name: string
    },
    answers: {
        id: number,
        questionId: number,
        text: string,
        createdAt: number
    }[],
    createdAt: number

    /*Client Declare*/
    keyTextarea: number
    defaultTextareaValue: string
    inputText: boolean
    editAnswer: boolean
}

class ShopQAStore {
    @observable _qas: IQuestion[] = [];
    set qas(value: IQuestion[]) {
        this._qas = value;
    }

    @computed get qas(): IQuestion[] {
        return this._qas;
    }
}

export const store = new ShopQAStore();
