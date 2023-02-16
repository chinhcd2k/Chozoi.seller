import {observable} from 'mobx';
import {IMetadata} from "../../api";
import {IDataTable} from "./components/TableData";
import {
  convertSecondsToHhmmss,
  getDataTableDetailAccess,
  getDataTableDetailInteractive,
  getDataTableProRank,
  getDataTableTabAccess,
  getDataTableTabInteractive, timeToSecond
} from "./service";
import {
  getDetailProductAccessExcel, getDetailProductInteractiveExcel,
  getProductInteractionExcel,
  getProductVisitExcel
} from "../../api/products-efficiency";
import {store as profileStore} from "../profile";
import {notify} from "../../common/notify/NotifyService";

export interface IRowTableAccess {
  key: number
  productName: { value: string, id: any }
  view: { value: number, percent: number }
  viewPC: { value: number, percent: number }
  viewApp: { value: number, percent: number }
  access: { value: number, percent: number }
  accessPC: { value: number, percent: number }
  accessApp: { value: number, percent: number }
  timeAvg: any
  exitPage: any
}

export interface IRowTableInteractive {
  key: number
  productName: { value: string, id: any }
  revenue: { value: number, percent: number }
  auction: { value: number, percent: number }
  peopleJoin: { value: number, percent: number }
  auctionSuccess: { value: number, percent: number }
  percentAucSuc: { value: number, percent: number }
  likePro: { value: number, percent: number }
  sharePro: { value: number, percent: number }
  addCart: number,
  percentAddCart: number
}

export interface ILineChart {
  label: string
  data: number []
  fill: boolean
  borderColor: string
}

export interface IChart {
  labels: string []
  datasets: ILineChart []
}

interface IExportOverviewAll extends IExportOverviewAuction {
  'Thêm giỏ hàng': any
  'Tỉ lệ thêm giỏ hàng': any
}

interface IExportOverviewNormal {
  'Ngày': any
  'Doanh thu': any
  'Yêu thích sản phẩm': any
  'Chia sẻ sản phẩm': any
  'Thêm giỏ hàng': any
  'Tỉ lệ thêm giỏ hàng': any
}

interface IExportOverviewAuction {
  'Ngày': any
  'Doanh thu': any
  'Lượt đấu giá': any
  'Người tham gia': any
  'Đấu giá thành công': any
  'Tỉ lệ đấu giá thành công': any
  'Yêu thích sản phẩm': any
  'Chia sẻ sản phẩm': any
}

interface IExportOverViewAccess {
  'Ngày': any
  'Lượt xem': any
  'Lượt xem máy tính': any
  'Lượt xem ứng dụng': any
  'Thời gian xem trung bình': any
  'Tỉ lệ thoát trang': any
  'Tổng lượt truy cập': any
  'Lượt truy cập máy tính': any
  'Lượt truy cập ứng dụng ': any

}

interface IExportDetailAccess {
  'Sản phẩm': any
  'Lượt xem': any
  'Lượt xem máy tính': any
  'Lượt xem ứng dụng': any
  'Lượt truy cập': any
  'Lượt truy cập máy tính': any
  'Lượt truy cập ứng dụng': any
  'Thời gian xem trung bình': any
  'Tỉ lệ thoát trang': any
}
interface IExportDetailInteractive {
  'Sản phẩm': any
  'Doanh thu': any
  'Lượt đấu giá': any
  'Người tham gia': any
  'Đấu giá thành công': any
  'Tỉ lệ đấu giá thành công': any
  'Thích sản phẩm': any
  'Chia sẻ sản phẩm': any
  'Thêm giỏ hàng': any
}

class Store {
  @observable statusLoading: boolean = false;
  @observable dataTableDetailAccess: IRowTableAccess[] = [];
  @observable dataTableDetailInteractive: IRowTableInteractive [] = [];
  @observable metadata: IMetadata = {total: 0, totalPage: 0, page: 0, size: 0}

  handleStaLoadChange = () => this.statusLoading = !this.statusLoading

