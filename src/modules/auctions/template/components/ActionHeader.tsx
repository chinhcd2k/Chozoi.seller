import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {IResponseAuction} from "../../DetailAuction";

interface IActionDetailProps {
	 type: 'CREATE' | 'UPDATE' | 'DETAIL' | 'REPLAY' | 'REPLAY_QUICK'|'CREATE_F_N'
	 auctionDetail?: IResponseAuction
}

@observer
export default class ActionHeader extends React.Component<IActionDetailProps, any> {
	 render() {
			if (this.props.auctionDetail) {
				 const {type} = this.props;
				 const {id, state, auction} = this.props.auctionDetail;
				 if (type === "DETAIL")
						return <div className="col-xs-12 col-lg-8" id="action-detail">
							 {((!/^(PENDING|READY)$/.test(state) && !/^(WAITING|BIDING|STOPPED)$/.test(auction.state))) &&
               <Link to={`/home/auction/update/${id}`} className="btn btn-primary mr-3"
                     type="button"><i className="fas
                        // fa-edit"/> Sửa</Link>}
							 <Link to={`/home/auction/add`} className="btn btn-default" type="button"> <i
									 className="fas fa-plus"/> Thêm</Link>
						</div>;
				 else if (/^(UPDATE|REPLAY|REPLAY_QUICK)$/.test(type))
						return <div className="col-xs-12 col-lg-8" id="action-detail">
							 <Link to={`/home/auction/add`} className="btn btn-primary" type="button"> <i
									 className="fas fa-plus"/> Thêm</Link>
						</div>;
				 else return null;
			} else return null;
	 }
}