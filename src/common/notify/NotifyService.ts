import {computed, observable} from "mobx";

export default class NotifyStore {
    @observable _init: boolean = true;
    set init(value: boolean) {
        this._init = value;
    }

    @computed get init(): boolean {
        return this._init;
    }

    @observable _show: boolean = false;
    set show(value: boolean) {
        this._show = value;
    }

    @computed get show(): boolean {
        return this._show;
    }

    @observable _text: string = '';
    set text(value: string) {
        this._text = value;
    }

    @computed get text(): string {
        return this._text;
    }

    @observable _flag: 'success' | 'warning' | 'error' = "success";
    set flag(value: 'success' | 'warning' | 'error') {
        this._flag = value;
    }

    @computed get flag(): 'success' | 'warning' | 'error' {
        return this._flag;
    }

    public timeout: any;

    /*Show notify*/
    public notify = (text: string, flag: 'success' | 'warning' | 'error', time: number = 5) => {
        this.init && (this.init = false);
        this.text = text;
        this.flag = flag;
        this.timeout && clearTimeout(this.timeout);
        if (this.show) {
            this.show = false;
            setTimeout(() => {
                this.timeout && clearTimeout(this.timeout);
                this.show = true;
                this.timeout = setTimeout(() => this.show = false, time * 1000);
            }, 400);
        } else {
            this.show = true;
            this.timeout = setTimeout(() => this.show = false, time * 1000);
        }
    }
}

export const store = new NotifyStore();

export const notify = {show: store.notify};
