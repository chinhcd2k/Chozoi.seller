import {ICategorise} from "./modules/auctions/manager-auction";

export interface IResCategory {
    id: number
    name: string
    level: number
    parentId: number | null
    sort: number
    description: string
    avatarUrl: string | null
}

interface ICategory {
    [id: number]: IResCategory[]
}

export class AppGlobal {
    private constructor() {
    }

    static categoriesRes: IResCategory[] = [];
    static categories?: ICategory;
    static dataFilterCategories: ICategorise[] = [];

    /*
    * Xử lý cấu trúc dữ liệu với
    * key: categoryId của level có giá trị lớn nhất
    * value: Tập hợp category object theo thứ tự level từ thấp đến cao: parent => children.
    * */
    static createCategoriesTreeReverse(categories: IResCategory[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                this.categories = {};
                if (categories.length > 0) {
                    // Sort by level DESC
                    categories = categories.sort((a, b) => {
                        if (a.level > b.level) return -1;
                        else if (a.level < b.level) return 1;
                        else return 0;
                    });
                    const maxLevel = categories[0].level;
                    const index = categories.findIndex(value => value.level < maxLevel);
                    const cateChildren = categories.splice(0, index);
                    const FIND_PARENT = (parentId: number, initialValue: IResCategory[]): IResCategory[] => {
                        const cate = categories.find(value => value.id === parentId);
                        if (cate) {
                            initialValue.unshift(cate);
                            cate.parentId && FIND_PARENT(cate.parentId, initialValue);
                        }
                        return initialValue;
                    };
                    cateChildren.map(value => (this.categories as any)[value.id] = FIND_PARENT(value.parentId as number, [value]));
                    resolve();
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
        })
    }
    static getDataCategorise = (dataCategories:IResCategory[]) => {
        let listCategoriesLv1: any[] = []
        let listCategoriesLv2: any[] = []
        let listCategoriesLv3: any[] = []
        listCategoriesLv1 = dataCategories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.level === 1) previousValue.push(currentValue);
            return previousValue;
        }, []);
        listCategoriesLv2 = dataCategories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.level === 2) previousValue.push(currentValue);
            return previousValue;
        }, []);
        listCategoriesLv3 = dataCategories.reduce((previousValue: any[], currentValue) => {
            if (currentValue.level === 3) previousValue.push(currentValue);
            return previousValue;
        }, []);
        listCategoriesLv1 = listCategoriesLv1.sort((a, b) => {
            if (a.sort < b.sort) return -1;
            else if (a.sort > b.sort) return 1;
            else return 0;
        });
        listCategoriesLv2 = listCategoriesLv2.sort((a, b) => {
            if (a.sort < b.sort) return -1;
            else if (a.sort > b.sort) return 1;
            else return 0;
        });
        listCategoriesLv3 = listCategoriesLv3.sort((a, b) => {
            if (a.sort < b.sort) return -1;
            else if (a.sort > b.sort) return 1;
            else return 0;
        });

        const data: ICategorise[] = [];
        let dataLv2: {
            value: string,
            label: string,
            id:number,
            children: {
                value: string,
                label: string,
                id:number
            }[]
        }[] = []
        let dataLv3: {
            value: string,
            label: string,
            id:number
        }[] = []
        listCategoriesLv1.map((value, i) => {
            listCategoriesLv2.map((value2, i) => {
                if (value2.parentId === value.id) {
                    listCategoriesLv3.map((value3, i) => {
                        if (value3.parentId === value2.id) {
                            let data3 = {
                                value: value3.name,
                                label: value3.name,
                                id:value3.id
                            }
                            dataLv3.push(data3)
                        }
                    })
                    let data2 = {
                        value: value2.name,
                        label: value2.name,
                        id:value2.id,
                        children: dataLv3
                    }
                    dataLv2.push(data2)
                    dataLv3 = []
                }
            })
            let data1 = {
                value: value.name,
                label: value.name,
                id:value.id,
                children: dataLv2
            }
            data.push(data1)
            dataLv2 = []
        })
        AppGlobal.dataFilterCategories = data
    }
}