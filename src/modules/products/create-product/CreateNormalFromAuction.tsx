import React, {Component} from 'react';
import {BreadcrumbsComponent, BreadcrumbsService} from "../../../common/breadcrumbs";
import RowVariantComponent from "./RowVariantComponent";
import {Feedback, FormGroup, Input, Validations} from "../../../common/form";
import CreateProductStore from "./CreateProductStore";
import {observable} from "mobx";
import {store as HomeStore} from "../../home";
import {CREATE_TEMPLATE_CONTROL} from "../components/create-template/CreateTemplateControl";
import {IResponseProduct} from "../manager-product/components/ManagerProductComponent";
import {IResponseAuction} from "../../auctions/DetailAuction";
import {store as ProfileStore} from "../../profile";
import {IResProfile} from "../../../api/auth/interfaces/response";
import Intro from "../components/Intro";
import Form from "../../../common/form/components/Form";
import ga from "../../../init-ga";
import {Link} from "react-router-dom";
import {css} from "@emotion/core";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {observer} from "mobx-react";
import {CREATE_NORMAL_FROM_AUCTION} from "./CreateNormalFromAuctionControl";
import {DETAIL_PRODUCT_CTRL} from "../detail-product/DetailProductControl";
import DetailProductStore from "../detail-product/DetailProductStore";
import DetailTemplate from "../components/detail-template/DetailTemplate";

interface ICreateProductProps {
  history: {
    push: (path: string) => void
  }
}

interface ICreateProductState {
  disabledSubmit: boolean
  applyDefaultValueVariant: boolean
  keyTableVariant: number
}
@observer
export default class CreateNormalFromAuction extends Component<ICreateProductProps,ICreateProductState> {
  public shop_id: number = -1;
  public shopId?: number;
  public store = new DetailProductStore();
  @observable visiable: boolean = true;
  @observable isShowIntro: boolean = true;

  state = {
    disabledSubmit: false,
    applyDefaultValueVariant: false,
    keyTableVariant: Date.now()
  };

  constructor(props: ICreateProductProps) {
    super(props);
    CREATE_NORMAL_FROM_AUCTION.view = this;
    CREATE_NORMAL_FROM_AUCTION.store = this.store;
    HomeStore.menuActive = [3, 2];
    BreadcrumbsService.loadBreadcrumbs([{title: '????ng b??n s???n ph???m'}]);
  }

  protected handlerOnChangeClassifierOnClick() {
    this.store.type = "CLASSIFIER";
    this.store.listClassifier = [{name: 'M??u s???c', values: []}];
    CREATE_NORMAL_FROM_AUCTION.initTableVariantData();
  }

