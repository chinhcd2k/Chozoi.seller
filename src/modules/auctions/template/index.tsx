import React from "react";
import "./style.scss";
import {observer} from "mobx-react";
import InfomationBasic from "./components/InfomationBasic";
import Gallery from "./components/Gallery";
import PriceAndStore from "./components/PriceAndStore";
import Shipping from "./components/Shipping";
import {PopupGuide, PopupGuideAuctionGroup, PopupGuideReverseAuction} from "./components/PopupGuide";
import FreeShipping from "./components/FreeShipping";
import TimeDuration from "./components/TimeDuration";
import {store as HomeStore} from "../../home";
import Status from "./components/Status";
import {observable} from "mobx";
import {store as ProfileStore} from "../../profile/stores/ProfileStore";
import {BaseService} from "../../../common/services/BaseService";
import {
  store as ShopProfileStore,
  store as ShopStore
} from "../../shop/stores/ShopInfomationStore";
import {service as ShopService} from "../../shop/ShopService";
import Alert from "./components/Alert";
import {uploadImage} from "../../../common/functions/UpfileFunc";
import {notify} from "../../../common/notify/NotifyService";
import {IResponseAuction} from "../DetailAuction";
import ActionForm from "./components/ActionForm";
import ActionHeader from "./components/ActionHeader";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {css, Global} from "@emotion/core";
import PopupNewAddress from "../../shop/address/components/PopupNewAddress";
import KeyPrivate from "./components/keyPrivate";
import {IResProfile} from "../../../api/auth/interfaces/response";
import {IResShopProfile} from "../../../api/shop/interfaces/response";
import {store as managerProductStore} from "../../products/manager-product/stores/ManagerProductStore";
import {AppGlobal} from "../../../AppGlobal";

export interface IRequestCreateAuction {
  name: string,
  attributes: { value_id: number }[],
  packing_size: number[],
  images: { sort: number, image_url: string }[],
  videos: string[],
  description: string,
  description_pickingout: string,
  category: { id: number },
  shipping_partner_ids: number[],
  type: "AUCTION" | "AUCTION_SALE" | "AUCTION_FLASH_BID" | "AUCTION_GROUP" | "AUCTION_INVERSE",
  weight: number,
  is_pending: boolean,
  auto_public: boolean,
  is_quantity_limited: boolean,
  condition: "NEW" | "USED",
  auction: {
    start_price: number,
    price_step: number,
    buy_now_price: number | null,
    time_duration: number
    expected_price: number
    // expected_max_price: number
    original_price: number
  }
  variants: {
    attributes: { name: string, value: string | number }[],
    price: number | null,
    sale_price: number,
    sku: string,
    inventory: {
      in_quantity: number,
    }
  }[]
  free_ship_status: boolean,
  private_code: string | null,
  private_description: string | null
}

export interface ICategories {
  id: number
  name: string
  level: number
  parentId: number | null
}

interface ITemplateFormAuctionProps {
  type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK' | 'CREATE_F_N'
  history: {
    push: (path: string) => any
    goBack: () => any
  }
  auctionDetail?: IResponseAuction
}

@observer
export default class TemplateFormAuction extends React.Component<ITemplateFormAuctionProps, object> {
  private service = new BaseService();
  private InfomationRef = React.createRef<InfomationBasic>();
  private GalleryRef = React.createRef<Gallery>();
  private PriceAndStoreRef = React.createRef<PriceAndStore>();
  private ShippingRef = React.createRef<Shipping>();
  private TimeDurationRef = React.createRef<TimeDuration>();
  private StatusRef = React.createRef<Status>();
  private FreeShippingRef = React.createRef<FreeShipping>();
  private KeyPrivateRef = React.createRef<KeyPrivate>();

  @observable warringVerify: boolean | undefined = undefined;
  @observable disabledSubmit: boolean = false;
  @observable auctionType?: 'NORMAL' | 'FLASH' | 'AUCTION_INVERSE' | 'AUCTION_GROUP';
  @observable dataCategories: ICategories[] = [];

  constructor(props: ITemplateFormAuctionProps) {
    super(props);
    HomeStore.isShowBreadcrumbs = false;
  }

