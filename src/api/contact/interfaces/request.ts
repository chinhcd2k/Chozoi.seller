interface IReqShopContact {
    warehouse: {
        detail_address: string,
        phone_number: string,
        province_id: number,
        district_id: number,
        ward_id: number,
        name: string
    },
    refund: {
        detail_address: string,
        phone_number: string,
        province_id: number,
        district_id: number,
        ward_id: number,
        name: string
    }
}

interface IReqContact {
    name: string
    numberPhone: string
    province: number
    district: number
    ward: number
    address?: string
}

export type {
    IReqContact,
    IReqShopContact
}
