import {IReqCategoryParent, IReqImage} from "./request";

interface IResOfficialStore {
    "id": number,
    "name": string
    "email": string
    "contactName": string
    "phoneNumber": string
    "shopType": string
    "pageUrl": string
    "user": {
        "id": number,
        "email": string
        "phoneNumber": string,
        "userRole": string
        "loginType": string
        "userState": string
    },
    "shopTag": string
    "freeShipStatus": string
    "sellShipping": boolean,
    "followType": string,
    "createdAt": number,
    "passwordRequire": boolean

}

interface IResListView {
    id: number
    shopId: number
    name: string
    state: "DRAFT" | "PUBLIC" | "DELETE"
    updatedAt: string
}

interface IResCategory {
    id: number
    name: string
    level: number
    parentId: number | null
    show: boolean
}

interface IResBanner {
    destop: {
        categories: IResCategory[],
        img: string
    }[],
    mobile: {
        categories: IResCategory[],
        img: string
    }[]
}

interface IResTemplate {
    id: number
    shopId: number
    name: string | null,
    coupons: any[] | null,
    logo: {
        destop: string,
        mobile: string
    } | null,
    mainBanner: IResBanner | null,
    picProducts: {
        banner: IResBanner,
        products: any[]
    }[] | null,
    subBanner: IResBanner[] | null
}

interface IResBannerTemp {
    image: IReqImage | null
    category: IReqCategoryParent | null
}

interface IResCategoryTemp {
    web: IResBannerTemp
    app: IResBannerTemp
    products: any[]
}

interface IResPopupUploadData {
    url: string
    files: any
}

interface IResPopupProductsData {
    selected: any[]
    products: any[]
    page: number
    size: number
    total: number
}

interface IResPopupCategoryData {
    web: IReqCategoryParent | null,
    app: IReqCategoryParent | null
}

export type {
    IResOfficialStore,
    IResListView,
    IResCategory,
    IResCategoryTemp,
    IResPopupUploadData,
    IResPopupProductsData,
    IResTemplate,
    IResPopupCategoryData,
    IResBanner,
    IResBannerTemp,
    IReqImage,
    IReqCategoryParent
}
