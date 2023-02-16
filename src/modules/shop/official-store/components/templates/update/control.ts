import {store as ProfileStore} from "../../../../../profile";
import {TemplateStore} from "../store";
import {HEADER_CTRL} from "../headers/control";
import UpdateOfficialStore from ".";
import {BANNER_PRIMARY_CTRL} from "../baner-primary/control";
import {BANNER_CTRL} from "../banner/control";
import {IBanner} from "../banner/store";
import {CATEGORY_CTRL} from "../category/control";
import {notify} from "../../../../../../common/notify/NotifyService";
import {IResTemplate} from "../../../../../../api/offical-store/interfaces/response";
import {getDetailTemplate} from "../../../../../../api/offical-store";
import {IReqCategory, IReqCategoryParent, IReqImage} from "../../../../../../api/offical-store/interfaces/request";

class Control {
    public view: UpdateOfficialStore = null as any;

    private static loadDataForHeaderStore(template: IResTemplate) {
        if (template.logo === null) HEADER_CTRL.store.logo = {web: null, app: null};
        else HEADER_CTRL.store.logo = {
            web: {url: template.logo.destop, file: null as any},
            app: {url: template.logo.mobile, file: null as any}
        };
    }

    private loadDataForBannerPrimaryStore(template: IResTemplate) {
        if (template.mainBanner === null)
            BANNER_PRIMARY_CTRL.store.banner = {
                web: [{
                    image: null,
                    category: null
                }],
                app: [
                    {
                        image: null,
                        category: null
                    }
                ]
            };
        else {
            const FUNC_CONVERT_CATEGORY = (categories: { id: number, name: string, level: number, parentId: number | null, show: boolean }[]): IReqCategoryParent | null => {
                const search_index = categories.findIndex(value1 => value1.show);
                if (search_index !== -1) {
                    const data = categories[search_index];
                    if (data.level === 1) return {
                        id: data.id,
                        name: data.name,
                        level: data.level,
                        children: []
                    };
                    else {
                        let parent_id = data.parentId;
                        let search_parent_index = -1;
                        do {
                            search_parent_index = categories.findIndex(value1 => value1.id === parent_id);
                            if (search_parent_index === -1) break;
                            else {
                                const parent = categories[search_parent_index];
                                if (parent.level === 1) {
                                    return {
                                        id: parent.id,
                                        name: parent.name,
                                        level: parent.level,
                                        children: [{
                                            id: data.id,
                                            name: data.name,
                                            level: data.level
                                        }]
                                    };
                                } else parent_id = parent.parentId;
                            }
                        } while (true);
                    }
                }
                return null;
            };
            BANNER_PRIMARY_CTRL.store.banner = {
                web: ((): { image: IReqImage | null, category: IReqCategoryParent | null }[] => {
                    let _return: { image: IReqImage | null, category: IReqCategoryParent | null }[] = [];
                    template.mainBanner && template.mainBanner.destop.map(value => _return.push({
                        image: {url: value.img} as any,
                        category: FUNC_CONVERT_CATEGORY(value.categories)
                    }));
                    return _return;
                })(),
                app: ((): { image: IReqImage | null, category: IReqCategoryParent | null }[] => {
                    let _return: { image: IReqImage | null, category: IReqCategoryParent | null }[] = [];
                    template.mainBanner && template.mainBanner.mobile.map(value => _return.push({
                        image: {url: value.img} as any,
                        category: FUNC_CONVERT_CATEGORY(value.categories)
                    }));
                    return _return;
                })()
            };
        }
    }

