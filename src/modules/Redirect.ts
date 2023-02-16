import {slug} from "../common/functions/FormatFunc";
import {AppGlobal} from "../AppGlobal";

export function getUrlPassport(userId: number): string {
    return `${(window as any).DOMAIN_BUYER}/passport/${userId}`;
}

export function getUrlDetailProductLive(categoryId: number, id: number, name: string): string {
    try {
        const {categories} = AppGlobal;
        if (categories && categories[categoryId]) {
            const data = categories[categoryId];
            let path = "";
            data.map(value => path += `/${slug(value.name)}`);
            return `${(window as any).DOMAIN_BUYER}${path}/${slug(name)}.${id}.html`;
        } else return `${(window as any).DOMAIN_BUYER}/${slug(name)}.${id}.html`;
    } catch (e) {
        return "#";
    }
}