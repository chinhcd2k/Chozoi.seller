import React from "react";
import {observer} from "mobx-react";
import {store} from "..";
import {Link} from "react-router-dom";
import {computed, observable} from "mobx";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import ga from '../../../init-ga';
import {Moment} from "../../../common/functions/Moment";

@observer
export default class Menu extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    const MenuData_TEMP: IMenu[] = MenuStore.menuData.sort((a, b) => {
      if (a.sort < b.sort) return -1;
      else if (a.sort > b.sort) return 1;
      else return 0;
    });
    MenuData_TEMP.reduce((previousValue: IMenu[], currentValue: IMenu) => {
      if (currentValue.children) currentValue.children = currentValue.children.sort((a, b) => {
        if (a.sort < b.sort) return -1;
        else if (a.sort > b.sort) return 1;
        else return 0;
      })
      previousValue.push(currentValue);
      return previousValue;
    }, []);
    MenuStore.menuData = MenuData_TEMP;
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return <ul id="mainnav-menu" className="list-group">
      {MenuStore.getMenuData.map((parent, index) =>
        !parent.hidden && <li key={index}
                              className={`${store.menuActive[0] === parent.id ? "active-sub active" : ""}`}>
              <Link to={parent.path ? parent.path : '#'}
                    onClick={() => store.menuActive = [parent.id, -1]}>
                {parent.icon}
                  <span className="menu-title">{parent.title}</span>
                {parent.children && <i className="arrow"/>}
              </Link>
          {parent.children &&
          <ul className={`collapse ${store.menuActive[0] === parent.id ? "in h-100" : ""}`}>
            {parent.children.map((children, index1) => {
              let render: boolean = !children.hidden;
              if (render) {
                // Check Shop Offical store vs Seller Shipping
                if (parent.id === 1 && children.id === 7)
                  render = ShopStore.shopProfile ? ShopStore.shopProfile.shopType === "OFFICIAL_STORE" : false;
                else if (parent.id === 1 && children.id === 8)
                  render = ShopStore.shopProfile ? ShopStore.shopProfile.sellShipping : false;
                // End
                // Check Chozoi enable Auction
                if (parent.id === 3 && (children.id === 1 || children.id === 3))
                  render = (window as any).IS_SHOW_AUCTION;
              }
              return render && <li key={index1}
                                   className={(store.menuActive[0] === parent.id) && (store.menuActive[1] === children.id) ? "active-link" : ""}>
                  <Link to={children.path} onClick={() => {
                    if (children.name === 'Đăng bán sản phẩm') ga.pushEventGa('Home_seller', 'Click_menu_submit_product'); else if (children.name === 'Đăng đấu giá') ga.pushEventGa('Home_seller', 'Click_menu_auction_product')
                  }}>{children.name}</Link>
              </li>
            })}
          </ul>}
          </li>
      )}
    </ul>;
  }
}

interface IMenu {
  id: number
  sort: number
  title: string
  path?: string
  icon: any
  hidden?: boolean
  children?: {
    id: number
    sort: number
    name: string
    path: string
    hidden?: boolean
  }[]
}

class Store {
  readonly todayStr = Moment.getDate(new Date().getTime(), "yyyy-mm-dd", false);
  @observable menuData: IMenu[] = [
    {
      id: 0,
      sort: 0,
      title: 'Dashboard',
      path: '/home',
      icon: <i className="fa fa-tachometer"/>
    },
    {
      id: 1,
      sort: 1,
      title: 'Quản lý cửa hàng',
      icon: <i className="fa fa-shopping-cart" aria-hidden="true"/>,
      children: [
        {
          id: 0,
          sort: 1,
          name: 'Quản lý thông tin',
          path: '/home/shop'
        },
        {
          id: 1,
          sort: 2,
          name: 'Quản lý địa chỉ',
          path: '/home/shop/address'
        },
        {
          id: 2,
          sort: 3,
          name: 'Cài đặt vận chuyển',
          path: '/home/profile/setting-shipping'
        },
        {
          id: 3,
          sort: 5,
          name: 'Quản lý thẻ',
          path: '/home/shop/card'
        },
        {
          id: 4,
          sort: 6,
          name: 'Đánh giá shop',
          path: '/home/shop/review?page=0&size=5'
        },
        {
          id: 5,
          sort: 7,
          name: 'Hỏi đáp',
          path: '/home/shop/qa/all'
        },
        {
          id: 6,
          sort: 8,
          name: 'Thông báo',
          path: '/home/notifications/type=all'
        },
        {
          id: 7,
          sort: 0,
          name: 'Quản lý mẫu store',
          path: '/home/shop/official-store'
        },
        {
          id: 8,
          sort: 4,
          name: 'Cài đặt khu vực vận chuyển',
          path: '/home/shop/shipping?type=all&page=0'
        },
      ]
    },
    {
      id: 2,
      sort: 2,
      title: 'Đơn hàng',
      icon: <i className="fas fa-file-alt"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Quản lý đơn hàng',
          path: '/home/orders/state=all'
        },
        {
          id: 1,
          sort: 1,
          name: 'Đơn hàng hoàn trả',
          path: '/home/order-return/state=request'
        }
      ]
    },
    {
      id: 3,
      sort: 3,
      title: 'Sản phẩm',
      icon: <i className="fa fa-shopping-bag" aria-hidden="true"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Danh sách sản phẩm',
          path: '/home/products/state=ALL',
        },
        {
          id: 1,
          sort: 1,
          name: 'Danh sách đấu giá',
          path: '/home/auctions?page=0&size=10',
        },
        {
          id: 2,
          sort: 2,
          name: 'Đăng bán sản phẩm',
          path: '/home/product/add',
        },
        {
          id: 3,
          sort: 3,
          name: 'Đăng đấu giá',
          path: '/home/auction/add',
        }
      ]
    },
    {
      id: 4,
      sort: 4,
      title: 'Doanh thu',
      icon: <i className="fa fa-money" aria-hidden="true"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Sao kê doanh thu',
          path: '/home/revenue'
        },
        {
          id: 1,
          sort: 1,
          name: 'Lịch sử giao dịch',
          path: '/home/revenue/history/type=all'
        },
      ]
    },
    {
      id: 5,
      sort: 5,
      title: 'Thống kê',
      icon: <i className="fa fa-line-chart"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Hiệu quả cửa hàng',
          path: `/home/shop-efficiency/type=draft&from=${this.todayStr}&to=${this.todayStr}`
        },
        {
          id: 1,
          sort: 1,
          name: 'Hiệu quả sản phẩm',
          path: `/home/products-efficiency?timeStart=${this.todayStr}&timeEnd=${this.todayStr}&state=INTERACTIVE`
        }
      ]
    },
    {
      id: 6,
      sort: 6,
      title: 'Khuyến mại',
      icon: <i className="fas fa-ad"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Mã giảm giá',
          path: '/home/coupon?type=all&page=0'
        },
        {
          id: 1,
          sort: 1,
          name: 'Chương trình Chozoi',
          path: '/home/campaign?page=0&size=5'
        }
      ]
    }
  ];

  @computed get getMenuData(): IMenu[] {
    return this.menuData;
  }
}

export const MenuStore = new Store();
