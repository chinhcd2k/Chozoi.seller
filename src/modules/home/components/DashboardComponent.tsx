import {observer} from "mobx-react";
import * as React from 'react';
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {Line} from 'react-chartjs-2';
import 'bootstrap-daterangepicker/daterangepicker.css';
import {dashboardStore, IlistInfoMustUpdate} from "../stores/DashboardStore";
import {store as HomeStore} from "../../home/stores/HomeStore";
import * as Sentry from "@sentry/browser";
import "../containers/DashboardStyle.scss";
import {store as ProfileStore} from "../../profile";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {Moment} from "../../../common/functions/Moment";
import {Link} from "react-router-dom";
import $ from "jquery";
import {observable} from "mobx";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {IResProfile} from "../../../api/auth/interfaces/response";
import {IResShopProfile} from "../../../api/shop/interfaces/response";
import {
  chartDataDashboard,
  chartDataDashboardAuction,
  chartOptionsDashboard
} from "../../analytics/shop-efficiency/ts/Chart";
import {
  getShopChartDashboardAuction,
  getShopChartDashboardRevenue,
  getShopChartDashboardValue
} from "../../../api/shop-efficiency";
import {service} from "../HomeService";
import {store as shopEfficiencyStore} from "../../analytics/shop-efficiency/stores/ShopEfficiencyStore";

interface IDashboardComponentProps {
  history: {
    push: (path: string, state?: any) => void
  }
}

interface IDashboardComponentState {
  keyChart: number,
  keyChartAuction: number
}

@observer
export default class DashboardComponent extends React.Component<IDashboardComponentProps, IDashboardComponentState> {
  public state: any;
  @observable statusRenderNotifyUpdateInfo: boolean = true;

  constructor(props: any) {
    super(props);
    BreadcrumbsService.loadBreadcrumbs([{title: 'Tổng quan cửa hàng'}]);
    HomeStore.menuActive = [0, 0];
    this.state = {
      keyChart: Math.random(),
      keyChartAuction: Math.random()
    }
  }

  public async componentDidMount() {
    if (ProfileStore.profile && (ProfileStore.profile as IResProfile).user.isSeller) {
      await this.getShopRevenue24Hour();
      await this.getShopValue24Hour();
      await this.getShopAuctionChart();
      $('#dashboard [data-toggle="tooltip"]').tooltip();
    }
    this.getListInfoMustUpdate().then();
  }

  componentWillUnmount(): void {
    $('#dashboard [data-toggle="tooltip"]').tooltip(('destroy' as any));
  }

  public async getShopRevenue24Hour() {
    const {shopId} = (ProfileStore.profile as IResProfile);
    const today = Moment.getDate(new Date().getTime(), "yyyy-mm-dd", false);
    const response = await getShopChartDashboardRevenue(shopId, today);
    if (response.status === 200) {
      chartDataDashboard.labels = [];
      dashboardStore.shopDashboard = response.body;
      response.body.chart.revenues.map((value, i) => {
        chartDataDashboard.labels.push(value.key);
        chartDataDashboard.datasets[0].data.push(value.value);
      })
    } else {

    }
    this.setState({keyChart: Math.random()});
  }

  async getShopValue24Hour() {
    const {shopId} = (ProfileStore.profile as IResProfile);
    const today = Moment.getDate(new Date().getTime(), "yyyy-mm-dd", false);
    const response = await getShopChartDashboardValue(shopId, today);
    if (response.status === 200) {
      dashboardStore.shopDashboardValue = response.body;
    } else {
    }
  }

  async getShopAuctionChart() {
    chartDataDashboardAuction.labels = [];
    chartDataDashboardAuction.datasets[0].data = [];
    const {shopId} = (ProfileStore.profile as IResProfile);
    const today = Moment.getDate(new Date().getTime(), "yyyy-mm-dd", false);
    const response = await getShopChartDashboardAuction(shopId, today);
    if (response.status === 200) {
      dashboardStore.shopDashboardAuction = response.body;
      response.body.revenues.map((value, i) => {
        chartDataDashboardAuction.labels.push(value.key);
        chartDataDashboardAuction.datasets[0].data.push(value.value);
      })
    } else {
    }
    this.setState({keyChartAuction: Math.random()});
  }

