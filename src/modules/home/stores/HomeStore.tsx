import React from "react";
import {observable} from "mobx";

export interface IMenu {
    title: string,
    icon: React.ReactNode,
    path: string,
    children?: {
        name: string,
        path: string
    }[]
}

class HomeStore {
    @observable menuActive: [number, number] = [1, 0];

    @observable titlePage: string = '';

    @observable tagLiveProduct: any;

    @observable pageHeaderClass: 'container' | 'container-fuild' = 'container-fuild';

    @observable actionNavbar: React.ReactNode | null = null;

    @observable isShowBreadcrumbs: boolean = true;
}

export const store = new HomeStore();

export function menu(parent_id: number, item_id: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const func = descriptor.value;
        descriptor.value = function (...args: any) {
            store.menuActive = [parent_id, item_id];
            func.apply(this, ...args);
        }
        return descriptor;
    }
}