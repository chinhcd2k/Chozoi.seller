import React from "react";
import {observer} from "mobx-react";
import {store as ProfileShopStore} from "../../../../../stores/ShopInfomationStore";
import {Moment} from "../../../../../../../common/functions/Moment";
import {numberWithCommas} from "../../../../../../../common/functions/FormatFunc";

@observer
export default class Description extends React.Component<any, any> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            if (ProfileShopStore.shopProfile && ProfileShopStore.shopStats)
                return <div className="description">
                    <h4>{ProfileShopStore.shopProfile.name}</h4>
                    <ul>
                        <li>
                            <div className="store">
                                <i className="fal fa-gem"/> Gian hàng chính hãng
                            </div>
                        </li>
                        <li>{Moment.getDate(ProfileShopStore.shopProfile.createdAt, "dd/mm/yyyy")}</li>
                        <li>{numberWithCommas(ProfileShopStore.shopStats.countProduct)} sản phẩm</li>
                        <li>{numberWithCommas(ProfileShopStore.shopStats.sumRating)} đánh giá</li>
                    </ul>
                </div>;
            else return null;
        } catch (e) {
            console.error(e);
            return null
        }
    }
}
