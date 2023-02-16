import React, {SyntheticEvent} from "react";
import {notify} from "../../../common/notify/NotifyService";
import {service} from "./ManagerAuctionService";
import {observer} from "mobx-react";
import {PaginationComponent} from "../../../common/pagination";
import {store as ProfileStore} from "../../profile";
import {ItemTableAuction} from "./components/ItemTableAuction";
import "./styles/ManagerAuctionStyle.scss";
import {Link} from "react-router-dom";
import ImageViewer from "../../../common/image-viewer/ImageViewer";
import {IResponseAuction} from "../DetailAuction";
import {observable} from "mobx";
import {menu} from "../../home/stores/HomeStore";
import {breadcrumb} from "../../../common/breadcrumbs/BreadcrumbsService";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {css} from "@emotion/core";
import ga from '../../../init-ga';
import {IResProfile} from "../../../api/auth/interfaces/response"
import {Cascader} from "antd";
import EditTemplateStore from "../../products/components/edit-template/EditTemplateStore";
import {AppGlobal} from "../../../AppGlobal";
import EditProductStore from "../../products/edit-product/EditProductStore";
import {IResponseDetailProduct} from "../../products/ProductServices";
import CreateProductStore from "../../products/create-product/CreateProductStore";
import DetailProductStore from "../../products/detail-product/DetailProductStore";
import {CREATE_NORMAL_FROM_AUCTION} from "../../products/create-product/CreateNormalFromAuctionControl";

const LINK_ADD_AUCTION: string = '/home/auction/add';

export interface ICategorise {
  value: string,
  label: string,
  id: number,
  children:
    {
      value: string,
      label: string,
      id: number,
      children:
        {
          value: string,
          label: string,
          id: number,
        }[]
    }[]
}

