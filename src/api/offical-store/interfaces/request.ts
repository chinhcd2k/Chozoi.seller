interface IReqBanner {
    destop: {
        categories: number[],
        img: string
    }[],
    mobile: {
        categories: number[],
        img: string
    }[]
}

interface IReqAddTemplate {
    name: string | null,
    logo: {
        destop: string,
        mobile: string
    } | null,
    coupons: any[] | null,
    mainBanner: IReqBanner | null,
    picProducts: {
        banner: IReqBanner | null,
        products: number[] | null
    }[] | null,
    subBanner: IReqBanner[] | null
}

interface IReqCategory {
    id: number
    level: number
    name: string
}

interface IReqCategoryParent {
    id: number
    level: number
    name: string
    children: IReqCategory[]
}

interface IReqImage {
    url: string,
    file: File
}

interface IReqPopupManagerRow {
    web: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }[]
    app: {
        image: IReqImage | null
        category: IReqCategoryParent | null
    }[]
}

export type {
    IReqBanner,
    IReqAddTemplate,
    IReqImage,
    IReqPopupManagerRow,
    IReqCategory,
    IReqCategoryParent
}
