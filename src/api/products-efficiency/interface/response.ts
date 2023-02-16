import {IMetadata} from "../../index";

export interface IResItemProAccess {
    id: any
    name: string
    totalView: number
    productViewApp: number
    productViewWeb: number
    totalVisit: number
    productVisitApp: number
    productVisitWeb: number
    totalBounceRate: number
    averageOnSite: number
}

export interface IResTotalValueAccess {
    totalView: number
    totalViewApp: number
    totalViewWeb: number
    totalVisit: number
    totalVisitApp: number
    totalVisitWeb: number
    totalBounceRate: number
    averageOnSite: number
}

export interface IResListProDetail {
    totalValue: IResTotalValueAccess
    products: IResItemProAccess[]
    metadata: IMetadata
}

export interface IResTotalValueInteractive {
    totalFavorites: number
    totalFavoriteWeb: number
    totalFavoriteApp: number
    totalShare: number
    totalShareWeb: number
    totalShareApp: number
    totalAddToCart: number
    totalAddToCartWeb: number
    totalAddToCartApp: number
    addToCartRatio: number
    totalRevenue: number
    totalAuction: number
    totalParticipants: number
    totalAuctionSuccess: number
    totalAuctionRatio: number
    totalAddToCartRatio: number
}

export interface IresItemProInteractive extends IResTotalValueInteractive {
    id: any
    name: string
}

export interface IResListProDetailInteractive {
    totalValue: IResTotalValueInteractive
    productInteraction: IresItemProInteractive[]
    metadata: IMetadata
}

interface IItemProductOverviewAccess {
    totalView: {
        totalView: number
        totalViewPercent: number
    }
    totalViewApp: {
        totalViewApp: number
        totalViewAppPercent: number
    }
    totalViewWeb: {
        totalViewWeb: number
        totalViewWebPercent: number
    }
    totalVisit: {
        totalVisit: number
        totalVisitPercent: number
    }
    totalVisitApp: {
        totalVisitApp: number
        totalVisitAppPercent: number
    }
    totalVisitWeb: {
        totalVisitWeb: number
        totalVisitWebPercent: number
    }
    totalOnSite: {
        averageOnSite: string
        averageOnSitePercent: number
    }
    totalBounceRate: {
        totalBounceRate: number,
        totalBounceRatePercent: number
    }
}

export interface IResProductOverviewAccess {
    productNormal: IItemProductOverviewAccess
    productAuction: IItemProductOverviewAccess
}

export interface IItemProductOverviewInteractive {
    totalFavorite: {
        totalFavorite: number
        totalFavoritePercent: number
    }
    totalFavoriteApp: {
        totalFavoriteApp: number
        totalFavoriteAppPercent: number
    }
    totalFavoriteWeb: {
        totalFavoriteWeb: number
        totalFavoriteWebPercent: number
    }
    totalShare: {
        totalShare: number
        totalSharePercent: number
    }
    totalShareApp: {
        totalShareApp: number
        totalShareAppPercent: number
    }
    totalShareWeb: {
        totalShareWeb: number
        totalShareWebPercent: number
    }
    totalAddToCart: {
        totalAddToCart: number
        totalAddToCartPercent: number
    }
    totalAddToCartApp: {
        totalAddToCartApp: number
        totalAddToCartAppPercent: number
    }
    totalAddToCartWeb: {
        totalAddToCartWeb: number
        totalAddToCartWebPercent: number
    }
    totalAddToCartRatio: {
        totalAddToCartRatio: number
        totalAddToCartRatioPercent: number
    }
    totalRevenue: {
        revenue: number
        revenuePercent: number
    }
    totalAuction: {
        totalAuction: number,
        totalAuctionPercent: number
    }
    totalAuctionSuccess: {
        totalAuctionSuccess: number
        totalAuctionSuccessPercent: number
    }
    totalAuctionRatio: {
        totalAuctionRatio: number
        totalAuctionRatioPercent: number
    }
    totalParticipants: {
        totalParticipants: number
        totalParticipantsPercent: number
    }
}

export interface IResProductOverviewInteractive {
    productNormal: IItemProductOverviewInteractive
    productAuction: IItemProductOverviewInteractive
}

export interface INodeChart {
    key: string
    value: number
}

