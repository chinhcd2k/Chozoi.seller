import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {store as HomeStore} from "../../../home";
import {observer} from "mobx-react";
import "../containers/ShopEfficiencyStyle.scss";
import {Doughnut, Line, Pie} from "react-chartjs-2";
import 'bootstrap-daterangepicker/daterangepicker.css';
import {store} from "../stores/ShopEfficiencyStore";
import $ from "jquery";
import "bootstrap-datepicker";
import "../../../../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css";
import {Moment} from "../../../../common/functions/Moment";
// import {DGetProfile} from "../../../../common/decorators/Auth";
import {store as ProfileStore} from "../../../profile/stores/ProfileStore";
import {
  chartOptions,
  chartData,
  chartPieOptions,
  chartDoughnutOptions,
  dataChartPie,
  dataChartAccess, dataChartView
} from "../ts/Chart";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {ExportCSV} from "../../../../common/export-excel/ExportCSV";
import {store as shopStore} from '../../../shop/stores/ShopInfomationStore';
import {DatePickerComponent} from "./DatePiker";
import {getDataExportExcel, getDetailRevenue, getShopChart, getShopOverview} from "../../../../api/shop-efficiency";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";


interface IShopEfficiencyComponentProps {
  history: { push: (path: string, state?: any) => void },
  match: { params: { query: string } }
}

interface IShopEfficiencyComponentState {
  keyChartLine: number
  keyChartPie: number
  keyChartDoughnut: number
  type: 'draft' | 'new' | 'done'
  day: 'today' | 'yesterday' | 'last7days' | 'last30days' | string
  from: string
  to: string
}

interface DataExcelExport {
  'Ngày': any,
  'Doanh thu': any,
  'Lượt xem': any,
  'Lượt truy cập': any,
  'Đơn hàng': any,
  'Tỉ lệ chuyển đổi': any,
  'Doanh thu/đơn hàng': any,
  'Tổng doanh thu': any,
  'Lượt xem máy tính': any,
  'Lượt xem ứng dụng': any,
  'Lượt truy cập máy tính': any,
  'Lượt truy cập ứng dụng': any
}

class ShopEfficiencyUrlParamsSearch extends URLSearchParams {

  public getType(): 'draft' | 'new' | 'done' {
    const type = this.get('type');
    return (type === 'draft' || type === 'new' || type === 'done') ? type : 'draft';
  }

  public getDay(): 'today' | 'yesterday' | 'last7days' | 'last30days' | string {
    const value = this.get('day') || '';
    const re = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    if (value === 'today' || value === 'yesterday' || value === 'last7days' || value === 'last30days')
      return value;
    else if (re.test(value))
      return value;
    else return '';
  }

  public getFrom(): string {
    const type = this.get('from') || '';
    const re = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    return re.test(type) ? type : '';
  }

  public getTo(): string {
    const type = this.get('to') || '';
    const re = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    return re.test(type) ? type : '';
  }
}

@observer
export default class ShopEfficiencyComponent extends React.Component<IShopEfficiencyComponentProps, IShopEfficiencyComponentState> {
  public shopId: number = -1;
  public dataSelectType = {draft: 'Tất cả đơn hàng', new: 'Đơn hàng đã xác nhận', done: 'Đơn hàng hoàn thành'};

  /*export excel*/
  @observable dataExcel: DataExcelExport[] = [];
  getDataExport = async () => {
    this.dataExcel = []
    const response = await getDataExportExcel(shopStore.shopProfile!.id, this.timeStart, this.timeEnd);
    if (response.status === 200) {
      response.body.properties.map((value, i) => {
        this.dataExcel.push({
          'Ngày': value.key,
          'Doanh thu': value.value.revenues.revenue,
          'Lượt xem': value.value.totalView.totalView,
          'Lượt truy cập': value.value.totalVisit.totalVisit,
          'Đơn hàng': value.value.orders.totalOrder,
          'Tỉ lệ chuyển đổi': value.value.conversionRates.conversionRate,
          'Doanh thu/đơn hàng': value.value.orderAverages.orderAverage,
          'Tổng doanh thu': value.value.totalRevenue.revenue,
          'Lượt xem máy tính': value.value.totalViewWeb.totalViewWeb,
          'Lượt xem ứng dụng': value.value.totalViewApp.totalViewApp,
          'Lượt truy cập máy tính': value.value.totalVisitWeb.totalVisitWeb,
          'Lượt truy cập ứng dụng': value.value.totalVisitApp.totalVisitApp
        })
      })
    } else {
    }
  }
  fileName = () => {
    const today = new Date();
    const nameShop = shopStore.shopProfile && shopStore.shopProfile.name;
    const title = "hieuquacuahang";
    const dateExport = Moment.getDate(today.getTime(), 'dd/mm/yyyy', false);
    return nameShop + "-" + title + "-" + dateExport;
  }

