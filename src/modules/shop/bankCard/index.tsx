import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {IShopCard, store} from "../stores/ShopCardStore";
import $ from "jquery";
import {store as ProfileStore} from "../../profile";
import {DGetProfile} from "../../../common/decorators/Auth";
import {service} from "../ShopService";
import {notify} from "../../../common/notify/NotifyService";
import {store as HomeStore} from "../../home/stores/HomeStore";
import "./style.scss";

interface IShopCardState {
    keySetDefault: number
    change: boolean
    listBranch: {
        id: number
        name: string
    }[]
    keyProvice: number
    keyBank: number
}

@observer
export default class ShopCard extends React.Component<any, IShopCardState> {
    public iCard: IShopCard;
    public shopId: number = -1;

    constructor(props: any) {
        super(props);
        this.iCard = {
            id: 0,
            name: '',
            identityCard: '',
            accountNumber: '',
            branch: '',
            branchId: {id: -1},
            bank: {},
            province: {},
            isDefault: false,
        };
        this.state = {
            keySetDefault: 0,
            change: false,
            listBranch: [],
            keyProvice: Date.now(),
            keyBank: Date.now()
        };

        BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý thẻ'}]);
        HomeStore.menuActive = [1, 3];
    }

    @DGetProfile
    public async componentDidMount() {
        ProfileStore.profile && (this.shopId = ProfileStore.profile.shopId as number);
        await this.getShopCards();
        const dataProvince = await service.getProvince();
        store.provinces = dataProvince.provinces ? dataProvince.provinces : [];

        await this.getBanks();
    }

    public async getShopCards() {
        if (ProfileStore.profile) {
            const response = await service.getShopCards();
            if (response.status === 200) {
                store.cards = response.body.payment.bankCards;
            }
        }
    }

    public async getBanks() {
        if (ProfileStore.profile) {
            const response = await service.getBanks(ProfileStore.profile.shopId as number);
            if (response.status === 200) {
                store.banks = response.body;
            }
        }
    }

    async handleAddCard(e: any) {
        $('form').trigger("reset");
        this.iCard = {
            id: 0,
            name: '',
            identityCard: '',
            accountNumber: '',
            branch: '',
            branchId: {id: -1},
            bank: {},
            province: {},
            isDefault: false,
        };
        ($('#modalCard') as any).modal('show');
        this.setState({
            change: false
        });
    }

    async handleUpdateCard(e: any, card: any) {
        this.iCard = {
            id: card.id,
            name: card.name,
            identityCard: card.identityCard,
            accountNumber: card.accountNumber,
            branch: card.branch,
            bank: card.bank,
            branchId: card.branchId,
            province: card.province,
            isDefault: card.isDefault,
        };
        ($('#modalCard') as any).modal('show');
        this.setState({
            change: false,
            keyBank: Date.now(),
            keyProvice: Date.now(),
            keySetDefault: Date.now()
        });
    }

    async handleRemoveCard(e: any, card: any) {
        ($('#modal-confirm') as any).modal('show');
        this.iCard.id = card.id;
    }

    async confirmRemoveCard() {
        ($('#modal-confirm') as any).modal('hide');
        if (!this.iCard.id) {
            notify.show("Lỗi chưa xác định", "error");
        } else {
            if (ProfileStore.profile) {
                const response = await service.deleteCard(ProfileStore.profile.shopId as number, this.iCard.id);
                if (response.status === 200) {
                    notify.show('Xóa thành công!', "success");
                    await this.getShopCards();
                } else if (response.body.message) {
                    notify.show(response.body.message, "error");
                } else {
                    notify.show("Yêu cầu tạm thời không thể thực hiện. Vui lòng quay lại sau", "error");
                }
            }
        }
    }

