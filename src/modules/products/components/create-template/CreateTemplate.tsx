import React, {SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {Feedback, FormGroup, Input, Textarea, Validations} from "../../../../common/form";
import {CREATE_TEMPLATE_CONTROL} from "./CreateTemplateControl";
import CreateTemplateStore from "./CreateTemplateStore";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {ReactComponent as PicterSVG} from "../images.svg";
import $ from "jquery";
import {Link} from "react-router-dom";
import {IImage} from "../../../auctions/template/components/Gallery";
import {Button} from "antd";
import PopupNewAddress from "../../../shop/address/components/PopupNewAddress";
import {store as ShopStore} from "../../../shop/stores/ShopInfomationStore";
import RickTextEditor from "./RickTextEditor";

interface ICreateTemplateProps {
  shopId: number
  /*Emit*/
  EmitInputOnChange: (event: SyntheticEvent<HTMLInputElement>, key: 'name' | 'condition' | 'description' | 'description_pickingout' | 'category' | 'weight' | 'C' | 'D' | 'R' | 'auto_public') => any
}

interface ICreateTemplateState {
  keyCategoriesLv2: number
  keyCategoriesLv3: number
  keyPropety: number
  keyInputFile: number
}

const MAX_IMAGE = 10;

@observer
export default class CreateTemplate extends React.Component<ICreateTemplateProps, ICreateTemplateState> {
  private store = new CreateTemplateStore();

  state = {
    keyCategoriesLv2: Date.now(),
    keyCategoriesLv3: Date.now(),
    keyPropety: Date.now(),
    keyInputFile: Date.now()
  };

  constructor(props: ICreateTemplateProps) {
    super(props);
    CREATE_TEMPLATE_CONTROL.view = this;
    CREATE_TEMPLATE_CONTROL.store = this.store;
  }

  componentDidMount(): void {
    CREATE_TEMPLATE_CONTROL.getListCategories();
    CREATE_TEMPLATE_CONTROL.getListShipping();
    $('[data-toggle="tooltip"]').tooltip();
  }

  componentDidUpdate(prevProps: Readonly<ICreateTemplateProps>, prevState: Readonly<ICreateTemplateState>, snapshot?: any): void {
    if (prevState.keyCategoriesLv2 !== this.state.keyCategoriesLv2 || prevState.keyCategoriesLv3 !== this.state.keyCategoriesLv3) {
      this.store.listPropety = [];
    }
  }

  componentWillUnmount(): void {
    $('span.fileinput-button').off('click');
    $('#products-gallery p.text-input').off('click');
  }

  protected openFileImage() {
    $('#products-gallery input#input-image').trigger('click');
  }

  render(): React.ReactNode {
    const {
      key,
      defaultName,
      defaultCategory,
      defaultWeight,
      defaultPackageSize,
      defaultDescPickingOut
    } = CREATE_TEMPLATE_CONTROL.store;
    return <div className="create-template" key={key}>
      <div className="col-lg-8">
        {/*Địa chỉ cửa hàng*/}
        {!ShopStore.hasContact() && <div className="row mb-3">
            <div className="col-xs-12">
                <div className="panel">
                    <div className="panel-heading">
                        <h3 className="panel-title font-weight-bold">Địa chỉ cửa hàng</h3>
                    </div>
                    <div className="panel-body pt-0 pb-3">
                        <Button size={"small"}
                                onClick={() => PopupNewAddress.show()}
                                type={"primary"}><i className="fal fa-plus"/>&nbsp;Thêm ngay</Button>
                    </div>
                </div>
            </div>
        </div>}
        {/*Thông tin cơ bản*/}
        <div className="row">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-heading"><h3 className="panel-title font-weight-bold">Thông
                tin cơ bản</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label className="control-label">Tên sản phẩm *</label>
                  <FormGroup className="form-group">
                    <Input type="text"
                           className="form-control"
                           autoFocus={true}
                           defaultValue={defaultName}
                           name={"name"}
                           validations={[new Validations(Validations.regexp(/^.{3,150}$/), 'Phải có từ 3 đến 150 ký tự')]}
                           onChange={e => this.props.EmitInputOnChange(e, "name")}
                    />
                    <Feedback invalid={"true"}/>
                  </FormGroup>
                </div>
                <div className="form-group">
                  <label className="control-label">Tình trạng sản phẩm *</label>
                  <div className="condition">
                    <div>
                      <input id="infomation-radio-1" className="magic-radio" type="radio"
                             value="NEW"
                             name="inline-form-radio-condition"
                             onChange={e => this.props.EmitInputOnChange(e, "condition")}
                      />
                      <label
                        htmlFor="infomation-radio-1">Mới</label>
                    </div>
                    <div className="mt-2">
                      <input id="infomation-radio-2"
                             value="USED"
                             className="magic-radio" type="radio"
                             name="inline-form-radio-condition"
                             onChange={e => this.props.EmitInputOnChange(e, "condition")}
                      /><label
                      htmlFor="infomation-radio-2">Đã sử dụng</label>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="control-label">Danh mục *
                    <a href="https://chozoi.vn/help-center/quy-dinh-dang-san-pham.18" target="_blank" style={{color:"#7a878e"}}>
                      <i className="fa fa-info-circle"
                         data-toggle="tooltip"
                         data-placement="top"
                         title="Xem chiết khấu ngành hàng."
                      />
                    </a></label>
                  <div className="w-100 d-flex">
                    {this.store.listCategoriesLv1.length > 0 &&
                    <select className="form-control"
                            defaultValue={defaultCategory ? defaultCategory[0].toString() : ""}
                            onChange={e => CREATE_TEMPLATE_CONTROL.getListCategoriesLv2(parseInt(e.currentTarget.value))}
                            style={{width: '30%'}} required>
                        <option value="" disabled>---Lựa chọn---</option>
                      {this.store.listCategoriesLv1.map((value, index) =>
                        <option key={index}
                                value={value.id}>{value.name}</option>)}
                    </select>}
                    {this.store.listCategoriesLv2.length > 0 &&
                    <select className="form-control mx-3"
                            defaultValue={defaultCategory ? defaultCategory[1].toString() : ""}
                            key={this.state.keyCategoriesLv2}
                            onChange={e => CREATE_TEMPLATE_CONTROL.getListCategoriesLv3(parseInt(e.currentTarget.value))}
                            style={{width: '30%'}} required>
                        <option value="" disabled>---Lựa chọn---</option>
                      {this.store.listCategoriesLv2.map((value, index) =>
                        <option key={index}
                                value={value.id}>{value.name}</option>)}
                    </select>}
                    {this.store.listCategoriesLv3.length > 0 &&
                    <select className="form-control"
                            defaultValue={defaultCategory && defaultCategory[2] ? defaultCategory[2].toString() : ""}
                            key={this.state.keyCategoriesLv3}
                            onChange={e => CREATE_TEMPLATE_CONTROL.getListPropety(parseInt(e.currentTarget.value))}
                            style={{width: '30%'}} required>
                        <option value="" disabled>---Lựa chọn---</option>
                      {this.store.listCategoriesLv3.map((value, index) =>
                        <option key={index}
                                value={value.id}>{value.name}</option>)}
                    </select>}
                  </div>
                </div>
                <div className="form-group" key={this.state.keyPropety}>
                  <label className="control-label">Thuộc tính sản phẩm *</label>
                  <div className="d-flex justify-content-between flex-wrap">
                    {this.store.listPropety.length > 0 && this.store.listPropety.map((value, index) =>
                      <div className="w-50 form-group" key={index}>
                        <label>{value.name}</label>
                        <select className="form-control"
                                defaultValue={value.selectValueId ? value.selectValueId + "" : ""}
                                onChange={e => CREATE_TEMPLATE_CONTROL.handlerOnChangePropety(e, value)}
                                style={{width: 'auto'}}
                                required={value.isRequired}>
                          <option value="" disabled={true}>---Lựa chọn---</option>
                          {value.values.map((value1, index1) =>
                            <option key={index1}
                                    value={value1.id}>{value1.value}</option>)}
                        </select>
                      </div>)}
                    {this.store.listPropety.length === 0 &&
                    <p className="text-warning">Vui lòng lựa chọn danh mục!</p>}
                  </div>
                </div>
                <hr/>
                <FormGroup className="form-group">
                  <label>Đặc điểm nổi bật (tối thiểu 3 ý, mỗi ý một dòng, không viết
                    đoạn
                    dài,
                    không chèn thông tin Cửa hàng) *</label>
                  <Textarea
                    name={"description"}
                    onChange={e => this.props.EmitInputOnChange(e, "description")}
                    validations={[
                      new Validations(Validations.minLength(15), 'Phải có tối thiểu 15 ký tự'),
                      new Validations(Validations.maxLength(500), 'Phải chỉ có thể tối đa 500 ký tự')
                    ]}
                    className="form-control" css={{minHeight: "10em"}}/>
                  <Feedback invalid={"true"}/>
                </FormGroup>
                <div className="form-group">
                  <label className="control-label">Mô tả chi tiết sản phẩm *</label>
                  <RickTextEditor defaultValue={defaultDescPickingOut}
                                  onChange={e => this.props.EmitInputOnChange(e, "description_pickingout")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Ảnh sản phẩm*/}
        <div className="row mt-3">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <div className="row" id="products-gallery">
                  <div className="col-xs-12 d-flex justify-content-between">
                    <h5>Ảnh sản phẩm</h5>
                    {this.store.listImage.length <= MAX_IMAGE && <div className="add-image">
                                            <span className="btn btn-default fileinput-button"
                                                  onClick={() => this.openFileImage()}>Thêm ảnh</span>
                        <input id="input-image" key={this.state.keyInputFile} type="file"
                               multiple={true}
                               accept={'image/jpeg, image/jpg, image/png'}
                               onChange={(e: any) => CREATE_TEMPLATE_CONTROL.uploadLocalImage(e.currentTarget.files)}/>
                    </div>}
                  </div>
                  <div className="col-xs-12 d-flex pr-0 justify-content-center">
                    <div className="image-container">
                      {this.store.listImage.length > 0 && this.store.listImage[0] &&
                      <div className="image-primary">
                          <img src={this.store.listImage[0].src} alt=""/>
                          <div className="action">
                              <i className="fa fa-trash"
                                 onClick={() => this.store.listImage.splice(0, 1)}/>
                          </div>
                      </div>}
                      {this.store.listImage.length > 0 && !this.store.listImage[0] &&
                      <div className="image-primary"/>}
                      <ul className="images">
                        {this.store.listImage.map((value: IImage, index: number) => {
                          if (index === 0) return null;
                          else if (!value) return <li key={index} className="image"/>;
                          else
                            return <li key={index}
                                       className="image">
                              <img src={value.src} alt=""/>
                              {this.store.listImage.length > 1 &&
                              <div className="action">
                                  <i className="fa fa-trash"
                                     onClick={() => this.store.listImage.splice(index, 1)}/>
                              </div>}
                            </li>
                        })}
                      </ul>
                      {/*Không có dữ liệu*/}
                      {this.store.listImage.length === 0 &&
                      <div className="empty w-100 d-flex justify-content-center flex-wrap">
                          <PicterSVG/>
                      </div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Childer*/}
        {this.props.children}
        {/*Vận chuyển*/}
        <div className="row mt-3">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-heading"><h3 className="panel-title font-weight-bold">Vận
                chuyển</h3>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="weight col-xs-12 col-lg-6"><label>Cân nặng *</label>
                    <FormGroup className="weight-form">
                      <Input
                        defaultValue={defaultWeight + ""}
                        className="form-control"
                        name={"weight"}
                        placeholder={"gram"}
                        validations={[new Validations(Validations.greaterThanNumber(0), 'Cân nặng phải lớn hơn 0')]}
                        onChange={e => this.props.EmitInputOnChange(e, "weight")}
                      />
                      <Feedback invalid={"true"}/>
                    </FormGroup>
                  </div>
                  <div className="package-size col-xs-12 col-lg-6"><label>Kích thước đóng
                    gói *</label>
                    <div className="d-flex">
                      <FormGroup className="form-group">
                        <Input
                          className="form-control"
                          name={"D"}
                          defaultValue={defaultPackageSize ? defaultPackageSize[0] + "" : ""}
                          placeholder={"cm"}
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Phải lớn hơn 0')]}
                          onChange={e => this.props.EmitInputOnChange(e, "D")}
                        />
                        <Feedback invalid={"true"}/>
                      </FormGroup>
                      <FormGroup className="form-group mx-5">
                        <Input
                          className="form-control"
                          name={"R"}
                          defaultValue={defaultPackageSize ? defaultPackageSize[1] + "" : ""}
                          placeholder={"cm"}
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Phải lớn hơn 0')]}
                          onChange={e => this.props.EmitInputOnChange(e, "R")}
                        />
                        <Feedback invalid={"true"}/>
                      </FormGroup>
                      <FormGroup className="form-group">
                        <Input
                          className="form-control"
                          name={"C"}
                          defaultValue={defaultPackageSize ? defaultPackageSize[2] + "" : ""}
                          placeholder={"cm"}
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Phải lớn hơn 0')]}
                          onChange={e => this.props.EmitInputOnChange(e, "C")}
                        />
                        <Feedback invalid={"true"}/>
                      </FormGroup>
                    </div>
                    <label>Chiều dài (D) * chiều rộng (R) * chiều cao (C) cm.</label></div>
                </div>
                <hr/>
                <div className="form-group">
                  <label className="control-label font-weight-bold">Đơn vị vận chuyển</label>
                  {this.store.listShipping.length > 0 && <ol>
                    {this.store.listShipping.map((value, index) =>
                      <li key={index}>
                        <p>{value.name}</p>
                        <ul>
                          <li>Cân nặng tối đa: {numberWithCommas(value.maxWeight)} gram
                          </li>
                          <li>Kích cỡ tối đa: {value.maxSize[0]}cm x {value.maxSize[1]}cm
                            x {value.maxSize[2]}cm
                          </li>
                          <li>Thu hộ tối đa: {numberWithCommas(value.maxValue)} đ</li>
                        </ul>
                      </li>)}
                  </ol>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Miễn phí vận chuyển*/}
        {(ShopStore.shopProfile && ShopStore.shopProfile.freeShipStatus === "ON") &&
        <div className="row mt-3">
            <div className="col-12">
                <div className="card freeship">
                    <div className="card-header">
                        Miễn phí vận chuyển
                    </div>
                    <div className="card-body">
                        <i>Mẹo: Thông thường hiệu quả bán hàng tăng 20% khi MIỄN PHÍ VẬN CHUYỂN. Hãy áp dụng
                            để
                            gia tăng doanh số của bạn</i>
                        <div className="dash">
                            <div className="btn-switch">
                                Áp dụng miễn phí vận chuyển cho sản phẩm
                              {!this.store.freeShip && <i className="fal fa-toggle-off fa-2x"
                                                          onClick={() => this.store.freeShip = true}/>}
                              {this.store.freeShip && <i className="fal fa-toggle-on fa-2x"
                                                         onClick={() => this.store.freeShip = false}/>}
                            </div>
                            <i>Khi áp dụng miễn phí vận chuyển: Sau khi phát sinh đơn hàng, tiền phí vận
                                chuyển
                                sẽ được tính vào phí bán hàng của Nhà bán hàng. Để đảm bảo quyền lợi, hãy
                                tham
                                kháo chính sách: Nhà bán hàng miễn phí vận chuyển <Link to="#">tại
                                    đây</Link>.</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>}
      </div>
      <div className="col-lg-4">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <div className="form-group">
                  <label className="control-label font-weight-bold">Hiển thị</label>
                  <div className="checkbox pad-btm text-left p-0 mt-0"><input
                    id="demo-form-checkbox" className="magic-checkbox"
                    defaultChecked={true}
                    onChange={e => this.props.EmitInputOnChange(e, 'auto_public')}
                    type="checkbox"/><label htmlFor="demo-form-checkbox">Đăng ngay sản phẩm
                    khi
                    được duyệt.</label></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Popup*/}
      <PopupNewAddress onFinish={() => ShopStore.getShopProfileNow()}/>
    </div>
  }
}
