import React from "react";
import DetailAuction from "./DetailAuction";
import {observer} from "mobx-react";
import TemplateFormAuction from "./template";
import {BreadcrumbsComponent} from "../../common/breadcrumbs";

@observer
export default class UpdateAuction extends DetailAuction {
    render(): any | null {
        if (this.auctionDetail)
            return <>
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12"><h2 className="mt-0">{this.auctionDetail.name}</h2></div>
                        <div className="col-xs-12"><BreadcrumbsComponent/></div>
                    </div>
                </div>
                <TemplateFormAuction
                    type={"UPDATE"}
                    history={this.props.history}
                    auctionDetail={this.auctionDetail}
                />
            </>;
        else return null;
    }
}