    async handleChangeData(e: any, key: 'name' | 'accountNumber' | 'branch' | 'branchId' | 'bank' | 'province' | 'isDefault') {
        switch (key) {
            case "name":
                let name: string = (e.currentTarget.value || '').toUpperCase();
                name = name.replace(/([^A-Z\s]|\s{2,})/g, ' ');
                e.currentTarget.value = name;
                this.iCard.name = name.trim();
                break;
            case "accountNumber":
                let accountNumber: string = (e.currentTarget.value || '').toUpperCase();
                accountNumber = accountNumber.replace(/[^0-9]/g, '');
                e.currentTarget.value = accountNumber;
                this.iCard.accountNumber = accountNumber;
                break;
            case "branch":
                this.iCard.branch = e.currentTarget.value;
                break;
            case "bank":
                this.iCard.bank.id = e.currentTarget.value;
                this.setState({keyProvice: Date.now()});
                break;
            case "province":
                this.iCard.province.id = e.currentTarget.value;
                const response = await service.getBankBranch(this.shopId, this.iCard.bank.id, this.iCard.province.id);
                this.setState({listBranch: response.status === 200 ? response.body : []});
                break;
            case "branchId":
                this.iCard.branchId.id = parseInt(e.currentTarget.value);
                this.iCard.branch = this.state.listBranch[this.state.listBranch.findIndex(value => value.id === this.iCard.branchId.id)].name;
                break;
            case "isDefault":
                this.iCard.isDefault = !this.iCard.isDefault;
                this.setState({keySetDefault: Math.random()});
                break;
        }
        !this.state.change && this.setState({change: true});
    }

