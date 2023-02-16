import React from "react";
import {observer} from "mobx-react";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {css} from "@emotion/core";
import {service} from "../ShopService";
import {store as ProfileStore} from "../../profile";
import $ from "jquery";
import {notify} from "../../../common/notify/NotifyService";
import {store as HomeStore} from "../../home/stores/HomeStore";
import {observable} from "mobx";
import {Button} from "antd";
import {store as ShopStore} from "../stores/ShopInfomationStore";
import PopupNewAddress from "./components/PopupNewAddress";
import {IResShopContact} from "../../../api/contact/interfaces/response";
import { getListContact } from "../../../api/contact";

@observer
export default class ShopAddress extends React.Component {
  public iContact: IResShopContact;
  public state: any;

  @observable contacts: IResShopContact[] = [];
  @observable provinces: { id: number, provinceName: string }[] = [];
  @observable districts: { id: number, districtName: string }[] = [];
  @observable wards: { id: number, wardName: string }[] = [];

  constructor(props: any) {
    super(props);
    this.iContact = {
      id: 0,
      contactType: '',
      name: '',
      shopId: 0,
      phoneNumber: '',
      isDefault: false,
      address: {
        detailAddress: '',
        province: {
          id: '',
          provinceName: ''
        },
        district: {
          id: '',
          districtName: ''
        },
        ward: {
          id: '',
          wardName: ''
        }
      },
    };
    this.state = {
      change: false
    };
    BreadcrumbsService.loadBreadcrumbs([{title: 'Quản lý địa chỉ'}]);
    HomeStore.menuActive = [1, 1];
    this.getShopContacts = this.getShopContacts.bind(this);
  }

  public async componentDidMount() {
    await this.getShopContacts();
    const dataProvince = await service.getProvince();
    this.provinces = this.provinces = dataProvince.provinces ? dataProvince.provinces : [];
  }