  private async onListenerAction(type: 'DRAFT' | 'CREATE' | 'UPDATE' | 'REPLAY_QUICK') {
    const InfomationRef = this.InfomationRef.current as InfomationBasic;
    const GalleryRef = this.GalleryRef.current as Gallery;
    const PriceAndStoreRef = this.PriceAndStoreRef.current as PriceAndStore;
    const ShippingRef = this.ShippingRef.current as Shipping;
    const TimeDurationRef = this.TimeDurationRef.current as TimeDuration;
    const StatusRef = this.StatusRef.current as Status;
    const FreeShippingRef = this.FreeShippingRef.current as FreeShipping;
    const KeyPrivateRef = this.KeyPrivateRef.current;

    let validate = InfomationRef.hasValidate();
    if (validate) validate = GalleryRef.hasValidate();
    if (validate) validate = PriceAndStoreRef.hasValidate();
    if (validate) validate = ShippingRef.hasValidate();
    if (validate) validate = TimeDurationRef.hasValidate();
    if (validate) validate = StatusRef.hasValidate();
    if (validate && KeyPrivateRef) validate = KeyPrivateRef.hasValidate();
    if (validate) {
      const request_body: IRequestCreateAuction = {
        name: InfomationRef.name,
        attributes: undefined as any,
        packing_size: ShippingRef.size.slice(),
        videos: [],
        description: InfomationRef.description,
        description_pickingout: InfomationRef.description_pickingout,
        category: {id: InfomationRef.category_id as number},
        shipping_partner_ids: undefined as any,
        type: undefined as any,
        weight: ShippingRef.weight,
        is_pending: undefined as any,
        auto_public: StatusRef.autoPublic as boolean,
        is_quantity_limited: true,
        condition: InfomationRef.condition as ('NEW' | 'USED'),
        auction: undefined as any,
        variants: undefined as any,
        free_ship_status: FreeShippingRef.freeShip,
        images: undefined as any,
        private_code: null,
        private_description: null
      }

      if (KeyPrivateRef && KeyPrivateRef.statusBtnKeyPrivate) {
        request_body.private_code = KeyPrivateRef.keyPrivateRef.current && KeyPrivateRef.keyPrivateRef.current.value;
        request_body.private_description = KeyPrivateRef.descriptionRef.current && KeyPrivateRef.descriptionRef.current.value;
      }

      request_body.attributes = InfomationRef.listProperty.reduce((previousValue: { value_id: number }[], currentValue) => {
        if (currentValue.selectedId) {
          previousValue.push({value_id: currentValue.selectedId});
        }
        return previousValue;
      }, []); // set request body attributes

      request_body.shipping_partner_ids = ShippingRef.listShipping.reduce((previousValue: number[], currentValue) => {
        previousValue.push(currentValue.id);
        return previousValue;
      }, []); // set request body shipping_partner_ids

      // set request body type
      if (PriceAndStoreRef.type === "FLASH") request_body.type = "AUCTION_FLASH_BID";
      else if (PriceAndStoreRef.isBuyNow) request_body.type = "AUCTION_SALE";
      /*them dau gia nguoc*/
      else if (PriceAndStoreRef.type === "AUCTION_INVERSE") request_body.type = "AUCTION_INVERSE"
      else if (PriceAndStoreRef.type === "AUCTION_GROUP") request_body.type = "AUCTION_GROUP";
      else request_body.type = "AUCTION";
      let buyNowPrice: number = 0
      let costPrice: number = 0
      if (PriceAndStoreRef.type === "AUCTION_GROUP") {
        buyNowPrice = PriceAndStoreRef.marketPrice
        costPrice = PriceAndStoreRef.costGroupPrice
      } else if (PriceAndStoreRef.type === "AUCTION_INVERSE") {
        buyNowPrice = PriceAndStoreRef.listedPrice
        costPrice = PriceAndStoreRef.costPrice
      } else {
        buyNowPrice = PriceAndStoreRef.buyNowPrice
        costPrice = 0
      }
      // set request body auction
      request_body.auction = {
        start_price: PriceAndStoreRef.startPrice,
        price_step: PriceAndStoreRef.priceStep,
        buy_now_price: buyNowPrice,
        time_duration: TimeDurationRef.selectValue === "other" ? TimeDurationRef.value : (TimeDurationRef.selectValue as number),
        expected_price: PriceAndStoreRef.betweenPrice[0],
        // expected_max_price: PriceAndStoreRef.betweenPrice[1],
        original_price: costPrice,
      }
      if (PriceAndStoreRef.type !== "FLASH") {
        delete request_body.auction.expected_price;
        // delete request_body.auction.expected_max_price;
      }
      let inQuantity: number = 1
      if (PriceAndStoreRef.type === "AUCTION_GROUP") {
        inQuantity = PriceAndStoreRef.amount
      } else if (PriceAndStoreRef.type === "FLASH") {
        inQuantity = PriceAndStoreRef.quantiy
      } else {
        inQuantity = 1
      }
      request_body.variants = [{
        attributes: [{name: "", value: ""}],
        price: 0,
        sale_price: 0,
        sku: "",
        inventory: {
          in_quantity: inQuantity
        }
      }]; // set request body variants

      // set request body image
      const images = GalleryRef.listImage.reduce((previousValue: any[], currentValue) => {
        const data = {
          id: currentValue.id,
          sort: currentValue.sort,
          image_url: currentValue.src,
          file: currentValue.file ? currentValue.file : undefined
        };
        !data.id && delete data.id;
        !data.file && delete data.file;
        previousValue.push(data);
        return previousValue;
      }, []);
      const asynUpload: Promise<{ url: string, sort: number } | null>[] = [];
      images.map(value => {
        if (isNaN(parseInt(value.id + '')) && value.file) {
          asynUpload.push(new Promise<{ url: string, sort: number } | null>(resolve => {
            uploadImage(value.file as File, "uploadProduct")
              .then((response: any) => resolve({url: response.url, sort: value.sort}))
              .catch(e => resolve(null));
          }));
        }
        return true;
      });
      await Promise.all(asynUpload).then(response => {
        images.map(value => value.file && response.map(value1 => {
          if (value1 && value.sort === value1.sort) {
            value.image_url = value1.url;
            delete value.file;
          }
          return value1;
        }))
      });
      request_body.images = images;

      // Send Request to Server
      this.disabledSubmit = true;
      const request_timeout = setTimeout(() => this.disabledSubmit = false, 30000);
      const shopId = (ProfileStore.profile as IResProfile).shopId;
      if (type === "DRAFT" || type === "CREATE") {
        if (!ShopProfileStore.hasContact()) {
          notify.show("Vui lòng thêm địa chỉ Cửa hàng", "error");
          PopupNewAddress.show();
          return;
        } else {
          request_body.is_pending = type !== "DRAFT";
          const response = await this.service.postRequest(`/v1/shops/${shopId}/products`, request_body, true);
          clearTimeout(request_timeout);
          if (response.status === 200) {
            this.disabledSubmit = false;
            notify.show('Thao tác thực hiện thành công', "success");
            this.props.history.push(`/home/auction/detail/${response.body.id}`);
            if (ShopStore.shopStats && !ShopStore.shopStats.countProduct)
              ShopStore.shopStats.countProduct = 1;
          } else {
            this.disabledSubmit = false;
            this.service.pushNotificationRequestError(response);
          }
        }
      } //
      else if (type === "UPDATE") {
        request_body.is_pending = true;
        const response = await this.service.putRequest(`/v1/shops/${shopId}/products/${(this.props.auctionDetail as IResponseAuction).id}`, request_body, true);
        clearTimeout(request_timeout);
        if (response.status === 200) {
          this.disabledSubmit = false;
          notify.show('Thao tác thực hiện thành công', "success");
          BreadcrumbsService.loadBreadcrumbs([{title: request_body.name}]);
        } else {
          this.disabledSubmit = false;
          this.service.pushNotificationRequestError(response);
        }
      } //
      else if (type === "REPLAY_QUICK") {
        const request_body_quick_replay = {
          start_price: request_body.auction.start_price,
          price_step: request_body.auction.price_step,
          duration_time: request_body.auction.time_duration,
          buy_now_Price: request_body.auction.buy_now_price,
          original_Price:request_body.auction.original_price,
          expected_price: request_body.auction.expected_price,
          // original_Price: request_body.auction.original_price,
          // expected_max_price: request_body.auction.expected_max_price,
          is_public: true,
          in_quantity: request_body.variants[0].inventory.in_quantity,
          private_code: request_body.private_code,
          private_description: request_body.private_description,
        };
        if (PriceAndStoreRef.type !== "FLASH") {
          delete request_body_quick_replay.expected_price;
          // delete request_body_quick_replay.expected_max_price;
        }
        if (!KeyPrivateRef || !KeyPrivateRef.statusBtnKeyPrivate) {
          delete request_body_quick_replay.private_code;
          delete request_body_quick_replay.private_description;
        }
        const response = await this.service.putRequest(`/v1/shops/${shopId}/products/${(this.props.auctionDetail as IResponseAuction).id}?collection=re_auction`, request_body_quick_replay);
        clearTimeout(request_timeout)
        if (response.status === 200) {
          this.disabledSubmit = false;
          notify.show('Tạo đấu giá lại thành công!', "success");
          this.props.history.push(`/home/auction/detail/${(this.props.auctionDetail as IResponseAuction).id}`);
        } else {
          this.disabledSubmit = false;
          this.service.pushNotificationRequestError(response);
        }
      } //
      else {
        clearTimeout(request_timeout);
        this.disabledSubmit = false;
        notify.show('Chức năng đang xây dựng', "warning");
      }
    }
  } //

