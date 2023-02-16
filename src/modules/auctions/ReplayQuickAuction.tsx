import React from "react";
import {observer} from "mobx-react";
import TemplateFormAuction from "./template";
import DetailAuction from "./DetailAuction";
import {BreadcrumbsComponent} from "../../common/breadcrumbs";

@observer
export default class ReplayQuickAuction extends DetailAuction {
    render(): any | null {
        if (this.auctionDetail)
            return <>
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12"><h2 className="mt-0">Đấu giá ngay: {this.auctionDetail.name}</h2>
                        </div>
                        <div className="col-xs-12"><BreadcrumbsComponent/></div>
                    </div>
                </div>
                <TemplateFormAuction
                    type={"REPLAY_QUICK"}
                    history={this.props.history}
                    auctionDetail={this.auctionDetail}
                />
            </>;
        else return null;
    }
}