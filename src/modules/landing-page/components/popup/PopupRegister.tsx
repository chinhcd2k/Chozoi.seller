import React from "react";
import {observer} from "mobx-react";
import {Modal, Form, Input, Button} from "antd";
import {observable} from "mobx";
import {LoginWithSocial} from "../LoginWithSocial";
import {IApiResponse} from "../../../../common/services/BaseService";
import {PopupLoginService} from "./PopupLogin";
import ReCAPTCHA from "react-google-recaptcha";
import Ga from '../../../../init-ga';

const {EyeInvisibleOutlined, EyeTwoTone} = require('@ant-design/icons');

export interface IReqBody {
	 name: string
	 username: string
	 password: string
	 confirm_password: string
	 recaptchaResponse: string
	 refCode: string
	 regType: 'Normal' | 'Link'
	 type: "Buyer" | "Seller"
}

interface IProps {
	 onLoginWithSocialSuccess: (res: IApiResponse) => any,
	 onRegister: (data: IReqBody) => any
}

@observer
export default class PopupRegister extends React.Component<IProps, any> {
	 public handlerOnCancer() {
			PopupRegisterService.visible = false;
			PopupRegisterService.keyForm = Date.now();
	 }

	 get renderModalTitle(): React.ReactNode {
			return <p style={{
				 fontSize: '19px',
				 textAlign: 'center',
				 marginBottom: 0,
				 padding: '0 32px',
				 fontFamily: 'OpenSans-Semibold',
				 color: "#000000"
			}}>Đăng ký nhà bán hàng mới</p>
	 }

	 handlerOnSubmitForm(data: IReqBody) {
			const {recaptchaResponse, refCode, disabledRefCode} = PopupRegisterService;
			data.recaptchaResponse = recaptchaResponse as string;
			data.type = "Seller";
			data.confirm_password = data.password;
			data.refCode = refCode || '';
			data.regType = disabledRefCode ? 'Link' : "Normal";
			PopupRegisterService.submitting = true;
			this.props.onRegister(data);
	 }

	 render() {
			const {GOOGLE_RECAPTCHA_CLIENT} = window as any;
			const {
				 visible,
				 submitting,
				 refCode,
				 disabledRefCode,
				 recaptchaResponse,
				 keyForm
			} = PopupRegisterService;

			return <Modal title={this.renderModalTitle}
										width={'500px'}
										visible={visible}
										onCancel={() => {
											 this.handlerOnCancer();
											 Ga.pushEventGa('popup_register', 'Click_close');
										}}
										footer={null}>
				 {/*Body Content*/}
				 <Form
						 key={keyForm}
						 onFinish={value => this.handlerOnSubmitForm(value)}>
						<Form.Item name={"name"}
											 rules={[
													{required: true, message: 'Không được bỏ trống'},
													{min: 6, message: 'Tối thiểu 6 ký tự và tối đa 50 ký tự'},
													{max: 50, message: 'Tối thiểu 6 ký tự và tối đa 50 ký tự'}
											 ]}>
							 <Input type={"text"}
											autoFocus={true}
											prefix={<i className="fal fa-user"/>}
											style={{height: '40px'}}
											placeholder={"Họ và tên"}/>
						</Form.Item>
						<Form.Item name={"username"}
											 rules={[
													{required: true, message: 'Không được bỏ trống'},
													{min: 6, message: 'Tối thiểu 6 ký tự và tối đa 50 ký tự'},
													{max: 50, message: 'Tối thiểu 6 ký tự và tối đa 50 ký tự'},
													{
														 pattern: /(^\d{10}$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/,
														 message: 'Số điện thoại gồm 10 chữ số hoặc email'
													}
											 ]}>
							 <Input type={"text"}
											prefix={<i className="fal fa-mobile"/>}
											style={{height: '40px'}}
											placeholder={"Số điện thoại hoặc email"}/>
						</Form.Item>
						<Form.Item name={"password"}
											 rules={[
													{required: true, message: 'Không được bỏ trống'},
													{min: 6, message: 'Tối thiểu 6 ký tự và tối đa 80 ký tự'},
													{max: 80, message: 'Tối thiểu 6 ký tự và tối đa 80 ký tự'},
											 ]}>
							 <Input.Password type={"password"}
															 prefix={<i className="fal fa-unlock-alt"/>}
															 iconRender={(visible => visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
															 style={{height: '40px'}}
															 placeholder={"Mật khẩu"}/>
						</Form.Item>
						<Form.Item name={"refCode"} initialValue={refCode}>
							 <Input type={"text"}
											prefix={<i className="fal fa-share-alt"/>}
											disabled={disabledRefCode}
											value={refCode}
											style={{height: '40px'}}
											placeholder={"Mã giới thiệu"}/>
						</Form.Item>
						<Form.Item>
							 <ReCAPTCHA
									 sitekey={GOOGLE_RECAPTCHA_CLIENT}
									 onChange={e => PopupRegisterService.recaptchaResponse = (e as string).toString()}
							 />
						</Form.Item>
						<Form.Item>
							 <Button type={"default"}
											 block
											 style={{
													backgroundColor: "#F54B24",
													height: "40px",
													color: "#ffffff",
													fontSize: '17px'
											 }}
											 loading={submitting}
											 disabled={submitting || !recaptchaResponse}
											 htmlType={"submit"}>Đăng ký</Button>
						</Form.Item>
				 </Form>

				 <LoginWithSocial onLoginFBSuccess={res => {
						this.props.onLoginWithSocialSuccess(res);
						res.status === 200 && Ga.pushEventGa('popup_register', 'Click_facebook');
				 }}
													onLoginGGSuccess={res => {
														 this.props.onLoginWithSocialSuccess(res);
														 res.status === 200 && Ga.pushEventGa('popup_register', 'Click_google');
													}}/>
				 <span style={{fontSize: '15px', color: '#000000'}}>Bạn đã có tài khoản nhà bán hàng.&nbsp;<Button
						 style={{
								paddingLeft: 0,
								color: "#2F6BFF",
								fontSize: "15px"
						 }}
						 onClick={() => {
								PopupRegisterService.visible = false;
								PopupLoginService.visible = true;
						 }}
						 type="link">Đăng nhập ngay</Button></span>
			</Modal>;
	 }
}

class PopupRegisterServiceClass {
	 @observable visible: boolean = false;
	 @observable submitting: boolean = false;
	 @observable refCode?: string;
	 @observable disabledRefCode: boolean = false;
	 @observable recaptchaResponse?: string;
	 @observable keyForm: number = Date.now();

	 refreshValueStore() {
			this.visible = false;
			this.submitting = false;
			this.refCode = undefined;
			this.disabledRefCode = false;
			this.recaptchaResponse = undefined;
	 }

	 show(refCode?: string) {
			this.refreshValueStore();
			this.refCode = refCode;
			this.keyForm = Date.now();
			if (this.refCode) this.disabledRefCode = true;
			this.visible = true;
	 }
}

export const PopupRegisterService = new PopupRegisterServiceClass();
