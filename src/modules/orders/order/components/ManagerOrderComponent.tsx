import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {IItemListOrder, service} from "../../OrderServices";
import {Link} from "react-router-dom";
import {PaginationComponent} from "../../../../common/pagination";
import {observer} from "mobx-react";
import "react-datepicker/dist/react-datepicker.css";
import {store as ProfileStore} from "../../../profile";
import {store as HomeStore} from "../../../home/stores/HomeStore";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import $ from "jquery";
import ReactToPrint from 'react-to-print';
import {notify} from "../../../../common/notify/NotifyService";
import "../containers/ManagerOrderStyle.scss";
import {Moment} from "../../../../common/functions/Moment";
import OrderPrintComponent from "../../components/OrderPrintComponent";
import ImageViewer from "../../../../common/image-viewer/ImageViewer";
import {observable} from "mobx";
import {store as ShopStore} from "../../../shop/stores/ShopInfomationStore";
import {css} from "@emotion/core";

interface IManagerOrderComponentProps {
    history: { push: (path: string, state?: any) => void }
    match: {
        params: {
            query: string
        }
    }
}

interface IManagerOrderComponentState {
    state: 'processing' | 'draft' | 'shipping' | 'finished' | 'canceled' | 'all'
    keyword: string
    from: string
    to: string
    timeFilterText: string
    orderPrint: string
    ranges: any
    shippingFeeTotal: number
    page: number
    size: number
    total: number
    keyFilter: number
}

@observer
export default class ManagerOrderComponent extends React.Component<IManagerOrderComponentProps, IManagerOrderComponentState> {
    public state: any;
    public componentRef: any;
    private shopId: number = -1;
    public ImageViewerRef = React.createRef<ImageViewer>();

    @observable listPackageOrder: IItemListOrder[] = [];
    @observable visiable: boolean = true;
    _exporter: any;

    constructor(props: IManagerOrderComponentProps) {
        super(props);
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
            currentState: 'all',
            keyword: '',
            startDate: null,
            endDate: null,
            timeFilterText: '',
            orderPrint: '',
            ranges: {
                'H??m nay': [today, today],
                'H??m qua': [yesterday, yesterday],
                '7 ng??y g???n ????y': [pre7Day, today],
                '30 ng??y g???n ????y': [pre30Day, today],
                '6 th??ng g???n ????y': [pre6Month, today],
            },
            keyFilter: 0,
            shippingFeeTotal: 0,
            page: 0,
            size: 10,
            total: 0
        };
        BreadcrumbsService.loadBreadcrumbs([{title: 'Qu???n l?? ????n h??ng'}]);
        HomeStore.menuActive = [2, 0];

