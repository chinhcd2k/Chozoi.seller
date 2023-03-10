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
                    if (children.name === '????ng b??n s???n ph???m') ga.pushEventGa('Home_seller', 'Click_menu_submit_product'); else if (children.name === '????ng ?????u gi??') ga.pushEventGa('Home_seller', 'Click_menu_auction_product')
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
      title: 'Qu???n l?? c???a h??ng',
      icon: <i className="fa fa-shopping-cart" aria-hidden="true"/>,
      children: [
        {
          id: 0,
          sort: 1,
          name: 'Qu???n l?? th??ng tin',
          path: '/home/shop'
        },
        {
          id: 1,
          sort: 2,
          name: 'Qu???n l?? ?????a ch???',
          path: '/home/shop/address'
        },
        {
          id: 2,
          sort: 3,
          name: 'C??i ?????t v???n chuy???n',
          path: '/home/profile/setting-shipping'
        },
        {
          id: 3,
          sort: 5,
          name: 'Qu???n l?? th???',
          path: '/home/shop/card'
        },
        {
          id: 4,
          sort: 6,
          name: '????nh gi?? shop',
          path: '/home/shop/review?page=0&size=5'
        },
        {
          id: 5,
          sort: 7,
          name: 'H???i ????p',
          path: '/home/shop/qa/all'
        },
        {
          id: 6,
          sort: 8,
          name: 'Th??ng b??o',
          path: '/home/notifications/type=all'
        },
        {
          id: 7,
          sort: 0,
          name: 'Qu???n l?? m???u store',
          path: '/home/shop/official-store'
        },
        {
          id: 8,
          sort: 4,
          name: 'C??i ?????t khu v???c v???n chuy???n',
          path: '/home/shop/shipping?type=all&page=0'
        },
      ]
    },
    {
      id: 2,
      sort: 2,
      title: '????n h??ng',
      icon: <i className="fas fa-file-alt"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Qu???n l?? ????n h??ng',
          path: '/home/orders/state=all'
        },
        {
          id: 1,
          sort: 1,
          name: '????n h??ng ho??n tr???',
          path: '/home/order-return/state=request'
        }
      ]
    },
    {
      id: 3,
      sort: 3,
      title: 'S???n ph???m',
      icon: <i className="fa fa-shopping-bag" aria-hidden="true"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Danh s??ch s???n ph???m',
          path: '/home/products/state=ALL',
        },
        {
          id: 1,
          sort: 1,
          name: 'Danh s??ch ?????u gi??',
          path: '/home/auctions?page=0&size=10',
        },
        {
          id: 2,
          sort: 2,
          name: '????ng b??n s???n ph???m',
          path: '/home/product/add',
        },
        {
          id: 3,
          sort: 3,
          name: '????ng ?????u gi??',
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
          name: 'Sao k?? doanh thu',
          path: '/home/revenue'
        },
        {
          id: 1,
          sort: 1,
          name: 'L???ch s??? giao d???ch',
          path: '/home/revenue/history/type=all'
        },
      ]
    },
    {
      id: 5,
      sort: 5,
      title: 'Th???ng k??',
      icon: <i className="fa fa-line-chart"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'Hi???u qu??? c???a h??ng',
          path: `/home/shop-efficiency/type=draft&from=${this.todayStr}&to=${this.todayStr}`
        },
        {
          id: 1,
          sort: 1,
          name: 'Hi???u qu??? s???n ph???m',
          path: `/home/products-efficiency?timeStart=${this.todayStr}&timeEnd=${this.todayStr}&state=INTERACTIVE`
        }
      ]
    },
    {
      id: 6,
      sort: 6,
      title: 'Khuy???n m???i',
      icon: <i className="fas fa-ad"/>,
      children: [
        {
          id: 0,
          sort: 0,
          name: 'M?? gi???m gi??',
          path: '/home/coupon?type=all&page=0'
        },
        {
          id: 1,
          sort: 1,
          name: 'Ch????ng tr??nh Chozoi',
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