export interface IResDataChartAccess {
    totalView: INodeChart []
    totalViewWeb: INodeChart []
    totalViewApp: INodeChart []
    totalVisit: INodeChart []
    totalVisitWeb: INodeChart []
    totalVisitApp: INodeChart []
    totalOnSite: INodeChart []
    totalBounceRate: INodeChart []
}

export interface IResDataChartInteractive {
    totalFavorites: INodeChart []
    totalFavoriteApps: INodeChart []
    totalFavoriteWebs: INodeChart []
    totalShares: INodeChart []
    totalShareApps: INodeChart []
    totalShareWebs: INodeChart []
    totalAddToCarts: INodeChart []
    totalAddToCartApps: INodeChart []
    totalAddToCartWebs: INodeChart []
    totalAddToCartRatios: INodeChart []
    totalRevenues: INodeChart []
    totalAuctions: INodeChart []
    totalAuctionSuccesses: INodeChart []
    totalAuctionRatios: INodeChart []
    totalParticipants: INodeChart []
}

export interface IResProductRanking {
    products: {name: string, imageUrl: string, price: number, salePrice: number, value: number} []
}

export interface IResExportExcelProductEfficiency{
    "products":{
        "key": string,
        "value": {
            "productNormal": {
                "totalView": {
                    "totalView": 0,
                    "totalViewPercent": 0
                },
                "totalViewApp": {
                    "totalViewApp": 0,
                    "totalViewAppPercent": 0
                },
                "totalViewWeb": {
                    "totalViewWeb": 0,
                    "totalViewWebPercent": 0
                },
                "totalVisit": {
                    "totalVisit": 0,
                    "totalVisitPercent": 0
                },
                "totalVisitApp": {
                    "totalVisitApp": 0,
                    "totalVisitAppPercent": 0
                },
                "totalVisitWeb": {
                    "totalVisitWeb": 0,
                    "totalVisitWebPercent": 0
                },
                "totalOnSite": {
                    "averageOnSite": string,
                    "averageOnSitePercent": 0
                },
                "totalBounceRate": {
                    "totalBounceRate": 0,
                    "totalBounceRatePercent": 0
                }
            },
            "productAuction": {
                "totalView": {
                    "totalView": 0,
                    "totalViewPercent": 0
                },
                "totalViewApp": {
                    "totalViewApp": 0,
                    "totalViewAppPercent": 0
                },
                "totalViewWeb": {
                    "totalViewWeb": 0,
                    "totalViewWebPercent": 0
                },
                "totalVisit": {
                    "totalVisit": 0,
                    "totalVisitPercent": 0
                },
                "totalVisitApp": {
                    "totalVisitApp": 0,
                    "totalVisitAppPercent": 0
                },
                "totalVisitWeb": {
                    "totalVisitWeb": 0,
                    "totalVisitWebPercent": 0
                },
                "totalOnSite": {
                    "averageOnSite": string,
                    "averageOnSitePercent": 0
                },
                "totalBounceRate": {
                    "totalBounceRate": 0,
                    "totalBounceRatePercent": 0
                }
            }
        }
    }[]
}

