import {computed, observable} from "mobx";

class BreadcrumbsStore {
    @observable _breadcrumbs!: { title: string, path?: string | undefined }[] | undefined;
    set breadcrumbs(value: { title: string, path?: string | undefined, goBack?: () => any }[] | undefined) {
        this._breadcrumbs = value;
    }

    @computed get breadcrumbs(): { title: string, path?: string, goBack?: () => any }[] | undefined {
        return this._breadcrumbs;
    }
}

export const store = new BreadcrumbsStore();