        /*Bind*/
        this.getListOrder = this.getListOrder.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleChangeTime = this.handleChangeTime.bind(this);
    }

    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        if (this.props.match.params.query) {
            const urlSearch = new UrlSearchParamsOrder(this.props.match.params.query);
            this.setState({
                state: urlSearch.getState,
                from: urlSearch.getFrom,
                to: urlSearch.getFrom,
                keyword: urlSearch.getKeyword,
                page: urlSearch.getPage,
                size: urlSearch.getSize,
                keyFilter: Math.random()
            }, () => this.getListOrder());
        }
    }

    componentDidUpdate(prevProps: Readonly<IManagerOrderComponentProps>, prevState: Readonly<IManagerOrderComponentState>, snapshot?: any): void {
        if (prevProps.match.params.query !== this.props.match.params.query) {
            const urlSearch = new UrlSearchParamsOrder(this.props.match.params.query);
            this.setState({
                state: urlSearch.getState,
                from: urlSearch.getFrom,
                to: urlSearch.getTo,
                keyword: urlSearch.getKeyword,
                page: urlSearch.getPage,
                size: urlSearch.getSize,
                keyFilter: Math.random()
            }, () => this.getListOrder());
        }
        if (prevState.state !== this.state.state) this.setState({timeFilterText: '', keyword: ''});
    }

    public async getListOrder() {
        const response = await service.getListOrder(this.shopId, this.state.state, this.state.size, this.state.page, this.state.keyword, this.state.from, this.state.to);
        this.listPackageOrder = [];
        if (response.status === 200 && response.body.shopOrders) {
            this.setState({total: response.body.metadata.total});
            Object.assign(this.listPackageOrder, response.body.shopOrders);
            window.scrollTo(0, 0);
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, 'error');
        else
            notify.show('???? c?? l???i x???y ra', 'error');
    }

    public async handleExport(date: any) {
        /* if (store._dataParser.length > 0) {
             this._exporter.save();
         }*/
    }

    public async handleFilter() {
        const path: string = `state=${this.state.state}${this.state.keyword ? '&keyword=' + this.state.keyword : ''}${this.state.from ? '&from=' + this.state.from : ''}${this.state.to ? '&to=' + this.state.to : ''}`;
        this.props.history.push('/home/orders/' + path);
    }

    public async paginationChange(page: number) {
        this.setState({page: page - 1});
        setTimeout(() => this.getListOrder());
    }

    public sumProperty(arr: any, type: any) {
        return arr.reduce((total: any, obj: any) => {
            if (typeof obj[type] === 'string') {
                return total + Number(obj[type]);
            }
            return total + obj[type];
        }, 0);
    }

    async handleChangeTime(event: any, picker: any) {
        let startDate = new Date(picker.startDate);
        let endDate = new Date(picker.endDate);
        let timeFilterText = 'Th???i gian t??? ' + Moment.getDate(startDate.getTime(), 'dd/mm/yyyy', false) + ' ?????n ' + Moment.getDate(endDate.getTime(), "dd/mm/yyyy", false);
        this.setState({
            from: Moment.getDate(startDate.getTime(), "yyyy-mm-dd", false),
            to: Moment.getDate(endDate.getTime(), "yyyy-mm-dd", false),
            timeFilterText: timeFilterText,
        });
    }

    async printDeliveryNote(id: number) {
        const response = await service.getOrderDetailPrint(this.shopId, id);
        if (response.status === 200) {
            let orderDetail = response.body;
            if (orderDetail) {
                this.setState({
                    shippingFeeTotal: orderDetail.shippingFeeTotal,
                    orderPrint: orderDetail,
                });
                $('#manager-orders .modal#deliveryNoteModal').modal('show');
            }
        } else if (response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else
            notify.show('???? c?? l???i x???y ra', "error");
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="manager-orders">
            {this.renderWaring}
            <div className='container-fluid'>
                <div className='row'>
                    <div className="col-xs-12">
                        <div className="card">
                            <div className="row search-order" key={this.state.keyFilter}>
                                <div className="col-md-4 col-lg-4 d-flex">
                                    <i className="fa fa-search position-absolute"/>
                                    <input className="form-control" placeholder="M?? ????n h??ng..."
                                           defaultValue={this.state.keyword}
                                           onChange={(e: any) => this.setState({keyword: e.currentTarget.value})}/>
                                </div>
                                <div className="col-md-3 col-lg-3 d-flex">
                                    <DateRangePicker
                                        onApply={this.handleChangeTime} opens="right" ranges={this.state.ranges}
                                        locale={{
                                            cancelLabel: 'H???y',
                                            applyLabel: '?????ng ??',
                                            customRangeLabel: 'T??y ch???nh'
                                        }}>
                                        <i className="fa fa-calendar" aria-hidden="true"/>
                                        <input className="form-control" placeholder="T??m ki???m theo th???i gian ?????t h??ng"
                                               onKeyDown={(e: any) => e.preventDefault()}
                                               defaultValue={this.state.timeFilterText}/>
                                    </DateRangePicker>
                                    <button
                                        className="btn btn-outline ml-3 btn-default"
                                        onClick={this.handleFilter}
                                        type="button"><i className="fa fa-search"/> T??m ki???m
                                    </button>
                                </div>
                                <div className="col-md-5 col-lg-5 d-flex justify-content-end">
                                    {/* <button
                                        className="btn btn-outline btn-primary"
                                        onClick={this.handleExport}
                                        type="button">Xu???t file
                                    </button>*/}
                                    {/*<ExcelExport data={store.dataParser} fileName="Danh s??ch ????n h??ng.xlsx"
                                                 ref={(exporter) => {
                                                     this._exporter = exporter;
                                                 }} headerPaddingCellOptions={{bold: true}}>
                                        <ExcelExportColumn field="code" title="M?? ????n h??ng" width={150}/>
                                        <ExcelExportColumn field="product" title="S???n ph???m" width={380}/>
                                        <ExcelExportColumn field="method" title="H??nh th???c thanh to??n" width={190}/>
                                        <ExcelExportColumn field="shipping" title="????n v??? v???n chuy???n" width={160}/>
                                        <ExcelExportColumn field="state" title="Tr???ng th??i" width={140}/>
                                        <ExcelExportColumn field="time" title="Th???i gian" width={140}/>
                                    </ExcelExport>*/}
                                </div>
                            </div>
                        </div>
                        <div className="tab-base">
                            <ul className="nav nav-tabs">
                                <li className={this.state.state === "all" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=all"}>T???t c???</Link>
                                </li>
                                <li className={this.state.state === "draft" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=draft"}>????n nh??p</Link>
                                </li>
                                <li className={this.state.state === "processing" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=processing"}>Ch??? x??? l??</Link>
                                </li>
                                <li className={this.state.state === "shipping" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=shipping"}>??ang giao</Link>
                                </li>
                                <li className={this.state.state === "finished" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=finished"}>Ho??n th??nh</Link>
                                </li>
                                <li className={this.state.state === "canceled" ? 'active' : ''}>
                                    <Link to={"/home/orders/state=canceled"}>???? h???y</Link>
                                </li>

                            </ul>
                            <div className="tab-content">
                                <div id="content-order" className="tab-pane fade active in table-responsive">
                                    <table className='table table-sm table-striped'>
                                        <thead>
                                        <tr>
                                            <th className="text-center">M?? ????n h??ng</th>
                                            <th className="text-center">S???n ph???m</th>
                                            <th/>
                                            <th className="text-center">H??nh th???c thanh to??n</th>
                                            <th className="text-center">T??nh tr???ng</th>
                                            <th className="text-center">????n v??? v???n chuy???n</th>
                                            <th className="text-center">Thao t??c</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/*List Order Request*/}
                                        {this.listPackageOrder.map((value, index: number) => <tr key={index}>
                                            <td className="text-center">
                                                <Link className="text-info"
                                                      to={"/home/order/package/" + value.id}>{value.code}</Link>
                                                <p>{Moment.getDate(value.createdAt, "dd/mm/yyyy")} {Moment.getTime(value.createdAt, "hh:mm")}</p>
                                            </td>
                                            <td>
                                                <img src={value.orderLines[0].productImage} height={60}
                                                     onClick={() => this.ImageViewerRef.current && this.ImageViewerRef.current.show(value.orderLines[0].productImage)}
                                                     className="mr-2 cursor-pointer" alt=""/>
                                                {value.orderLines[0].productName}
                                            </td>
                                            <td>
                                                {value.orderLines[0].isFreeShip &&
                                                <span className="label label-info font-weight-bold">Freeship</span>}
                                            </td>
                                            <td className="text-center">
                                                {value.order.paymentType === "COD" && "Nh???n h??ng thanh to??n - COD"}
                                                {value.order.paymentType === "PAY" && "Thanh to??n Online - PAY"}
                                            </td>
                                            <td className="text-center">
                                                {value.state === "NEW" &&
                                                <p className="label label-info">M???i</p>
                                                }
                                                {value.state === "CANCELED" &&
                                                <p className="label label-danger">???? h???y</p>
                                                }
                                                {value.state === "CONFIRMED" &&
                                                <p className="label label-info">???? x??c nh???n</p>
                                                }
                                                {value.state === "SHIPPING" &&
                                                <p className="label label-info">??ang giao</p>
                                                }
                                                {value.state === "COMPLETED" &&
                                                <p className="label label-success">???? giao h??ng</p>
                                                }
                                                {value.state === "FINISHED" &&
                                                <p className="label label-success">Ho??n th??nh</p>
                                                }
                                            </td>
                                            <td className="text-center">{value.shippingPartnerName}</td>
                                            <td className="text-center">
                                                {((value.shippingCode && !/^(CANCELED|FINISHED)$/.test(value.state)) || (value.shippingPartnerCode === "SELLER_EXPRESS" && value.state === "SHIPPING")) &&
                                                <div className="d-flex flex-column">
                                                    <i className="fa fa-print text-warning"/>
                                                    <span className="text-warning"
                                                          style={{cursor: "pointer"}}
                                                          onClick={() => this.printDeliveryNote(value.id)}>In phi???u giao</span>
                                                </div>}
                                            </td>
                                        </tr>)}
                                        {/*Not Found data*/}
                                        {this.listPackageOrder.length === 0 && <tr>
                                            <td colSpan={7}><p className="my-5 text-center">Ch??a c?? ????n n??o!</p>
                                            </td>
                                        </tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="mt-3 d-flex justify-content-end">
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
            </div>
            <div className="modal fade" id='deliveryNoteModal'>
                <div className='modal-dialog'>
                    <div className="modal-content">
                        <div className="modal-body">
                            <div>
                                <OrderPrintComponent ref={el => (this.componentRef = el)}
                                                     order={this.state.orderPrint}/>
                                <ReactToPrint
                                    trigger={() => <button className="btn btn-sm btn-primary">In phi???u</button>}
                                    content={() => this.componentRef}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ImageViewer ref={this.ImageViewerRef}/>
        </div>
    }

    get renderWaring(): React.ReactNode {
        if (ShopStore.shopProfile&&ShopStore.shopStats) {
            const {countOrder} = ShopStore.shopStats;
            if (!countOrder && this.visiable) {
                const warringCss = css`
            border: 1px dashed #F54B24;
            background: #FEF3EC 0% 0% no-repeat padding-box;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            position: relative;
            
            button.close {
                position: absolute;
                right: 12px;
                top: 8px;
                width: 24px;
                height: 24px;
                border: 1px solid #F54B24;
                background-color: transparent;
                border-radius: 50%;
                
                &:hover {
                    opacity: 1;
                }
                
                i.fa-times {
                    color: #F54B24;
                }  
            }
            
            p {
                padding-right: 20px;
                margin-bottom: 0;
                color: #000000;
                font-size: 17px;
            }
        `;
                return <div className='container-fluid mx-3' css={warringCss}>
                    <button
                        onClick={() => this.visiable = false}
                        className="close d-flex flex-column align-items-center justify-content-center">
                        <i className="fal fa-times"/></button>
                    <p>Ch??? c???n th??m 1 b?????c n???a th??i s??? gi??p b???n t??ng c?? h???i c?? th??m ????n h??ng. ????ng s???n ph???m c???a m??nh
                        ngay ????? kh??ch h??ng c?? th??? t??m ki???m v?? mua s???n ph???m c???a b???n ngay nh??. <Link
                            to={"/home/product/add"}>????ng b??n ngay</Link></p>
                </div>
            }
        }
        return null;
    }
}

class UrlSearchParamsOrder extends URLSearchParams {
    constructor(search: string) {
        super(search);
        Object.setPrototypeOf(this, UrlSearchParamsOrder.prototype);
    }

    get getState(): 'processing' | 'draft' | 'shipping' | 'finished' | 'canceled' | 'all' {
        const state: string | null = this.get('state');
        if (state === 'processing' || state === 'shipping' || state === 'draft' || state === 'finished' || state === 'canceled')
            return state;
        else
            return 'all';
    }

    get getKeyword(): string {
        return this.get('keyword') || '';
    }

    get getFrom(): string {
        const value: string = this.get('from') || '';
        const re = RegExp(/^\d{4}-\d{2}-\d{2}$/g);
        if (re.test(value)) return value;
        return '';
    }

    get getTo(): string {
        const value: string = this.get('to') || '';
        const re = RegExp(/^\d{4}-\d{2}-\d{2}$/g);
        if (re.test(value)) return value;
        return '';
    }

    get getPage(): number {
        const value: number = parseInt(this.get('page') || '0');
        return isNaN(value) ? 0 : value;
    }

    get getSize(): number {
        const value: number = parseInt(this.get('page') || '10');
        return isNaN(value) ? 10 : value;
    }
}