  // DETAIL PRODUCT COMPONENT
  getDataDetail = async (type: 'ALL' | 'AUCTION' | 'NORMAL', dateStart: string, dateEnd: string, state: 'interactive' | 'access', page: number) => {
    try {
      this.dataTableDetailInteractive = [];
      this.dataTableDetailAccess = [];
      if (state === "access") {
        this.handleStaLoadChange();
        await this.getDataExportDetailAccess(type,dateStart, dateEnd);
        let data = await getDataTableDetailAccess(type, dateStart, dateEnd, page);
        if (data) {
          this.handleStaLoadChange();
          this.dataTableDetailAccess = data.table;
          this.metadata = data.metadata;
        }
      } else {
        this.handleStaLoadChange();
        await this.getDataExportDetailInteractive(type,dateStart,dateEnd);
        let data = await getDataTableDetailInteractive(type, dateStart, dateEnd, page);
        if (data) {
          this.handleStaLoadChange();
          this.dataTableDetailInteractive = data.table;
          this.metadata = data.metadata;
        }
      }
    } catch (e) {
      this.handleStaLoadChange();
      console.error(e);
    }
  }
  // TAB ACCESS
  public exportDetailAllAccess: IExportDetailAccess [] = []

  public getDataExportDetailAccess = async (type: 'ALL' | 'AUCTION' | 'NORMAL',dateStart: any, dateEnd: any) => {
    this.exportDetailAllAccess = [];
    const response = await getDetailProductAccessExcel(type,profileStore.profile!.shopId, dateStart, dateEnd);
    if (response.status === 200) {
      this.exportDetailAllAccess.push({
        'Sản phẩm': "",
        'Lượt xem': response.body.totalValue.totalView,
        'Lượt xem máy tính': response.body.totalValue.totalViewWeb,
        'Lượt xem ứng dụng': response.body.totalValue.totalViewApp,
        'Lượt truy cập': response.body.totalValue.totalVisit,
        'Lượt truy cập máy tính': response.body.totalValue.totalVisitWeb,
        'Lượt truy cập ứng dụng': response.body.totalValue.totalVisitApp,
        'Thời gian xem trung bình': response.body.totalValue.averageOnSite,
        'Tỉ lệ thoát trang': response.body.totalValue.totalBounceRate
      })
      response.body.products.map((value,i)=>{
        this.exportDetailAllAccess.push({
          'Sản phẩm': value.name,
          'Lượt xem': value.totalView,
          'Lượt xem máy tính': value.productViewWeb,
          'Lượt xem ứng dụng': value.productViewApp,
          'Lượt truy cập': value.totalVisit,
          'Lượt truy cập máy tính': value.productVisitWeb,
          'Lượt truy cập ứng dụng': value.productVisitApp,
          'Thời gian xem trung bình': value.averageOnSite,
          'Tỉ lệ thoát trang': value.totalBounceRate
        })
      })
    } else {
    }
  }
  // TAB INTERACTIVE
  public exportDetailAllInteractive: IExportDetailInteractive [] = []

  public getDataExportDetailInteractive = async (type: 'ALL' | 'AUCTION' | 'NORMAL',dateStart: any, dateEnd: any) => {
    this.exportDetailAllInteractive = [];
    const response = await getDetailProductInteractiveExcel(type,profileStore.profile!.shopId, dateStart, dateEnd);
    if (response.status === 200) {
      this.exportDetailAllInteractive.push({
        'Sản phẩm': "",
        'Doanh thu': response.body.totalValue.totalRevenue,
        'Lượt đấu giá': response.body.totalValue.totalAuction,
        'Người tham gia': response.body.totalValue.totalParticipants,
        'Đấu giá thành công': response.body.totalValue.totalAuctionSuccess,
        'Tỉ lệ đấu giá thành công': response.body.totalValue.totalAuctionRatio,
        'Thích sản phẩm': response.body.totalValue.totalFavorites,
        'Chia sẻ sản phẩm':response.body.totalValue.totalShare,
        'Thêm giỏ hàng': response.body.totalValue.totalAddToCart
      })
      response.body.productInteraction.map((value,i)=>{
        this.exportDetailAllInteractive.push({
          'Sản phẩm': value.name,
          'Doanh thu': value.totalRevenue,
          'Lượt đấu giá': value.totalAuction,
          'Người tham gia': value.totalParticipants,
          'Đấu giá thành công': value.totalAuctionSuccess,
          'Tỉ lệ đấu giá thành công': value.totalAuctionRatio,
          'Thích sản phẩm': value.totalFavorites,
          'Chia sẻ sản phẩm': value.totalShare,
          'Thêm giỏ hàng': value.totalAddToCart
        })
      })
    } else {


    }
  }

  // index.ts PRODUCT OVERVIEW
  @observable dataTable: { key: number, title: { value: string, hover: string }, all: IDataTable | null, productNormal: IDataTable | null, productBid: IDataTable | null } [] = []

