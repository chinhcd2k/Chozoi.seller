import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {ManagerProductStore} from "../stores/ManagerProductStore";
import {service} from "../../ProductServices";
import {IApiResponse} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import {Link} from "react-router-dom";
import {PaginationComponent} from "../../../../common/pagination";
import {observer} from "mobx-react";
import $ from "jquery";
import {store as ProfileStore} from "../../../profile";
import {store as HomeStore} from "../../../home";
import "../containers/ManagerProductStyle.scss";
import {ItemTableProduct} from "./ItemTableProduct";
import {UrlManagerProductSearchParams} from "../ts/UrlManagerProductSearchParams";
import ImageViewer from "../../../../common/image-viewer/ImageViewer";
import {store as ShopStore} from "../../../shop/stores/ShopInfomationStore";
import {css} from "@emotion/core";
import {observable} from "mobx";
import ga from '../../../../init-ga';
import {IMetadata} from "../../../../api";
import {Cascader} from "antd";
import {AppGlobal} from "../../../../AppGlobal";

export interface IResponseProduct {
  id: number
  name: string
  condition: 'NEW' | 'USED' | '' ,
  attributes: { id: number, valueId: number, name: string, value: string }[]
  packingSize: [number, number, number]
  images: { id: number, sort: number, imageUrl: string }[]
  imageVariants: {
    image65: string
    image180: string
  }[]
  description: string
  descriptionPickingOut: string
  descriptionPinkingOut:string
  categories: {
    id: number
    name: string
    level: number
    parentId: number | null
  }[]
  category: { id: number, name: string, level: number, parentId: number | null }
  shippingPartnerIds: number[]
  type: "PROMOTION" | "NORMAL" | "CLASSIFIER"
  state: "PUBLIC" | "READY" | "REJECT" | "DRAFT" | 'PENDING'
  weight: number
  isPending: boolean
  autoPublic: boolean
  isQuantityLimited: boolean
  isPublic: boolean | null
  promotion?: {
    pricePromotion: number
    dateStart: string
    dateEnd: string
  }
  classifiers?: any[]
  variants: {
    id?: number
    attributes: { name: string, value: string | number }[]
    price: number | ""
    salePrice: number
    sku: string
    inventory: {
      initialQuantity: number
      inQuantity: number
      outQuantity: number
      quantity: number
      remainingQuantity: number
    }
    imageId: number | null
    /*Sử dụng để update quantity*/
    input?: boolean
  }[]
  currency: string
  reportIssues?: {
    id: number,
    description: string,
    solution: string
  }
  /*Client Extend*/
  selected: boolean
  showVariants: number
  input: boolean
}

interface IManagerProductProps {
  history: {
    push: (path: string, state?: any) => void
  }
  match: {
    params: { query: string }
  }
}

interface IManagerProductComponentState {
  state: { name: string, value: 'PUBLIC' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | 'ALL' }[]
  aspect: { name: string, value: 'selling' | 'soldOff' | '' }[]
  keyAspect: number
  keyTable: number
  actionFixedTop: boolean
  textSearch: string
  currentState: 'PUBLIC' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | 'ALL'
  currentAspect: 'selling' | 'soldOff' | ''
  disableSubmitModal: boolean
  page: number
  size: number
  total: number
  keyToggle: number
}

@observer
export default class ManagerProductComponent extends React.Component<IManagerProductProps, IManagerProductComponentState> {
  public shopId: number = -1;
  public role: 'NORMAL' | 'SELLER' | string = '';
  public number_show_variants: number = 5;
  public store: ManagerProductStore = new ManagerProductStore();
  public ImageViewerRef = React.createRef<ImageViewer>();

  @observable visiable: boolean = true;
  @observable metadata: IMetadata = {page: 0, size: 15, total: 0, totalPage: 0};

