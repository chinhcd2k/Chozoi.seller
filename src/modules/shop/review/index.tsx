import React from "react";
import {observer} from "mobx-react";
import {menu} from "../../home/stores/HomeStore";
import {breadcrumb} from "../../../common/breadcrumbs/BreadcrumbsService";
import Filter from "./components/Filter";
import ItemReview from "./components/ItemReview";
import {IReview, ShopReviewService} from "./service";
import Search from "./components/Search";
import {store as ProfileStore} from "../../profile";
import * as Sentry from "@sentry/browser";
import {Skeleton, Pagination, Empty} from "antd";
import {IResProfile} from "../../../api/auth/interfaces/response";

@observer
export default class ShopReviewSite extends React.Component<any, any> {
    profileStore = ProfileStore.profile as IResProfile;
    service = ShopReviewService.service;

    protected matchQueryString() {
        if (this.props.location.search) {
            const params = new URLSearchParams(this.props.location.search);
            const page = params.get('page');
            const size = params.get('size');
            const status = (params.get('status') || '').toLowerCase();
            const rate = params.get('rate');
            const product = params.get('product') || '';
            const buyer = params.get('buyer') || '';
            const fromDate = params.get('fromDate') || '';
            const toDate = params.get('toDate') || '';

            this.service.productName = product;
            this.service.buyerName = buyer;
            this.service.date = (fromDate && toDate) ? [fromDate, toDate] : undefined;
            this.service.page = parseInt(page as string) || 0;
            this.service.size = parseInt(size as string) || this.service.size;
            this.service.status = /^(reply|unreply)$/.test(status || '') ? status as ("reply" | "unreply") : "";
            this.service.rate = parseInt(rate as string) as (1 | 2 | 3 | 4 | 5) || "";

        } else {
            this.service.productName = '';
            this.service.buyerName = '';
            this.service.date = undefined;
            this.service.status = '';
            this.service.rate = '';
        }
    }

    protected handlerOnSearch(productName?: string, buyerName?: string, date?: [string, string]) {
        let search = '?';
        const {status, rate} = this.service;
        search += `product=${productName || null}`;
        search += `&buyer=${buyerName || null}`;
        search += `&fromDate=${date ? date[0] : null}&toDate=${date ? date[1] : null}`;
        search += `&status=${status || null}`;
        search += `&rate=${rate || null}`;
        search += '&page=0&size=5';
        search = search.replace(/[?&]\w+\=null/g, "");
        search = search.replace(/^&/, "?");
        this.props.history.push('/home/shop/review' + search);
    }

    protected handlerOnFilter(type: 'status' | 'rate', value: string | number) {
        let search = '?';
        const {productName, buyerName, date, status, rate} = this.service;
        search += `product=${productName || null}`;
        search += `&buyer=${buyerName || null}`;
        search += `&fromDate=${date ? date[0] : null}&toDate=${date ? date[1] : null}`;
        if (type === "status") {
            search += `&status=${value || null}`;
            search += `&rate=${rate || null}`;
        } else if (type === "rate") {
            search += `&status=${status || null}`;
            search += `&rate=${value || null}`;
        }
        search += '&page=0&size=5';
        search = search.replace(/[?&]\w+\=null/g, "");
        search = search.replace(/^&/, "?");
        this.props.history.push('/home/shop/review' + search);
    }

    handlerOnChangePage(page: number, page_size: number) {
        let search = this.props.location.search || '?';
        search = search.replace(/[?&]page=\d*/i, "");
        search = search.replace(/&size=\d*/i, "");
        search += `&page=${page ? page - 1 : page}&size=${page_size}`;
        search = search.replace(/^&/i, "?");
        this.props.history.push('/home/shop/review' + search);
    }

    handlerOnReply(data: IReview, text: string, callback: (success: boolean) => any) {
        this.service.updateReply(data.id, text, callback).finally();
    }

    @menu(1, 4)
    @breadcrumb([{title: 'Đánh giá cửa hàng'}])
    async componentDidMount() {
        this.matchQueryString();
        await this.service.getListReview(this.profileStore.shopId as number);
        window.scrollTo(0, 0);
    }

    async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.location.search !== this.props.location.search) {
            this.matchQueryString();
            await this.service.getListReview(this.profileStore.shopId as number);
            window.scrollTo(0, 0);
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            const {buyerName, productName, date, status, rate, listReview, loading, page, total, size} = this.service;
            return <div id="shop-review" style={{padding: '0 16px'}}>
                <Search buyerName={buyerName}
                        productName={productName}
                        date={date}
                        onSeach={((productName1, buyerName1, dateString) => this.handlerOnSearch(productName1, buyerName1, dateString))}/>
                <Filter
                    status={status}
                    rate={rate}
                    onFilter={(type, value) => this.handlerOnFilter(type, value)}/>
                {loading && <div className="w-100 d-flex flex-column"
                                 style={{backgroundColor: 'white'}}>{[...Array(3)].map((value, index) => <Skeleton
                    key={index} active/>)}</div>}
                {!loading && <ul style={{listStyle: 'none', paddingLeft: 0}}>
                    {listReview.length === 0 &&
                    <li className="d-flex flex-column justify-content-center align-content-center"
                        style={{minHeight: '60vh'}}><Empty/></li>}
                    {listReview.map((value, index) => <li key={index} style={{marginTop: '8px'}}>
                        <ItemReview key={value.id} data={value}
                                    onReply={((text, callback) => this.handlerOnReply(value, text, callback))}/>
                    </li>)}
                </ul>}
                {!loading && total > 0 && <Pagination
                    current={page + 1}
                    defaultPageSize={size}
                    total={total}
                    pageSizeOptions={['5', '10', '20']}
                    onChange={(page, pageSize) => this.handlerOnChangePage(page, pageSize || size)}/>}
            </div>
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }
}