  public async getListInfoMustUpdate() {
    if (ProfileStore.profile) {
      const response = await service.getListInfoMustUpdate(ProfileStore.profile.shopId + '');
      if (response.status === 200) {
        let data: IlistInfoMustUpdate [] = [];
        data.push(response.body.bankCard);
        data.push(response.body.contact);
        data.push(response.body.description);
        data.push(response.body.email);
        data.push(response.body.idCard);
        data.push(response.body.phone);
        dashboardStore.listInfoUpdate = data;
      }
    }

  }

  renderPercent(value: number) {
    if (value !== 0) {
      return (
        <div className="footer text-end">
          {!isNaN(value) && <span
              data-toggle="tooltip"
              data-original-title="So với hôm qua"
              data-placement="top"
              className={`${value > 0 ? 'text-success' : 'text-danger'}`}>
                                                    <i className={`fa ${value > 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}/>
            {+Math.abs(value).toFixed(2)}%</span>}
        </div>
      )
    } else return null;
  }

  renderNotifyUpdateInfoShop = (status: boolean, list_info_must_update: IlistInfoMustUpdate []): React.ReactNode => {
    let percent: number = 0;
    let indexCarousel: number = 6;
    let shopName: string = (ShopStore.shopProfile as IResShopProfile).name;
    list_info_must_update.map(value => {
      if (value.status) {
        percent = percent + value.percent;
        indexCarousel--;
      }
    });
    list_info_must_update = list_info_must_update.sort((a: IlistInfoMustUpdate, b: IlistInfoMustUpdate) => {
      if (a.status && !b.status) return 1;
      else if (!a.status && b.status) return -1;
      else return 0;
    });
    let linkUpdateInfo: string = '';
    for (let i = 0; i < list_info_must_update.length; i++) {
      if (list_info_must_update[i].type === 'contact' && !list_info_must_update[i].status) {
        linkUpdateInfo = '/home/shop/address';
      }
    }
    if (linkUpdateInfo === '') {
      for (let i = 0; i < list_info_must_update.length; i++) {
        if ((list_info_must_update[i].type === 'description' && !list_info_must_update[i].status) || (list_info_must_update[i].type === 'email' && !list_info_must_update[i].status) || (list_info_must_update[i].type === 'idCard' && !list_info_must_update[i].status) || (list_info_must_update[i].type === 'phone' && !list_info_must_update[i].status)) {
          linkUpdateInfo = '/home/shop';
          break;
        }
      }
    }
    if (linkUpdateInfo === '') {
      for (let i = 0; i < list_info_must_update.length; i++) {
        if (list_info_must_update[i].type === 'bankCard' && !list_info_must_update[i].status) {
          linkUpdateInfo = 'home/shop/card';
          break;
        }
      }
    }
    if (status && list_info_must_update.length > 0 && percent < 100)
      return <div className={"notify-update-info"}>
        <div style={{height: "100%", width: "100%", display: "flex"}}>
          <div className={"wrapper-notify-update-info__percent-update"}>
            <svg width="152" height="152">
              <circle r="70" cx="76" cy="76" className="track"/>
              <circle r="70" cx="76" cy="76" className="progress"
                      style={{strokeDashoffset: `${440 - (percent / 100) * 440}`}}/>
            </svg>
            <div className={"wrapper-notify-update-info__percent-update__percent"}>
              <div className={"circle-percent"}>
                {percent}%
              </div>
            </div>
          </div>
          <div className={"notify-update-info__content"}>
            <div className={"notify-update-info__content__main-title"}>Xin chào, {shopName}</div>
            <div className={"notify-update-info__content__sub-title"}>
              Thông tin hồ sơ của bạn cần được bổ sung thêm để trải nghiệm tối đa dịch vụ bán hàng của
              Chozoi.
            </div>
            <Link to={linkUpdateInfo}>
              <div className={"notify-update-info__content__link"}>
                Hoàn tất hồ sơ ngay &nbsp; <i className="fal fa-pencil-alt"/>
              </div>
            </Link>
            <div className={"notify-update-info__content__slider"}>
              <div id="myCarousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                  {list_info_must_update.map(((value, index) => {
                    if (!value.status) return (
                      <div key={index}
                           className={`item ${(index === 0) ? `active` : ``} `}>
                        <div>
                          <div className={"notify-tooltip"}>{value.description}</div>
                          <div style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            padding: "0 75px"
                          }}>{value.description}</div>
                        </div>
                      </div>
                    )
                  }))}
                </div>
                <a className="left carousel-control" href="#myCarousel" data-slide="prev">
                  {(indexCarousel > 1) ? <span className="glyphicon glyphicon-chevron-left"/> : null}
                  <span className="sr-only">Previous</span>
                </a>
                <a className="right carousel-control" href="#myCarousel" data-slide="next">
                  {(indexCarousel > 1) ? <span className="glyphicon glyphicon-chevron-right"/> : null}
                  <span className="sr-only">Next</span>
                </a>
              </div>
            </div>
            <div className={"notify-update-info__content__close"}
                 onClick={() => {
                   // close notify update info
                   this.statusRenderNotifyUpdateInfo = false
                 }}>
              <i className="fal fa-times-circle"/>
            </div>
          </div>
        </div>
      </div>;
    else return null;
  }

  renderValueRevenue(value:number|null){
    if (value!==null){
     return(
       <p>{value}</p>
     )
    }else {
      return (
        <p>---</p>
      )
    }
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    try {
      return <div id="dashboard">
        <div className="container-fluid">
          {this.renderNotifyUpdateInfoShop(this.statusRenderNotifyUpdateInfo, dashboardStore.listInfoUpdate)}
          {dashboardStore.shopDashboard &&
          <div className="row section-1">
              <div className="col-xs-12 col-lg-6">
                  <div className="panel chart h-100">
                      <div className="panel-header">
                          <div className="row mx-0">
                              <div className="col-xs-12 d-flex justify-content-between">
                                  <p className="pt-3">Doanh thu (Hôm nay)</p>
                                  <Link className="text-info pt-3 pr-3"
                                        to={`/home/shop-efficiency/type=draft&from=${shopEfficiencyStore.today}&to=${shopEfficiencyStore.today}`}>Xem
                                      thêm</Link>
                              </div>
                              <div className="col-xs-12 mt-2">
                                  <div
                                      className="d-flex flex-wrap justify-content-between align-items-center">
                                      <h1 className="w-50 mt-0">{numberWithCommas(dashboardStore.shopDashboard.chart.totalRevenue.revenue ?
                                        dashboardStore.shopDashboard.chart.totalRevenue.revenue : 0, 'đ')}</h1>
                                    {this.renderPercent(dashboardStore.shopDashboard.chart.totalRevenue.revenuePercent)}
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="panel-body">
                          <div className="chart mt-4" key={this.state.keyChart}>
                              <Line height={100} options={chartOptionsDashboard} data={chartDataDashboard}/>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="col-xs-12 col-lg-6">
                  <div className="panel analytics">
                      <div className="panel-body h-100">
                          <div>
                              <p className="text-info font-weight-bold">Thống kê đơn hàng</p>
                              <ul className="order">
                                  <li onClick={() => this.props.history.push('/home/orders/state=draft')}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.order.totalOrderDraft)}
                                          <span>Chờ xác nhận</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push('/home/orders/state=processing')}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.order.totalOrderNew)}
                                          <span>Chờ xử lý</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push('/home/orders/state=shipping')}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.order.totalOrderShipping)}
                                          <span>Đang giao</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push('/home/orders/state=canceled')}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.order.totalOrderCanceled)}
                                          <span>Đã hủy</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push('/home/order-return/state=processing')}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.order.totalOrderReturned)}
                                          <span>Trả hàng / hoàn tiền</span>
                                      </div>
                                  </li>
                              </ul>
                          </div>
                          <div>
                              <p className="mt-5 text-info font-weight-bold">Thống kê sản phẩm</p>
                              <ul className="product">
                                  <li onClick={() => this.props.history.push(`/home/products/state=PUBLIC`)}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.product.totalProductPublic)}
                                          <span className="text-center">Sản phẩm đang bán</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push(`/home/products/state=PENDING`)}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.product.totalProductPending)}
                                          <span className="text-center">Sản phẩm đợi duyệt</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push(`/home/products/state=REJECT`)}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.product.totalProductReported)}
                                          <span className="text-center">Sản phẩm bị khóa / hủy</span>
                                      </div>
                                  </li>
                                  <li onClick={() => this.props.history.push(`/home/products/aspect=soldOff`)}>
                                      <div>
                                        {this.renderValueRevenue(dashboardStore.shopDashboard.value.product.totalProductOutOfStock)}
                                          <span className="text-center">Sản phẩm hết hàng</span>
                                      </div>
                                  </li>
                                  <li>
                                      <div>
                                          {this.renderValueRevenue(dashboardStore.shopDashboard.value.product.totalProductReturned)}
                                          <span
                                              className="text-center ">Sản phẩm trả hàng / hoàn tiền</span>
                                      </div>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </div>}
          {dashboardStore.shopDashboardValue &&
          <div className="row section-2">
              <div className="col-xs-12">
                  <div className="panel">
                      <ul>
                          <li>
                              <div className="content">
                                  <div className="header">
                                      <label>Đơn hàng<i
                                          data-toggle="tooltip"
                                          data-original-title="Tổng số đơn hàng: là số đơn hàng đã đặt bao gồm cả đơn đã bị hủy và hoàn trả trong thời gian báo cáo."
                                          data-placement="top"
                                          className="ml-2 fa fa-info-circle"/></label>
                                      <p className="small">(Hôm nay)</p>
                                  </div>
                                  <div className="body">
                                      <p className="result text-end">{numberWithCommas(dashboardStore.shopDashboardValue.totalOrder.totalOrder)}</p>
                                  </div>
                                {this.renderPercent(dashboardStore.shopDashboardValue.totalOrder.totalOrderPercent)}
                              </div>
                          </li>
                          <li>
                              <div className="content">
                                  <div className="header">
                                      <label className="">Lượt xem<i
                                          data-toggle="tooltip"
                                          data-original-title="Tổng số lượt xem sản phẩm trong thời gian báo cáo từ Chozoi từ web và ứng dụng Chozoi."
                                          data-placement="top"
                                          className="ml-2 fa fa-info-circle"/></label>
                                      <p className="small">(Hôm nay)</p>
                                  </div>
                                  <div className="body">
                                      <p className="text-end">{numberWithCommas(dashboardStore.shopDashboardValue.totalView.totalView)}</p>
                                  </div>
                                {this.renderPercent(dashboardStore.shopDashboardValue.totalView.totalViewPercent)}
                              </div>
                          </li>
                          <li>
                              <div className="content">
                                  <div className="header">
                                      <label className="">Lượt truy cập<i
                                          data-toggle="tooltip"
                                          data-original-title="Tổng số lượt xem sản phẩm trong thời gian báo cáo từ Chozoi từ web và ứng dụng Chozoi. Một người xem 1 sản phẩm nhiều lần cũng là chỉ tính 1 lượt."
                                          data-placement="top"
                                          className="ml-2 fa fa-info-circle"/></label>
                                      <p className="small">(Hôm nay)</p>
                                  </div>
                                  <div className="body">
                                      <p className="text-end">{numberWithCommas(dashboardStore.shopDashboardValue.totalVisit.totalVisit)}</p>
                                  </div>
                                {this.renderPercent(dashboardStore.shopDashboardValue.totalVisit.totalVisitPercent)}
                              </div>
                          </li>
                          <li>
                              <div className="content">
                                  <div className="header">
                                      <label className="">Tỷ lệ chuyển đổi<i
                                          data-toggle="tooltip"
                                          data-original-title="Tổng số khách hàng có đơn hàng đã được thanh toán trên tổng số lượt xem"
                                          data-placement="top"
                                          className="ml-2 fa fa-info-circle"/></label>
                                      <p className="small">(Hôm nay)</p>
                                  </div>
                                  <div className="body">
                                      <p className="text-end">{+dashboardStore.shopDashboardValue.totalConversionRate.conversionRate.toFixed(2)}%</p>

                                  </div>
                                {this.renderPercent(dashboardStore.shopDashboardValue.totalConversionRate.conversionRatePercent)}
                              </div>
                          </li>
                          <li>
                              <div className="content">
                                  <div className="header">
                                      <label className="">Lượt theo dõi<i
                                          data-toggle="tooltip"
                                          data-original-title="Số lượt theo dõi mới đến thời điểm báo cáo."
                                          data-placement="top"
                                          className="ml-2 fa fa-info-circle"/></label>
                                      <p className="small">(Hôm nay)</p>
                                  </div>
                                  <div className="body">
                                      <p className="text-end">{numberWithCommas(dashboardStore.shopDashboardValue.totalFollow.totalFollow)}</p>
                                  </div>
                                {this.renderPercent(dashboardStore.shopDashboardValue.totalFollow.totalFollowPercent)}
                              </div>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>}
          {dashboardStore.shopDashboardAuction &&
          <div className="row section-3">
              <div className="col-xs-12 col-lg-8">
                  <div className="panel">
                      <div className="panel-heading">
                          <label className="font-weight-bold text-info">Quản lý đấu giá (Hôm nay)</label>
                        {/*<a className="float-right text-info" href="">Xem thêm</a>*/}
                      </div>
                      <div className="panel-body">
                          <div>
                              <p>Doanh thu đấu giá</p>
                          </div>
                          <div className="d-flex justify-content-between"><h1
                              className="w-50 mt-0">{numberWithCommas(dashboardStore.shopDashboardAuction.totalAuctionRevenue.revenue ?
                            dashboardStore.shopDashboardAuction.totalAuctionRevenue.revenue : 0, 'đ')}</h1>
                            {this.renderPercent(dashboardStore.shopDashboardAuction.totalAuctionRevenue.revenuePercent)}
                          </div>
                          <div className="chart mt-4" key={this.state.keyChartAuction}>
                              <Line height={50} options={chartOptionsDashboard}
                                    data={chartDataDashboardAuction}/>
                          </div>
                          <div className="chart-bottom">
                              <ul className="d-flex">
                                  <li>
                                      <p>
                                          <span>{dashboardStore.shopDashboardAuction.numberOfParticipants}</span> Người
                                          tham gia</p>
                                  </li>
                                  <li>
                                      <p>
                                          <span>{dashboardStore.shopDashboardAuction.numberOfAuction}</span> Lượt
                                          đấu giá</p>
                                  </li>
                                  <li>
                                      <p>
                                          <span>{dashboardStore.shopDashboardAuction.productsOnAuction}</span> Sản
                                          phẩm đang đấu giá</p>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
            {/*<div className="col-xs-12 col-lg-4">*/}
            {/*    <div className="panel">*/}
            {/*        <div className="panel-heading">*/}
            {/*            <label className="font-weight-bold text-info">Quản lý đồ cũ</label>*/}
            {/*            /!*<a className="float-right text-info" href="">Xem thêm</a>*!/*/}
            {/*        </div>*/}
            {/*        <div className="panel-body">*/}
            {/*            <div className="empty">*/}
            {/*                <i className="fal fa-folder-open"/>*/}
            {/*                <p>Không có dữ liệu</p>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
              <div className="col-xs-12 col-lg-4">
                  <div className="panel">
                      <div className="panel-heading">
                          <label className="font-weight-bold text-info">Thông báo hệ thống</label>
                        {/* <a className="float-right text-info" href="">Xem thêm</a>*/}
                      </div>
                      <div className="panel-body">
                          <div className="empty">
                              <i className="fal fa-folder-open"/>
                              <p>Không có dữ liệu</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          }

        </div>
      </div>
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      return "Component render exception";
    }
  }

  // protected getGrowth(key: 'revenue' | 'order'): boolean {
  //     const statistical = dashboardStore.statistical;
  //     return statistical[key].src >= statistical[key].desc
  // }
  //
  // protected getGrowthValue(key: 'revenue' | 'order'): number {
  //     const statistical = dashboardStore.statistical;
  //     return Math.abs(((statistical[key].src - statistical[key].desc) / statistical[key].desc) * 100);
  // }
}