export interface IResExportExcelProductInterEfficiency{
    "products":{
        "key": "2021-05-29",
        "value": {
            "productNormal": {
                "totalFavorite": {
                    "totalFavorite": 0,
                    "totalFavoritePercent": 0
                },
                "totalFavoriteApp": {
                    "totalFavoriteApp": 0,
                    "totalFavoriteAppPercent": 0
                },
                "totalFavoriteWeb": {
                    "totalFavoriteWeb": 0,
                    "totalFavoriteWebPercent": 0
                },
                "totalShare": {
                    "totalShare": 0,
                    "totalSharePercent": 0
                },
                "totalShareApp": {
                    "totalShareApp": 0,
                    "totalShareAppPercent": 0
                },
                "totalShareWeb": {
                    "totalShareWeb": 0,
                    "totalShareWebPercent": 0
                },
                "totalAddToCart": {
                    "totalAddToCart": 0,
                    "totalAddToCartPercent": 0
                },
                "totalAddToCartApp": {
                    "totalAddToCartApp": 0,
                    "totalAddToCartAppPercent": 0
                },
                "totalAddToCartWeb": {
                    "totalAddToCartWeb": 0,
                    "totalAddToCartWebPercent": 0
                },
                "totalAddToCartRatio": {
                    "totalAddToCartRatio": 0,
                    "totalAddToCartRatioPercent": 0
                },
                "totalRevenue": {
                    "revenue": 0,
                    "revenuePercent": 0
                },
                "totalAuction": {
                    "totalAuction": 0,
                    "totalAuctionPercent": 0
                },
                "totalAuctionSuccess": {
                    "totalAuctionSuccess": 0,
                    "totalAuctionSuccessPercent": 0
                },
                "totalAuctionRatio": {
                    "totalAuctionRatio": 0,
                    "totalAuctionRatioPercent": 0
                },
                "totalParticipants": {
                    "totalParticipants": 0,
                    "totalParticipantsPercent": 0
                }
            },
            "productAuction": {
                "totalFavorite": {
                    "totalFavorite": 0,
                    "totalFavoritePercent": 0
                },
                "totalFavoriteApp": {
                    "totalFavoriteApp": 0,
                    "totalFavoriteAppPercent": 0
                },
                "totalFavoriteWeb": {
                    "totalFavoriteWeb": 0,
                    "totalFavoriteWebPercent": 0
                },
                "totalShare": {
                    "totalShare": 0,
                    "totalSharePercent": 0
                },
                "totalShareApp": {
                    "totalShareApp": 0,
                    "totalShareAppPercent": 0
                },
                "totalShareWeb": {
                    "totalShareWeb": 0,
                    "totalShareWebPercent": 0
                },
                "totalAddToCart": {
                    "totalAddToCart": 0,
                    "totalAddToCartPercent": 0
                },
                "totalAddToCartApp": {
                    "totalAddToCartApp": 0,
                    "totalAddToCartAppPercent": 0
                },
                "totalAddToCartWeb": {
                    "totalAddToCartWeb": 0,
                    "totalAddToCartWebPercent": 0
                },
                "totalAddToCartRatio": {
                    "totalAddToCartRatio": 0,
                    "totalAddToCartRatioPercent": 0
                },
                "totalRevenue": {
                    "revenue": 0,
                    "revenuePercent": 0
                },
                "totalAuction": {
                    "totalAuction": 0,
                    "totalAuctionPercent": 0
                },
                "totalAuctionSuccess": {
                    "totalAuctionSuccess": 0,
                    "totalAuctionSuccessPercent": 0
                },
                "totalAuctionRatio": {
                    "totalAuctionRatio": 0,
                    "totalAuctionRatioPercent": 0
                },
                "totalParticipants": {
                    "totalParticipants": 0,
                    "totalParticipantsPercent": 0
                }
            }
        }
    }[]
}

export interface IResExportExcelDetailAccessProductEfficiency{
    "totalValue": {
        "totalView": number,
        "totalViewApp": number,
        "totalViewWeb": number,
        "totalVisit": number,
        "totalVisitApp": number,
        "totalVisitWeb": number,
        "totalBounceRate": number,
        "averageOnSite": string
    },
    "products": [
        {
            "id": number,
            "name": string,
            "totalView": number,
            "productViewApp": number,
            "productViewWeb": number,
            "totalVisit": number,
            "productVisitApp": number,
            "productVisitWeb": number,
            "totalBounceRate": number,
            "averageOnSite": string
        },
    ],
    "metadata": IMetadata
}

export interface IResExportExcelDetailInterProductEfficiency{
    "totalValue": {
        "totalFavorites": number,
        "totalFavoriteWeb": number,
        "totalFavoriteApp": number,
        "totalShare": number,
        "totalShareWeb": number,
        "totalShareApp": number,
        "totalAddToCart": number,
        "totalAddToCartWeb": number,
        "totalAddToCartApp": number,
        "totalAddToCartRatio": number,
        "totalRevenue": number,
        "totalAuction": number,
        "totalParticipants": number,
        "totalAuctionSuccess": number,
        "totalAuctionRatio": number
    },
    "productInteraction":
        {
            "id": number,
            "name": string,
            "totalFavorites": number,
            "productFavoriteWeb": number,
            "productFavoriteApp": number,
            "totalShare": number,
            "productShareWeb": number,
            "productShareApp": number,
            "totalAddToCart": number,
            "productAddToCartApp": number,
            "productAddToCartWeb": number,
            "addToCartRatio": number,
            "totalRevenue": number,
            "totalAuction": number,
            "totalParticipants": number,
            "totalAuctionSuccess": number,
            "totalAuctionRatio": number
        }[]
}