  constructor(props: IManagerProductProps) {
    super(props);
    BreadcrumbsService.loadBreadcrumbs([{title: 'Danh sách sản phẩm'}]);
    this.paginationChange = this.paginationChange.bind(this);
    this.getListProduct = this.getListProduct.bind(this);
    HomeStore.menuActive = [3, 0];
    /*State*/
    this.state = {
      state: [
        {
          name: 'Tất cả',
          value: 'ALL'
        },
        {
          name: 'Đang bán',
          value: 'PUBLIC'
        },
        {
          name: 'Nháp',
          value: 'DRAFT'
        },
        {
          name: 'Sẵn sàng',
          value: 'READY'
        },
        {
          name: 'Đợi duyệt',
          value: 'PENDING'
        },
        {
          name: 'Từ chối',
          value: 'REJECT'
        }
      ],
      aspect: [{name: 'Tất cả', value: ''}, {name: 'Còn hàng', value: 'selling'}, {
        name: 'Hết hàng',
        value: 'soldOff'
      }],
      keyTable: 0,
      actionFixedTop: false,
      disableSubmitModal: false,
      currentState: 'ALL',
      currentAspect: '',
      textSearch: '',
      keyAspect: 0,
      page: 0,
      size: 10,
      total: 0,
      keyToggle: Math.random()
    };
    /*Bind*/
    this.confirmChangeQuantity = this.confirmChangeQuantity.bind(this);
  }

  public async componentDidMount() {
    if (ProfileStore.profile) {
      this.shopId = ProfileStore.profile.shopId as number;
      this.role = ProfileStore.profile.user.role;
    }
    this.setState({actionFixedTop: window.scrollY > 60});
    /*Set default value select filter*/
    if (this.props.match.params.query) {
      const urlSearch = new UrlManagerProductSearchParams(this.props.match.params.query);
      this.setState({
        currentState: urlSearch.getState,
        currentAspect: urlSearch.getAspect,
        textSearch: urlSearch.getKeyWord,
        keyAspect: Math.random(),
      }, () => this.getListProduct());
    }
  }

  async componentDidUpdate(prevProps: Readonly<IManagerProductProps>, prevState: Readonly<IManagerProductComponentState>, snapshot?: any) {
    if (prevProps.match.params.query !== this.props.match.params.query) {
      this.store.actionBar = false;
      const urlSearch = new UrlManagerProductSearchParams(this.props.match.params.query);
      this.metadata.page = urlSearch.getPage;
      this.metadata.size = urlSearch.getSize;
      this.setState({
        currentAspect: urlSearch.getAspect,
        currentState: urlSearch.getState,
        textSearch: urlSearch.getKeyWord
      }, () => this.getListProduct());
    }
  }

  public async getListProduct() {
    const {page, size} = this.metadata;
    const response = await service.search(this.shopId, 'NORMAL', this.categoryFillterId?'':this.state.textSearch, this.state.currentState === "ALL" ? '' : this.state.currentState, this.state.currentAspect, this.state.size, this.state.page,this.categoryFillterId?this.categoryFillterId:undefined);
    if (response.status === 200) {
      this.metadata = response.body.metadata;
      this.store.listProduct = response.body.products;
      this.store.listProduct.map((item: IResponseProduct) => {
        if (item.type === "CLASSIFIER") {
          item.showVariants = this.number_show_variants;
        }
        item.selected = false;
        return null;
      });
      window.scrollTo(0, 0);
      if (!this.isChangePage){
        this.categoryFillterId=undefined
      }
    } else if (response.body.message && typeof response.body.message === "string")
      notify.show(response.body.message, "error");
    else
      notify.show('Đã có lỗi xảy ra', "error");
    this.setState({keyTable: Math.random()});
  }

  @observable isChangePage:boolean=false
  private async paginationChange(page: number) {
    this.setState({page: page - 1});
    this.isChangePage=true
    setTimeout(() => this.getListProduct());
  }

