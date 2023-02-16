import {computed, observable} from "mobx";

export class PaginationStore {
    @observable public data!: {
        total: number,
        number: number,
    };

    @observable public active!: number;
    @observable public pages: number[] = [];

    @computed get getData() {
        return this.data;
    }

    @computed get getActive() {
        return this.active;
    }

    @computed get getPages() {
        return this.pages;
    }

    @computed get getTotalPage() {
        return Math.floor((this.data.total + (this.data.number - 1)) / this.data.number);
    }
}

export const store = new PaginationStore();
