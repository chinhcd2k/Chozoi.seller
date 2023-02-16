import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {Link} from "react-router-dom";
import {PaginationComponent} from "../../../../common/pagination";
import {observer} from "mobx-react";
import "react-datepicker/dist/react-datepicker.css";
import {store as HomeStore} from "../../../home/stores/HomeStore";
import "../containers/ReturnOrderStyle.scss";
import {IOrderReturnLineResponse, service} from "../../OrderServices";
import {Moment} from "../../../../common/functions/Moment";
import {store as ProfileStore} from "../../../profile";
import DateRangePicker from "react-bootstrap-daterangepicker";
import OrderReturnStore from "../store/OrderReturnStore";
import {UrlSearchParamsOrderReturn} from "../ts/UrlSearchParamsOrderReturn";
import ImageViewer from "../../../../common/image-viewer/ImageViewer";
import {RowTableOrderReturn} from "./RowTableOrderReturn";

interface IOrderReturnComponentProps {
    history: { push: (path: string, state?: any) => void }
    match: {
        params: {
            query: string
        }
    }
}

interface IReturnOrderComponentState {
    from: any
    to: any
    keyword: string
    timeFilterText: any
    orderPrint: any
    ranges: any
    state: 'request' | 'processing' | 'finished'
    page: number
    size: number
    total: number
    keyFilter: number
}

