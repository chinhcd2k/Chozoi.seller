import React from "react";
import {store as ShopStore} from "../../shop/stores/ShopInfomationStore";
import {Link} from "react-router-dom";
import {observer} from "mobx-react";
import {RankFavourite, RankPositive, RankNormal} from "./Rank";

@observer
export default class ProfileWidget extends React.Component<any, any> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        if (ShopStore.shopProfile)
            return <div id="mainnav-profile" className="mainnav-profile">
                <div className="profile-wrap text-center">
                    <div className="pad-btm">
                        <img aria-hidden className="img-circle img-md"
                             src={ShopStore.shopProfile && ShopStore.shopProfile.imgAvatarUrl ? ShopStore.shopProfile.imgAvatarUrl : '/assets/images/avatar.png'}
                             alt="Profile Picture"/>
                    </div>
                    <div className="box-block">
                        { ShopStore.shopProfile.status==='ON'&&<div style={{
                            color:"#ffb300",
                        }}>
                            <i className="fal fa-clock"/> Shop đang tạm nghỉ
                        </div>}
                        <Link to="/home/shop"><p
                            className="mnp-name">{ShopStore.shopProfile && ShopStore.shopProfile.name ? ShopStore.shopProfile.name : ''}</p>
                        </Link>
                        <p className="mnp-desc">
                            {ShopStore.shopProfile && ShopStore.shopProfile.email ? ShopStore.shopProfile.email : ''}
                        </p>
                        {ShopStore.shopProfile.shopTag === "NORMAL" && <RankNormal/>}
                        {ShopStore.shopProfile.shopTag === "FAVOURITE" && <RankFavourite/>}
                        {ShopStore.shopProfile.shopTag === "POSITIVE" && <RankPositive/>}
                    </div>
                </div>
            </div>;
        else return null;
    }
}