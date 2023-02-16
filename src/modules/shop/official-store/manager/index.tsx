import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {store as HomeStore} from "../../../home";
import "../style.scss";
import {PopupAction} from "./popup/popup-action";
import {observer} from "mobx-react";
import {Moment} from "../../../../common/functions/Moment";
import {TemplateStore} from "../components/templates/store";
import {Link} from "react-router-dom";
import {observable} from "mobx";
import {store as ShopStore} from "../../stores/ShopInfomationStore";
import {IApiResponse} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import $ from "jquery";
import {IResShopProfile} from "../../../../api/shop/interfaces/response";
import {
    sendAddTemplate,
    sendCloneTemplate,
    sendUpdateTemplate,
    getListTemplates,
    sendChangeStateTemplate
} from "../../../../api/offical-store";
import {IResListView} from "../../../../api/offical-store/interfaces/response";

interface IOfficialStoreProps {
    history: { push: (path: string) => any }
}

@observer
export default class OfficialStore extends React.Component<IOfficialStoreProps, any> {
    private PopupActionRef = React.createRef<PopupAction>();
    @observable templates: IResListView[] = [];

    constructor(props: IOfficialStoreProps) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý mẫu store'}]);
        HomeStore.menuActive = [1, 7];
    }

    public async getListTemplates() {
        const shop_id: number = (ShopStore.shopProfile as IResShopProfile).id;
        const response = await getListTemplates(shop_id);
        if (response.status === 200) this.templates = response.body.templates;
    }

    public async handlerOnAccept(type: 'CREATE' | 'RENAME' | 'CLONE' | 'DELETE', name: string, id?: number) {
        const shop_id: number = (ShopStore.shopProfile as IResShopProfile).id;
        let response: IApiResponse = null as any;
        switch (type) {
            case "CREATE":
                response = await sendAddTemplate(shop_id, name);
                break;
            case "RENAME":
                response = await sendUpdateTemplate(shop_id, (this.PopupActionRef.current as PopupAction).state.id, {
                    name: name,
                    logo: null,
                    subBanner: null,
                    picProducts: null,
                    mainBanner: null,
                    coupons: null
                });
                if (response.status === 200) {
                    const search_index = this.templates.findIndex(value => value.id === id);
                    search_index !== -1 && (this.templates[search_index].name = name);
                }
                break;
            case "CLONE":
                response = await sendCloneTemplate(shop_id, (this.PopupActionRef.current as PopupAction).state.id, name);
                break;
            case "DELETE":
                response = await sendChangeStateTemplate(shop_id, id as number, "DELETED");
                if (response.status === 200) {
                    const search_index = this.templates.findIndex(value => value.id === id);
                    search_index !== -1 && this.templates.splice(search_index, 1);
                }
                break;
        }
        if (response.status === 200) {
            notify.show('Thao tác hoàn tất', "success");
            setTimeout(() => this.getListTemplates(), 1000);
        } else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else notify.show('Đã có lỗi xảy ra', "error");
    }

    public showPopupAction(target: 'CREATE' | 'RENAME' | 'CLONE' | 'DELETE', id?: number, name?: string) {
        if (this.PopupActionRef.current && target !== "CREATE" && id !== undefined && name !== undefined)
            this.PopupActionRef.current.setState({id: id, name_old: name});
        TemplateStore.type = target;
        $('div.modal#popup-action').modal({show: true, backdrop: "static"});
    }

    async componentDidMount() {
        await this.getListTemplates();
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (<div id="official-store">
            <div className="container">
                <div className="panel">
                    <div className="panel-heading">
                        <button type="button"
                                onClick={() => this.showPopupAction('CREATE')}
                                className="btn btn-primary float-right mt-3 mr-3">Thiết kế mới
                        </button>
                    </div>
                    <div className="panel-body">
                        <div className="">
                            <table className="table table-striped">
                                <thead>
                                <tr>
                                    <th>Tên phiên bản</th>
                                    <th>Cập nhật</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.templates.map((value, index) =>
                                    <tr key={index}>
                                        <td>{value.name}</td>
                                        <td>{Moment.getDate(value.updatedAt, "dd/mm/yyyy")} {Moment.getTime(value.updatedAt, "hh:mm")}</td>
                                        <td>
                                            {value.state === "DRAFT" && "Nháp"}
                                            {value.state === "PUBLIC" && "Đang hoạt động"}
                                        </td>
                                        <td>
                                            <div>
                                                <div className="btn-group dropdown">
                                                    <button
                                                        className="btn btn-default dropdown-toggle dropdown-toggle-icon"
                                                        data-toggle="dropdown" type="button" aria-expanded="false">
                                                        <i className="fas fa-ellipsis-h"/>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><a href="#"
                                                               onClick={() => this.showPopupAction("RENAME", value.id, value.name)}>Thay
                                                            đổi tên phiên bản</a></li>
                                                        <li><a href="#"
                                                               onClick={() => this.showPopupAction("CLONE", value.id, value.name)}>Tạo
                                                            bản sao chép</a></li>
                                                        <li><a href="#"
                                                               onClick={() => this.showPopupAction("DELETE", value.id, value.name)}>Xóa</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <Link to={'/home/shop/official-store/' + value.id}
                                                      type="button"
                                                      className="ml-3 btn btn-default"><i
                                                    className="far fa-edit"/></Link>
                                            </div>
                                        </td>
                                    </tr>)}
                                {this.templates.length === 0 && <tr>
                                    <td colSpan={4}><p className="mt-3 text-center">Chưa có bản thiêt kế nào</p></td>
                                </tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/*Popup*/}
            <PopupAction
                ref={this.PopupActionRef}
                type={TemplateStore.type as any}
                OnAccept={(type, name) => this.handlerOnAccept(type, name)}
                OnDelete={id => this.handlerOnAccept("DELETE", '', id)}
            />
        </div>);
    }
};
