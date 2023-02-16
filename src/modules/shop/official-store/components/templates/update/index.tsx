import React from "react";
import {BreadcrumbsService} from "../../../../../../common/breadcrumbs";
import {store as HomeStore} from "../../../../../home";
import {CATEGORY_CTRL} from "../category/control";
import TemplateComponent from "../index";
import {HEADER_CTRL} from "../headers/control";
import {BANNER_PRIMARY_CTRL} from "../baner-primary/control";
import {BANNER_CTRL} from "../banner/control";
import {notify} from "../../../../../../common/notify/NotifyService";
import {UPDATE_TEMPLATE_CTRL} from "./control";
import {TemplateStore} from "../store";
import {sendChangeStateTemplate} from "../../../../../../api/offical-store";

interface ICreateOfficialProps {
    match: { params: { id: string } }
    history: { goBack: () => any, push: (path: string) => any }
}

export default class UpdateOfficialStore extends React.Component<ICreateOfficialProps, any> {
    constructor(props: ICreateOfficialProps) {
        super(props);
        UPDATE_TEMPLATE_CTRL.view = this;
        BreadcrumbsService.loadBreadcrumbs([{
            title: 'Quản lý mẫu store',
            path: '/home/shop/official-store'
        }, {title: 'Thiết kế store'}]);
        HomeStore.menuActive = [1, 7];
    }

    componentDidMount(): void {
        const template_id = parseInt(this.props.match.params.id);
        if (isNaN(template_id)) {
            notify.show('Không tìm thấy bản thiết kế', "error");
            this.props.history.goBack();
            return;
        }
        UPDATE_TEMPLATE_CTRL.getDetailTemplate(template_id);
        CATEGORY_CTRL.getCategoryForShop();
        CATEGORY_CTRL.getProductsForShop();
    }

    componentWillUnmount(): void {
        HEADER_CTRL.store.logo = {web: null, app: null};
        CATEGORY_CTRL.store.category = [
            {
                web: {
                    image: null,
                    category: null
                },
                app: {
                    image: null,
                    category: null
                },
                products: []
            }
        ];
        BANNER_PRIMARY_CTRL.store.banner = {
            web: [{
                image: null,
                category: null
            }],
            app: [
                {
                    image: null,
                    category: null
                }
            ]
        };
        BANNER_CTRL.store.banner = [
            {
                web: {
                    image: null,
                    category: null
                },
                app: {
                    image: null,
                    category: null
                }
            },
            {
                web: {
                    image: null,
                    category: null
                },
                app: {
                    image: null,
                    category: null
                }
            }
        ];
    }

    protected async handlerOnAction(target: 'PUBLIC' | 'DRAFT') {
        const detailTemplate = TemplateStore.detailTemplate;
        const response = await sendChangeStateTemplate(detailTemplate.shopId, detailTemplate.id, target);
        if (response.status === 200) notify.show('Thao tác thành công !', "success");
        else if (response.body && response.body.message && typeof response.body.message === "string")
            notify.show(response.body.message, "error");
        else notify.show('Đã có lỗi xảy ra', "error");
    }

    protected handlerOnCancer() {
        this.props.history.goBack();
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="create-official-store">
            <TemplateComponent
                OnCancer={() => this.handlerOnCancer()}
                OnSave={target => this.handlerOnAction(target)}
            />
        </div>
    }
}