  /*===============================================================================================*/
  constructor(props: IShopEfficiencyComponentProps) {
    super(props);
    BreadcrumbsService.loadBreadcrumbs([{title: 'Hiệu quả cửa hàng'}]);
    HomeStore.menuActive = [5, 0];
    store.sumRevenue = 1000000;
    store.sumRevenueAuction = 200000;
    store.sumRevenueProduct = 200000;
    store.sumRevenueFlashBid = 600000;
    this.state = {
      keyChartLine: Math.random(),
      keyChartPie: Math.random(),
      keyChartDoughnut: Math.random(),
      type: 'draft',
      day: 'today',
      from: '',
      to: ''
    };
  }

  @observable timeStart: string = '';
  @observable timeEnd: string = '';

  // @DGetProfile
  async componentDidMount() {
    this.setData();
    if (ProfileStore.profile && ProfileStore.profile.shopId) {
      ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId);
      await this.setupConfigDatePicker();
      if (this.props.match.params.query) {
        const urlParams = new ShopEfficiencyUrlParamsSearch(this.props.match.params.query);
        this.timeStart = urlParams.getFrom();
        this.timeEnd = urlParams.getTo()
        // setTimeout(() => this.getEfficiency());
        await this.getEfficiency()
      }
      $('[data-toggle="tooltip"]').tooltip();
    }
  }

  setData = () => {
    const dataCharPie: number[] = [store.sumRevenueProduct, store.sumRevenueAuction, store.sumRevenueFlashBid];
    dataChartPie.datasets[0].data = [];
    dataCharPie.map((value, i) => {
      dataChartPie.datasets[0].data.push(value);
      return i;
    })
    chartData.datasets.map((value: any, i: number) => {
      if (i < 4) {
        value.hidden = false;
      } else {
        value.hidden = true;
        $(`#${i}`).addClass("title-strikethrough");
      }
    })
  }

  componentDidUpdate(prevProps: Readonly<IShopEfficiencyComponentProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if (prevProps.match.params.query !== this.props.match.params.query) {
      const urlParams = new ShopEfficiencyUrlParamsSearch(this.props.match.params.query);
      this.timeStart = urlParams.getFrom();
      this.timeEnd = urlParams.getTo()
      this.getEfficiency().then();
    }
  }

  componentWillUnmount(): void {
    dataChartView.datasets[0].data = [];
    dataChartAccess.datasets[0].data = [];
    chartData.labels = [];
  }

  private setupConfigDatePicker() {
    // let startDate: string = '';
    let endDate: string;
    let yesterday: Date = new Date();
    endDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
    yesterday.setDate(yesterday.getDate() - 1);
    // startDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
    this.handleChoseTime(endDate, endDate, "Hôm nay");
  }

  private async getEfficiency() {
    try {
      if (shopStore.shopProfile) {
        dataChartView.datasets[0].data = [];
        dataChartAccess.datasets[0].data = [];
        chartData.labels = [];
        dataChartPie.datasets[0].data = [];
        for (let i = 0; i < chartData.datasets.length; i++) {
          chartData.datasets[i].data = [];
        }
        /*get value chart doughnut*/
        const response = await getShopOverview(shopStore.shopProfile.id, this.timeStart, this.timeEnd);
        if (response.status === 200) {
          store.calculateAccess = response.body;
          dataChartView.datasets[0].data.push(response.body.totalViewWeb.totalViewWeb);
          dataChartView.datasets[0].data.push(response.body.totalViewApp.totalViewApp);
          dataChartAccess.datasets[0].data.push(response.body.totalVisitWeb.totalVisitWeb);
          dataChartAccess.datasets[0].data.push(response.body.totalVisitApp.totalVisitApp);
        } else {
        }
        /*get value chart line*/
        const responseShopChartLine = await getShopChart(shopStore.shopProfile.id, this.timeStart, this.timeEnd);
        if (responseShopChartLine.status === 200) {
          store.shopChart = responseShopChartLine.body;
          responseShopChartLine.body.chart.revenues.map((value) => {
            chartData.labels.push(value.key);
          })
          responseShopChartLine.body.chart.revenues.map((value) => {
            chartData.datasets[0].data.push(value.value);
          })
          responseShopChartLine.body.chart.totalViews.map((value) => {
            chartData.datasets[1].data.push(value.value);
          })
          responseShopChartLine.body.chart.totalVisits.map((value) => {
            chartData.datasets[2].data.push(value.value);
          })
          responseShopChartLine.body.chart.orders.map((value) => {
            chartData.datasets[3].data.push(value.value);
          })
          responseShopChartLine.body.chart.conversionRates.map((value) => {
            chartData.datasets[4].data.push(value.value);
          })
          responseShopChartLine.body.chart.orderAverages.map((value) => {
            chartData.datasets[5].data.push(value.value);
          })
        } else {
        }
        /*get value revenue in pie chart*/
        const responsePie = await getDetailRevenue(shopStore.shopProfile.id, this.timeStart, this.timeEnd);
        if (responsePie.status === 200) {
          store.calculateRevenue = responsePie.body;
          dataChartPie.datasets[0].data.push(responsePie.body.totalRevenueProduct.totalRevenueProduct);
          dataChartPie.datasets[0].data.push(responsePie.body.totalRevenueAuction.totalRevenueAuction);
          dataChartPie.datasets[0].data.push(responsePie.body.totalRevenueFlashbid.totalRevenueFlashbid);
        }
        this.setState({keyChartLine: Math.random()});
        this.setState({keyChartDoughnut: Math.random()});
        this.setState({keyChartPie: Math.random()});
        await this.getDataExport();
      } else return null;
    } catch (e) {
      console.log(e)
    }

  }

  handleClickChangeLineChar(selection: number) {
    let count: number = 0;
    chartData.datasets.map((value: any, i: any) => {
      if (value.hidden === false) {
        count++;
      }
    })
    if (count >= 4 && $(`#${selection}`).hasClass("title-strikethrough")) {
      notify.show("Chỉ chọn xem tối đa 4 lựa chọn", "warning", 2);
    }
    if ($(`#${selection}`).hasClass("title-strikethrough") && count < 4) {
      $(`#${selection}`).removeClass("title-strikethrough")
      chartData.datasets[selection].hidden = false;
    } else {
      $(`#${selection}`).addClass("title-strikethrough");
      chartData.datasets[selection].hidden = true;
    }
    this.setState({keyChartLine: Math.random()});
  }

  handleChoseTime(startTime: string, endTime: string, type: string) {
    this.props.history.push(`/home/shop-efficiency/type=draft&from=${startTime}&to=${endTime}`);
  }

  public getPercentValue = (src: number, desc: number): number => {
    let num = (((src) / desc) * 100).toFixed(2);
    return +num;
  }

  renderPercent(value: number) {
    if (value !== 0) {
      if (value > 0) {
        return (
          <div
            className={`text-success percent`}>
            <i
              className={`mr-2 fa fa-arrow-up`}/>
            {+value.toFixed(2)}%
          </div>
        )
      } else {
        return (
          <div
            className={`text-danger percent`}>
            <i
              className={`mr-2 fa fa-arrow-down`}/>
            {+(value * -1).toFixed(2)}%
          </div>
        )
      }
    } else return null
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return <div id="shop-efficiency">
      <div className="container-fluid">
        <div className="row secction-1">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <div className="d-flex justify-content-between">
                  {/*Type*/}
                  {/*<div className="btn-group dropdown">*/}
                  {/*    <button*/}
                  {/*        className="btn btn-default">{this.dataSelectType[this.state.type]}</button>*/}
                  {/*    <button className="btn btn-default dropdown-toggle dropdown-toggle-icon"*/}
                  {/*            data-toggle="dropdown" type="button" aria-expanded="false">*/}
                  {/*        <i className="dropdown-caret"/>*/}
                  {/*    </button>*/}
                  {/*    <ul className="dropdown-menu">*/}
                  {/*        <li><Link to={'/home/shop-efficiency/type=draft'}>Tất cả đơn hàng</Link>*/}
                  {/*        </li>*/}
                  {/*        <li><Link to={'/home/shop-efficiency/type=new'}>Đơn hàng đã xác nhận</Link>*/}
                  {/*        </li>*/}
                  {/*        <li><Link to={'/home/shop-efficiency/type=done'}>Đơn hàng hoàn thành</Link>*/}
                  {/*        </li>*/}
                  {/*    </ul>*/}
                  {/*</div>*/}

                  {/*Date picker*/}
                  <DatePickerComponent
                    onChoseDate={(startTime, endTime, type) => this.handleChoseTime(startTime, endTime, type)}/>

                  {/*export file*/}
                  <div className="export-file">
                    <ExportCSV csvData={this.dataExcel} fileName={this.fileName()} sheetName={'Shop'}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row secction-2">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <p className="title text-info">Các chỉ số quan trọng</p>
                {store.shopChart &&
                <div className="custom-row key-index">
                    <div className="custom-col">
                        <div>
                            <label>Doanh thu <i className="fa fa-info-circle"
                                                data-toggle="tooltip"
                                                data-placement="top"
                                                data-original-title="Tổng giá trị các đơn đã được đặt trong thời gian đã báo cáo, bao gồm cả đơn chưa thanh toán."
                            /></label>
                            <p>{numberWithCommas(store.shopChart.value.revenues.revenue, 'đ')}</p>
                          {this.renderPercent(store.shopChart.value.revenues.revenuePercent)}
                        </div>
                    </div>
                    <div className="custom-col">
                        <div>
                            <label>Lượt xem<i className="fa fa-info-circle"
                                              data-toggle="tooltip"
                                              data-placement="top"
                                              data-original-title="Tổng số lượt xem trang chủ (shop overview) và trang sản phẩm của shop, trong thời gian đã chọn (Bao gồm trên máy tính và ứng dụng)."
                            /></label>
                            <p>{numberWithCommas(store.shopChart.value.totalView.totalView, '')}</p>
                          {this.renderPercent(store.shopChart.value.totalView.totalViewPercent)}
                        </div>
                    </div>
                    <div className="custom-col">
                        <div>
                            <label>Lượt truy cập <i className="fa fa-info-circle"
                                                    data-toggle="tooltip"
                                                    data-placement="top"
                                                    data-original-title="Tổng số khách truy cập duy nhất đã xem trang chủ (shop overview) và trang sản phẩm của Shop trong khoảng thời gian được chọn. Mỗi khách xem một trang sản phẩm nhiều lần được tính là lượt truy cập duy nhất."
                            /></label>
                            <p>{numberWithCommas(store.shopChart.value.totalVisit.totalVisit, '')}</p>
                          {this.renderPercent(store.shopChart.value.totalVisit.totalVisitPercent)}
                        </div>
                    </div>
                    <div className="custom-col">
                        <div>
                            <label>Đơn hàng <i className="fa fa-info-circle"
                                               data-toggle="tooltip"
                                               data-placement="top"
                                               data-original-title="Tổng số đơn hàng đã đặt trong khoảng thời gian được chọn (bao gồm đơn đã hủy và bị hoàn trả)."
                            /></label>
                            <p>{numberWithCommas(store.shopChart.value.orders.totalOrder, '')}</p>
                          {this.renderPercent(store.shopChart.value.orders.totalOrderPercent)}
                        </div>
                    </div>
                    <div className="custom-col">
                        <div>
                            <label>Tỷ lệ chuyển đổi <i className="fa fa-info-circle"
                                                       data-toggle="tooltip"
                                                       data-placement="top"
                                                       data-original-title="Tổng số khách hàng có đơn hàng đã được thanh toán trên tổng số lượt xem."
                            /></label>
                          {/*<p>{numberWithCommas(store.shopChart.value.conversionRates.conversionRate, '%')}</p>*/}
                            <p>{+store.shopChart.value.conversionRates.conversionRate.toFixed(2)}%</p>
                          {this.renderPercent(store.shopChart.value.conversionRates.conversionRatePercent)}
                        </div>
                    </div>
                    <div className="custom-col">
                        <div>
                            <label>Doanh thu trên mỗi đơn hàng <i
                                className="fa fa-info-circle"
                                data-toggle="tooltip"
                                data-placement="top"
                                data-original-title="Doanh thu trung bình của một đơn hàng phát sinh trong khoảng thời gian đã chọn."
                            /></label>
                            <p>{numberWithCommas(store.shopChart.value.orderAverages.orderAverage, 'đ')}</p>
                          {this.renderPercent(store.shopChart.value.orderAverages.orderAveragePercent)}
                        </div>
                    </div>
                </div>}

                <div className="row">
                  <div className="note d-flex justify-content-center">
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(0)}>
                      <div className="box-color color-red">
                      </div>
                      <div className="title" id="0">
                        <p>Doanh thu</p>
                      </div>
                    </div>
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(1)}>
                      <div className="box-color color-orange">
                      </div>
                      <div className="title " id="1">
                        <p>Lượt xem</p>
                      </div>
                    </div>
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(2)}>
                      <div className="box-color color-green">
                      </div>
                      <div className="title " id="2">
                        <p>Lượt truy cập</p>
                      </div>
                    </div>
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(3)}>
                      <div className="box-color color-blue">
                      </div>
                      <div className="title " id="3">
                        <p>Đơn hàng</p>
                      </div>
                    </div>
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(4)}>
                      <div className="box-color color-dark-blue">
                      </div>
                      <div className="title " id="4">
                        <p>Tỷ lệ chuyển đổi</p>
                      </div>
                    </div>
                    <div className="d-flex align-content-center"
                         onClick={() => this.handleClickChangeLineChar(5)}>
                      <div className="box-color color-purple">
                      </div>
                      <div className="title " id="5">
                        <p>Doanh thu/đơn hàng</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="mt-5 chart" key={this.state.keyChartLine}>
                      <Line height={50} options={chartOptions} data={chartData} legend={
                        {
                          display: false,
                          labels: {
                            usePointStyle: true,
                          },
                        }
                      }/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row secction-3">
          <div className="col-xs-12">
            <div className="panel">
              {store.calculateRevenue &&
              <div className="panel-body">
                  <p className="title text-info">Doanh thu</p>
                  <div className="row">
                      <div className="col-xs-3">
                        {store.calculateRevenue.totalRevenue.totalRevenue !== 0 &&
                        <div className="mt-5 chart" key={this.state.keyChartPie}>
                            <Pie height={150} options={chartPieOptions} data={dataChartPie} legend={{
                              display: false,
                              position: 'right',
                            }}/>
                        </div>
                        }
                      </div>
                      <div className="col-xs-9">
                          <div className="data d-flex justify-content-between">
                              <div className="custom-col">
                                  <div>
                                      <label>Tổng doanh thu <i className="fa fa-info-circle"
                                                               data-toggle="tooltip"
                                                               data-placement="top"
                                                               data-original-title="Tổng giá trị các đơn đã được đặt trong thời gian đã báo cáo, bao gồm cả đơn chưa thanh toán."
                                      /></label>
                                    {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                      <p>{numberWithCommas(store.calculateRevenue.totalRevenue.totalRevenue, 'đ')}</p>
                                    {this.renderPercent(store.calculateRevenue.totalRevenue.totalRevenuePercent)}
                                  </div>
                              </div>
                              <div className="custom-col">
                                  <div>
                                      <label>Doanh thu từ sản phẩm <i className="fa fa-info-circle"
                                                                      data-toggle="tooltip"
                                                                      data-placement="top"
                                                                      data-original-title="Doanh thu của đơn hàng thường."
                                      /></label>
                                    {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                      <p>{numberWithCommas(store.calculateRevenue.totalRevenueProduct.totalRevenueProduct, 'đ')}</p>
                                    {this.renderPercent(store.calculateRevenue.totalRevenueProduct.totalRevenueProductPercent)}
                                  </div>
                              </div>
                              <div className="custom-col">
                                  <div>
                                      <label>Doanh thu từ đấu giá <i className="fa fa-info-circle"
                                                                     data-toggle="tooltip"
                                                                     data-placement="top"
                                                                     data-original-title="Doanh thu của đơn hàng đấu giá thường."
                                      /></label>
                                    {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                      <p>{numberWithCommas(store.calculateRevenue.totalRevenueAuction.totalRevenueAuction, 'đ')}</p>
                                    {this.renderPercent(store.calculateRevenue.totalRevenueAuction.totalRevenueAuctionPercent)}
                                  </div>
                              </div>
                              <div className="custom-col">
                                  <div>
                                      <label>Doanh thu flashbid <i className="fa fa-info-circle"
                                                                   data-toggle="tooltip"
                                                                   data-placement="top"
                                                                   data-original-title="Doanh thu từ sản phẩm flashbid."
                                      /></label>
                                    {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                      <p>{numberWithCommas(store.calculateRevenue.totalRevenueFlashbid.totalRevenueFlashbid, 'đ')}</p>
                                    {this.renderPercent(store.calculateRevenue.totalRevenueFlashbid.totalRevenuePercentFlashbid)}
                                  </div>
                              </div>
                          </div>
                        {store.calculateRevenue.totalRevenue.totalRevenue !== 0 &&
                        <div className="note">
                            <div className="d-flex align-content-center">
                                <div className="box-color color-red">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateRevenue.totalRevenueProduct.totalRevenueProduct, store.calculateRevenue.totalRevenue.totalRevenue)}%
                                        doanh thu sản phẩm thường</p>
                                </div>
                            </div>
                            <div className="d-flex align-content-center">
                                <div className="box-color color-orange">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateRevenue.totalRevenueAuction.totalRevenueAuction, store.calculateRevenue.totalRevenue.totalRevenue)}%
                                        doanh thu sản phẩm đấu giá</p>
                                </div>
                            </div>
                            <div className="d-flex align-content-center">
                                <div className="box-color color-blue">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateRevenue.totalRevenueFlashbid.totalRevenueFlashbid, store.calculateRevenue.totalRevenue.totalRevenue)}%
                                        doanh thu sản phẩm flashbid</p>
                                </div>
                            </div>
                        </div>
                        }
                      </div>
                  </div>
              </div>}

            </div>
          </div>
        </div>
        <div className="row secction-4">
          <div className="col-xs-12">
            <div className="panel">
              {store.calculateAccess &&
              <div className="panel-body">
                  <p className="title text-info">Truy cập</p>
                  <div className="data row">
                      <div className=" dataView col-xs-6">
                          <div className="custom-col">
                              <div className="d-flex ">
                                  <label>Tổng lượt xem <i className="fa fa-info-circle"
                                                          data-toggle="tooltip"
                                                          data-placement="top"
                                                          data-original-title="Tổng số lượt xem trang chủ (shop overview) và trang sản phẩm của shop, trong thời gian đã chọn (Bao gồm trên máy tính và ứng dụng)."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalView.totalView, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalView.totalViewPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt xem máy tính <i className="fa fa-info-circle"
                                                              data-toggle="tooltip"
                                                              data-placement="top"
                                                              data-original-title="Tổng số lượt xem trang chủ (shop overview) và trang sản phẩm của shop, trong thời gian đã chọn Trên máy tính."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess ? store.calculateAccess.totalViewWeb.totalViewWeb : 0, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalViewWeb.totalViewWebPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt xem ứng dụng <i className="fa fa-info-circle"
                                                              data-toggle="tooltip"
                                                              data-placement="top"
                                                              data-original-title="Tổng số lượt xem trang chủ (shop overview) và trang sản phẩm của shop, trong thời gian đã chọn Trên ứng dụng."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalViewApp.totalViewApp, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalViewApp.totalViewAppPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Thời gian xem trung bình <i className="fa fa-info-circle"
                                                                     data-toggle="tooltip"
                                                                     data-placement="top"
                                                                     data-original-title="Thời gian trung bình 1 khách truy cập xem trang chủ(shop overview) và trang sản phẩm của shop."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{store.calculateAccess.totalOnSite.averageOnSite}</p>
                                {this.renderPercent(store.calculateAccess.totalOnSite.averageOnSitePercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Tỉ lệ thoát trang <i className="fa fa-info-circle"
                                                              data-toggle="tooltip"
                                                              data-placement="top"
                                                              data-original-title="Tỉ lệ khách truy cập duy nhất vào trang sản phẩm của bạn nhưng rời đi mà không thao tác thêm (ví dụ:bấm xem thêm, lướt ảnh ,lưu giỏ hàng....)."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{+store.calculateAccess.totalBounceRate.totalBounceRate.toFixed(2)}%</p>
                                {this.renderPercent(store.calculateAccess.totalBounceRate.totalBounceRatePercent)}
                              </div>
                          </div>
                      </div>
                      <div className="dataAccess col-xs-6">
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt truy cập <i className="fa fa-info-circle"
                                                          data-toggle="tooltip"
                                                          data-placement="top"
                                                          data-original-title="Tổng số khách truy cập duy nhất đã xem trang chủ (shop overview) và trang sản phẩm của Shop trong khoảng thời gian được chọn. Mỗi khách xem một trang sản phẩm nhiều lần được tính là lượt truy cập duy nhất."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalVisit.totalVisit, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalVisit.totalVisitPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt truy cập máy tính <i className="fa fa-info-circle"
                                                                   data-toggle="tooltip"
                                                                   data-placement="top"
                                                                   data-original-title="Tổng số khách truy cập duy nhất đã xem trang sản phẩm của shop trong khoảng thời gian được chọn trên máy tính. Mỗi khách xem một trang sản phẩm nhiều lần được tính là lượt truy cập duy nhất."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalVisitWeb.totalVisitWeb, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalVisitWeb.totalVisitWebPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt truy cập ứng dụng <i className="fa fa-info-circle"
                                                                   data-toggle="tooltip"
                                                                   data-placement="top"
                                                                   data-original-title="Tổng số khách truy cập duy nhất đã xem trang sản phẩm của shop trong khoảng thời gian được chọn trên ứng dụng. Mỗi khách xem một trang sản phẩm nhiều lần được tính là lượt truy cập duy nhất."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalVisitApp.totalVisitApp, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalVisitApp.totalVisitAppPercent)}
                              </div>
                          </div>
                          <div className="custom-col">
                              <div className="d-flex">
                                  <label>Lượt theo dõi <i className="fa fa-info-circle"
                                                          data-toggle="tooltip"
                                                          data-placement="top"
                                                          data-original-title="Số người bấm theo dõi shop trong khoảng thời gian được chọn."
                                  /></label>
                                {/*<p>{numberWithCommas(store.statistical.revenue.src, 'đ')}</p>*/}
                                  <p>{numberWithCommas(store.calculateAccess.totalFollow.totalFollow, '')}</p>
                                {this.renderPercent(store.calculateAccess.totalFollow.totalFollowPercent)}
                              </div>
                          </div>
                      </div>
                  </div>
                {(store.calculateAccess.totalVisit.totalVisit !== 0 && store.calculateAccess.totalView.totalView !== 0) &&
                <div className="row">
                    <div className="col-xs-6 d-flex">
                        <div className="col-xs-6" key={this.state.keyChartDoughnut}>
                            <Doughnut height={200} options={chartDoughnutOptions} data={dataChartView}
                                      legend={{
                                        display: false,
                                        position: 'right',
                                      }}/>
                        </div>
                        <div className="note col-xs-6">
                            <div className="d-flex align-content-center">
                                <div className="box-color color-blue">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateAccess.totalViewWeb.totalViewWeb, store.calculateAccess.totalView.totalView)}%
                                        Lượt xem máy tính</p>
                                </div>
                            </div>
                            <div className="d-flex align-content-center">
                                <div className="box-color color-orange">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateAccess.totalViewApp.totalViewApp, store.calculateAccess.totalView.totalView)}%
                                        Lượt xem ứng dụng</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row col-xs-6 d-flex">
                        <div className="col-xs-6" key={this.state.keyChartDoughnut}>
                            <Doughnut height={200} options={chartDoughnutOptions} data={dataChartAccess}
                                      legend={{
                                        display: false,
                                        position: 'right',
                                      }}/>
                        </div>
                        <div className="note col-xs-6 ">
                            <div className="d-flex align-content-center">
                                <div className="box-color color-blue">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateAccess.totalVisitWeb.totalVisitWeb, store.calculateAccess.totalVisit.totalVisit)}%
                                        Lượt truy cập máy tính</p>
                                </div>
                            </div>
                            <div className="d-flex align-content-center">
                                <div className="box-color color-orange">
                                </div>
                                <div className="title ">
                                    <p>{this.getPercentValue(store.calculateAccess.totalVisitApp.totalVisitApp, store.calculateAccess.totalVisit.totalVisit)}%
                                        Lượt truy cập ứng dụng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
              </div>}

            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}

