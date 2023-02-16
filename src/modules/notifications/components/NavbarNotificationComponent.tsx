import React from "react";
import {observer} from "mobx-react";
import {DGetProfile} from "../../../common/decorators/Auth";
import {ItemListNotificationComponent} from "./ItemListNotificationComponent";
import {Link} from "react-router-dom";
import {service} from "../NotificationService";
import {IItemListNotification, NotificationProvider} from "./NotificationComponent";

interface INavbarNotificationComponentProps {
    history: { push: (path: string, state?: any) => void }
}

@observer
export default class NavbarNotificationComponent extends React.Component<INavbarNotificationComponentProps> {
    constructor(props: any) {
        super(props);
        this.state = {
            path: '',
            redirect: false
        };
        window.onfocus = () => {
            this.getListNotification().finally();
        };
    }

    @DGetProfile
    async componentDidMount() {
        this.getListNotification().finally();
    }

    protected async getListNotification() {
        const response = await service.getListNotifications(0, 15, 'ALL');
        if (response.status === 200) {
            NotificationProvider.listShortNotification = response.body.notifications;
            NotificationProvider.totalNew = response.body.totalNew;
        }
    }

    protected async sendReadedAll() {
        service.putReadAll().then(success => {
            if (success.status === 200) {
                NotificationProvider.totalNew = 0;
                NotificationProvider.listShortNotification.map(value => value.readAt = Date.now().toString());
                NotificationProvider.listNotification.map(value => value.readAt = Date.now().toString());
            }
        });
    }

    protected sendViewed() {
        const ids: string[] = NotificationProvider.listShortNotification.reduce((previousValue: string[], currentValue) => {
            currentValue.readAt === null && currentValue.viewedAt === null && previousValue.push(currentValue.id);
            return previousValue;
        }, []);
        ids.length > 0 && service.putViewed(ids).then(response => response.status === 200 && (NotificationProvider.totalNew = response.body.totalNew));
    }

    protected sendActionReaded(value: IItemListNotification) {
        value.order !== null && this.props.history.push(`/home/orders/state=all&keyword=${value.order.shopOrderCode}`);
        !value.readAt && service.putReaded(value.id).then(success => {
            if (success.status === 200) {
                value.readAt = Date.now().toString();
                let index: number = NotificationProvider.listShortNotification.findIndex(value1 => value1.id === value.id);
                index !== -1 && (NotificationProvider.listShortNotification[index].readAt = Date.now().toString());
                index = NotificationProvider.listNotification.findIndex(value1 => value1.id === value.id);
                index !== -1 && (NotificationProvider.listNotification[index].readAt = Date.now().toString());
            }
        });
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <li className="dropdown" id="navbar-notification">
            <a data-toggle="dropdown" className="dropdown-toggle cursor-pointer"
               onClick={async () => {
                   await this.getListNotification();
                   this.sendViewed();
               }}>
                <i className="fas fa-bell"/>
                {NotificationProvider.totalNew > 0 &&
                <span className="badge badge-header badge-danger">{NotificationProvider.totalNew}</span>}
            </a>
            <div className="dropdown-menu dropdown-menu-md dropdown-menu-right">
                {NotificationProvider.listShortNotification.length > 0 &&
                <span className="cursor-pointer float-right pt-2 pr-3 position-relative"
                      style={{textAlign: 'end', zIndex: 1}}
                      onClick={() => this.sendReadedAll()}>Đánh dấu đã đọc tất cả</span>}
                <div className="scrollable">
                    <div className="scrollable-content">
                        {NotificationProvider.listShortNotification.length > 0 && <ul className="head-list">
                            {NotificationProvider.listShortNotification.map((value, index) =>
                                <ItemListNotificationComponent
                                    key={index}
                                    length={90}
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
                    </div>
                </div>
                <div className="pad-all bord-top">
                    {NotificationProvider.listShortNotification.length === 0 &&
                    <p className="text-center m-0">Chưa có thông báo!</p>}
                    {NotificationProvider.listShortNotification.length > 0 &&
                    <Link to="/home/notifications/type=all&page=0&size=10" className="btn-link text-main box-block">
                        <i className="pci-chevron chevron-right pull-right"/>Xem tất cả thông báo
                    </Link>}
                </div>
            </div>
        </li>;
    }
}