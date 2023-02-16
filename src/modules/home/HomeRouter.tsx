import * as React from "react";
import {Route} from "react-router-dom";
import {DashboardComponent} from "./index";
import ChangePasswordComponent from "../auth/change-password/components/ChangePasswordComponent";
import ManagerProductComponent from "../products/manager-product/components/ManagerProductComponent";
import CreateProduct from "../products/create-product/CreateProduct";
import EditProduct from "../products/edit-product/EditProduct";
import ManagerAuctionPageSite from "../auctions/manager-auction";
import ManagerOrderComponent from "../orders/order/components/ManagerOrderComponent";
import PackageOrderComponent from "../orders/order/components/PackageOrderComponent";
import DetailOrderComponent from "../orders/order/components/DetailOrderComponent";
import OrderReturnComponent from "../orders/return/components/OrderReturnComponent";
import PackageOrderReturnComponent from "../orders/return/components/PackageOrderReturnComponent";
import DetailOrderReturnComponent from "../orders/return/components/DetailOrderReturnComponent";
import {SettingShippingComponent} from "../profile";
import RevenueWalletComponent from "../revenue/components/RevenueWalletComponent";
import RevenueHistoryComponent from "../revenue/components/RevenueHistoryComponent";
import RevenueCashoutComponent from "../revenue/components/RevenueCashoutComponent";
import ShopEfficiencyComponent from "../analytics/shop-efficiency/components/ShopEfficiencyComponent";
import NotificationComponent from "../notifications/components/NotificationComponent";
import DetailProductComponent from "../products/detail-product/DetailProduct";
import {ShopRankComponent} from "../shop/rank";
import ShopInformation from "../shop/shopInfomation/index";
import ShopAddress from "../shop/address";
import ShopReviewSite from "../shop/review";
import ShopCard from "../shop/bankCard";
import ShopQA from "../shop/components/ShopQA";
import OfficialStore from "../shop/official-store/manager";
import UpdateOfficialStore from "../shop/official-store/components/templates/update";
import ManagerCoupont from "../coupon/manager";
import CreateCoupon from "../coupon/CreateCoupon";
import UpdateCoupon from "../coupon/UpdateCoupon";
import SellerShipping from "../shop/shipping/manager";
import CreateShipping from "../shop/shipping/CreateShipping";
import UpdateShipping from "../shop/shipping/UpdateShipping";
import CreateAuction from "../auctions/CreateAuction";
import DetailAuction from "../auctions/DetailAuction";
import UpdateAuction from "../auctions/UpdateAuction";
import ReplayAuction from "../auctions/ReplayAuction";
import ReplayQuickAuction from "../auctions/ReplayQuickAuction";
import {CampaignRoutes} from "../campaign/router";
import ProductsEfficiency from "../products-efficiency";
import DetailProduct from "../products-efficiency/detail-product/DetailProduct";
import CreateAuctionFromNormal from "../auctions/CreateAuctionFromNormal";
import CreateNormalFromAuction from "../products/create-product/CreateNormalFromAuction";

export const HomeRouter: React.FC = () => {
  return (
    <>
      {/*--------- DASHBOARD ---------*/}
      <Route path='/home' exact component={DashboardComponent}/>
      <Route path='/home/change-password' exact component={ChangePasswordComponent}/>
      {/*--------- ROUTER PRODUCTS ---------*/}
      <Route path='/home/products/:query' exact component={ManagerProductComponent}/>
      <Route path='/home/product/add' exact component={CreateProduct}/>
      <Route path='/home/product/update/:id' exact component={EditProduct}/>
      <Route path='/home/product/detail/:id' exact component={DetailProductComponent}/>
        <Route path='/home/auction/createFromAuction' exact component={CreateNormalFromAuction}/>
      <Route path='/home/auctions' exact component={ManagerAuctionPageSite}/>
      <Route path='/home/auction/add' exact component={CreateAuction}/>
      <Route path='/home/auction/update/:id' exact component={UpdateAuction}/>
      <Route path='/home/auction/detail/:id' exact component={DetailAuction}/>
      <Route path='/home/auction/replay/:id' exact component={ReplayAuction}/>
      <Route path='/home/auction/replay-quick/:id' exact component={ReplayQuickAuction}/>
        <Route path='/home/auction/createFromNormal' exact component={CreateAuctionFromNormal}/>
      {/*--------- ORDER ---------*/}
      <Route path='/home/orders/:query' exact component={ManagerOrderComponent}/>
      <Route path='/home/order/package/:id' exact component={PackageOrderComponent}/>
      <Route path='/home/order/package/:packageId/detail/:lineId' exact
             component={DetailOrderComponent}/>
      <Route path='/home/order-return/:query' exact component={OrderReturnComponent}/>
      <Route path='/home/order-return/package/:id' exact
             component={PackageOrderReturnComponent}/>
      <Route path='/home/order-return/package/:packageId/detail/:lineId' exact
             component={DetailOrderReturnComponent}/>
      <Route path='/home/order-return/detail/:lineId' exact
             component={DetailOrderReturnComponent}/>
      {/*--------- SHOP ---------*/}
      <Route path='/home/shop' exact component={ShopInformation}/>
      <Route path='/home/shop/address' exact component={ShopAddress}/>
      <Route path='/home/shop/review' exact component={ShopReviewSite}/>
      <Route path='/home/shop/card' exact component={ShopCard}/>
      <Route path='/home/shop/qa/:type' exact component={ShopQA}/>
      <Route path='/home/profile/setting-shipping' exact
             component={SettingShippingComponent}/>
      <Route path='/home/shop/rank' component={ShopRankComponent}/>
      <Route path='/home/shop/shipping/' exact component={SellerShipping}/>
      <Route path='/home/shop/shipping/create/' exact component={CreateShipping}/>
      <Route path='/home/shop/shipping/update/:id' exact component={UpdateShipping}/>
      {/*--------- REVENUE ---------*/}
      <Route path='/home/revenue' exact component={RevenueWalletComponent}/>
      <Route path='/home/revenue/history/:query' exact
             component={RevenueHistoryComponent}/>
      <Route path='/home/revenue/cashout' exact component={RevenueCashoutComponent}/>
      {/*Analytics*/}
      <Route path="/home/shop-efficiency/:query" exact
             component={ShopEfficiencyComponent}/>
      <Route path={"/home/products-efficiency"} exact component={ProductsEfficiency}/>
      <Route path={"/home/products-efficiency/detail-product"} exact component={DetailProduct}/>
      {/*Notification*/}
      <Route exact path="/home/notifications/:query" component={NotificationComponent}/>
      {/*Official Store*/}
      <Route exact path='/home/shop/official-store' component={OfficialStore}/>
      <Route exact path='/home/shop/official-store/:id' component={UpdateOfficialStore}/>
      {/*Promotions*/}
      <Route exact path='/home/coupon/' component={ManagerCoupont}/>
      <Route exact path='/home/coupon/create/' component={CreateCoupon}/>
      <Route exact path='/home/coupon/update/:id' component={UpdateCoupon}/>
      {/*Campaign*/}
      <CampaignRoutes/>
    </>
  );
};
