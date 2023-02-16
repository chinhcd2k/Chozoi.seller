import React from "react";
import {observer} from "mobx-react";
import {HEADER_CTRL} from "../control";

@observer
export default class Logo extends React.Component<any, any> {
    private store = HEADER_CTRL.store;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <div className="add" onClick={() => HEADER_CTRL.showPopupUpload()}>
            {this.store.getLogo.web && <img src={this.store.getLogo.web.url} alt="logo-web"/>}
            {!this.store.getLogo.web && <i className="fal fa-plus"/>}
        </div>;
    }
}