    private loadDataForCategoryStore(template: IResTemplate) {
        if (template.picProducts === null || template.picProducts.length === 0)
            CATEGORY_CTRL.store.category = [
                {
                    web: {
                        image: null,
                        category: null
                    },
                    app: {
                        image: null,
                        category: null
                    },
                    products: []
                }
            ];
        else {
            CATEGORY_CTRL.store.category = [];
            template.picProducts.map((value, index) => {
                CATEGORY_CTRL.store.category.push({
                    web: {
                        image: value.banner.destop.length > 0 ? {url: value.banner.destop[0].img} as any : null,
                        category: value.banner.destop.length > 0 ? ((): IReqCategoryParent | null => {
                            let category: IReqCategoryParent = null as any;
                            const child: IReqCategory[] = [];
                            value.banner.destop[0].categories.map(value1 => {
                                if (value1.show) {
                                    if (value1.level === 1) category = {
                                        id: value1.id,
                                        name: value1.name,
                                        level: value1.level,
                                        children: []
                                    };
                                    else child.push({id: value1.id, name: value1.name, level: value1.level});
                                }
                                return null;
                            });
                            if (category) category.children = [...child];
                            return category;
                        })() : null
                    },
                    app: {
                        image: value.banner.mobile.length > 0 ? {url: value.banner.mobile[0].img} as any : null,
                        category: value.banner.mobile.length > 0 ? ((): IReqCategoryParent | null => {
                            let category: IReqCategoryParent = null as any;
                            const child: IReqCategory[] = [];
                            value.banner.mobile[0].categories.map(value1 => {
                                if (value1.show) {
                                    if (value1.level === 1) category = {
                                        id: value1.id,
                                        name: value1.name,
                                        level: value1.level,
                                        children: []
                                    };
                                    else child.push({id: value1.id, name: value1.name, level: value1.level});
                                }
                                return null;
                            });
                            if (category) category.children = [...child];
                            return category;
                        })() : null
                    },
                    products: value.products ? [...value.products] : []
                });
                return null;
            });
        }
    }

    private loadDataForSubBannerStore(template: IResTemplate) {
        if (template.subBanner === null) BANNER_CTRL.store.banner = [
            {
                web: {
                    image: null,
                    category: null
                },
                app: {
                    image: null,
                    category: null
                }
            },
            {
                web: {
                    image: null,
                    category: null
                },
                app: {
                    image: null,
                    category: null
                }
            }
        ];
        else {
            const FUNC_CONVERT_CATEGORY = (categories: { id: number, name: string, level: number, parentId: number | null, show: boolean }[]): IReqCategoryParent | null => {
                const search_index = categories.findIndex(value1 => value1.show);
                if (search_index !== -1) {
                    const data = categories[search_index];
                    if (data.level === 1) return {
                        id: data.id,
                        name: data.name,
                        level: data.level,
                        children: []
                    };
                    else {
                        let parent_id = data.parentId;
                        let search_parent_index = -1;
                        do {
                            search_parent_index = categories.findIndex(value1 => value1.id === parent_id);
                            if (search_parent_index === -1) break;
                            else {
                                const parent = categories[search_parent_index];
                                if (parent.level === 1) {
                                    return {
                                        id: parent.id,
                                        name: parent.name,
                                        level: parent.level,
                                        children: [{
                                            id: data.id,
                                            name: data.name,
                                            level: data.level
                                        }]
                                    };
                                } else parent_id = parent.parentId;
                            }
                        } while (true);
                    }
                }
                return null;
            };
            BANNER_CTRL.store.banner = ((): IBanner[] => {
                let _return: IBanner[] = [];
                if (Array.isArray(template.subBanner) && template.subBanner.length > 0) {
                    template.subBanner.map(value => _return.push({
                        web: {
                            image: {url: value.destop[0].img} as any,
                            category: FUNC_CONVERT_CATEGORY(value.destop[0].categories)
                        },
                        app: {
                            image: {url: value.mobile[0].img} as any,
                            category: FUNC_CONVERT_CATEGORY(value.mobile[0].categories)
                        }
                    }));
                }
                if (_return.length < 2) _return.push({
                    web: {image: null, category: null},
                    app: {image: null, category: null}
                });
                return _return;
            })();
        }
    }

    public async getDetailTemplate(template_id: number) {
        const shopId = ProfileStore.profile!.shopId;
        TemplateStore.templateId = template_id;
        const response = await getDetailTemplate(shopId, template_id);
        if (response.status === 200) {
            const data: IResTemplate = response.body;
            TemplateStore.detailTemplate = response.body;
            Control.loadDataForHeaderStore(data);
            this.loadDataForBannerPrimaryStore(data);
            this.loadDataForCategoryStore(data);
            this.loadDataForSubBannerStore(data);
            return;
        }
        if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, 'error');
        else notify.show('Đã có lỗi xảy ra', "error");
        this.view.props.history.goBack();
    }
}

export const UPDATE_TEMPLATE_CTRL = new Control();