  protected handlerOnChangeAuctionType(type: 'NORMAL' | 'FLASH' | 'AUCTION_INVERSE' | 'AUCTION_GROUP') {
    this.auctionType = type;
    (this.TimeDurationRef.current as TimeDuration).changeAuctionType(type);
  }
  protected renderActionTopBar() {
    const style = css`{
      position: absolute;
      background-color: white;
      left: 0;
      right: 0;
      box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);

      div.container {
        height: 60px;

        & > div {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 100%;
        }
      }
    }`;
    if (this.props.type === "UPDATE" || this.props.type === "REPLAY_QUICK")
      HomeStore.actionNavbar = <div css={style} id="action-navbar-from-auction">
        <div className="container">
          <div>
            {this.props.type === "UPDATE" &&
            <button className="btn btn-primary mr-3"
                    key={'update'}
                    disabled={this.disabledSubmit}
                    onClick={() => this.onListenerAction("UPDATE")}>Cập nhật
            </button>}
            {this.props.type === "REPLAY_QUICK" &&
            <button className="btn btn-primary mr-3"
                    key={'update'}
                    disabled={this.disabledSubmit}
                    onClick={() => this.onListenerAction("REPLAY_QUICK")}>Lưu
            </button>}
            <button className="btn btn-danger" key={'cancer'}
                    onClick={() => this.props.history.goBack()}>Hủy bỏ
            </button>
          </div>
        </div>
      </div>;
    else return null;
  }

