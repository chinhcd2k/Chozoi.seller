import React from "react";
import "./style.scss";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {Process} from "./components/Process";
import {SHOP_RANK_CTRL} from "./control";
import {LabelWarring} from "./components/LabelWarring";
import {observer} from "mobx-react";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {store as ShopStore} from "../stores/ShopInfomationStore";
import {Badge} from "./components/Badge";
import {IResShopProfile} from "../../../api/shop/interfaces/response";

@observer
export class ShopRankComponent extends React.Component<any, any> {
    private store = SHOP_RANK_CTRL.store;

    componentDidMount(): void {
        BreadcrumbsService.loadBreadcrumbs([{title: 'Danh hiệu cửa hàng'}]);
        SHOP_RANK_CTRL.getStatusRank();
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        if (!!this.store.getData) {
            const data = this.store.getData;
            return <div id="router-shop-rank">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <Process tag={data.tag} percent={this.store.processPercent}/>
                        </div>
                    </div>
                    <LabelWarring shopName={(ShopStore.shopProfile as IResShopProfile).name} tag={data.tag}/>
                    <div className='table-responsive'>
                        <table className="table table-condensed table-striped">
                            <thead>
                            <tr>
                                <th>Tiêu chí</th>
                                <th>Điểm của cửa hàng</th>
                                <th>Shop tích cực</th>
                                <th>Shop yêu thích</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Số lượng đơn hàng hoàn tất (đơn)</td>
                                <td>{numberWithCommas(data.countOrderFinished.current)}</td>
                                <td>
                                    {numberWithCommas(data.countOrderFinished.positiveCondition)}
                                    <Badge cur={data.countOrderFinished.current} des={data.countOrderFinished.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.countOrderFinished.favouriteCondition)}
                                    <Badge cur={data.countOrderFinished.current} des={data.countOrderFinished.favouriteCondition}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Tỷ lệ đơn hàng hoàn tất</td>
                                <td>{data.orderFinishedPercent.current} %</td>
                                <td>
                                    {numberWithCommas(data.orderFinishedPercent.positiveCondition)} %
                                    <Badge cur={data.orderFinishedPercent.current} des={data.orderFinishedPercent.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.orderFinishedPercent.favouriteCondition)} %
                                    <Badge cur={data.orderFinishedPercent.current} des={data.orderFinishedPercent.favouriteCondition}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Số lượng khách hàng không trùng lặp (khách)</td>
                                <td>
                                    {numberWithCommas(data.countBuyerNotDuplicate.current)}
                                </td>
                                <td>
                                    {numberWithCommas(data.countBuyerNotDuplicate.positiveCondition)}
                                    <Badge cur={data.countBuyerNotDuplicate.current} des={data.countBuyerNotDuplicate.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.countBuyerNotDuplicate.favouriteCondition)}
                                    <Badge cur={data.countBuyerNotDuplicate.current} des={data.countBuyerNotDuplicate.favouriteCondition}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Điểm đánh giá shop (sao)</td>
                                <td>{numberWithCommas(data.sumRating.current)}</td>
                                <td>
                                    {numberWithCommas(data.sumRating.positiveCondition)}
                                    <Badge cur={data.sumRating.current} des={data.sumRating.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.sumRating.favouriteCondition)}
                                    <Badge cur={data.sumRating.current} des={data.sumRating.favouriteCondition}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Tỷ lệ đơn hàng được đánh giá</td>
                                <td>{data.orderRatingPercent.current} %</td>
                                <td>
                                    {numberWithCommas(data.orderRatingPercent.positiveCondition)} %
                                    <Badge cur={data.orderRatingPercent.current} des={data.orderRatingPercent.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.orderRatingPercent.favouriteCondition)} %
                                    <Badge cur={data.orderRatingPercent.current} des={data.orderRatingPercent.favouriteCondition}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Tỷ lệ chuẩn bị hàng đúng hạn</td>
                                <td>{data.prepareGoodsOnTimePercent.current} %</td>
                                <td>
                                    {numberWithCommas(data.prepareGoodsOnTimePercent.positiveCondition)} %
                                    <Badge cur={data.prepareGoodsOnTimePercent.current} des={data.prepareGoodsOnTimePercent.positiveCondition}/>
                                </td>
                                <td>
                                    {numberWithCommas(data.prepareGoodsOnTimePercent.favouriteCondition)} %
                                    <Badge cur={data.prepareGoodsOnTimePercent.current} des={data.prepareGoodsOnTimePercent.favouriteCondition}/>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>;
        } else return null;
    }
}