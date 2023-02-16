import React from "react";
import {observer} from "mobx-react";
import TemplateFormAuction from "./template";
import {BreadcrumbsComponent} from "../../common/breadcrumbs";
import CreateAuction from "./CreateAuction";

@observer
export default class CreateAuctionFromNormal extends CreateAuction {
  render(): any | null {
  return<>
        <div className="container">
          <div className="row">
            <div className="col-xs-12"><h2 className="mt-0">Đăng đấu giá</h2>
            </div>
            <div className="col-xs-12"><BreadcrumbsComponent/></div>
          </div>
        </div>
    <TemplateFormAuction type={"CREATE_F_N"} history={this.props.history}/>
      </>;
  }
}