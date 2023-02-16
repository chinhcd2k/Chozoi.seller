import {store} from "./BreadcrumbsStore";

export default class BreadcrumbsService {
    public static loadBreadcrumbs(value: { title: string, path?: string, goBack?: () => any }[]) {
        store.breadcrumbs = value;
    }
}

export function breadcrumb(data: { title: string, path?: string | undefined, goBack?: () => any }[] | undefined) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let func = descriptor.value;
        descriptor.value = function (...args: any) {
            setTimeout(() => store.breadcrumbs = data);
            func.apply(this, [...args]);
        }
        return descriptor;
    }
}

export function setBreadcrumb(data: { title: string, path?: string | undefined, goBack?: () => any }[] | undefined) {
    store.breadcrumbs = data
}
