interface IResShopProfile {
    "id": number,
    "name": string,
    "email": string,
    "contactName": string,
    "phoneNumber": string,
    "shopType": 'COMPANY' | 'NORMAL' | 'OFFICIAL_STORE' | "HOUSEHOLD",
    "description": string,
    "user": {
        "email": string,
        "id": number,
        "phoneNumber": string,
        "userRole": string,
        "loginType": string,
        "userState": string
    },
    "shopTag": string,
    "freeShipStatus": string,
    "sellShipping": boolean,
    "followType": string,
    "createdAt": number,
    "passwordRequire": boolean,
    imgAvatarUrl: string | null,
    imgDescriptionUrls: string[],
    imgCoverUrl: string | null,
    status:'ON'|'OFF'
}

interface IResShopStats {
    "averageRating": number,
    "totalRating": number,

    "positiveRating": number,
    "oneMonth": {
        "positive": number,
        "normal": number,
        "negative": number,
        "percent": number
    },
    "threeMonth": {
        "positive": number,
        "normal": number,
        "negative": number,
        "percent": number
    },
    "sixMonth": {
        "positive": number,
        "normal": number,
        "negative": number,
        "percent": number
    },
    "countSold": number,
    "countFollow": number,
    "countFavorite": number,
    "countProduct": number,
    "countOrder": number | null
    "sumRating": number | null
}

interface IInfoAdvancedNormal {
    name: string
    idCard: string
    state: "NON_VERIFIED" | "VERIFIED" | "WAIT_CONFIRMED" | "NONE" | "REJECT" | "CANCELED"
    frontPhotoIdCardUrl: string
    backPhotoIdCardUrl: string
}

interface IInfoAdvancedCompany {
    name: string
    taxCode: string
    businessOwnerName: string
    frontPhotoBusinessLicenseUrl: string
    backPhotoBusinessLicenseUrl: string
    state: "NON_VERIFIED" | "VERIFIED" | "WAIT_CONFIRMED" | "NONE" | "REJECT"
}

interface IInfoAdvancedNormalOfficialHousehold extends IInfoAdvancedNormal {
    addressBusinessLicense: string,
    businessOwnerName: string,
    taxCode: string,
    frontPhotoBusinessLicenseUrl: string,
    backPhotoBusinessLicenseUrl: string,
    officialStoreName: string,
    officialStoreBrand: string,
    officialStoreType: string,
    officialStoreLicenseImgs: string[]
}

export type {
    IResShopProfile,
    IResShopStats,
    IInfoAdvancedCompany,
    IInfoAdvancedNormalOfficialHousehold,
    IInfoAdvancedNormal,
}