  public async getShopContacts() {
    try {
      if (ProfileStore.profile) {
        const {status, body} = await getListContact(ProfileStore.profile.shopId as number);
        if (status === 200) {
          this.contacts = body;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async handleCreateContact(e: any) {
    $('form').trigger("reset");
    this.iContact = {
      id: 0,
      contactType: '',
      name: '',
      shopId: 0,
      phoneNumber: '',
      isDefault: false,
      address: {
        detailAddress: '',
        province: {
          id: '',
          provinceName: ''
        },
        district: {
          id: '',
          districtName: ''
        },
        ward: {
          id: '',
          wardName: ''
        }
      },
    };

    this.districts = [];
    this.wards = [];
    $('div.modal#modalContact').modal({show: true, backdrop: "static"});
    this.setState({
      change: false
    });
  }

  async handleUpdateContact(contact: IResShopContact) {
    $('form').trigger("reset");
    this.iContact = {
      id: contact.id,
      contactType: contact.contactType,
      name: contact.name,
      shopId: contact.shopId,
      phoneNumber: contact.phoneNumber,
      isDefault: contact.isDefault,
      address: {
        detailAddress: contact.address.detailAddress,
        province: {
          id: contact.address.province.id,
          provinceName: contact.address.province.provinceName
        },
        district: {
          id: contact.address.district.id,
          districtName: contact.address.district.districtName
        },
        ward: {
          id: contact.address.ward.id,
          wardName: contact.address.ward.wardName
        }
      },
    };

    $('div.modal#modalContact').modal({show: true, backdrop: "static"});
    await this.getDistricts(contact.address.province.id);
    await this.getWards(contact.address.district.id);
    this.setState({
      change: false
    });
  }

  public async handleDeleteContact(id: number) {
    this.iContact.id = id;
    $('div.modal#modalConfirm').modal({show: true, backdrop: "static"});
  }

  public async confirmDeleteContact(e: any) {
    if (ProfileStore.profile && this.iContact.id) {
      const response = await service.deleteContact(ProfileStore.profile.shopId as number, this.iContact.id);
      if (response.status === 200) {
        notify.show('Xóa liên hệ thành công!', "success");
        $('div.modal#modalConfirm').modal({show: true, backdrop: "static"});
        await this.getShopContacts();
      } else if (response.body.message) {
        notify.show(response.body.message, "error");
      } else {
        notify.show("Lỗi chưa xác định", "error");
      }
    }
  }

  async handleChangeType(e: any) {
    this.iContact.contactType = e.currentTarget.value;
    this.setState({
      change: true
    });
  }

  async handleChangeName(e: any) {
    this.iContact.name = e.currentTarget.value;
    this.setState({
      change: true
    });
  }

  async handleChangePhone(e: any) {
    this.iContact.phoneNumber = e.currentTarget.value;
    this.setState({
      change: true
    });
  }

  async handleChangeAddress(e: any) {
    this.iContact.address.detailAddress = e.currentTarget.value;
    this.setState({
      change: true
    });
  }

  public async putContact(e: any) {
    e.preventDefault();
    this.setState({
      change: false
    });
    if (ProfileStore.profile) {
      try {
        const {address: {province, district, ward}} = this.iContact;
        const data = {
          detail_address: this.iContact.address.detailAddress,
          ward_id: parseInt(ward.id),
          district_id: parseInt(district.id),
          province_id: parseInt(province.id),
          name: this.iContact.name,
          phone_number: this.iContact.phoneNumber,
          is_default: this.iContact.isDefault,
          type: this.iContact.contactType.toLowerCase()
        };
        const response = this.iContact.id > 0 ? await service.updateContact(ProfileStore.profile.shopId as number, this.iContact.id, data) : await service.createContact(ProfileStore.profile.shopId as number, data);
        if (response.status === 200) {
          notify.show('Gửi thành công!', "success");
          $('form').trigger("reset");
          $('div.modal#modalContact').modal({show: true, backdrop: "static"});
          await this.getShopContacts();
        } else if (response.body.message) {
          notify.show(response.body.message, "error");
        } else {
          notify.show("Lỗi chưa xác định", "error");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  public async getDistricts(province_id: any) {
    const provinceId = parseInt(province_id, 10);
    const data = await service.getDistricts(provinceId);
    this.iContact.address.province.id = provinceId;
    this.wards = [];
    this.districts = data ? data.districts : [];
    this.setState({
      change: true
    });
  }

  public async getWards(district_id: any) {
    const districtId = parseInt(district_id, 10);
    const data = await service.getWards(districtId);
    this.iContact.address.district.id = districtId;
    this.wards = data ? data.wards : [];
    this.setState({
      change: true
    });
  }

  public async changeWard(ward_id: any) {
    const wardId = parseInt(ward_id, 10);
    this.iContact.address.ward.id = wardId;
    this.setState({
      change: true
    });
  }

  async handleChangeDefault(e: any) {
    this.iContact.isDefault = this.iContact.isDefault ? false : true;
    this.setState({
      change: true
    });
  }

  private get hasContact(): boolean {
    if (this.contacts) return this.contacts.length > 0;
    else return false;
  }

  render(): React.ReactNode {
    const addressCss = css`
      .card-body ul {
        li:first-of-type {
          label {
            font-weight: bold;
            padding-right: .5em;
          }

          i[class*="fa"] {
            font-size: 20px;
            cursor: pointer;
          }
        }
      }

      .icon-list li {
        line-height: 2.2rem;
      }

      @media (min-width: 1200px) {
        .contact-item .card-title {
          position: absolute;
          right: 10px;
        }
      }
    `;
    return <>
      <div className="container" css={addressCss}>
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Quản lý địa chỉ</h4>
            {!this.hasContact &&
            <Button className="mt-3"
                    size={"small"}
                    onClick={() => PopupNewAddress.show()}
                    type={"primary"}><i className="fal fa-plus"/>&nbsp;Thêm địa
                chỉ</Button>}
            {this.hasContact && <div className="mt-5">
              {this.contacts.map((contact: any, index: number) =>
                <div key={index} className="mb-3 contact-item">
                  <div className="card-group">
                    <div className="card">
                      <div className="card-body pt-0">
                        <ul className="icon-list list-unstyled mt-3">
                          <li>
                            {contact.contactType === 'REFUND' && <label>Trả hàng</label>}
                            {contact.contactType === 'WAREHOUSE' && <label>Lấy hàng</label>}
                            <span className=""
                                  onClick={(e: any) => this.handleUpdateContact(contact)}><i
                              className="far fa-edit"/></span>
                          </li>
                          <li><i className="fas fa-user mr-1"/> <strong>Họ
                            tên: </strong>{contact.name}</li>
                          <li><i className="fa fa-phone-square mr-1"/> <strong>Điện
                            thoại: </strong>{contact.phoneNumber}</li>
                          <li><i className="fa fa-address-book mr-1"/> <strong>Địa
                            chỉ: </strong>
                            {contact.address.detailAddress}
                            {contact.address.ward &&
                            <span> - {contact.address.ward.wardName}</span>}
                            {contact.address.district &&
                            <span> - {contact.address.district.districtName}</span>}
                            {contact.address.province &&
                            <span> - {contact.address.province.provinceName}</span>}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>}
          </div>
        </div>
      </div>
      <div className="modal fade" id='modalContact'>
        <div className='modal-dialog'>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thông tin địa chỉ</h5>
              <button type="button" className="close" data-dismiss="modal"><i
                className="pci-cross pci-circle"/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e: any) => this.putContact(e)}>
                <div className="form-group">
                  <select className="form-control"
                          value={this.iContact ? this.iContact.contactType : 'WAREHOUSE'}
                          onChange={(e: any) => this.handleChangeType(e)}
                          disabled={true}>
                    <option value='WAREHOUSE'>Địa chỉ lấy hàng</option>
                    <option value='REFUND'>Địa chỉ trả hàng</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input className="form-control" placeholder="Họ tên liên hệ" required
                             pattern=".{6,50}" title="Phải có từ 6 đến 50 ký tự"
                             onChange={(e: any) => this.handleChangeName(e)}
                             defaultValue={this.iContact ? this.iContact.name : ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input className="form-control" placeholder="Số điện thoại" required
                             pattern=".{10,10}" title="Phải có 10 chữ số"
                             onChange={(e: any) => this.handleChangePhone(e)}
                             defaultValue={this.iContact ? this.iContact.phoneNumber : ''}/>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <input className="form-control" placeholder="Địa chỉ chi tiết" required
                         pattern=".{10,250}" title="Phải có từ 10 đến 250 ký tự"
                         onChange={(e: any) => this.handleChangeAddress(e)}
                         defaultValue={this.iContact ? this.iContact.address.detailAddress : ''}/>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <select className="form-control" required
                              onChange={async (e: any) => {
                                await this.getDistricts(e.currentTarget.value)
                              }} value={this.iContact ? this.iContact.address.province.id : ''}>
                        <option value="">Tỉnh/Thành phố</option>
                        {this.provinces && this.provinces.map((item: any, index: number) =>
                          <option key={index} value={item.id}>{item.provinceName}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <select className="form-control" required
                              onChange={async (e: any) => {
                                await this.getWards(e.currentTarget.value);
                              }} value={this.iContact ? this.iContact.address.district.id : ''}>
                        <option value="">Quận/Huyện</option>
                        {this.districts && this.districts.map((item: any, index: number) =>
                          <option key={index} value={item.id}>{item.districtName}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <select className="form-control" required
                              onChange={async (e: any) => {
                                this.changeWard(e.currentTarget.value);
                              }}
                              value={this.iContact ? this.iContact.address.ward.id : ''}>
                        <option value="">Phường/Xã</option>
                        {this.wards && this.wards.map((item: any, index: number) =>
                          <option key={index} value={item.id}>{item.wardName}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group d-flex align-items-center">
                      <span className={this.iContact.isDefault ? 'text-success' : ''}
                            onClick={(e: any) => this.handleChangeDefault(e)}>
                        <i
                          className={this.iContact.isDefault ? 'fa-2x mr-3 fa fa-toggle-on' : 'fa-2x mr-3 fa fa-toggle-off'}/>
                      </span>
                  Đặt làm địa chỉ mặc định
                </div>

                <div className="mb-4 text-center">
                  {this.state.change &&
                  <button className="btn btn-success btn-outline mr-3" type="submit">Xác nhận</button>
                  }
                  {!this.state.change &&
                  <button className="btn btn-success btn-outline mr-3 disabled" type="button">Xác
                      nhận</button>
                  }
                  <button className="btn btn-default btn-outline btn-close"
                          data-dismiss="modal">Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id='modalConfirm'>
        <div className='modal-dialog'>
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="mb-4">Thao tác không thể phục hồi. Bạn có chắc muốn xóa liên hệ này?</div>
              <div>
                <button className="btn btn-danger btn-sm btn-outline mr-3"
                        onClick={(e: any) => this.confirmDeleteContact(e)}>Xóa liên hệ
                </button>
                <button className="btn btn-default btn-sm btn-outline btn-close"
                        data-dismiss="modal">Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PopupNewAddress onFinish={async () => {
        await ShopStore.getShopProfileNow();
        this.contacts = (ShopStore.contacts as IResShopContact[]);
      }}/>
    </>
  }
}
