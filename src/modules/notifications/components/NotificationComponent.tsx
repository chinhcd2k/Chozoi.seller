import React from "react";
import {Link} from "react-router-dom";
import {observer} from "mobx-react";
import {DGetProfile} from "../../../common/decorators/Auth";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {ItemListNotificationComponent} from "./ItemListNotificationComponent";
import {service} from "../NotificationService";
import "../containers/NotificationsStyle.scss";
import {PaginationComponent} from "../../../common/pagination";
import {store as HomeStore} from "../../home";
import {observable} from "mobx";

interface INotificationComponentProps {
    history: { push: (path: string, state?: any) => void }
    match: { params: { query: string } }
}

interface INotificationComponentState {
    type: 'all' | 'event' | 'order' | 'system'
    renderPagination: boolean
    total: number
    page: number
    size: number
}

export interface IItemListNotification {
    id: string
    type: 'SYSTEM' | 'ORDER' | 'EVENT'
    title: string
    content: string
    order: {
        shopOrderCode: number
    } | null
    createdAt: string
    viewedAt?: string
    readAt?: string
    linkObj: {
        path: string
    } | null
}

class UrlSearchParamsNotifications extends URLSearchParams {
    get getType(): 'all' | 'event' | 'order' | 'system' {
        const value: string = this.get('type') || '';
        if (value === 'event' || value === 'order' || value === 'system') return value;
        else return "all";
    }

    get getPage(): number {
        const value: string = this.get('page') || '0';
        return !isNaN(parseInt(value)) ? parseInt(value) : 0;
    }

    get getSize(): number {
        const value: string = this.get('size') || '15';
        return !isNaN(parseInt(value)) ? parseInt(value) : 15;
    }
}

@observer
export default class NotificationComponent extends React.Component<INotificationComponentProps, INotificationComponentState> {

    constructor(props: INotificationComponentProps) {
        super(props);
        HomeStore.menuActive = [1, 6];
        BreadcrumbsService.loadBreadcrumbs([{title: 'Thông báo'}]);
        this.state = {type: 'all', renderPagination: false, page: 0, size: 15, total: 0};
    }

    @DGetProfile
    componentDidMount() {
        window.scrollTo(0, 0);
        if (this.props.match.params.query) {
            const urlParams = new UrlSearchParamsNotifications(this.props.match.params.query);
            this.setState({
                type: urlParams.getType,
                page: urlParams.getPage,
                size: urlParams.getSize
            });
            setTimeout(() => this.getListNotification());
        }
    }

    componentDidUpdate(prevProps: Readonly<INotificationComponentProps>, prevState: Readonly<INotificationComponentState>, snapshot?: any): void {
        if (prevProps.match.params.query !== this.props.match.params.query) {
            const urlParams = new UrlSearchParamsNotifications(this.props.match.params.query);
            this.setState({
                type: urlParams.getType,
                page: urlParams.getPage,
                size: urlParams.getSize
            }, () => this.getListNotification());
        }
    }

    /*Lấy danh sách sản phẩm*/
    protected async getListNotification() {
        const size = this.state.size;
        const page = this.state.page;
        const response = await service.getListNotifications(page, size, this.state.type.toUpperCase());
        if (response.status === 200) {
            NotificationProvider.listNotification = response.body.notifications;
            NotificationProvider.totalNew = response.body.totalNew;
            this.setState({
                total: response.body.metadata.total
            });
        }
    }

    /*Đánh dấu đã đọc*/
    protected sendActionReaded(value: IItemListNotification) {
        value.order !== null && this.props.history.push(`/home/orders/state=all&keyword=${value.order.shopOrderCode}`);
        !value.readAt && service.putReaded(value.id).then(success => {
            if (success.status === 200) {
                value.readAt = Date.now().toString();
                !value.viewedAt && (NotificationProvider.totalNew -= 1);
            }
        });
    }

    protected paginationChange(page: number) {
        this.setState({page: page - 1});
        setTimeout(() => this.getListNotification());
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="container-fluid" id="manager-notification">
            <div className="tab-base">
                <ul className="nav nav-tabs">
                    <li className={this.state.type === 'all' ? 'active' : ''}>
                        <Link to="/home/notifications/type=all&page=0&size=10"><i className="fas fa-home"/> Tất
                            cả</Link>
                    </li>
                    <li className={this.state.type === 'event' ? 'active' : ''}>
                        <Link to="/home/notifications/type=event&page=0&size=10"><i className="fas fa-percent"/> Sự
                            kiện</Link>
                    </li>
                    <li className={this.state.type === 'order' ? 'active' : ''}>
                        <Link to="/home/notifications/type=order&page=0&size=10"><i className="fas fa-file-alt"/> Đơn
                            hàng</Link>
                    </li>
                    <li className={this.state.type === 'system' ? 'active' : ''}>
                        <Link to="/home/notifications/type=system&page=0&size=10"><i
                            className="fas fa-globe-asia"/> Khác</Link>
                    </li>
                </ul>
                <div className="tab-content">
                    <div className="tab-pane fade active in">
                        {NotificationProvider.listNotification.length === 0 &&
                        <div className="empty"><p className="my-5 text-center">Chưa có thông báo nào</p></div>}
                        {NotificationProvider.listNotification.length > 0 && <ul className="list">
                            {NotificationProvider.listNotification.map((value, index) => <ItemListNotificationComponent
                                key={index}
                                type={value.type}
                                title={value.title}
                                order={value.order}
                                readAt={value.readAt}
                                content={value.content}
                                createdAt={value.createdAt}
                                link={value.linkObj ? value.linkObj.path : undefined}
                                emitActionReaded={() => this.sendActionReaded(value)}
                            />)}
                        </ul>}

                        {/*Pagination*/}
                        {NotificationProvider.listNotification.length > 0 &&
                        <div className="mt-3 d-flex justify-content-end">
                            <PaginationComponent
                                total={this.state.total}
                                number={this.state.size}
                                defaultActive={this.state.page}
                                emitOnChangePage={(page: number) => this.paginationChange(page)}/>
                        </div>}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export class NotificationProvider {
    // Số lượng thông báo chưa đọc
    @observable static totalNew: number = 0;

    // Danh sách thông báo
    @observable static listShortNotification: IItemListNotification[] = [];

    @observable static listNotification: IItemListNotification[] = [];
}