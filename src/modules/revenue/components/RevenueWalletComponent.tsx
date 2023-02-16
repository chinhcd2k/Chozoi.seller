import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {store} from "../stores/RevenueWalletStore";
import {service} from "../RevenueServices";
import {store as ProfileStore} from "../../profile";
import {Link} from "react-router-dom";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import "../containers/RevenueWalletStyle.scss";
import {ItemListViewRevenueComponent} from "./ItemListViewRevenueComponent";
import ModalDetailRevenueComponent from "./ModalDetailRevenueComponent";
import {handlerRequestError} from "../../../common/services/BaseService";
import {notify} from "../../../common/notify/NotifyService";

@observer
export default class RevenueWalletComponent extends React.Component {
    public state: any;
    public shopId: number = -1;
    public ModalDetailRef = React.createRef<ModalDetailRevenueComponent>();

    constructor(props: any) {
        super(props);
        this.state = {
            change: false,
            bankDefault: '',
            balanceFormatted: 0,
            transactionDetail: '',
        };
        BreadcrumbsService.loadBreadcrumbs([{title: 'Sao kê doanh thu'}]);
        HomeStore.menuActive = [4, 0];
    }

    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        await this.getShopPayment();
        if (store.banks.length === 0) {
            notify.show("Bổ sung thêm thẻ ngân hàng để Chozoi có thể thực hiện thanh toán cho bạn", "error");
        }
        await this.getShopTransaction();
    }

    public async getShopPayment() {
        if (ProfileStore.profile) {
            const response = await service.getShopPayment();
            if (response.status === 200) {
                store.wallet = response.body.payment.wallet;
                store.banks = response.body.payment.bankCards;
                const index: number = store.banks.findIndex(value => value.isDefault);
                this.setState({
                    balanceFormatted: numberWithCommas(store.wallet ? store.wallet.balance : 0),
                    bankDefault: index !== -1 ? store.banks[index] : ''
                });
            } else handlerRequestError(response);
        }
    }

    public async getShopTransaction() {
        if (ProfileStore.profile) {
            const response = await service.getShopTransaction(0, 10);
            if (response.status === 200) {
                store.transactions = response.body.payments;
            }
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="revenue-wallet">
            <div className="container-fluid">
                <div className="card mb-4 header">
                    <div className="actions">
                        <Link to="/home/revenue/cashout" className="btn btn-primary">Yêu cầu thanh
                            toán</Link>
                    </div>
                    <div className="card-body">
                        <h5 className="align-items-center card-title d-flex">Doanh thu hiện tại: <span
                            className="text-2x text-info ml-2"> {numberWithCommas(this.state.balanceFormatted, 'đ')}</span>
                        </h5>
                        <hr/>
                        <div>
                            <i className="fa fa-credit-card"/>
                            <span> Tài khoản mặc định: </span>{this.state.bankDefault && <span>
                            {this.state.bankDefault.name}<span> - </span>
                            {this.state.bankDefault.accountNumber}<span> - </span>
                            {this.state.bankDefault.bank.name}<span> - Chi nhánh </span>
                            {this.state.bankDefault.branch}<span> - </span>
                            {this.state.bankDefault.province.provinceName}
                          </span>}
                            {!this.state.bankDefault && <span> Trống</span>}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Giao dịch gần đây</h5>
                        <div className="actions">
                            <Link to="/home/revenue/history/type=all" className="btn btn-warning"><i
                                className="fa fa-history"/> Lịch sử giao dịch</Link>
                        </div>
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
                                {/*Not Found data*/}
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
                </div>
            </div>
            {/*Modal Detail*/}
            <ModalDetailRevenueComponent ref={this.ModalDetailRef}/>
        </div>
    }
}