  private async action(type?: 'UPDATE_QUANTITY' | 'PUBLIC' | 'READY' | 'PENDING' | 'DELETE') {
    this.setState({disableSubmitModal: true});
    if (type === "UPDATE_QUANTITY" && this.store.modalData && this.store.modalData.product && this.store.modalData.variant_id && this.store.modalData.quantity !== undefined) {
      let old_quantity: number = 0;
      if (this.store.modalData.product.type === "NORMAL" && this.store.modalData.product.variants[0].inventory.remainingQuantity)
        old_quantity = this.store.modalData.product.variants[0].inventory.remainingQuantity;
      else {
        const index = this.store.modalData.product.variants.findIndex(value => value.id === this.store.modalData.variant_id);
        index !== -1 && (old_quantity = this.store.modalData.product.variants[index].inventory.remainingQuantity);
      }
      if (old_quantity === this.store.modalData.quantity) notify.show('Số lượng không có sự thay đổi!', 'warning');
      else {
        const response = await service.updateQuantity(this.shopId, {
          productId: this.store.modalData.product.id,
          variantId: this.store.modalData.variant_id,
          quantity: this.store.modalData.quantity
        });
        if (response.status === 200) {
          notify.show('Cập nhật số lượng thành công!', 'success');
          this.store.modalData.responseUpdateQuantity && this.store.modalData.responseUpdateQuantity(this.store.modalData ? this.store.modalData.variant_id : undefined);
        } else if (response.body.message && typeof response.body.message === "string") notify.show(response.body.message, "error");
        else notify.show('Đã có lỗi xảy ra!', "error");
      }
      $('div.modal#manager-product-modal').modal('hide');
    }
      //
    /*else if ((type === "PUBLIC" || type === "READY" || type === "PENDING") && this.role !== "SELLER") {
        notify.show('Bạn chưa được phê duyệt thành nhà bán hàng', 'error');
        $('div.modal#manager-product-modal').modal('hide');
    } */
    else {
      let ids: number[] = [(this.store.modalData as any).product.id];
      let response!: IApiResponse;
      if (ids.length > 0) {
        if (type === "DELETE") {
          response = await service.DeleteDraftMulti(this.shopId, {ids: ids});
        } else if (type !== "UPDATE_QUANTITY" && type)
          response = await service.PutChangeStateMulti(this.shopId, {ids: ids, state: type});
        if (response && response.status === 200) {
          notify.show('Thao tác thực hiện thành công.', "success");
          ids.map((id: number) => {
            const index: number = this.store.listProduct.findIndex(value => value.id === id);
            if (index !== -1 && (type === "PUBLIC" || type === "READY" || type === "PENDING") && this.state.currentState === 'ALL') {
              this.store.listProduct[index].state = type;
              this.store.listProduct[index].selected = false;
              if (type === "PUBLIC") this.store.listProduct[index].isPublic = true;
              else if (type === "READY") this.store.listProduct[index].isPublic = false;
            } else if (index !== -1 && (type === "DELETE" || this.state.currentState !== "ALL"))
              this.store.listProduct.splice(index, 1);
            return null;
          });
          this.setState({keyTable: Math.random()});
        } else if (response.body && response.body.message && typeof response.body.message === "string")
          notify.show(response.body.message, "error");
        else {
          notify.show('Đã có lỗi xảy ra', "error");
        }
      }
      $('div.modal#manager-product-modal').modal('hide');
    }
    this.setState({disableSubmitModal: false, keyTable: Math.random()});
  }

  public confirmChangeQuantity(product: IResponseProduct, variantId: number | undefined, quantity: number, callback_response_upload_quantity: () => void) {
    this.store.modalData = {
      product: product,
      responseUpdateQuantity: callback_response_upload_quantity,
      variant_id: variantId,
      quantity: quantity,
      message: 'Bạn có chắc chắn muốn thay đổi số lượng của sản phẩm này?',
      type: 'UPDATE_QUANTITY',
      show: true
    };
    $('div#products-manager-product div.modal#manager-product-modal').modal({show: true, backdrop: "static"});
  }

  public confirmChangeState(type: 'PUBLIC' | 'READY' | 'PENDING' | 'DELETE', product: IResponseProduct) {
    let message: string = '';
    switch (type) {
      case "PUBLIC":
        message = 'Bạn có chắc chắn muốn hiển thị trên sàn Chozoi?';
        break;
      case "DELETE":
        message = 'Bạn có chắc chắn muốn xóa?';
        break;
      case "PENDING":
        message = 'Bạn muốn yêu cầu duyệt sản phẩm này?';
        break;
      case "READY":
        message = 'Bạn muốn ẩn sản phẩm khỏi sàn Chozoi?';
        break;
    }
    this.store.modalData = {
      product: product,
      variant_id: undefined,
      quantity: undefined,
      message: message,
      type: type,
      show: true
    };
    $('div#products-manager-product div.modal#manager-product-modal').modal({show: true, backdrop: "static"});
  }

  @observable categoryFillterId?: number
  onChange = async (value: any, selectedOptions: any) => {
    // this.setState({
    //   textSearch: selectedOptions.map((o: any) => o.label).join('/ '),
    //   keyToggle: Math.random()
    // })
    if (selectedOptions[2].id) {
      this.categoryFillterId = selectedOptions[2].id;
    } else {
      this.categoryFillterId = selectedOptions[1].id;
    }
    await this.getListProduct();
  }
  // clearTextSearch = () => {
  //   this.categoryFillterId = undefined
  //   this.setState({
  //     textSearch: '',
  //     keyToggle: Math.random()
  //   })
  // }