@observer
export default class ManagerAuctionPageSite extends React.Component<any, {}> {
    public ImageViewerRef = React.createRef<ImageViewer>();
    private stateData = [
        {
            name: 'Tất cả',
            value: '',
        },
        {
            name: 'Đang đấu giá',
            value: 'BIDING'
        },
        {
            name: 'Kết thúc',
            value: 'STOPPED'
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
    ];
    private typeData = [{name: 'Tất cả', value: ''}, {name: 'Đấu giá thường', value: 'AUCTION'}, {
        name: 'Đấu giá chớp nhoáng',
        value: 'AUCTION_FLASH_BID'
    },{name: 'Đấu giá ngược', value: 'AUCTION_INVERSE'}];

  @observable listAuction: any[] = []
  @observable currentState: 'BIDING' | 'STOPPED' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | "" = "";
  @observable currentType: 'AUCTION' | 'AUCTION_FLASH_BID' | "" = "";
  @observable textSearch: string = ''
  @observable page: number = 0;
  @observable size: number = 10;
  @observable total: number = 0;
  @observable visiable: boolean = true;
  @observable listCategoriesLv1: any[] = []
  @observable listCategoriesLv2: any[] = []
  @observable listCategoriesLv3: any[] = []
  @observable fillterData: ICategorise[] = []

  constructor(props: any) {
    super(props);
    this.paginationChange = this.paginationChange.bind(this);
  }

  private matchQueryString() {
    if (this.props.location.search) {
      const urlParams = new UrlManagerAuctionSearchParams(this.props.location.search);
      this.textSearch = urlParams.getKeyWord;
      this.currentState = urlParams.getState;
      this.currentType = urlParams.getType;
      this.page = urlParams.getPage;
      this.size = urlParams.getSize;
      this.categoryFillterId = urlParams.getCategoryId;
    }
  }

  private async getListAuction() {

    const response = await service.search(
      (ProfileStore.profile as IResProfile).shopId as number,
      'AUCTION',
      this.categoryFillterId ? '' : this.textSearch,
      this.currentState,
      this.currentType,
      this.size,
      this.page,
      this.categoryFillterId
    );
    if (response.status === 200) {
      this.listAuction = response.body.products;
      this.total = response.body.metadata.total;
      window.scrollTo(0, 0);
    } else if (response.body.message && typeof response.body.message === "string")
      notify.show(response.body.message, "error");
    else
      notify.show('Đã có lỗi xảy ra', "error");



  }

  private async paginationChange(page: number) {
    let search = `?search=${this.textSearch}&state=${this.currentState}&filterAuction=${this.currentType}&page=${page - 1}&size=${this.size}${this.categoryFillterId ? `&categoryId=${this.categoryFillterId}` : ''}`;
    this.props.history.push('/home/auctions' + search);
  }

    private async handlerOnChangeStateProduct(state: 'VIEW' | 'EDIT' | 'PENDING' | 'DRAFT' | 'BIDDING' | 'STOPPED' | 'REPLAY' | 'REPLAY_QUICK' | 'REMOVE'|'CREATE_N', auctionDetail: IResponseAuction) {
        switch (state) {
            case "VIEW":
            case "EDIT":
                this.props.history.push(`/home/auction/${state === "VIEW" ? 'detail' : 'update'}/${auctionDetail.id}`);
                break;
            case "REPLAY":
            case "REPLAY_QUICK":
                this.props.history.push(`/home/auction/${state === "REPLAY" ? 'replay' : 'replay-quick'}/${auctionDetail.id}`);
                break;
            case "REMOVE":
                this.deleteDraft(auctionDetail.id).finally();
                break;
            case "DRAFT":
            case "PENDING":
            case "STOPPED":
                this.RequestChangeState(auctionDetail.id, state).finally();
                break;
            case "BIDDING":
                this.RequestChangeState(auctionDetail.id, "PUBLIC").finally();
                break;
            case "CREATE_N":
                CREATE_NORMAL_FROM_AUCTION.productFromAuction=auctionDetail
                this.props.history.push(`/home/auction/createFromAuction`);
                break;
            default:
                notify.show('Chức năng đang xây dựng', "warning");
                break;
    }
  }

  private async RequestChangeState(product_id: number, toState: 'PENDING' | 'DRAFT' | 'PUBLIC' | 'STOPPED') {
    const response = await service.PutChangeStateMulti((ProfileStore.profile as IResProfile).shopId as number, {
      ids: [product_id],
      state: toState
    });
    if (response.status === 200) {
      notify.show('Thao tác thực hiện thành công.', "success");
      const index: number = this.listAuction.findIndex(value => value.id === product_id);
      index !== -1 && (this.listAuction[index].state = toState);
      this.setState({keyTable: Math.random()});
    } else if (response.body.message && typeof response.body.message === "string")
      notify.show(response.body.message, "error");
    else
      notify.show('Đã có lỗi xảy ra', "error");
  }

  private async deleteDraft(product_id: number) {
    const response = await service.DeleteDraftMulti((ProfileStore.profile as IResProfile).shopId as number, {ids: [product_id]});
    if (response.status === 200) {
      notify.show('Sản phẩm nháp đã được xóa thành công.', "success");
      const index: number = this.listAuction.findIndex(value => value.id === product_id);
      index !== -1 && this.listAuction.splice(index, 1);
      this.setState({keyTable: Math.random()});
    } else if (response.body.message && typeof response.body.message === "string")
      notify.show(response.body.message, "error");
    else
      notify.show('Đã có lỗi xảy ra', "error");
  }

  handlerOnChangeFilter(key: "state" | "aspect" | "type", value: string) {
    let search = "?";
    if (key === "state") {
      search += `&state=${value || null}`;
      search += `&filterAuction=${this.currentType || null}`;
    } else if (key === "type") {
      search += `&state=${this.currentState || null}`;
      search += `&filterAuction=${value || null}`;
    }
    search += `&page=0&size=${this.size}`;
    search = search.replace(/&\w+=null/g, "");
    search = search.replace(/(\?\w+=null|\?&)/g, "?");
    this.props.history.push(window.location.pathname + search);
  }

  handlerBtnSearchOnClick() {
    let search = `?search=${this.textSearch}&state=${this.currentState}&filterAuction=${this.currentType}&page=0&size=${this.size}`;
    this.props.history.push('/home/auctions' + search);
  }

  @observable categoryFillterId?: number
  onChange = async (value: any, selectedOptions: any) => {
    // this.textSearch = selectedOptions.map((o: any) => o.label).join('/ ')
    if (selectedOptions[2].id) {
      this.categoryFillterId = selectedOptions[2].id;
    } else {
      this.categoryFillterId = selectedOptions[1].id;
    }
    let search = `?search=&state=${this.currentState}&filterAuction=${this.currentType}&page=0&size=${this.size}&categoryId=${this.categoryFillterId}`;
    this.props.history.push('/home/auctions' + search);
  }
  // clearTextSearch=()=>{
  //   this.textSearch=''
  //   this.categoryFillterId=undefined;
  // }
  handleChangeTextSearch(e: any) {
    this.textSearch = e.currentTarget.value
    this.categoryFillterId = undefined
  }

  render(): React.ReactNode {
    const options = AppGlobal.dataFilterCategories;
    return <div className="container-fluid" id="products-manager-auction">
      <Warning/>
      <div className='row'>
        <div className="col-xs-12 px-0">
          <div className='card'>
            <div className='card-header search'>
              <div className="row">
                <div className="col-xs-12 col-lg-4 position-relative">
                  <input className="form-control" placeholder="Tìm kiếm"
                         value={this.textSearch}
                         onChange={(e: SyntheticEvent<HTMLInputElement>) => this.handleChangeTextSearch(e)}
                         type="text"/>
                  {/*<i className="fas fa-times-octagon position-absolute" style={{top:"10px",right:"20px",cursor:"pointer"}} onClick={()=>this.clearTextSearch()}/>*/}
                </div>
                <div className="col-xs-12 col-lg-8 d-flex">
                  <Cascader options={options} onChange={this.onChange} size={"large"} style={{height: "500px"}}>
                    <button className="float-left btn btn-default btn-labeled" style={{marginRight: "12px"}}>
                      <i className="btn-label fas fa-filter"/>Bộ lọc
                    </button>
                  </Cascader>
                  <button className="float-left btn btn-default btn-labeled"
                          onClick={() => this.handlerBtnSearchOnClick()}><i
                    className="btn-label fa fa-search"/>Tìm kiếm
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  this.props.history.push(LINK_ADD_AUCTION);
                  ga.pushEventGa('Product_manage', 'Click_submit_auction_product');
                }}
                className="btn btn-add btn-primary">+ Thêm đấu giá
              </button>
            </div>
            <div className='card-body'>
              <div className="tab-base mb-0">
                <ul className="nav nav-tabs">
                  {this.stateData.map((item, index: number) =>
                    <li className={this.currentState === item.value ? 'active' : ''}
                        key={index}><Link
                      to={`/home/auctions?state=${item.value}&page=${this.page}&size=${this.size}`}>{item.name}</Link>
                    </li>)}
                </ul>
                <div className="tab-content">
                  <div className="tab-pane fade active in">
                    <table className="table table-striped">
                      <thead>
                      <tr>
                        <th className="px-0" colSpan={7}>
                          <select value={this.currentType}
                                  onChange={e => this.handlerOnChangeFilter("type", e.currentTarget.value)}
                                  className="w-auto form-control-sm form-control float-left ml-3">
                            {this.typeData.map((item: { name: string, value: string }, index: number) =>
                              <option key={index}
                                      value={item.value}>{item.name}</option>)}
                          </select>
                        </th>
                      </tr>
                      <tr className="text-center font-weight-bold text-uppercase">
                        <th className="text-left">Sản phẩm</th>
                        <th className="text-center"/>
                        <th className="text-center">Kiểu đấu giá</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-center">Thời gian bắt đầu</th>
                        <th className="text-center">Trạng thái</th>
                        <th className="text-end">Hành động</th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.listAuction && this.listAuction.map((item: IResponseAuction, index: number) =>
                        <ItemTableAuction key={index}
                                          data={item}
                                          onChangeState={state => this.handlerOnChangeStateProduct(state, item)}
                                          emitOnViewerImage={src => (this.ImageViewerRef.current as ImageViewer).show(src)}
                        />)}
                      {/*Not found data*/}
                      {this.listAuction.length === 0 && <tr>
                          <td colSpan={7}><p className="my-5 text-center">Không tìm thấy dữ
                              liệu</p></td>
                      </tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {this.total > 0 && <div className="card-footer">
                <div className="row d-flex px-3 justify-content-between">
                    <div className="w-50 d-flex align-items-center">
                        <p className="mb-0 mr-5">{this.total} sản phẩm</p>
                    </div>
                    <div className="w-50 d-flex justify-content-end">
                      {this.total > 0 &&
                      <PaginationComponent
                          total={this.total}
                          number={this.size}
                          defaultActive={this.page}
                          emitOnChangePage={page => this.paginationChange(page)}
                      />}
                    </div>
                </div>
            </div>}
          </div>
        </div>
      </div>
      <ImageViewer ref={this.ImageViewerRef}/>
    </div>;
  }

  @menu(3, 1)
  @breadcrumb([{title: 'Danh sách đấu giá'}])
  public async componentDidMount() {
    // this.getDataCategorise()
    this.matchQueryString();
    this.getListAuction().then();
    if (ShopStore.shopProfile && ShopStore.shopStats) {
      const {countProduct} = ShopStore.shopStats;
      if (countProduct > 0 && !ShopStore.hasContact() && !ShopStore.hasInformationAdvanced() && !ShopStore.hasNumberPhone())
        notify.show("Hãy bổ sung thông tin nâng cao của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. Đối với cá nhân và hộ kinh doanh là chứng minh nhân dân, đối với doanh nghiệp sẽ là hồ sơ doanh nghiệp.", "warning", 10);
    }
  }

  async componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<{}>, snapshot?: any) {
    if (prevProps.location.search !== this.props.location.search) {
      this.matchQueryString();
      this.getListAuction().then();
    }
  }
}