@observer
export default class OrderReturnComponent extends React.Component<IOrderReturnComponentProps, IReturnOrderComponentState> {
    protected shopId: number = -1;
    public store: OrderReturnStore = new OrderReturnStore();
    public ImageViewerRef = React.createRef<ImageViewer>();

    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý đơn hàng hoàn trả'}]);
        HomeStore.menuActive = [2, 1];
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const pre7Day = new Date();
        pre7Day.setDate(today.getDate() - 6);
        const pre30Day = new Date();
        pre30Day.setDate(today.getDate() - 29);
        const pre6Month = new Date();
        pre6Month.setMonth(today.getMonth() - 6);
        this.state = {
            timeFilterText: '',
            orderPrint: '',
            keyword: '',
            keyFilter: 0,
            ranges: {
                'Hôm nay': [today, today],
                'Hôm qua': [yesterday, yesterday],
                '7 ngày gần đây': [pre7Day, today],
                '30 ngày gần đây': [pre30Day, today],
                '6 tháng gần đây': [pre6Month, today],
            },
            state: 'request',
            from: '',
            to: '',
            page: 0,
            size: 10,
            total: 0
        };
        /*Bind*/
        this.paginationChange = this.paginationChange.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleChangeTime = this.handleChangeTime.bind(this);
    }

    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        if (this.props.match.params.query) {
            const searchParams = new UrlSearchParamsOrderReturn(this.props.match.params.query);
            this.setState({
                state: searchParams.getState,
                from: searchParams.getFrom,
                to: searchParams.getFrom,
                keyword: searchParams.getKeyword,
                page: searchParams.getPage,
                size: searchParams.getSize,
                keyFilter: Math.random()
            }, () => this.getListReturnOrderLine());
        }

    }

    async componentDidUpdate(prevProps: Readonly<IOrderReturnComponentProps>, prevState: Readonly<IReturnOrderComponentState>, snapshot?: any) {
        if (prevProps.match.params.query !== this.props.match.params.query) {
            const searchParams = new UrlSearchParamsOrderReturn(this.props.match.params.query);
            this.setState({
                state: searchParams.getState,
                from: searchParams.getFrom,
                to: searchParams.getFrom,
                keyword: searchParams.getKeyword,
                page: searchParams.getPage,
                size: searchParams.getSize,
                keyFilter: Math.random()
            }, () => this.getListReturnOrderLine());
        }
        if (prevState.state !== this.state.state) this.setState({timeFilterText: '', keyword: ''})
    }

    // Lấy danh sách order
    private async getListReturnOrderLine() {
        this.store.listOrderLine = this.store.listPackageOrderReturn = [];
        const response = await service.getListReturnOrder(this.shopId, this.state.state, this.state.size, this.state.page, {
            keyword: this.state.keyword,
            from: this.state.from,
            to: this.state.to
        });
        if (response.status === 200) {
            this.setState({total: response.body.metadata.total});
            response.body.data && (this.store.listOrderLine = response.body.data);
            window.scrollTo(0, 0);
        }
    }

    public handleFilter() {
        const path: string = `state=${this.state.state}${this.state.keyword ? '&keyword=' + this.state.keyword : ''}${this.state.from ? '&from=' + this.state.from : ''}${this.state.to ? '&to=' + this.state.to : ''}`;
        this.props.history.push('/home/order-return/' + path);
    }

    public async paginationChange(page: number) {
        this.setState({page: page - 1});
        setTimeout(() => this.getListReturnOrderLine());
    }

    async handleChangeTime(event: any, picker: any) {
        let startDate = new Date(picker.startDate);
        let endDate = new Date(picker.endDate);
        let timeFilterText = 'Thời gian từ ' + Moment.getDate(startDate.getTime(), "dd/mm/yyyy", false) + ' đến ' + Moment.getDate(endDate.getTime(), "dd/mm/yyyy", false);
        this.setState({
            from: Moment.getDate(startDate.getTime(), "yyyy-mm-dd", false),
            to: Moment.getDate(endDate.getTime(), "yyyy-mm-dd", false),
            timeFilterText: timeFilterText,
        });
    }

    protected getTextStatus(
        returnType: 'CHOZOI_VIA_RETURN' | 'RETURN_NOT_RECEVIE' | 'CHOZOI_ARBITRATION',
        state: 'DRAFT' | 'NEW' | 'CANCELED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'WAIT_REFUND' | 'FINISHED',
        shippingState?: 'ACEPPTED' | 'CANCELED' | 'DONE' | 'LOST' | 'PICKING' | 'READYTOPIC' | 'RECEVIED' | 'RETURN' | 'RETURNED' | 'SHIPPED' | 'SHIPPING' | 'WAITTODONE'): string {
        if (returnType === "CHOZOI_VIA_RETURN") {
            if (state === "COMPLETED") return "Chờ lấy hàng";
            else if (state === "SHIPPING") {
                if (shippingState && shippingState === "READYTOPIC") return "Chờ lấy hàng";
                else if (shippingState && (shippingState === "RECEVIED" || shippingState === "SHIPPED")) return "Đang giao";
            } else if (state === "WAIT_REFUND") return "Chờ thanh toán";
            else if (state === "FINISHED") return "Hoàn thành";
        } else if (returnType === "RETURN_NOT_RECEVIE") {
            if (state === "WAIT_REFUND") return "Chờ thanh toán";
            else if (state === "FINISHED") return 'Hoàn thành';
        } else if (returnType === "CHOZOI_ARBITRATION") {
            return state === "FINISHED" ? 'Hoàn thành' : '';
        }
        return "";
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            return <div className='container-fluid' id="order-return">
                <div className="row">
                    <div className="col-xs-12">
                        <div className="card">
                            <div className="row search-order-return" key={this.state.keyFilter}>
                                <div className="col-md-4 col-lg-4 d-flex">
                                    <i className="fa fa-search position-absolute"/>
                                    <input className="form-control" placeholder="Mã đơn hàng..."
                                           defaultValue={this.state.keyword}
                                           onChange={(e: any) => this.setState({keyword: e.currentTarget.value})}/>
                                </div>
                                <div className="col-md-3 col-lg-3 d-flex">
                                    <DateRangePicker
                                        onApply={this.handleChangeTime} opens="right" ranges={this.state.ranges}
                                        locale={{
                                            cancelLabel: 'Hủy',
                                            applyLabel: 'Đồng ý',
                                            customRangeLabel: 'Tùy chỉnh'
                                        }}>
                                        <i className="fa fa-calendar" aria-hidden="true"/>
                                        <input className="form-control" placeholder="Tìm kiếm theo thời gian đặt hàng"
                                               onKeyDown={(e: any) => e.preventDefault()}
                                               defaultValue={this.state.timeFilterText}/>
                                    </DateRangePicker>
                                    <button
                                        className="btn ml-3 btn-default"
                                        onClick={() => this.handleFilter()}
                                        type="button"><i className="fa fa-search"/> Tìm kiếm
                                    </button>
                                </div>
                                <div className="col-md-5 col-lg-5 d-flex justify-content-end">
                                    {/* <button
                                        className="btn btn-outline btn-primary"
                                        onClick={this.handleExport}
                                        type="button">Xuất file
                                    </button>*/}
                                    {/*<ExcelExport data={store.dataParser} fileName="Danh sách đơn hàng.xlsx"
                                         ref={(exporter) => {
                                             this._exporter = exporter;
                                         }} headerPaddingCellOptions={{bold: true}}>
                                <ExcelExportColumn field="code" title="Mã đơn hàng" width={150}/>
                                <ExcelExportColumn field="product" title="Sản phẩm" width={380}/>
                                <ExcelExportColumn field="method" title="Hình thức thanh toán" width={190}/>
                                <ExcelExportColumn field="shipping" title="Đơn vị vận chuyển" width={160}/>
                                <ExcelExportColumn field="state" title="Trạng thái" width={140}/>
                                <ExcelExportColumn field="time" title="Thời gian" width={140}/>
                            </ExcelExport>*/}
                                </div>
                            </div>
                        </div>
                        <div className="tab-base">
                            <ul className="nav nav-tabs">
                                <li className={this.state.state === "request" ? 'active' : ''}>
                                    <Link to="/home/order-return/state=request">Yêu cầu duyệt</Link>
                                </li>
                                <li className={this.state.state === "processing" ? 'active' : ''}>
                                    <Link to="/home/order-return/state=processing">Đang xử lý</Link>
                                </li>
                                <li className={this.state.state === "finished" ? 'active' : ''}>
                                    <Link to="/home/order-return/state=finished">Hoàn thành</Link>
                                </li>
                            </ul>
                            <div className="tab-content">
                                <div id="content" className="tab-pane fade active in table-responsive">
                                    <table className='table table-striped'>
                                        <thead>
                                        <tr>
                                            <th className="text-center">Mã đổi trả</th>
                                            <th className="text-center">Kiện</th>
                                            <th className="text-center">Hình thức hoàn trả</th>
                                            <th className="text-center">Tình trạng</th>
                                            <th className="text-center">Đơn vị vận chuyển</th>
                                            <th className="text-center">Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/*Not found data*/}
                                        {(this.store.listOrderLine.length === 0 && this.store.listPackageOrderReturn.length === 0) &&
                                        <tr>
                                            <td colSpan={6}><p className="text-center my-5">Không có dữ liệu</p></td>
                                        </tr>}
                                        {this.store.listOrderLine.map((order: IOrderReturnLineResponse, index: number) =>
                                            <RowTableOrderReturn key={index}
                                                                 data={order}
                                                                 EmitOnViewImage={url => this.ImageViewerRef.current && this.ImageViewerRef.current.show(url)}
                                            />)}
                                        {/*List Order Processing or Finished*/}
                                        {/* {this.state.state !== "request" && this.store.listPackageOrderReturn.map(((value: IPackageOrderReturnResponse, index: number) =>
                                            <tr key={index}>
                                                <td className="text-center">
                                                    <p className="m-0">
                                                        <Link className="text-info"
                                                              style={{cursor: 'pointer'}}
                                                              to={`/home/order-return/package/${value.id}`}>{value.code}</Link>
                                                    </p>
                                                    <span>{Moment.getDate(new Date(value.createdAt), 'dd/mm/yyyy')} {Moment.getTime(new Date(value.createdAt), 'hh:mm')}</span>
                                                </td>
                                                <td>
                                                    {value.lineReturns[0].orderLine.productImage &&
                                                    <img src={value.lineReturns[0].orderLine.productImage}
                                                         onClick={() => this.ImageViewerRef.current && this.ImageViewerRef.current.show(value.lineReturns[0].orderLine.productImage)}
                                                         alt={value.lineReturns[0].orderLine.productName}
                                                         height={60} className="mr-2 cursor-pointer"/>}
                                                    {value.lineReturns[0].orderLine.productName}
                                                </td>
                                                Hình thức hoàn trả
                                                <td className="text-center">
                                                    {value.lineReturns[0].returnType === "CHOZOI_VIA_RETURN" &&
                                                    <span className="">Trả hàng / hoàn tiền</span>}
                                                    {value.lineReturns[0].returnType === "RETURN_NOT_RECEVIE" && (value.state === "WAIT_REFUND" || value.state === "FINISHED") &&
                                                    <span className="">Hoàn tiền</span>}
                                                    {value.lineReturns[0].returnType === "CHOZOI_ARBITRATION" && value.state === "FINISHED" &&
                                                    <span className="">Từ chối</span>}
                                                </td>
                                                Tình trạng
                                                <td className="text-center">
                                                    {this.getTextStatus(value.lineReturns[0].returnType, value.state, value.shippingState) &&
                                                    <span
                                                        className="label label-info">{this.getTextStatus(value.lineReturns[0].returnType, value.state, value.shippingState)}</span>}
                                                </td>
                                                Đơn vị vận chuyển
                                                <td className="text-center"><span
                                                    className="">{value.shippingPartner ? value.shippingPartner.name : ''}</span>
                                                </td>
                                                <td className="text-center"/>
                                            </tr>))}*/}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="float-right mt-3">
                                {this.state.total > 0 && <PaginationComponent
                                    total={this.state.total}
                                    number={this.state.size}
                                    defaultActive={this.state.page}
                                    emitOnChangePage={page => this.paginationChange(page)}
                                />}
                            </div>
                        </div>
                    </div>
                </div>
                <ImageViewer ref={this.ImageViewerRef}/>
            </div>
        } catch (e) {
            console.log(e);
            return <div className="container-fluid">Đã có lỗi xảy ra!</div>;
        }
    }
}