  handleChangeTextSearch(e: any) {
    this.categoryFillterId = undefined
    this.setState({textSearch: e.currentTarget.value})
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const options = AppGlobal.dataFilterCategories;
    return <div id="products-manager-product">
      {this.renderWaring}
      <div className='container-fluid'>
        <div className='row'>
          <div className="col-xs-12 px-0">
            <div className="card">
              <div className="card-header">
                <div className="row">
                  <div className="col-xs-8 col-md-4 pl-0">
                    <input className="form-control" placeholder="Tìm kiếm"
                           defaultValue={this.state.textSearch}
                           onChange={(e: any) => this.handleChangeTextSearch(e)}
                           type="text"
                           key={this.state.keyToggle}/>
                    {/*<i className="fas fa-times-octagon position-absolute" style={{top:"10px",right:"20px",cursor:"pointer"}} onClick={()=>this.clearTextSearch()}/>*/}
                  </div>
                  <div
                    className="col-xs-4 col-md-2 d-flex justify-content-center justify-content-lg-start">
                    <Cascader options={options} onChange={this.onChange} size={"large"} style={{height: "500px"}}>
                      <button className="float-left btn btn-default btn-labeled" style={{marginRight: "12px"}}>
                        <i className="btn-label fas fa-filter"/>Bộ lọc
                      </button>
                    </Cascader>
                    <button className="btn btn-default btn-labeled"
                            onClick={() => this.getListProduct()}><i
                      className="btn-label fa fa-search"/>Tìm kiếm
                    </button>
                  </div>
                  <div className="mt-2 mt-lg-0 col-xs-12 col-md-6">
                    <Link className="new-product float-lg-right" to="/home/product/add">
                      <button className="btn btn-primary"
                              onClick={() => ga.pushEventGa('Product_manage', 'Click_submit_product')}>Thêm sản phẩm
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className='card-body'>
                <div className="tab-base mb-0">
                  <ul className="nav nav-tabs">
                    {this.state.state.map((item: { name: string, value: string }, index: number) =>
                      <li key={index}
                          className={item.value === this.state.currentState ? 'active' : ''}><Link
                        to={`/home/products/state=${item.value}`}>{item.name}</Link>
                      </li>)}
                  </ul>
                  <div className="tab-content">
                    <div className="tab-pane fade active in">
                      <div className="table-responsive">
                        <table className='table table-striped'>
                          <thead>
                          {/*{this.store.actionBar &&
                                                    <tr className={`bg-gray${this.state.actionFixedTop ? ' action-fixed' : ''}`}>
                                                        <th colSpan={8}>
                                                            <div className="w-100 d-flex align-items-center">
                                                                <div className="mt-1 d-flex align-items-center">
                                                                    <input
                                                                        onChange={(e: any) => this.onChangeSelectedAll(e)}
                                                                        id='remember-select-all'
                                                                        className="magic-checkbox"
                                                                        type="checkbox"/>
                                                                    <label
                                                                        className='text-primary'
                                                                        htmlFor='remember-select-all'>Lựa chọn</label>
                                                                </div>
                                                                <button
                                                                    className="ml-5 btn-dark btn-sm"
                                                                    data-toggle="modal"
                                                                    data-target="#manager-product-modal"
                                                                    data-backdrop="static"
                                                                    onClick={(e: any) => {
                                                                        this.store.modalData = {
                                                                            show: true,
                                                                            message: 'Ẩn các sản phẩm đã duyệt trên trang chủ. Chỉ áp dụng các sản phẩm đã được Chozoi duyệt.',
                                                                            type: "READY"
                                                                        };
                                                                    }}>Ẩn
                                                                </button>
                                                                <button
                                                                    data-toggle="modal"
                                                                    data-target="#manager-product-modal"
                                                                    data-backdrop="static"
                                                                    className='ml-3 btn-sm btn-danger'
                                                                    onClick={(e: any) => {
                                                                        this.store.modalData = {
                                                                            show: true,
                                                                            message: 'Xóa toàn bộ sản phẩm đã chọn. Bạn không thể khôi phục sản phẩm sau khi xóa.',
                                                                            type: "DELETE"
                                                                        };
                                                                    }}>Xóa
                                                                </button>
                                                            </div>
                                                        </th>
                                                    </tr>}*/}
                          <tr>
                            <th className="px-0" colSpan={8}>
                              <select key={this.state.keyAspect}
                                      defaultValue={this.state.currentAspect}
                                      onChange={(e: any) => {
                                        const aspect: string = e.currentTarget.value;
                                        if (!aspect && !this.state.currentState && !this.state.textSearch)
                                          this.props.history.push('/home/products/all');
                                        else
                                          this.props.history.push(`/home/products/${this.state.textSearch ? 'search=' + this.state.textSearch : ''}${this.state.currentState ? '&state=' + this.state.currentState : ''}${aspect ? '&aspect=' + aspect : ''}`);
                                      }}
                                      className="w-auto form-control-sm form-control">
                                {this.state.aspect.map((item: { name: string, value: string }, index: number) =>
                                  <option key={index}
                                          value={item.value}>{item.name}</option>)}
                              </select>
                            </th>
                          </tr>
                          <tr className="font-weight-bold text-uppercase">
                            {/*<th/>*/}
                            <th>Sản phẩm</th>
                            <th>Phân loại</th>
                            <th>Giá bán</th>
                            <th>Số lượng</th>
                            <th>Thời gian khuyến mại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                            <th>Trên sàn</th>
                          </tr>
                          </thead>
                          <tbody key={this.state.keyTable}>
                          {this.store.listProduct.map((product: IResponseProduct, index: number) =>
                            <ItemTableProduct
                              key={index}
                              confirmChangeQuantity={((product, variantId, quantity, callback) => this.confirmChangeQuantity(product, variantId, quantity, callback))}
                              confirmChangeState={(toState => this.confirmChangeState(toState, product))}
                              emitViewerImage={src => this.ImageViewerRef.current && this.ImageViewerRef.current.show(src)}
                              data={product} index={index}/>)}
                          {/*Not found data*/}
                          {this.store.listProduct.length === 0 && <tr>
                              <td colSpan={8}><p className="text-center my-5">Không tìm thấy
                                  dữ
                                  liệu</p></td>
                          </tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.metadata && <div className='card-footer'>
                  <div className="row px-3 d-flex justify-content-between">
                      <div className="w-50 d-flex align-items-center">
                          <p className="mb-0 mr-5">{this.metadata.total} sản phẩm</p>
                      </div>
                      <div className="w-50 d-flex justify-content-end">
                        {
                          this.metadata.total > 0 &&
                          <PaginationComponent
                              total={this.metadata.total}
                              number={this.metadata.size}
                              defaultActive={this.metadata.page}
                              emitOnChangePage={page => this.paginationChange(page)}
                          />
                        }
                      </div>
                  </div>
              </div>}
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id='manager-product-modal'>
        <div className='modal-dialog'>
          <div className="modal-content">
            <div className="modal-body">
              <button type="button" className="close" data-dismiss="modal" style={{marginTop: '-10px'}}><i
                className="pci-cross pci-circle"/></button>
              {this.store.modalData && <div className="bootbox-body">
                  <p className="text-center pr-4">{this.store.modalData.message}</p>
                  <div className="d-flex justify-content-center">
                      <button className='btn btn-sm btn-primary'
                              disabled={this.state.disableSubmitModal}
                              onClick={(e: any) => {
                                this.store.modalData.show = false;
                                return this.action(this.store.modalData.type);
                              }}>Đồng ý
                      </button>
                      <span className="mx-1"/>
                      <button className='btn btn-sm btn-danger'
                              data-dismiss="modal"
                              onClick={(e: any) => this.store.modalData.show = false}>Hủy
                      </button>
                  </div>
              </div>}
            </div>
          </div>
        </div>
      </div>
      <ImageViewer ref={this.ImageViewerRef}/>
    </div>;
  }

  get renderWaring(): React.ReactNode {
    if (ShopStore.shopProfile && ShopStore.shopStats) {
      const {countProduct} = ShopStore.shopStats;
      if (!countProduct && this.visiable) {
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
        return <div className='container-fluid mx-3' css={warringCss}>
          <button
            onClick={() => this.visiable = false}
            className="close d-flex flex-column align-items-center justify-content-center">
            <i className="fal fa-times"/></button>
          <p>Chỉ cần thêm 1 bước nữa thôi sẽ giúp bạn tăng cơ hội có thêm đơn hàng. Đăng sản phẩm của mình
            ngay để khách hàng có thể tìm kiếm và mua sản phẩm của bạn ngay nhé. <Link
              to={"/home/product/add"}>Đăng bán ngay</Link></p>
        </div>
      }
    }
    return null;
  }
}