  protected setStoreTemplateComponents() {
    const InfomationRef = this.InfomationRef.current as InfomationBasic;
    const GalleryRef = this.GalleryRef.current as Gallery;
    const PriceAndStoreRef = this.PriceAndStoreRef.current as PriceAndStore;
    const ShippingRef = this.ShippingRef.current as Shipping;
    const TimeDurationRef = this.TimeDurationRef.current as TimeDuration;
    const StatusRef = this.StatusRef.current as Status;
    const FreeShippingRef = this.FreeShippingRef.current as FreeShipping;

    const detailAuction = this.props.auctionDetail as IResponseAuction;
    // Set store Infomation
    InfomationRef.name = detailAuction.name;
    InfomationRef.condition = detailAuction.condition;
    InfomationRef.description = detailAuction.description;
    InfomationRef.description_pickingout = detailAuction.descriptionPickingOut;
    InfomationRef.attributes = detailAuction.attributes;
    InfomationRef.setStoreCategories(detailAuction.categories).finally();
    // Set store Gallery
    GalleryRef.setImageStore(detailAuction.images);
    // Set store Price and store
    // PriceAndStoreRef.type = detailAuction.type === "AUCTION_FLASH_BID" ? "FLASH" : "NORMAL";
    if (detailAuction.type === "AUCTION_FLASH_BID") {
      PriceAndStoreRef.type = "FLASH"
    } else {
      if (detailAuction.type === "AUCTION_INVERSE") {
        PriceAndStoreRef.type = "AUCTION_INVERSE"
      } else {
        if (detailAuction.type === "AUCTION_GROUP") {
          PriceAndStoreRef.type = "AUCTION_GROUP"
        } else PriceAndStoreRef.type = "NORMAL"
      }
    }

    this.auctionType = PriceAndStoreRef.type;
    if (this.KeyPrivateRef.current && (this.props.type === "DETAIL" || this.props.type === "UPDATE")) {
      this.KeyPrivateRef.current.valueDescriptionDisable = detailAuction.privateDescription;
      this.KeyPrivateRef.current.valueKeyPrivateDisable = detailAuction.privateCode;
    }
    PriceAndStoreRef.startPrice = detailAuction.auction.startPrice;
    PriceAndStoreRef.priceStep = detailAuction.auction.priceStep;
    PriceAndStoreRef.listedPrice = detailAuction.auction.buyNowPrice;
    PriceAndStoreRef.costPrice = detailAuction.auction.originalPrice;
    PriceAndStoreRef.costGroupPrice = detailAuction.auction.originalPrice
    PriceAndStoreRef.amount = detailAuction.variants[0].inventory.inQuantity
    PriceAndStoreRef.marketPrice = detailAuction.auction.buyNowPrice
    /*can them cua dau gai mua chung tai day*/
    if (detailAuction.auction.buyNowPrice > 0) {
      PriceAndStoreRef.isBuyNow = true;
      PriceAndStoreRef.buyNowPrice = detailAuction.auction.buyNowPrice;
    }
    if (detailAuction.type === "AUCTION_FLASH_BID") {
      PriceAndStoreRef.quantiy = detailAuction.variants[0].inventory.inQuantity;
      PriceAndStoreRef.betweenPrice = [detailAuction.auction.expectedPrice || 0, detailAuction.auction.expectedMaxPrice || 0];
    }
    // Set store shipping
    ShippingRef.weight = detailAuction.weight;
    ShippingRef.size = detailAuction.packingSize;
    // Set store Freeship
    FreeShippingRef.freeShip = detailAuction.freeShipStatus;
    // Set store Timeduration
    TimeDurationRef.type = detailAuction.type === "AUCTION_FLASH_BID" ? "FLASH" : "NORMAL";
    TimeDurationRef.setTimeDurationStore(detailAuction.auction.timeDuration, TimeDurationRef.type);
    // Set store Status
    StatusRef.autoPublic = detailAuction.autoPublic;
  }

