import React from "react";
import {BANNER_PRIMARY_CTRL} from "./control";
import {observer} from "mobx-react";

@observer
export default class TemplateBannerPrimary extends React.Component<any, any> {
    private store = BANNER_PRIMARY_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="templates-banner-primary">
            {(this.store.getBanner.web.length === 0 || !this.store.getBanner.web[0].image) &&
            <div className="add"
                 onClick={() => BANNER_PRIMARY_CTRL.showPopupManager()}>
                <label>Ảnh banner chính</label>
                <i className="fal fa-plus fa-3x"/>
            </div>}
            {this.store.getBanner.web.length > 0 && this.store.getBanner.web[0].image && <div className="image">
                <img
                    src={this.store.getBanner.web[0].image.url}
                    alt="banner-primary-web"
                    onClick={() => BANNER_PRIMARY_CTRL.showPopupManager()}
                />
            </div>}
        </div>;
    }
};
