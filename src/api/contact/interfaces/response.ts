interface IResProvince {
    provinces: {
        provinceName: string
        id: number,
        sort: number
    }[]
}

interface IResDistrict {
    districts: {
        districtName: string
        id: number
    }[]
}

interface IResWard {
    wards: {
        id: number
        wardName: string
    }[]
}

interface IResShopContact {
    "id": number,
    "shopId": number,
    "name": string,
    "phoneNumber": string,
    "address": {
        "detailAddress": string,
        "province": {
            "id": any,
            "provinceName": string
        },
        "district": {
            "id": any
            "districtName": string
        },
        "ward": {
            "id": any
            "wardName": string
        }
    },
    "contactType": string,
    "isDefault": boolean
}

export type  {
    IResShopContact,
    IResDistrict,
    IResProvince,
    IResWard
}