  // TAB ACCESS
  public exportOverviewAllAccess: IExportOverViewAccess [] = []
  public exportOverviewNormalAccess: IExportOverViewAccess [] = []
  public exportOverviewAuctionAccess: IExportOverViewAccess [] = []

  public getDataExportAccess = async (dateStart: any, dateEnd: any) => {
    this.exportOverviewNormalAccess = [];
    this.exportOverviewAllAccess = [];
    this.exportOverviewAuctionAccess = [];
    const response = await getProductVisitExcel(profileStore.profile!.shopId, dateStart, dateEnd);
    if (response.status === 200) {
      response.body.products.map((value, i) => {
        const totalTime = convertSecondsToHhmmss(timeToSecond(value.value.productAuction.totalOnSite.averageOnSite) + timeToSecond(value.value.productNormal.totalOnSite.averageOnSite))
        this.exportOverviewAllAccess.push({
          'Ngày': value.key,
          'Lượt xem': value.value.productAuction.totalView.totalView + value.value.productNormal.totalViewWeb.totalViewWeb,
          'Lượt xem máy tính': value.value.productAuction.totalViewWeb.totalViewWeb + value.value.productNormal.totalViewWeb.totalViewWeb,
          'Lượt xem ứng dụng': value.value.productAuction.totalViewApp.totalViewApp + value.value.productNormal.totalViewApp.totalViewApp,
          'Thời gian xem trung bình': totalTime,
          'Tỉ lệ thoát trang': value.value.productAuction.totalBounceRate.totalBounceRate + value.value.productNormal.totalBounceRate.totalBounceRate,
          'Tổng lượt truy cập': value.value.productAuction.totalVisit.totalVisit + value.value.productNormal.totalVisit.totalVisit,
          'Lượt truy cập máy tính': value.value.productAuction.totalVisitWeb.totalVisitWeb + value.value.productNormal.totalVisitWeb.totalVisitWeb,
          'Lượt truy cập ứng dụng ': value.value.productAuction.totalVisitApp.totalVisitApp + value.value.productNormal.totalVisitApp.totalVisitApp,
        })

        this.exportOverviewAuctionAccess.push({
          'Ngày': value.key,
          'Lượt xem': value.value.productAuction.totalView.totalView,
          'Lượt xem máy tính': value.value.productAuction.totalViewWeb.totalViewWeb,
          'Lượt xem ứng dụng': value.value.productAuction.totalViewApp.totalViewApp,
          'Thời gian xem trung bình': value.value.productAuction.totalOnSite.averageOnSite,
          'Tỉ lệ thoát trang': value.value.productAuction.totalBounceRate.totalBounceRate,
          'Tổng lượt truy cập': value.value.productAuction.totalVisit.totalVisit,
          'Lượt truy cập máy tính': value.value.productAuction.totalVisitWeb.totalVisitWeb,
          'Lượt truy cập ứng dụng ': value.value.productAuction.totalVisitApp.totalVisitApp,
        })

        this.exportOverviewNormalAccess.push({
          'Ngày': value.key,
          'Lượt xem': value.value.productNormal.totalView.totalView,
          'Lượt xem máy tính': value.value.productNormal.totalViewWeb.totalViewWeb,
          'Lượt xem ứng dụng': value.value.productNormal.totalViewApp.totalViewApp,
          'Thời gian xem trung bình': value.value.productNormal.totalOnSite.averageOnSite,
          'Tỉ lệ thoát trang': value.value.productNormal.totalBounceRate.totalBounceRate,
          'Tổng lượt truy cập': value.value.productNormal.totalVisit.totalVisit,
          'Lượt truy cập máy tính': value.value.productNormal.totalVisitWeb.totalVisitWeb,
          'Lượt truy cập ứng dụng ': value.value.productNormal.totalVisitApp.totalVisitApp,
        })
      })
    } else {
      notify.show("đã có lỗi xảy ra", "warning")
    }

  }

  private getDataTabAccess = async (dateStart: any, dateEnd: any) => {
    this.handleStaLoadChange();
    let dataTable = await getDataTableTabAccess(dateStart, dateEnd);
    if (dataTable) {
      this.getDataExportAccess(dateStart, dateEnd)
      this.handleStaLoadChange();
      this.dataTable = dataTable;
    }
  }

  // TAB INTERACTIVE
  public exportOverviewAllInteractive: IExportOverviewAll [] = []
  public exportOverviewNormalInteractive: IExportOverviewNormal [] = []
  public exportOverviewAuctionInteractive: IExportOverviewAuction [] = []

