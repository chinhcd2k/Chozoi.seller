import React from "react";
import {store as HomeStore} from "../home";
import {BreadcrumbsComponent, BreadcrumbsService} from "../../common/breadcrumbs";
import TemplateFormAuction from "./template";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {css} from "@emotion/core";
import {store as ShopStore} from "../shop/stores/ShopInfomationStore";
import {Link} from "react-router-dom";
import PopupNewAddress from "../shop/address/components/PopupNewAddress";
import {Button} from "antd";
import Intro from "../products/components/Intro";
import {IResponseProduct} from "../products/manager-product/components/ManagerProductComponent";
import {IResponseAuction} from "./DetailAuction";
import InfomationBasic from "./template/components/InfomationBasic";
import {AppGlobal} from "../../AppGlobal";
import Gallery from "./template/components/Gallery";
import Shipping from "./template/components/Shipping";

interface ICreateAuctionProps {
    history: {
        push: (path: string) => any
        goBack: () => any
    }
}

@observer
export default class CreateAuction extends React.Component<ICreateAuctionProps, any> {
    constructor(props: any) {
        super(props);
        BreadcrumbsService.loadBreadcrumbs([{title: 'Đăng đấu giá'}]);
        HomeStore.menuActive = [3, 3];
    }

  @observable isShowIntro: boolean = true;

  handlerOnCreate(name?: string) {
    this.isShowIntro = false;
    if (InfomationBasic.getInstance) {
      const infomationBasic = InfomationBasic.getInstance;
      infomationBasic.name = name || "";
    }
  }

  async handlerOnFetchData(data: IResponseProduct | IResponseAuction) {
    this.isShowIntro = false;
    if (InfomationBasic.getInstance) {
      const infomationBasic = InfomationBasic.getInstance;
      infomationBasic.name = data.name;
      if (AppGlobal.categories && AppGlobal.categories[data.category.id]) {
        const cates = AppGlobal.categories[data.category.id];
        if (cates.length === 2) {
          infomationBasic.getcategoriesLevel2(cates[0].id);
          infomationBasic.categoriesLv1Value = cates[0].id;
          infomationBasic.categoriesLv2Value = cates[1].id;
          await infomationBasic.getPropertycategories(cates[1].id);
        } else if (cates.length === 3) {
          infomationBasic.getcategoriesLevel2(cates[0].id);
          infomationBasic.getcategoriesLevel3(cates[1].id);
          infomationBasic.categoriesLv1Value = cates[0].id;
          infomationBasic.categoriesLv2Value = cates[1].id;
          infomationBasic.categoriesLv3Value = cates[2].id;
          await infomationBasic.getPropertycategories(cates[2].id);
        }
        (data as IResponseAuction).attributes.map(value => {
          return infomationBasic.listProperty.map(value1 => {
            if (value1.id === value.id) value1.selectedId = value.valueId;
            return value1;
          });
        });
        infomationBasic.description_pickingout = data.descriptionPickingOut || "";
      }
    }
    if (Gallery.getInstance) {
      const gallery = Gallery.getInstance;
      gallery.listImage = [];
      (data as IResponseAuction).images.map((value, index) => gallery.listImage.push({
        file: undefined,
        sort: index,
        src: value.imageUrl
      }));
    }
    if (Shipping.getInstance) {
      const shipping = Shipping.getInstance;
      shipping.weight = data.weight;
      shipping.size = data.packingSize;
    }
  }

  render() {
    return <>
      {this.isShowIntro && <div className="container">
          <Intro onNext={name => this.handlerOnCreate(name)}
                 onFetch={data => this.handlerOnFetchData(data)}
          />
      </div>}
      <div style={{display: this.isShowIntro ? "none" : "block"}}>
        <Warning/>
        <div className="container">
          <div className="row">
            <div className="col-xs-12"><h2 className="mt-0">Đăng đấu giá</h2></div>
            <div className="col-xs-12"><BreadcrumbsComponent/></div>
          </div>
        </div>
        {!ShopStore.hasContact() && <div className="container mt-3">
            <div className="panel mb-0">
                <div className="panel-body pb-3">
                    <h5>Địa chỉ cửa hàng *</h5>
                    <Button type={"primary"}
                            onClick={() => PopupNewAddress.show()}
                            size={"small"}><i className="fal fa-plus"/>&nbsp;Thêm địa chỉ</Button>
                </div>
            </div>
        </div>}
        <TemplateFormAuction type={"CREATE"} history={this.props.history}/>
        <PopupNewAddress onFinish={() => ShopStore.getShopProfileNow()}/>
      </div>
    </>;
  }

  componentDidMount() {
    HomeStore.isShowBreadcrumbs = false;
  }

  componentWillUnmount() {
    HomeStore.isShowBreadcrumbs = true;
  }
}


interface IDataWarning {
    text: string
    link: string
    visible: boolean
}

@observer
class Warning extends React.Component<any, any> {
    @observable data: IDataWarning[] = [
        {
            text: "Hãy bổ sung thông tin kho và số điện thoại ngay nhé để sản phẩm của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. " +
                "Bổ sung số điện thoại để chúng tôi liên hệ khi phát sinh đơn hàng nhé sau đó bổ sung địa chỉ kho để chúng tôi có thể đến lấy hàng khi phát sinh đơn.",
            link: "/home/shop/address",
            visible: true
        },
        {
            text: "Hãy bổ sung thông tin số điện thoại ngay nhé để sản phẩm của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. " +
                "Bổ sung số điện thoại để chúng tôi liên hệ khi phát sinh đơn hàng nhé.",
            link: "/home/shop",
            visible: true
        },
        {
            text: "Hãy bổ sung thông tin kho ngay nhé để sản phẩm của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. " +
                "Bổ sung địa chỉ kho để chúng tôi có thể đến lấy hàng khi phát sinh đơn.",
            link: "/home/shop/address",
            visible: true
        },
        {
            text: "Hãy bổ sung thông tin nâng cao của bạn sau khi đăng sẽ đủ điều kiện phê duyệt. " +
                "Đối với cá nhân và hộ kinh doanh là chứng minh nhân dân, đối với doanh nghiệp sẽ là hồ sơ doanh nghiệp.",
            link: "/home/shop",
            visible: true
        }
    ];

    render() {
        const warringCss = css`
            border: 1px dashed #F54B24;
            background: #FEF3EC 0% 0% no-repeat padding-box;
            border-radius: 12px;
            padding: 20px;
            position: relative;
            margin-bottom: 16px;
            
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
        if (this.getWarning && this.getWarning.visible)
            return <div className='container'>
                <div css={warringCss}>
                    <button
                        onClick={() => (this.getWarning as IDataWarning).visible = false}
                        className="close d-flex flex-column align-items-center justify-content-center">
                        <i className="fal fa-times"/></button>
                    <p>{this.getWarning.text} <Link to={this.getWarning.link}>Bổ sung ngay</Link></p>
                </div>
            </div>;
        else return null;
    }

    get getWarning(): { text: string, link: string, visible: boolean } | null {
        if (!ShopStore.hasNumberPhone() && !ShopStore.hasContact() && !ShopStore.hasInformationAdvanced())
            return this.data[0];
        else if (!ShopStore.hasNumberPhone() && ShopStore.hasContact())
            return this.data[1];
        else if (!ShopStore.hasContact() && ShopStore.hasNumberPhone())
            return this.data[2];
        else if (!ShopStore.hasInformationAdvanced() && ShopStore.hasNumberPhone() && ShopStore.hasContact())
            return this.data[3];
        return null;
    }
}
