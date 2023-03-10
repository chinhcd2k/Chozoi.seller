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
        {/*?????a ch??? c???a h??ng*/}
        {!ShopStore.hasContact() && <div className="row mb-3">
            <div className="col-xs-12">
                <div className="panel">
                    <div className="panel-heading">
                        <h3 className="panel-title font-weight-bold">?????a ch??? c???a h??ng</h3>
                    </div>
                    <div className="panel-body pt-0 pb-3">
                        <Button size={"small"}
                                onClick={() => PopupNewAddress.show()}
                                type={"primary"}><i className="fal fa-plus"/>&nbsp;Th??m ngay</Button>
                    </div>
                </div>
            </div>
        </div>}
        {/*Th??ng tin c?? b???n*/}
        <div className="row">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-heading"><h3 className="panel-title font-weight-bold">Th??ng
                tin c?? b???n</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label className="control-label">T??n s???n ph???m *</label>
                  <FormGroup className="form-group">
                    <Input type="text"
                           className="form-control"
                           autoFocus={true}
                           defaultValue={defaultName}
                           name={"name"}
                           validations={[new Validations(Validations.regexp(/^.{3,150}$/), 'Ph???i c?? t??? 3 ?????n 150 k?? t???')]}
                           onChange={e => this.props.EmitInputOnChange(e, "name")}
                    />
                    <Feedback invalid={"true"}/>
                  </FormGroup>
                </div>
                <div className="form-group">
                  <label className="control-label">T??nh tr???ng s???n ph???m *</label>
                  <div className="condition">
                    <div>
                      <input id="infomation-radio-1" className="magic-radio" type="radio"
                             value="NEW"
                             name="inline-form-radio-condition"
                             onChange={e => this.props.EmitInputOnChange(e, "condition")}
                      />
                      <label
                        htmlFor="infomation-radio-1">M???i</label>
                    </div>
                    <div className="mt-2">
                      <input id="infomation-radio-2"
                             value="USED"
                             className="magic-radio" type="radio"
                             name="inline-form-radio-condition"
                             onChange={e => this.props.EmitInputOnChange(e, "condition")}
                      /><label
                      htmlFor="infomation-radio-2">???? s??? d???ng</label>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="control-label">Danh m???c *
                    <a href="https://chozoi.vn/help-center/quy-dinh-dang-san-pham.18" target="_blank" style={{color:"#7a878e"}}>
                      <i className="fa fa-info-circle"
                         data-toggle="tooltip"
                         data-placement="top"
                         title="Xem chi???t kh???u ng??nh h??ng."
                      />
                    </a></label>
                  <div className="w-100 d-flex">
                    {this.store.listCategoriesLv1.length > 0 &&
                    <select className="form-control"
                            defaultValue={defaultCategory ? defaultCategory[0].toString() : ""}
                            onChange={e => CREATE_TEMPLATE_CONTROL.getListCategoriesLv2(parseInt(e.currentTarget.value))}
                            style={{width: '30%'}} required>
                        <option value="" disabled>---L???a ch???n---</option>
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
                        <option value="" disabled>---L???a ch???n---</option>
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
                        <option value="" disabled>---L???a ch???n---</option>
                      {this.store.listCategoriesLv3.map((value, index) =>
                        <option key={index}
                                value={value.id}>{value.name}</option>)}
                    </select>}
                  </div>
                </div>
                <div className="form-group" key={this.state.keyPropety}>
                  <label className="control-label">Thu???c t??nh s???n ph???m *</label>
                  <div className="d-flex justify-content-between flex-wrap">
                    {this.store.listPropety.length > 0 && this.store.listPropety.map((value, index) =>
                      <div className="w-50 form-group" key={index}>
                        <label>{value.name}</label>
                        <select className="form-control"
                                defaultValue={value.selectValueId ? value.selectValueId + "" : ""}
                                onChange={e => CREATE_TEMPLATE_CONTROL.handlerOnChangePropety(e, value)}
                                style={{width: 'auto'}}
                                required={value.isRequired}>
                          <option value="" disabled={true}>---L???a ch???n---</option>
                          {value.values.map((value1, index1) =>
                            <option key={index1}
                                    value={value1.id}>{value1.value}</option>)}
                        </select>
                      </div>)}
                    {this.store.listPropety.length === 0 &&
                    <p className="text-warning">Vui l??ng l???a ch???n danh m???c!</p>}
                  </div>
                </div>
                <hr/>
                <FormGroup className="form-group">
                  <label>?????c ??i???m n???i b???t (t???i thi???u 3 ??, m???i ?? m???t d??ng, kh??ng vi???t
                    ??o???n
                    d??i,
                    kh??ng ch??n th??ng tin C???a h??ng) *</label>
                  <Textarea
                    name={"description"}
                    onChange={e => this.props.EmitInputOnChange(e, "description")}
                    validations={[
                      new Validations(Validations.minLength(15), 'Ph???i c?? t???i thi???u 15 k?? t???'),
                      new Validations(Validations.maxLength(500), 'Ph???i ch??? c?? th??? t???i ??a 500 k?? t???')
                    ]}
                    className="form-control" css={{minHeight: "10em"}}/>
                  <Feedback invalid={"true"}/>
                </FormGroup>
                <div className="form-group">
                  <label className="control-label">M?? t??? chi ti???t s???n ph???m *</label>
                  <RickTextEditor defaultValue={defaultDescPickingOut}
                                  onChange={e => this.props.EmitInputOnChange(e, "description_pickingout")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*???nh s???n ph???m*/}
        <div className="row mt-3">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-body">
                <div className="row" id="products-gallery">
                  <div className="col-xs-12 d-flex justify-content-between">
                    <h5>???nh s???n ph???m</h5>
                    {this.store.listImage.length <= MAX_IMAGE && <div className="add-image">
                                            <span className="btn btn-default fileinput-button"
                                                  onClick={() => this.openFileImage()}>Th??m ???nh</span>
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
                      {/*Kh??ng c?? d??? li???u*/}
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
        {/*V???n chuy???n*/}
        <div className="row mt-3">
          <div className="col-xs-12">
            <div className="panel">
              <div className="panel-heading"><h3 className="panel-title font-weight-bold">V???n
                chuy???n</h3>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="weight col-xs-12 col-lg-6"><label>C??n n???ng *</label>
                    <FormGroup className="weight-form">
                      <Input
                        defaultValue={defaultWeight + ""}
                        className="form-control"
                        name={"weight"}
                        placeholder={"gram"}
                        validations={[new Validations(Validations.greaterThanNumber(0), 'C??n n???ng ph???i l???n h??n 0')]}
                        onChange={e => this.props.EmitInputOnChange(e, "weight")}
                      />
                      <Feedback invalid={"true"}/>
                    </FormGroup>
                  </div>
                  <div className="package-size col-xs-12 col-lg-6"><label>K??ch th?????c ????ng
                    g??i *</label>
                    <div className="d-flex">
                      <FormGroup className="form-group">
                        <Input
                          className="form-control"
                          name={"D"}
                          defaultValue={defaultPackageSize ? defaultPackageSize[0] + "" : ""}
                          placeholder={"cm"}
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
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
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
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
                          validations={[new Validations(Validations.greaterThanNumber(0), 'Ph???i l???n h??n 0')]}
                          onChange={e => this.props.EmitInputOnChange(e, "C")}
                        />
                        <Feedback invalid={"true"}/>
                      </FormGroup>
                    </div>
                    <label>Chi???u d??i (D) * chi???u r???ng (R) * chi???u cao (C) cm.</label></div>
                </div>
                <hr/>
                <div className="form-group">
                  <label className="control-label font-weight-bold">????n v??? v???n chuy???n</label>
                  {this.store.listShipping.length > 0 && <ol>
                    {this.store.listShipping.map((value, index) =>
                      <li key={index}>
                        <p>{value.name}</p>
                        <ul>
                          <li>C??n n???ng t???i ??a: {numberWithCommas(value.maxWeight)} gram
                          </li>
                          <li>K??ch c??? t???i ??a: {value.maxSize[0]}cm x {value.maxSize[1]}cm
                            x {value.maxSize[2]}cm
                          </li>
                          <li>Thu h??? t???i ??a: {numberWithCommas(value.maxValue)} ??</li>
                        </ul>
                      </li>)}
                  </ol>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*Mi???n ph?? v???n chuy???n*/}
        {(ShopStore.shopProfile && ShopStore.shopProfile.freeShipStatus === "ON") &&
        <div className="row mt-3">
            <div className="col-12">
                <div className="card freeship">
                    <div className="card-header">
                        Mi???n ph?? v???n chuy???n
                    </div>
                    <div className="card-body">
                        <i>M???o: Th??ng th?????ng hi???u qu??? b??n h??ng t??ng 20% khi MI???N PH?? V???N CHUY???N. H??y ??p d???ng
                            ?????
                            gia t??ng doanh s??? c???a b???n</i>
                        <div className="dash">
                            <div className="btn-switch">
                                ??p d???ng mi???n ph?? v???n chuy???n cho s???n ph???m
                              {!this.store.freeShip && <i className="fal fa-toggle-off fa-2x"
                                                          onClick={() => this.store.freeShip = true}/>}
                              {this.store.freeShip && <i className="fal fa-toggle-on fa-2x"
                                                         onClick={() => this.store.freeShip = false}/>}
                            </div>
                            <i>Khi ??p d???ng mi???n ph?? v???n chuy???n: Sau khi ph??t sinh ????n h??ng, ti???n ph?? v???n
                                chuy???n
                                s??? ???????c t??nh v??o ph?? b??n h??ng c???a Nh?? b??n h??ng. ????? ?????m b???o quy???n l???i, h??y
                                tham
                                kh??o ch??nh s??ch: Nh?? b??n h??ng mi???n ph?? v???n chuy???n <Link to="#">t???i
                                    ????y</Link>.</i>
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
                  <label className="control-label font-weight-bold">Hi???n th???</label>
                  <div className="checkbox pad-btm text-left p-0 mt-0"><input
                    id="demo-form-checkbox" className="magic-checkbox"
                    defaultChecked={true}
                    onChange={e => this.props.EmitInputOnChange(e, 'auto_public')}
                    type="checkbox"/><label htmlFor="demo-form-checkbox">????ng ngay s???n ph???m
                    khi
                    ???????c duy???t.</label></div>
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