  public getDataExportInteractive = async (dateStart: any, dateEnd: any) => {
    this.exportOverviewAllInteractive = [];
    this.exportOverviewNormalInteractive = [];
    this.exportOverviewAuctionInteractive = [];
    const response = await getProductInteractionExcel(profileStore.profile!.shopId, dateStart, dateEnd);
    if (response.status === 200) {
      response.body.products.map((value, i) => {
        this.exportOverviewAllInteractive.push({
          "Ngày": value.key,
          "Doanh thu": value.value.productAuction.totalRevenue.revenue + value.value.productNormal.totalRevenue.revenue,
          "Lượt đấu giá": value.value.productAuction.totalAuction.totalAuction + value.value.productNormal.totalAuction.totalAuction,
          "Người tham gia": value.value.productAuction.totalParticipants.totalParticipants + value.value.productNormal.totalParticipants.totalParticipants,
          "Đấu giá thành công": value.value.productAuction.totalAuctionSuccess.totalAuctionSuccess + value.value.productNormal.totalAuctionSuccess.totalAuctionSuccess,
          "Tỉ lệ đấu giá thành công": value.value.productAuction.totalAuctionRatio.totalAuctionRatio + value.value.productNormal.totalAuctionRatio.totalAuctionRatio,
          "Yêu thích sản phẩm": value.value.productAuction.totalFavorite.totalFavorite + value.value.productNormal.totalFavorite.totalFavorite,
          "Chia sẻ sản phẩm": value.value.productAuction.totalShare.totalShare + value.value.productNormal.totalShare.totalShare,
          "Thêm giỏ hàng": value.value.productNormal.totalAddToCart.totalAddToCart + value.value.productAuction.totalAddToCart.totalAddToCart,
          "Tỉ lệ thêm giỏ hàng": value.value.productNormal.totalAddToCartRatio.totalAddToCartRatio + value.value.productAuction.totalAddToCartRatio.totalAddToCartRatio,
        })

        this.exportOverviewAuctionInteractive.push({
          "Ngày": value.key,
          "Doanh thu": value.value.productAuction.totalRevenue.revenue,
          "Lượt đấu giá": value.value.productAuction.totalAuction.totalAuction,
          "Người tham gia": value.value.productAuction.totalParticipants.totalParticipants,
          "Đấu giá thành công": value.value.productAuction.totalAuctionSuccess.totalAuctionSuccess,
          "Tỉ lệ đấu giá thành công": value.value.productAuction.totalAuctionRatio.totalAuctionRatio,
          "Yêu thích sản phẩm": value.value.productAuction.totalFavorite.totalFavorite,
          "Chia sẻ sản phẩm": value.value.productAuction.totalShare.totalShare,
        })

        this.exportOverviewNormalInteractive.push({
          "Ngày": value.key,
          "Doanh thu": value.value.productNormal.totalRevenue.revenue,
          "Yêu thích sản phẩm": value.value.productNormal.totalFavorite.totalFavorite,
          "Chia sẻ sản phẩm": value.value.productNormal.totalShare.totalShare,
          "Thêm giỏ hàng": value.value.productNormal.totalAddToCart.totalAddToCart,
          "Tỉ lệ thêm giỏ hàng": value.value.productNormal.totalAddToCartRatio.totalAddToCartRatio,
        })
      })
    } else {

    }
  }

  private getDataTabInteractive = async (dateStart: any, dateEnd: any) => {
    this.handleStaLoadChange();
    let dataTable = await getDataTableTabInteractive(dateStart, dateEnd);

    if (dataTable) {
      this.getDataExportInteractive(dateStart, dateEnd);
      this.handleStaLoadChange();
      this.dataTable = dataTable;
    }
  }

  // PRODUCT OVERVIEW
  getDataOverview = async (state: "ACCESS" | "INTERACTIVE", dateStart: any, dateEnd: any) => {
    if (state === "ACCESS") {
      this.getDataTabAccess(dateStart, dateEnd)
    } else {
      this.getDataTabInteractive(dateStart, dateEnd)
    }
  }

  // PRODUCT RANKING
  @observable dataTableProductRanking: { key: number, top: number, product: { image: string, name: string, price: number }, revenue: number } [] = []
  @observable statusLoadRank: boolean = false;
  getDataProductRanking = async (shopId: any, dateStart: string, dateEnd: any, type: string) => {
    this.statusLoadRank = true
    let data = await getDataTableProRank(shopId, dateStart, dateEnd, type);
    if (data) {
      this.statusLoadRank = false;
      this.dataTableProductRanking = data
    }
  }

}

export default new Store();