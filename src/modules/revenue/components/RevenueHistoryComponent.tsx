import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store} from "../stores/RevenueHistoryStore";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import "react-datepicker/dist/react-datepicker.css";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {PaginationComponent} from "../../../common/pagination";
import {convertDateToString} from "../../../common/functions/FormatFunc";
import {store as ProfileStore} from "../../profile";
import {service} from "../RevenueServices";
import "../containers/RevenueHistoryStyle.scss";
import {Moment} from "../../../common/functions/Moment";
import {RevenueHistoryUrlSearchParams} from "../ts/RevenueHistoryUrlSearchParams";
import {ItemListViewRevenueComponent} from "./ItemListViewRevenueComponent";
import ModalDetailRevenueComponent from "./ModalDetailRevenueComponent";

interface RevenueHistoryComponentProps {
    history: { push: (path: string, state?: any) => void }
    match: { params: { query: string } }
}

interface IRevenueHistoryComponentState {
    type: 'all' | 'order' | 'cashout' | 'return'
    keyword: string
    from: string
    to: string
    transactionDetail: any
    ranges: any
    timeFilterText: any
    keyType: number
    page: number
    size: number
    total: number
}

@observer
export default class RevenueHistoryComponent extends React.Component<RevenueHistoryComponentProps, IRevenueHistoryComponentState> {
    private shopId: number = -1;
    public state: any;
    public ModalDetailRef = React.createRef<ModalDetailRevenueComponent>();
    _exporter: any;

    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Lịch sử giao dịch'}]);
        HomeStore.menuActive = [4, 1];
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
            keyType: 0,
            keyword: '',
            type: '',
            from: '',
            to: '',
            timeFilterText: '',
            transactionDetail: '',
            ranges: {
                'Hôm nay': [today, today],
                'Hôm qua': [yesterday, yesterday],
                '7 ngày gần đây': [pre7Day, today],
                '30 ngày gần đây': [pre30Day, today],
                '6 tháng gần đây': [pre6Month, today],
            },
            page: 0,
            size: 10,
            total: 0
        };
        this.paginationChange = this.paginationChange.bind(this);
        this.handleChangeTime = this.handleChangeTime.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        if (this.props.match.params.query) {
            const urlSearch = new RevenueHistoryUrlSearchParams(this.props.match.params.query);
            this.setState({
                type: urlSearch.getType(),
                keyword: urlSearch.getKeyword(),
                from: urlSearch.getFrom(),
                to: urlSearch.getTo(),
                keyType: Math.random(),
                page: urlSearch.getPage,
                size: urlSearch.getSize
            }, () => this.getShopTransaction());
        }
    }

    async componentDidUpdate(prevProps: Readonly<RevenueHistoryComponentProps>, prevState: Readonly<{}>, snapshot?: any) {
        if (this.props.match.params.query !== prevProps.match.params.query) {
            const urlSearch = new RevenueHistoryUrlSearchParams(this.props.match.params.query);
            this.setState({
                type: urlSearch.getType(),
                keyword: urlSearch.getKeyword(),
                from: urlSearch.getFrom(),
                to: urlSearch.getTo(),
                keyType: Math.random(),
                page: urlSearch.getPage,
                size: urlSearch.getSize
            }, () => this.getShopTransaction());
        }
    }

    public async getShopTransaction() {
        const data = {
            keyword: this.state.keyword,
            type: this.state.type,
            startDate: this.state.from,
            endDate: this.state.to,
        };
        const response = await service.getShopTransaction(this.state.page, this.state.size, data);
        if (response.status === 200 && response.body.payments) {
            this.setState({total: response.body.metadata.total});
            store.transactions = response.body.payments;
            window.scrollTo(0, 0);
        }
    }

    public async handleExport(date: any) {

    }

    public async handleFilter() {
        const path = `type=${this.state.type}${this.state.keyword ? '&keyword=' + this.state.keyword : ''}${this.state.from ? '&from=' + this.state.from : ''}${this.state.to ? '&to=' + this.state.to : ''}`;
        this.props.history.push('/home/revenue/history/' + path);
    }

    private async paginationChange(page: number) {
        this.setState({page: page - 1});
        setTimeout(() => this.getShopTransaction());
    }

    async handleChangeKeyword(e: any) {
        this.setState({
            keyword: e.currentTarget.value
        });
    }

    async handleChangeTime(event: any, picker: any) {
        let startDate = new Date(picker.startDate);
        let endDate = new Date(picker.endDate);
        let timeFilterText = 'Thời gian từ ' + convertDateToString(startDate, false) + ' đến ' + convertDateToString(endDate, false);
        this.setState({
            from: Moment.getDate(startDate.getTime(), "yyyy-mm-dd"),
            to: Moment.getDate(endDate.getTime(), "yyyy-mm-dd"),
            timeFilterText: timeFilterText,
        });
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="revenue-history">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <div className="row">
                            <div className="col-md-4 col-lg-4">
                                <i className="fa fa-search position-absolute" aria-hidden="true"/>
                                <input className="form-control" placeholder="Mã đơn hàng, mã thanh toán, khách hàng..."
                                       onChange={(e: any) => this.handleChangeKeyword(e)}
                                />
                            </div>
                            <div className="col-md-3 col-lg-3">
                                <DateRangePicker
                                    onApply={this.handleChangeTime}
                                    opens="right"
                                    ranges={this.state.ranges}
                                    locale={{cancelLabel: 'Hủy', applyLabel: 'Đồng ý', customRangeLabel: 'Tùy chỉnh'}}
                                >
                                    <i className="fa fa-calendar" aria-hidden="true"/>
                                    <input className="form-control" placeholder="Tìm kiếm theo thời gian đặt hàng"
                                           defaultValue={this.state.timeFilterText}/>
                                </DateRangePicker>
                            </div>
                            <div className="col-md-3 col-lg-3">
                                <select className="form-control" key={this.state.keyType}
                                        onChange={(e: any) => this.setState({type: e.currentTarget.value})}>
                                    <option value="all">Tất cả giao dịch</option>
                                    <option value="order">Doanh thu đơn hàng</option>
                                    <option value="cashout">Thanh toán doanh thu</option>
                                    <option value="return">Hoàn tiền thanh toán lỗi</option>
                                </select>
                            </div>
                            <div className="col-md-2 col-lg-2 d-flex">
                                <button
                                    className="btn btn-primary mr-2 ml-auto"
                                    onClick={this.handleFilter}
                                    type="button">Tìm kiếm
                                </button>
                                {/* <button
                                    className="btn btn-warning"
                                    onClick={this.handleExport}
                                    type="button">Xuất file
                                </button>*/}
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className='table table-striped'>
                                <thead>
                                <tr className="text-center">
                                    <th>Thời gian</th>
                                    <th>Mã giao dịch</th>
                                    <th>Giao dịch</th>
                                    <th>Trạng thái</th>
                                    <th>Số tiền</th>
                                    <th>Số dư</th>
                                </tr>
                                </thead>
                                <tbody>
                                {/*Not found data*/}
                                {Array.isArray(store.transactions) && store.transactions.length === 0 && <tr>
                                    <td colSpan={6}><p className="my-5 text-center">Không tìm thấy dữ liệu</p></td>
                                </tr>}
                                {store.transactions.map((item, index) =>
                                    <ItemListViewRevenueComponent
                                        emitActionShowDetail={e => this.ModalDetailRef.current && this.ModalDetailRef.current.show(item)}
                                        key={index} data={item}/>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {this.state.total > 0 && <div className="card-footer px-0">
                        <div className="d-flex justify-content-end">
                            <PaginationComponent
                                total={this.state.total}
                                number={this.state.size}
                                defaultActive={this.state.page}
                                emitOnChangePage={page => this.paginationChange(page)}
                            />
                        </div>
                    </div>}
                </div>
            </div>
            <ModalDetailRevenueComponent ref={this.ModalDetailRef}/>
        </div>
    }
}
