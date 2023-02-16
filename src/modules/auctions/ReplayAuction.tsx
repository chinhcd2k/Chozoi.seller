import React from "react";
import TemplateFormAuction from "./template";
import DetailAuction from "./DetailAuction";
import {observer} from "mobx-react";
import {BreadcrumbsComponent} from "../../common/breadcrumbs";

@observer
export default class ReplayAuction extends DetailAuction {
    render() {
        if (this.auctionDetail)
            return <>
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12"><h2 className="mt-0">Đấu giá lại: {this.auctionDetail.name}</h2></div>
                        <div className="col-xs-12"><BreadcrumbsComponent/></div>
                    </div>
                </div>
                <TemplateFormAuction
                    type={"REPLAY"}
                    history={this.props.history}
                    auctionDetail={this.auctionDetail}
                />
            </>;
        else return null;
    }
}