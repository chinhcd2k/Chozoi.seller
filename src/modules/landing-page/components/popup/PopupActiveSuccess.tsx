import React from "react";
import {Button, Modal} from "antd";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {css} from "@emotion/core";
import {IApiResponse, postRequest} from "../../../../common/services/BaseService";
import {service as ProfileService} from "../../../profile";
import ga from "../../../../init-ga";

interface IProps {
	 onFinish?: (res: IApiResponse) => any
}

@observer
export default class PopupActiveSuccess extends React.Component<IProps, any> {
	 private static instance: PopupActiveSuccess = undefined as any;
	 private username?: string;
	 private password?: string;

	 @observable visiable: boolean = false;

	 constructor(props: IProps) {
			super(props);
			PopupActiveSuccess.instance = this;
	 }

	 show(username: string, password: string) {
			this.username = username;
			this.password = password;
			this.visiable = true;
	 }

	 async handlerOnFinish() {
			this.visiable = false;
			if (this.props.onFinish) {
				 const res = await postRequest('/v1/auth/login', {
						username: this.username,
						password: this.password,
						remember: true
				 }, false);
				 if (res.status === 200) {
						const {accessToken} = res.body as { accessToken: string };
						localStorage.setItem("token", accessToken);
						this.props.onFinish(res);
				 }
			}
	 }

	 async handlerOnSkip() {
			this.visiable = false;
			const res = await postRequest('/v1/auth/login', {
				 username: this.username,
				 password: this.password,
				 remember: true
			}, false);
			if (res.status === 200) {
				 const {accessToken} = res.body as { accessToken: string };
				 localStorage.setItem("token", accessToken);
				 await ProfileService.getProfile();
			}
	 }

	 render() {
			const footerCss = css`
        button {
          width: 172px;
          height: 40px;
          font-size: 17px;
          font-family: "OpenSans-Semibold";

          @media screen and (max-width: 432px) {
            width: 120px;
            font-size: 15px;
          }

          &:first-of-type {
            color: #000000;
            background-color: #FFFFFF;
            border-color: #F54B24;
          }

          &:last-of-type {
            margin-left: 24px;
            color: #FFFFFF;
            background-color: #F54B24;
            border-color: #F54B24;
          }
        }
			`;
			return (<Modal
					width={'562px'}
					closable={false}
					footer={null}
					visible={this.visiable}>
				 <div style={{
						display: 'flex',
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "space-between",
						height: '272px'
				 }}>
						<i className="fal fa-check-circle" style={{
							 color: "#64BC00",
							 fontSize: '63px'
						}}/>
						<p style={{
							 color: '#000000',
							 fontSize: '19px',
							 margin: '0 -8px',
							 textAlign: "center",
							 fontFamily: "OpenSans-Semibold"
						}}>Chúc mừng bạn đã trở thành thành viên mới tại Chozoi! Cùng hoàn tất bước cuối để trở thành
							 nhà bán mới nhé</p>
						<div css={footerCss}>
							 <Button type={"default"}
											 onClick={() => {
													this.handlerOnSkip();
													ga.pushEventGa('popup_success', 'Click_close');
											 }}>Bỏ qua</Button>
							 <Button type={"default"}
											 onClick={() => {
													this.handlerOnFinish();
													ga.pushEventGa('popup_success', 'Click_continue');
											 }}>Tiếp tục</Button>
						</div>
				 </div>
			</Modal>);
	 }

	 static get getInstance(): PopupActiveSuccess {
			return PopupActiveSuccess.instance;
	 }
}
