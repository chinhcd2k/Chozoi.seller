import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Modal, Button} from "antd";
import {css} from "@emotion/core";
import {handlerRequestError, postRequest} from "../../../../common/services/BaseService";
import ga from "../../../../init-ga";

interface IProps {
	 onFinish?: () => any
}

@observer
export default class PopupSellerType extends React.Component<IProps, any> {
	 @observable visiable: boolean = false;
	 @observable type?: "normal" | "household" | "company";

	 public show(type?: "normal" | "household" | "company") {
			this.type = type;
			this.visiable = true;
			if (!type) {
				 ga.pushEventGa('register', 'open_popup', 'type');
			}
	 }

	 async handlerOnSubmit() {
			this.visiable = false;
			if (this.type) {
				 const res = await postRequest('/v1/shops', {type: this.type});
				 if (res.status === 200) {
						this.props.onFinish && this.props.onFinish();
						ga.pushEventGa('popup_shop_type', this.type);
				 }
				 else handlerRequestError(res);
			}
	 }

	 get title(): React.ReactNode {
			return <p className="title" style={{
				 color: "#000000",
				 fontSize: "19px",
				 textAlign: "center",
				 fontFamily: "OpenSans-Semibold",
				 marginTop: "-8px"
			}}>Bạn là nhà bán hàng nào?</p>;
	 }

	 render() {
			const ulCss = css`
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: space-between;
        margin-left: -40px;
        margin-top: 32px;

        @media screen and (max-width: 623.99px) {
          flex-direction: column;
          align-items: center;
        }

        li {
          width: 152px;
          margin-left: 40px;

          img {
            width: 152px;
            height: 152px;
            max-width: 152px;
            max-height: 152px;
          }

          button.ant-btn-default {
            margin-top: 20px;
            width: 152px;
            height: 32px;
            background-color: #F4F5F6;
            color: #999999;
            font-size: 15px;
            border-color: transparent;
            border-radius: 20px;
            font-family: "OpenSans-Semibold";

            &.active {
              color: #F54B24;
              border-color: #F54B24;
              background-color: #FFFFFF;
            }
          }

          a span {
            color: #F1A153;
            font-size: 13px;
          }

          p {
            margin-top: 12px;
            color: #666666;
            font-size: 13px;
            height: 58px;
            text-align: center;
          }
        }
			`;
			const footerCss = css`
        margin-top: 36px;
        @media screen and (max-width: 413.9px) {
          button:last-of-type {
            position: unset !important;;
          }
        }
			`;
			return <Modal
					closable={false}
					visible={this.visiable}
					footer={null}
					width={"624px"}
					bodyStyle={{
						 minHeight: "518px",
						 padding: "40px"
					}}
			>
				 {this.title}
				 <ul css={ulCss}>
						<li>
							 <img src={`/assets/images/landing-page/personal${this.type === "normal" ? "-active" : ""}.png`}
										onClick={() => this.type = "normal"}
										alt="normal"/>
							 <Button type={"default"}
											 className={this.type === "normal" ? "active" : ""}
											 onClick={() => this.type = "normal"}>Cá nhân</Button>
							 <p>Người bán hàng đơn lẻ<br/>Không yêu cầu GPKD</p>
							 <div className="text-center">
									<a target={"_blank"}
										 href={"https://blog.chozoi.vn/phan-loai-nha-ban-hang-tren-san-dau-gia-truc-tuyen-chozoi/"}>Xem
										 thêm</a>
							 </div>
						</li>
						<li>
							 <img src={`/assets/images/landing-page/business${this.type === "household" ? "-active" : ""}.png`}
										onClick={() => this.type = "household"}
										alt="household"/>
							 <Button type={"default"}
											 className={this.type === "household" ? "active" : ""}
											 onClick={() => this.type = "household"}>Hộ kinh doanh</Button>
							 <p>Shop bán hàng<br/>Không yêu cầu GPKD</p>
							 <div className="text-center">
									<a target={"_blank"}
										 href={"https://blog.chozoi.vn/phan-loai-nha-ban-hang-tren-san-dau-gia-truc-tuyen-chozoi/"}>Xem
										 thêm</a>
							 </div>
						</li>
						<li>
							 <img
									 src={`/assets/images/landing-page/enterprise${this.type === "company" ? "-active" : ""}.png`}
									 onClick={() => this.type = "company"}
									 alt="company"/>
							 <Button type={"default"}
											 className={this.type === "company" ? "active" : ""}
											 onClick={() => this.type = "company"}>Doanh nghiệp</Button>
							 <p>Doanh nghiệp đa dạng hàng hóa<br/>Yêu cầu có GPKD</p>
							 <div className="text-center">
									<a target={"_blank"}
										 href={"https://blog.chozoi.vn/phan-loai-nha-ban-hang-tren-san-dau-gia-truc-tuyen-chozoi/"}
										 onClick={() => ga.pushEventGa('popup_shop_type', 'Click_showmore')}
									>Xem thêm</a>
							 </div>
						</li>
				 </ul>
				 <div className="text-center position-relative" css={footerCss}>
						<Button type={"default"}
										style={{
											 backgroundColor: this.type ? "#F54B24" : "#ECECEC",
											 color: this.type ? "#FFFFFF" : "#999999",
											 borderColor: this.type ? "#F54B24" : "transparent",
											 width: "172px",
											 height: "40px",
											 fontFamily: "OpenSans-Semibold",
											 borderRadius: "4px",
										}}
										disabled={!this.type}
										onClick={() => {
											 this.handlerOnSubmit();
											 ga.pushEventGa('popup_shop_type', 'Click_finish');
										}}
						>Hoàn tất</Button>
						<Button type={"link"} style={{
							 position: 'absolute',
							 left: 0,
							 fontSize: '15px',
							 color: "#2F6BFF"
						}} onClick={() => {
							 this.visiable = false;
							 ga.pushEventGa('popup_shop_type', 'Click_close');
						}}>Bỏ qua</Button>
				 </div>
			</Modal>;
	 }
}
