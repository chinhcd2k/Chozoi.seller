export interface IResProductAuction{
  auction: {
    buyNowPrice: number
    expectedMaxPrice: number|null
    expectedPrice: number|null
    id: number
    lastMinuteBidCount: number
    originalPrice: number
    phaseId: number
    priceAutoBid: number
    priceBid: number
    priceStep: number
    refusePayment: false
    result: {
      biddersCount: number
      bidsCount: number
      ceilingPrice: number
      currentPrice: number
      id: number
      winnerId: number
      winnerName: string
    }
    startPrice: number
    state: string
    timeDuration: number
    timeEnd: number
    timeStart: number
    typeBid: string
  }
  bidding: false
  category: {id: number, name: string, parentId: number}
  condition: string
  createdAt: number
  description:  string
  freeShipStatus: false
  id: number
  images: {
    id: number
    imageUrl: string
    sort:number
  }[]
  isLiked: false
  isQuantityLimited: true
  name: string
  price: number
  promotion: null
  remaining_quantity: number
  salePrice: number
  soldQuantity: number
  type: string

}
export interface IProduct {
  attributes: { "name": string, "valueId": number, "value": string }[];
  category: { "id": number, "name": string, "parentId": number };
  classifiers: { name: string; values: {}[] }[];
  commentsCount: number;
  description: string;
  freeShipStatus: boolean
  descriptionPickingout: string;
  id: number;
  images: { "id": number, "imageUrl": string }[];
  imageVariants: {
    image65: string,
    image140: string
    image160: string
    image180: string
    image350: string
    image600: string
    variantId: string
  }[];
  name: string;
  packingSize: [number, number, number];
  price: number;
  salePrice: number;
  quantity: number;
  quantityLimited: boolean;
  promotion: any;
  questionsCount: number;
  shippingPartnerIds: [number, number, number];
  shop: {
    id: 166,
    name: "hai nguyen thu",
    email: "test22@mailinator.com",
    contactName: "hai nguyen thu",
    phoneNumber: null,
    type: "NORMAL" | "OFFICIAL_STORE" | string
    provinces:
        {
          id: 24,
          provinceName: string
        }[],
    tag: "NORMAL" | "FAVOURITE" | "POSITIVE"
  },
  condition: "NEW" | "USED"
  type: string;
  soldQuantity: number;
  variants: {
    attributes: { name: string, value: string }[]
    price: number
    quantity: number
    sku: string
    id: number;
    salePrice: number;
    inventory: {
      id: number,
      initialQuantity: number,
      inQuantity: number,
      outQuantity: number,
      quantity: number;
    }
  }[];
  auction: {
    id: number,
    timeStart: number,
    timeEnd: number
    priceStep: number,
    startPrice: number,
    state: string,
    buyNowPrice: number,
    timeDuration: number
    phaseId: number
    result: {
      id: number,
      bidsCount: number,
      biddersCount: number,
      currentPrice: number,
      ceilingPrice: number
    }
  }
  stats: {
    id: number
    averageRating: number
    sumRating: number,
    countQuestion: number
    countReview:number
  }
}