  protected get renderVariant(): React.ReactNode {
    return <div>
      <div className="panel-heading" style={{height: "auto"}}>
        <p>S???n ph???m c?? nhi???u l???a ch???n theo m??u s???c, k??ch c???, dung l?????ng...?</p>
        {this.store.getType === "NORMAL" &&
        <button className="btn btn-default" type="button"
                onClick={() => this.handlerOnChangeClassifierOnClick()}>Th??m ph??n lo???i h??ng
        </button>}
      </div>
      {this.store.getType === "CLASSIFIER" && <div className="panel-body">
        {/*Form th??m*/}
          <div className="table-responsive">
              <table className="classifier mt-0">
                  <thead>
                  <tr>
                      <th>Nh??m ph??n lo???i</th>
                      <th>Ph??n lo???i</th>
                      <th/>
                  </tr>
                  </thead>
                  <tbody>
                  {this.store.getListClassifier.map((item, index) => <tr key={index}>
                    <td><input type="text" className="form-control" autoFocus={true}
                               placeholder="T??n ph??n lo???i"
                               defaultValue={item.name}
                               required={true}
                               onChange={(e: any) => item.name = e.currentTarget.value}/></td>
                    <td>
                      <div>
                        {item.values.length > 0 && <ul className="option-values">
                          {item.values.map((name: string, index1: number) => <li key={index1}>
                            <span>{name}</span>
                            <i className="fal fa-times"
                               onClick={() => CREATE_NORMAL_FROM_AUCTION.removeValueClassifier(item, index, index1)}/>
                          </li>)}
                        </ul>}
                        <input type="text" placeholder="T??y ch???n ri??ng bi???t v???i d???u ph???y ',' ho???c Enter"
                               onKeyDown={(e: any) => {
                                 const value: string = e.currentTarget.value || ''.trim();
                                 /* D???u ph???y ho???c Enter*/
                                 if (e.keyCode === 13 || e.keyCode === 188) {
                                   e.currentTarget.value && item.values.length < 10 && item.values.push(value);
                                   e.currentTarget.value = "";
                                   e.preventDefault();
                                 }
                               }}/>
                      </div>
                    </td>
                    {/*X??a nh??m ph??n lo???i*/}
                    <td>
                      <button type="button" className="btn btn-default"
                              onClick={() => CREATE_NORMAL_FROM_AUCTION.removeClassifier(index)}>
                        <i className="fa fa-trash"/></button>
                    </td>
                  </tr>)}
                  </tbody>
                {this.store.getListClassifier.length < 2 && <tfoot>
                <tr>
                    <td>
                        <button className="btn btn-primary" type="button"
                                onClick={() => this.store.getListClassifier.push({
                                  name: 'K??ch c???',
                                  values: []
                                })}>Th??m nh??m ph??n lo???i
                        </button>
                    </td>
                </tr>
                </tfoot>}
              </table>
          </div>

        {/*Ap dung*/}
          <div className="mt-3 w-100 d-flex align-items-center apply-value">
              <input type="text"
                     className="form-control"
                     placeholder="Gi?? th??? tr?????ng"
                     onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangeDefaultValueVariant(e, "price")}
              />
              <input type="text"
                     className="ml-3 form-control"
                     placeholder="Gi?? b??n(*)"
                     onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangeDefaultValueVariant(e, "sale_price")}
              />
              <input type="text"
                     className="ml-3 form-control"
                     placeholder="Kho h??ng"
                     onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangeDefaultValueVariant(e, "quantity")}
              />
              <input type="text"
                     className="ml-3 form-control"
                     placeholder="SKU ph??n lo???i"
                     name="sku"
                     onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangeDefaultValueVariant(e, "sku")}
              />
              <button className="ml-3 btn btn-dark"
                      type="button"
                      onClick={() => CREATE_NORMAL_FROM_AUCTION.handlerApplyDefaultValueVariant()}>??p d???ng
              </button>
          </div>

        {/*Danh s??ch nh???p d??? li???u cho variant*/}
        {
          this.store.listClassifier.length > 0 &&
          <div key={this.state.keyTableVariant}>
              <div className="table-responsive">
                  <table className="table table-striped table-data-variant">
                      <thead>
                      <tr>
                          <th>Ph??n lo???i</th>
                          <th>Gi?? th??? tr?????ng</th>
                          <th>Gi??</th>
                          <th>Kho h??ng</th>
                          <th>Sku ph??n lo???i</th>
                      </tr>
                      </thead>
                      <tbody>
                      {/*Chi co 1*/}
                      {this.store.getListClassifier.length === 1 &&
                      this.store.getListClassifier.map((value, index) => value.values.map((value1: string, index1: number) =>
                        <RowVariantComponent key={index1} title={value1}
                                             value={this.store.tableVariantData[index1]}/>
                      ))}
                      {/*Co 2*/}
                      {this.store.getListClassifier.length === 2 &&
                      this.store.getListClassifier[0].values.map((value, index) => this.store.getListClassifier[1].values.map((value1, index1) => {
                        const index_temp = index * (this.store.getListClassifier[1].values.length) + index1;
                        return <RowVariantComponent key={index_temp}
                                                    title={value + ' - ' + value1}
                                                    value={this.store.tableVariantData[index_temp]}
                        />;
                      }))}
                      </tbody>
                  </table>
              </div>
          </div>
        }
      </div>}
    </div>
  }

  protected get renderPriceAndStore(): React.ReactNode {
    return <div className="panel-body">
      <h5>Gi?? v?? kho h??ng</h5>
      <div className="row">
        <div className="col-xs-6">
          <label>Gi?? th??? tr?????ng</label>
          <FormGroup className="form-group">
            <Input
              className="form-control"
              name="price"
              placeholder="Gi?? g???ch"
              onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangePriceAndStore(e, "price")}
            />
            <Feedback invalid={"true"}/>
          </FormGroup>
        </div>
        <div className="col-xs-6">
          <label>Gi?? b??n *</label>
          <FormGroup className="form-group">
            <Input
              onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangePriceAndStore(e, "sale_price")}
              className="form-control"
              placeholder="Gi?? b??n"
              name={"sale_price"}
              validations={[new Validations(Validations.greaterThanNumber(0), 'Gi?? b??n ph???i l???n h??n 0')]}
            />
            <Feedback invalid={"true"}/>
          </FormGroup>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-6">
          <label>Sku</label>
          <div className="form-group">
            <input className="form-control" type="text"
                   onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangePriceAndStore(e, "sku")}
                   placeholder="M?? sku"/>
          </div>
        </div>
      </div>
      {/*T??nh tr???ng h??ng*/}
      <div className="row">
        <div className="col-xs-12 col-lg-6">
          <p>T??nh tr???ng h??ng *</p>
          <div className="radio">
            <div>
              <input id="demo-inline-form-radio-1"
                     className="magic-radio" type="radio"
                     onClick={() => this.store.isQuantityLimited = false}
                     defaultChecked={this.store.getIsQuantityLimited}
                     name="inline-form-radio"/>
              <label htmlFor="demo-inline-form-radio-1">C??n h??ng</label>
            </div>
            <div className="mt-2">
              <input id="demo-inline-form-radio-2"
                     className="magic-radio" type="radio"
                     onClick={() => this.store.isQuantityLimited = true}
                     defaultChecked={this.store.getIsQuantityLimited}
                     name="inline-form-radio"/>
              <label htmlFor="demo-inline-form-radio-2">Qu???n l?? kho</label>
            </div>
          </div>
          {this.store.getIsQuantityLimited && <FormGroup className="form-group">
              <label>S??? l?????ng s???n ph???m *</label>
              <Input
                  className="form-control" placeholder="S??? l?????ng"
                  onChange={e => CREATE_NORMAL_FROM_AUCTION.handlerOnChangePriceAndStore(e, "quantity")}
                  validations={[
                    new Validations(Validations.greaterThanNumber(0), 'T???i thi???u ph???i c?? 1 s???n ph???m'),
                    new Validations(Validations.lessThanNumber(1000), 'T???i ??a 999')
                  ]}
              />
              <Feedback invalid={"true"}/>
          </FormGroup>}
        </div>
      </div>
    </div>;
  }

  handlerOnCreate(name?: string) {
    this.isShowIntro = false;
    CREATE_TEMPLATE_CONTROL.store.defaultName = name;

    if (CREATE_NORMAL_FROM_AUCTION.request_body_data_create_product) {
      CREATE_NORMAL_FROM_AUCTION.request_body_data_create_product.name = name || '';
    }
    // Re render
    CREATE_TEMPLATE_CONTROL.store.key = Date.now();
  }
  render(): React.ReactNode {
    const {shopId} = ProfileStore.profile as IResProfile;
    if (this.store.getProduct){
      return <div id="create-product">
        {this.renderWarring}
        <Form className="container" onSubmit={(e: any) => CREATE_NORMAL_FROM_AUCTION.handlerOnSubmit(e)}>
          <div className="row">
            <div className="col-xs-12"><h2 className="mt-0">????ng b??n s???n ph???m</h2></div>
            <div className="col-xs-12"><BreadcrumbsComponent/></div>
          </div>
          <div className="row mt-3">
            <DetailTemplate
              shopId={this.shop_id}
              defaultValue={this.store.getProduct}
              EmitInputOnChange={(e, key) => DETAIL_PRODUCT_CTRL.handlerOnChangeFormField(e, key)}>
              {/*Th??m variant s???n ph???m*/}
              <div className="panel mt-3" id="panel-variants">{this.renderVariant}</div>
              {/*Gi?? v?? kho*/}
              {this.store.getType === "NORMAL" &&
              <div className="panel mt-3" id="store-and-price">{this.renderPriceAndStore}</div>}
            </DetailTemplate>
          </div>
          {/*Action*/}
          <div className="row mt-5">
            <div className="col-xs-12">
              <button className="btn btn-default" type="submit"
                      disabled={this.state.disabledSubmit}
                      onClick={() => {
                        CREATE_NORMAL_FROM_AUCTION.handlerBtnOnSubmit(0);
                        ga.pushEventGa('Submit_product_s2', 'Click_save_draft');
                      }}>L??u Nh??p
              </button>
              <button className="btn btn-primary mx-3" type="submit"
                      disabled={this.state.disabledSubmit}
                      onClick={() => {
                        CREATE_NORMAL_FROM_AUCTION.handlerBtnOnSubmit(1);
                        ga.pushEventGa('Submit_product_s2', 'Click_save_submit');
                      }}>L??u v?? ????ng
              </button>
              <button className="btn btn-danger" type="reset"
                      onClick={() => {
                        CREATE_NORMAL_FROM_AUCTION.handlerBtnOnSubmit(2);
                        ga.pushEventGa('Submit_product_s2', 'Click_cancel');
                      }}>H???y
              </button>
            </div>
          </div>
        </Form>
      </div>;
    }else return null

  }

  get renderWarring(): React.ReactNode {
    if (!this.store.GET_VALIDATE_SHIPPING)
      return <p className="text-center">Vui l??ng b???t ????n v??? v???n chuy???n <Link to="/home/profile/setting-shipping">t???i
        ????y</Link>!</p>;
    else if (this.visiable) {
      const warringCss = css`
        border: 1px dashed #F54B24;
        background: #FEF3EC 0% 0% no-repeat padding-box;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        position: relative;

        button.close {
          position: absolute;
          right: 12px;
          top: 8px;
          width: 24px;
          height: 24px;
          border: 1px solid #F54B24;
          background-color: transparent;
          border-radius: 50%;

          &:hover {
            opacity: 1;
          }

          i.fa-times {
            color: #F54B24;
          }
        }

        p {
          padding-right: 20px;
          margin-bottom: 0;
          color: #000000;
          font-size: 17px;
        }
      `;
      if (!ShopStore.hasNumberPhone() && !ShopStore.hasContact())
        return <div className="container" css={warringCss}>
          <button
            onClick={() => this.visiable = false}
            className="close d-flex flex-column align-items-center justify-content-center">
            <i className="fal fa-times"/></button>
          <p>H??y b??? sung th??ng tin kho v?? s??? ??i???n tho???i ngay nh?? ????? s???n ph???m c???a b???n sau khi ????ng s??? ????? ??i???u
            ki???n
            ph??
            duy???t. B??? sung s??? ??i???n tho???i ????? ch??ng t??i li??n h??? khi ph??t sinh ????n h??ng nh?? sau ???? b??? sung ?????a
            ch???
            kho
            ????? ch??ng t??i c?? th??? ?????n l???y h??ng khi ph??t sinh ????n. <Link to={"/home/shop/address"}>B??? sung
              ngay</Link></p>
        </div>
      else if (!ShopStore.hasNumberPhone() && ShopStore.hasContact())
        return <div className="container" css={warringCss}>
          <button
            onClick={() => this.visiable = false}
            className="close d-flex flex-column align-items-center justify-content-center">
            <i className="fal fa-times"/></button>
          <p>H??y b??? sung th??ng tin s??? ??i???n tho???i ngay nh?? ????? s???n ph???m c???a b???n sau khi ????ng s??? ????? ??i???u ki???n ph??
            duy???t. B??? sung s??? ??i???n tho???i ????? ch??ng t??i li??n h??? khi ph??t sinh ????n h??ng nh??. <Link
              to={"/home/shop"}>B??? sung
              ngay</Link></p>
        </div>
      else if (ShopStore.hasNumberPhone() && !ShopStore.hasContact())
        return <div className="container" css={warringCss}>
          <button
            onClick={() => this.visiable = false}
            className="close d-flex flex-column align-items-center justify-content-center">
            <i className="fal fa-times"/></button>
          <p>H??y b??? sung th??ng tin kho ngay nh?? ????? s???n ph???m c???a b???n sau khi ????ng s??? ????? ??i???u ki???n ph?? duy???t. B???
            sung ?????a ch??? kho ????? ch??ng t??i c?? th??? ?????n l???y h??ng khi ph??t sinh ????n. <Link
              to={"/home/shop/address"}>B??? sung
              ngay</Link></p>
        </div>
    }
    return null;
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    HomeStore.isShowBreadcrumbs = false;
    CREATE_NORMAL_FROM_AUCTION.loadDefaultValueCreateFromAuction();
  }

  componentWillUnmount(): void {
    HomeStore.isShowBreadcrumbs = true;
    // CREATE_TEMPLATE_CONTROL.store.freeShip = false;
    if (window.location.pathname === '/home') {
      ga.pushEventGa('Submit_product_s2', 'Click_button_home');
    }
  }

  componentDidUpdate(prevProps: Readonly<ICreateProductProps>, prevState: Readonly<ICreateProductState>, snapshot?: any): void {
    if (prevState.applyDefaultValueVariant !== this.state.applyDefaultValueVariant) {
      this.state.applyDefaultValueVariant && CREATE_NORMAL_FROM_AUCTION.handlerApplyDefaultValueVariant();
    }
  }
}
