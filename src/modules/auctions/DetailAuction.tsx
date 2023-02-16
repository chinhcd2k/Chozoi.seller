import React from "react";
import {BreadcrumbsComponent, BreadcrumbsService} from "../../common/breadcrumbs";
import {store as HomeStore} from "../home";
import TemplateFormAuction from "./template";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {BaseService} from "../../common/services/BaseService";
import {store as ProfileStore} from "../profile/stores/ProfileStore";
import {IResProfile} from "../../api/auth/interfaces/response"

export interface IResponseAuction {
  id: number
  name: string
  description: string
  freeShipStatus: boolean
  category: {
    id: number
    name: string
    level: number
    parentId: number | null }
  packingSize: [number, number, number]
  weight: number
  type: "AUCTION" | "AUCTION_SALE" | "AUCTION_FLASH_BID" | "AUCTION_INVERSE"|"AUCTION_GROUP"
  condition: "NEW" | "USED"
  state: 'DRAFT' | 'PENDING' | 'REJECT' | 'READY' | 'PUBLIC'
  attributes: {
    id: number
    name: string
    valueId: number
    value: string
  }[]
  auction: {
    buyNowPrice: number
    priceStep: number
    startPrice: number
    timeDuration: number
    state: "BIDING" | "WAITING" | "STOPPED"
    timeStart: string | null
    timeEnd: string | null
    result: {
      currentPrice: number,
      bidsCount: number
    }
    expectedPrice: number | null
    expectedMaxPrice: number | null,
    originalPrice: number
  }
  expectedPrice: number | null
  expectedMaxPrice: number | null
  images: {
    id: number
    imageUrl: string
    sort: number
  }[]
  variants: [{
    id: number
    attributes: { name: string, value: number | string }[]
    price: number
    salePrice: number
    sku: string
    imageId: number | null
    inventory: {
      id: number
      inQuantity: number
      remainingQuantity: number
    }
  }]
  categories: {
    id: number
    name: string
    level: number
    parentId: number | null
  }[]
  descriptionPickingOut: string
  descriptionPinkingOut: string
  isQuantityLimited: boolean
  autoPublic: boolean
  reportIssues: { description: string, solution: string } | null
  isPublic: boolean
  imageVariants: {
    image65: string
  }[]
  shop: {
    id: number,
    name:string
  },
  privateCode: string,
  privateDescription: string
}

@observer
export default class DetailAuction extends React.Component<any, any> {
  @observable auctionDetail?: IResponseAuction;

  // Life cycel
  async componentWillMount() {
    BreadcrumbsService.loadBreadcrumbs([{title: 'Chi tiết đấu giá'}]);
    HomeStore.menuActive = [3, 1];

    const id: number = parseInt(this.props.match.params.id);
    if (!isNaN(id)) {
      const service = new BaseService();
      const response = await service.getRequest(`/v1/shops/${(ProfileStore.profile as IResProfile).shopId}/products/${id}`, true);
      if (response.status === 200) {
        this.auctionDetail = response.body;
      } else service.pushNotificationRequestError(response);
    }
  }

  render() {
    if (this.auctionDetail)
      return <>
        <div className="container">
          <div className="row">
            <div className="col-xs-12"><h2 className="mt-0">{this.auctionDetail.name}</h2></div>
            <div className="col-xs-12"><BreadcrumbsComponent/></div>
          </div>
        </div>
        <TemplateFormAuction
          type={"DETAIL"}
          history={this.props.history}
          auctionDetail={this.auctionDetail}
        />;
      </>
    else return null;
  }
}