  protected findCategories(dataLv3: ICategories, index: number) {
    this.dataCategories.push(dataLv3)
    let index1 = index
    if (index1 >= 1) {
      AppGlobal.categoriesRes.map((value, i) => {
        if (value.level === index) {
          if (value.id === dataLv3.parentId) {
            this.findCategories(value, 1)
          }
        }
      })
    }
    if (dataLv3.level === 1) {
      return false
    }
  }

  protected async setStoreTemplateCreateAuctionComponents() {
    const InfomationRef = this.InfomationRef.current as InfomationBasic;
    const GalleryRef = this.GalleryRef.current as Gallery;
    const ShippingRef = this.ShippingRef.current as Shipping;

    // Set store Infomation
    if (managerProductStore.dataCreateAuction) {
      const dataLv3: ICategories = {
        id: managerProductStore.dataCreateAuction.category.id,
        name: managerProductStore.dataCreateAuction.category.name,
        level: 3,
        parentId: managerProductStore.dataCreateAuction.category.parentId
      }
      await this.findCategories(dataLv3, 2)
      InfomationRef.name = managerProductStore.dataCreateAuction.name;
      InfomationRef.condition = managerProductStore.dataCreateAuction.condition;
      InfomationRef.description = managerProductStore.dataCreateAuction.description;
      InfomationRef.description_pickingout = managerProductStore.dataCreateAuction.descriptionPickingOut ? managerProductStore.dataCreateAuction.descriptionPickingOut : managerProductStore.dataCreateAuction.descriptionPinkingOut;
      InfomationRef.attributes = managerProductStore.dataCreateAuction.attributes;
      InfomationRef.setStoreCategories(this.dataCategories).finally();
      // Set store Gallery
      GalleryRef.setImageStore(managerProductStore.dataCreateAuction.images);
      // Set store shipping
      ShippingRef.weight = managerProductStore.dataCreateAuction.weight;
      ShippingRef.size = managerProductStore.dataCreateAuction.packingSize;
    }
  }

  // Life cycle