class UrlManagerAuctionSearchParams extends URLSearchParams {
  constructor(search: string) {
    super(search);
    Object.setPrototypeOf(this, UrlManagerAuctionSearchParams.prototype);
  }

  get getKeyWord(): string | '' {
    return this.get('search') || '';
  }

  get getState(): 'BIDING' | 'STOPPED' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT' | '' {
    const result = this.get('state') || '';
    if (/^(BIDING|STOPPED|DRAFT|READY|PENDING|DELETED|REJECT)$/i.test(result))
      return result as ('BIDING' | 'STOPPED' | 'DRAFT' | 'READY' | 'PENDING' | 'DELETED' | 'REJECT');
    else return '';
  }

  /*get getAspect(): 'selling' | 'soldOff' | '' {
      const result = this.get('aspect');
      if (result === 'selling' || result === 'soldOff')
          return result;
      else return '';
  }*/

  get getPage(): number {
    const value: number = parseInt(this.get('page') || '0');
    return isNaN(value) ? 0 : value;
  }

  get getCategoryId(): number {
    const value: number = parseInt(this.get('categoryId') || '0');
    return isNaN(value) ? 0 : value;
  }

  get getSize(): number {
    const value: number = parseInt(this.get('size') || '');
    return isNaN(value) ? 10 : value;
  }

  get getType(): 'AUCTION' | 'AUCTION_FLASH_BID' | "" {
    const type = this.get("filterAuction") || '';
    if (/^(AUCTION|AUCTION_FLASH_BID)$/.test(type))
      return type as ('AUCTION' | 'AUCTION_FLASH_BID')
    else return "";
  }
}