    public async putCard(e: any) {
        e.preventDefault();
        this.setState({
            change: false,
            listBranch: []
        });
        let data = {
            id: 0,
            name: this.iCard.name,
            bank: {
                id: this.iCard.bank.id
            },
            shop: {
                id: this.shopId
            },
            province: {
                id: this.iCard.province.id
            },
            branchId: this.iCard.branchId,
            isDefault: this.iCard.isDefault,
            branch: this.iCard.branch,
            accountNumber: this.iCard.accountNumber,
        };
        (data.branchId && data.branchId.id === -1) && delete data.branchId;
        if (this.iCard.id) {
            data.id = this.iCard.id;
        }

        const response = this.iCard.id > 0 ? await service.updateCard(this.shopId, this.iCard.id, data) : await service.createCard(this.shopId, data);
        if (response.status === 200) {
            notify.show('Gửi thành công!', "success");
            $('form').trigger("reset");
            ($('#modalCard') as any).modal('hide');
            await this.getShopCards();
        } else if (response.body.message && typeof response.body.message === "string") {
            notify.show(response.body.message, "error");
        } else {
            notify.show("Lỗi chưa xác định", "error");
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div id="shop-manager-card">
            <div className="container">
                <div className="card mb-2">
                    <div className="card-header">
                        <h4 className="card-title">Quản lý thẻ</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {(!store.cards || store.cards.length < 10) && <div className="col-md-4">
                                <div className="card-item add" onClick={(e: any) => this.handleAddCard(e)}>
                                    <i className="fa fa-plus fa-3x"/>
                                </div>
                            </div>}
                            {store.cards && store.cards.map((card: any, index: number) =>
                                <div key={index} className='col-md-4'>
                                    <div className="card-item">
                                        <div className="card-item-content">
                                            <div className="card-item-header">
                                                <span className={card.bank.code} title={card.bank.fullName}/>
                                                {card.isDefault &&
                                                <span className="badge badge-primary">Mặc định</span>}
                                            </div>
                                            <div className="card-item-body">
                                                <div className="card-state text-right">
                                                    {card.state === 'CHECKED' &&
                                                    <span className="text-success text-semibold">Đã kiểm tra <i
                                                        className="fa fa-check"/></span>}
                                                    {card.state === 'VERIFIED' &&
                                                    <span className="text-success text-semibold">Đã kiểm tra</span>}
                                                    {card.state === 'UPDATED' && <span
                                                        className="text-danger text-semibold">Cập nhật lại thông tin</span>}
                                                </div>
                                                <div className="card-detail">
                                                    <div className="card-number">{card.accountNumber}</div>
                                                    <div className="card-branch">Chi
                                                        nhánh: {card.branch} - {card.province.provinceName}</div>
                                                    <div className="card-name text-semibold">{card.name}</div>
                                                </div>
                                                <div className="card-actions text-right">
                                                    <span className="text-info"
                                                          onClick={(e: any) => this.handleUpdateCard(e, card)}><i
                                                        className="fa fa-pencil"/> {!card.isDefault ? '|' : ''} </span>
                                                    {!card.isDefault && <span className="text-danger"
                                                                              onClick={(e: any) => this.handleRemoveCard(e, card)}><i
                                                        className="fa fa-trash"/></span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id='modalCard'>
                <div className='modal-dialog'>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Thông tin thẻ</h5>
                            <button type="button" className="close" data-dismiss="modal"><i
                                className="pci-cross pci-circle"/></button>
                        </div>
                        <form onSubmit={(e: any) => this.putCard(e)}>
                            <div className="modal-body text-center">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input className="form-control" placeholder="Chủ tài khoản" required
                                                   pattern="^.{6,60}$" title="Phải có từ 6 đến 60 ký tự"
                                                   onChange={(e: any) => this.handleChangeData(e, 'name')}
                                                   defaultValue={this.iCard ? this.iCard.name : ''}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input className="form-control" placeholder="Số tài khoản" required
                                                   pattern="[0-9]{4,20}" title="Phải có từ 4 đến 20 ký tự"
                                                   onChange={(e: any) => this.handleChangeData(e, 'accountNumber')}
                                                   defaultValue={this.iCard ? this.iCard.accountNumber : ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <select className="form-control"
                                                    required
                                                    key={this.state.keyBank}
                                                    defaultValue={this.iCard.bank ? this.iCard.bank.id : ""}
                                                    onChange={(e: any) => this.handleChangeData(e, 'bank')}>
                                                <option value="" disabled>Ngân hàng</option>
                                                {store.banks && store.banks.map((item: any, index: number) =>
                                                    <option key={index} value={item.id}>{item.fullName}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <select className="form-control"
                                                    key={this.state.keyProvice}
                                                    defaultValue={this.iCard.province ? this.iCard.province.id : ""}
                                                    onChange={(e: any) => this.handleChangeData(e, 'province')}>
                                                <option value="">Tỉnh/Thành phố</option>
                                                {store.provinces && store.provinces.map((item: any, index: number) =>
                                                    <option key={index} value={item.id}>{item.provinceName}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    {this.state.listBranch.length === 0 &&
                                    <input className="form-control" placeholder="Chi nhánh ngân hàng" required
                                           pattern=".{6,50}" title="Phải có từ 6 đến 50 ký tự"
                                           onChange={(e: any) => this.handleChangeData(e, 'branch')}
                                           defaultValue={this.iCard ? this.iCard.branch : ''}
                                    />}
                                    {this.state.listBranch.length > 0 &&
                                    <select className="form-control" defaultValue=""
                                            required
                                            onChange={e => this.handleChangeData(e, "branchId")}>
                                        <option value="" disabled>Lựa chọn chi nhánh</option>
                                        {this.state.listBranch.map((value, index) =>
                                            <option key={index} value={value.id}>{value.name}</option>)}
                                    </select>}
                                </div>
                                <div className="form-group d-flex align-items-center" key={this.state.keySetDefault}>
                                    <span className={this.iCard.isDefault ? 'text-primary' : ''}
                                          onClick={(e: any) => this.handleChangeData(e, 'isDefault')}>
                                      <i className={this.iCard.isDefault ? 'fa-2x mr-3 fa fa-toggle-on' : 'fa-2x mr-3 fa fa-toggle-off'}
                                      />
                                    </span>
                                    Đặt làm thẻ mặc định
                                </div>
                                <div>
                                    {this.state.change &&
                                    <button className="btn btn-primary mr-3" type="submit">Xác
                                        nhận</button>}
                                    {!this.state.change &&
                                    <button className="btn btn-primary mr-3 disabled" type="button">Xác
                                        nhận</button>}
                                    <button className="btn btn-default btn-close"
                                            data-dismiss="modal">Đóng
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="modal-confirm">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body text-center">
                            <div className="mb-4">Thao tác không thể phục hồi. Bạn có chắc muốn xóa thẻ ngân hàng này?
                            </div>
                            <div>
                                <button className="btn btn-danger btn-sm btn-outline mr-3"
                                        onClick={() => this.confirmRemoveCard()}>Đồng ý
                                </button>
                                <button className="btn btn-default btn-sm btn-outline btn-close"
                                        data-dismiss="modal">Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