  async componentDidMount() {
    HomeStore.pageHeaderClass = "container";
    const shopData = ShopProfileStore.shopProfile as IResShopProfile;
    const response = await ShopService.getInformationAdvanced(shopData.id, shopData.shopType);
    if (response.status === 200) this.warringVerify = response.body.state !== "VERIFIED";
    else this.warringVerify = true;
    this.renderActionTopBar();
    if (/^(DETAIL|UPDATE|REPLAY|REPLAY_QUICK)$/.test(this.props.type) && this.props.auctionDetail) {
      this.setStoreTemplateComponents();
    }
    if (/^(CREATE_F_N)$/.test(this.props.type)) {
      this.setStoreTemplateCreateAuctionComponents()
    }
    if (/^(CREATE|UPDATE|REPLAY|REPLAY_QUICK)$/.test(this.props.type)) window.onbeforeunload = () => "";
    if (this.props.type === "REPLAY_QUICK") {
      notify.show('Bạn có thể thay đổi các mục: "Giá và kho hàng", "Thời gian diễn ra" và "Hiển thị ngay". Sau khi lưu sản phẩm sẽ được đấu giá ngay mà không cần đợi duyệt.', "warning", 60);
      const htmlInputTag: HTMLInputElement | null = document.querySelector('div#card-price-store input');
      htmlInputTag && htmlInputTag.focus();
    } //
    else if (this.props.type === "REPLAY")
      notify.show('Sản phẩm của bạn sẽ phải đợi Chozoi kiểm duyệt trước khi lên sàn đấu giá.', "warning", 60);

    const PriceAndStoreRef = this.PriceAndStoreRef.current as PriceAndStore;
    if (PriceAndStoreRef) {
      this.auctionType = PriceAndStoreRef.type;
    }
  }
  componentWillUnmount() {
    HomeStore.pageHeaderClass = "container-fuild";
    HomeStore.actionNavbar = null;
    window.onbeforeunload = null;
    HomeStore.isShowBreadcrumbs = true;
  }
  render() {
    return <div id="template-form-auction">
      <div className="container">
        {/*Thông báo sản phảm bị từ chối*/}
        <div className="row"><Alert type={this.props.type} detailAuction={this.props.auctionDetail}/></div>
        {/*Chuyển hướng trang*/}
        <div className="row">
          <ActionHeader type={this.props.type} auctionDetail={this.props.auctionDetail}/>
        </div>
        {/*Form nhập dữ liệu*/}
        <div className="row">
          <div className="col-xs-8">
            {/*Thông tin cơ bản*/}
            <div className="card" id="card-information-basic">
              <div className="card-body"><InfomationBasic type={this.props.type}
                                                          ref={this.InfomationRef}/></div>
            </div>
            {/*Ảnh sản phẩm*/}
            <div className="card" id="card-gallery">
              <div className="card-body"><Gallery type={this.props.type} ref={this.GalleryRef}/></div>
            </div>
            {/*Giá và kho hàng*/}
            <div className="card" id="card-price-store">
              <div className="card-body">
                <PriceAndStore
                  ref={this.PriceAndStoreRef}
                  type={this.props.type}
                  onChangeAuctionType={type => this.handlerOnChangeAuctionType(type)}
                /></div>
            </div>
            {/*Vận chuyển*/}
            <div className="card" id="card-shipping">
              <div className="card-body"><Shipping type={this.props.type} ref={this.ShippingRef}/></div>
            </div>
            {/*Miễn phí vận chuyển*/}
            <div className="card freeship">
              <FreeShipping type={this.props.type} ref={this.FreeShippingRef}/>
            </div>
          </div>
          <div className="col-xs-4">
            {/*Thời gian diễn ra*/}
            <div className="card" id="card-time-duration">
              <div className="card-body"><TimeDuration type={this.props.type} ref={this.TimeDurationRef}/>
              </div>
            </div>
            {/*Hiển thị*/}
            <div className="card" id="card-public">
              <Status type={this.props.type} ref={this.StatusRef}/>
            </div>
          </div>
        </div>
        {/*key private*/}
        {
          this.auctionType === "NORMAL" && <KeyPrivate type={this.props.type} ref={this.KeyPrivateRef}/>
        }
        {/* Hành động */}
        <div className="row">
          <div className="col-xs-8 mt-5">
            <ActionForm type={this.props.type}
                        goBack={this.props.history.goBack}
                        OnSubmit={type => this.onListenerAction(type)}
                        disabled={this.disabledSubmit}
            />
          </div>
        </div>
      </div>
      {/* Popup giới thiệu về đấu giá nhanh*/}
      <PopupGuide/>
      <PopupGuideReverseAuction/>
      <PopupGuideAuctionGroup/>
    </div>;
  }
}
