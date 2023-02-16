import React from "react";
import {observable} from "mobx";
import {observer} from "mobx-react";
import {notify} from "../../../../common/notify/NotifyService";
import $ from "jquery";

interface IPopupReviewProps {
    onReview: (like: boolean, text: string, callback: (success: boolean) => any) => any
}

@observer
export default class PopupReview extends React.Component<IPopupReviewProps, any> {
    @observable like?: boolean;
    @observable text: string = '';
    @observable disabledSubmit: boolean = false;
    @observable reviewed: boolean = false;

    modalRef = React.createRef<HTMLDivElement>();

    private data = ['Khách hàng vui vẻ, thân', 'Khách hàng thân quen cửa hàng', 'Khách mua hàng có độ tin cậy'];

    protected handlerOnReview() {
        if (this.like === undefined)
            return notify.show('Vui lòng chọn hài lòng hay không hài lòng', "error");
        if (!this.text.trim())
            return notify.show('Vui lòng nhập nội dung đánh giá', "error");
        this.disabledSubmit = true;
        this.props.onReview(this.like, this.text, success => {
            this.disabledSubmit = false;
            if (success) {
                this.reviewed = true;
                notify.show('Đánh giá thành công', "success");
                this.toggle(false);
            }
        });
    }

    public toggle(show: boolean, data?: { like: boolean, text: string }) {
        if (!show) {
            $(this.modalRef.current as any).modal('hide');
            setTimeout(() => {
                this.text = '';
                this.like = undefined
            }, 400);
        } else if (data) {
            this.reviewed = true;
            this.text = data.text;
            this.like = data.like;
            $(this.modalRef.current as any).modal({show: true, backdrop: "static"});
        }
    }

    render() {
        return <div className="modal fade" id="popup-review" ref={this.modalRef}>
            <div className="modal-dialog" style={{maxWidth: '500px'}}>
                <div className="modal-content">
                    <div className="modal-header" style={{borderBottom: 'solid 1px #cccccc'}}>
                        <h4 className="title my-0">Đánh giá người mua</h4>
                        <button className="close" onClick={() => this.toggle(false)}><i className="fas fa-times"/>
                        </button>
                    </div>
                    <div className="modal-body py-0">
                        {!this.reviewed && <div className="d-flex justify-content-center my-3">
                            <i className={`far fa-2x fa-thumbs-up cursor-pointer${this.like === true ? ' text-info' : ''}`}
                               onClick={() => this.like = true}/>
                            <div className="mx-3"/>
                            <i className={`far fa-2x fa-thumbs-down cursor-pointer${this.like === false ? ' text-danger' : ''}`}
                               onClick={() => this.like = false}/>
                        </div>}
                        {this.reviewed && <div className="d-flex justify-content-center my-3">
                            {this.like && <i className={`far fa-2x fa-thumbs-up cursor-pointer text-info`}/>}
                            {!this.like && <i className={`far fa-2x fa-thumbs-down cursor-pointer text-danger`}/>}
                        </div>}
                        <div className="form-group">
                                <textarea rows={5}
                                          placeholder="Nhập nội dung đánh giá"
                                          className="form-control"
                                          value={this.text}
                                          disabled={this.reviewed}
                                          style={{resize: 'none'}}
                                          onChange={e => this.text = e.currentTarget.value}
                                />
                        </div>
                        {!this.reviewed && <div className="form-group" style={{paddingBottom: '16px'}}>
                            <ul className="pl-0 d-flex flex-wrap" style={{listStyle: 'none', margin: '-8px 0 0 -16px'}}>
                                {this.data.map((value, index) =>
                                    <li key={index} style={{
                                        marginLeft: '16px',
                                        marginTop: '8px',
                                        borderRadius: '8px',
                                        lineHeight: '28px',
                                        padding: '0 12px',
                                        cursor: 'pointer',
                                        border: 'solid 1px #cccccc'
                                    }}
                                        onClick={() => this.text = value}
                                    >{value}</li>)}
                            </ul>
                        </div>}
                    </div>
                    {this.reviewed && <div className="modal-footer">
                        <button className="btn btn-default" onClick={() => this.toggle(false)}>Đóng</button>
                    </div>}
                    {!this.reviewed && <div className="modal-footer">
                        <button className="btn btn-danger" onClick={() => this.toggle(false)}>Hủy bỏ</button>
                        <button className="ml-3 btn btn-primary"
                                disabled={this.disabledSubmit}
                                onClick={() => this.handlerOnReview()}>
                            {this.disabledSubmit && <i className="fal fa-spinner fa-spin"/>} &nbsp;Đánh giá
                        </button>
                    </div>}
                </div>
            </div>
        </div>;
    }
}