interface IWarningData {
  text: string
  link: string
  visiable: boolean
}

@observer
class Warning extends React.Component<any, any> {
  @observable data: IWarningData[] = [
    {
      text: "Chỉ cần thêm 1 bước nữa thôi sẽ giúp bạn tăng cơ hội có thêm đơn hàng. " +
        "Đăng sản phẩm của mình ngay để khách hàng có thể tìm kiếm và mua sản phẩm của bạn ngay nhé.",
      link: "/home/auction/add",
      visiable: true
    },
    {
      text: "Hãy bổ sung thông tin nâng cao của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. " +
        "Đối với cá nhân và hộ kinh doanh là chứng minh nhân dân, đối với doanh nghiệp sẽ là hồ sơ doanh nghiệp.",
      link: "/home/auction/add",
      visiable: true
    }
  ];

  render() {
    if (ShopStore.shopProfile && this.getWarning && this.getWarning.visiable) {

      return <div className='container-fluid' css={warringCss}>
        <button
          onClick={() => (this.getWarning as IWarningData).visiable = false}
          className="close d-flex flex-column align-items-center justify-content-center">
          <i className="fal fa-times"/></button>
        <p>{this.getWarning.text} <Link to={this.getWarning.link}>Đăng bán ngay</Link></p>
      </div>
    } else return null;
  }

  get getWarning(): IWarningData | null {
    if (ShopStore.shopProfile && ShopStore.shopStats) {
      const {countProduct} = ShopStore.shopStats;
      if (!countProduct)
        return this.data[0];
      else if (countProduct && !ShopStore.hasInformationAdvanced())
        return this.data[1];
      else return null;
    } else return null;
  }
}

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
