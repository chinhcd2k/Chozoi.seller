import React from "react";
import PopupReview from "./PopupReview";
import {BaseService} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import {IPackageOrderResponse} from "../../OrderServices";

export default class ReviewBuyer extends React.Component<{ data: IPackageOrderResponse }, any> {
    PupupRef = React.createRef<PopupReview>();
    service = new BaseService();

    async handlerOnReview(like: boolean, text: string, callback: (success: boolean) => any) {
        const {id} = this.props.data;
        const response = await this.service.postRequest('/v1/reviews/seller', {
            shopOrderId: id,
            text: text,
            likeStatus: like
        }, true);
        if (response.status === 200) {
            notify.show('Đánh giá người mua thành công', "success");
            callback(true);
        } else {
            callback(false);
            this.service.pushNotificationRequestError(response);
        }
    }

    handlerViewReview(review: { avatar: string, content: string, likeStatus: boolean, name: number }) {
        if (this.PupupRef.current)
            this.PupupRef.current.toggle(true, {
                like: review.likeStatus,
                text: review.content
            });
    }

    render() {
        const {order: {buyerContactName}, reviewShop, order} = this.props.data;
        return <div id="info-buyer">
            <div className="w-100 d-flex">
                <div style={{width: '60%', padding: '0 16px'}}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex">
                            <img
                                src={order.avatar || "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"}
                                alt="avatar"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    minHeight: '80px',
                                    minWidth: '80px',
                                    borderRadius: '50%'
                                }}/>
                            <div>
                                <h3 className="m-0">{buyerContactName}</h3>
                                <label>Thành viên</label>
                            </div>
                        </div>
                        {(!reviewShop || !reviewShop.review) && this.props.data.state === "FINISHED" &&
                        <button className="btn btn-primary" data-toggle="modal" data-target="#popup-review"
                                data-backdrop="static">Đánh giá
                        </button>}
                        {(reviewShop && reviewShop.review) &&
                        <p className="text-info cursor-pointer"
                           onClick={() => this.handlerViewReview((reviewShop as any).review)}>
                            {reviewShop.review.content}
                            &nbsp;
                            {reviewShop.review.likeStatus && <i className="text-info far fa-thumbs-up"/>}
                            {!reviewShop.review.likeStatus && <i className="text-danger far fa-thumbs-down"/>}
                        </p>}
                    </div>
                </div>
                {reviewShop &&
                <div style={{width: '20%'}} className="d-flex flex-column justify-content-center align-items-center">
                    <h3 className="text-info">{reviewShop.cancelOrderRate}%</h3>
                    <p>Tỷ lệ hủy hàng</p>
                </div>}
                {reviewShop &&
                <div style={{width: '20%'}} className="d-flex flex-column justify-content-center align-items-center">
                    <h3 className="text-info">{reviewShop.sellerPositiveRate}%</h3>
                    <p>Người bán hàng đánh giá tích cực</p>
                </div>}
            </div>
            <PopupReview
                ref={this.PupupRef}
                onReview={(like, text, callback) => this.handlerOnReview(like, text, callback)}/>
        </div>;
    }
}