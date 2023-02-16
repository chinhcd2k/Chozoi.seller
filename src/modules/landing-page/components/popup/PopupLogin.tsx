import React from "react";
import {observer} from "mobx-react";
import {Modal, Form, Input, Button} from "antd";
import {observable} from "mobx";
import {LoginWithSocial} from "../LoginWithSocial";
import {IApiResponse} from "../../../../common/services/BaseService";
import {PopupRegisterService} from "./PopupRegister";
import Ga from '../../../../init-ga';

const {EyeInvisibleOutlined, EyeTwoTone} = require('@ant-design/icons');

interface IFormData {
	 username?: string,
	 password?: string,
	 remember?: boolean
}

interface IProps {
	 linkForgetPassOnClick: () => any
	 onLoginWithSocialSuccess: (res: IApiResponse) => any,
	 onLogin: (data: IFormData) => any
}

@observer
export default class PopupLogin extends React.Component<IProps, any> {
	 public handlerOnCancer() {
			PopupLoginService.visible = false;
			PopupLoginService.keyForm = Date.now();
	 }

	 get renderModalTitle(): React.ReactNode {
			return <p style={{
				 fontSize: '19px',
				 textAlign: 'center',
				 marginBottom: 0,
				 padding: '0 32px',
				 fontFamily: 'OpenSans-Semibold',
				 color: "#000000"
			}}>Chào mừng bạn đến với kênh bán hàng của Chozoi</p>
	 }

	 handlerOnSubmit(value: IFormData) {
			PopupLoginService.submitting = true;
			this.props.onLogin(value);
	 }

	 render() {
			const {visible, submitting, keyForm, username, password} = PopupLoginService;

			return <Modal title={this.renderModalTitle}
										width={'500px'}
										visible={visible}
										onCancel={() => {
											 this.handlerOnCancer();
											 Ga.pushEventGa('popup_login', 'Click_close');
										}}
										footer={null}>
				 {/*Body Content*/}
				 <Form key={keyForm}
							 onFinish={value => this.handlerOnSubmit(value as IFormData)}>
						<Form.Item
								initialValue={username}
								name={"username"}
								rules={[
									 {required: true, message: 'Không được bỏ trống'}
								]}>
							 <Input type={"text"}
											autoFocus={true}
											prefix={<i className="fal fa-user"/>}
											style={{height: '40px'}}
											placeholder={"Số điện thoại hoặc email"}/>
						</Form.Item>
						<Form.Item name={"password"}
											 initialValue={password}
											 rules={[
													{required: true, message: 'Không được bỏ trống'}
											 ]}>
							 <Input.Password type={"password"}
															 prefix={<i className="fal fa-unlock-alt"/>}
															 style={{height: '40px'}}
															 iconRender={(visible: boolean) => (visible ? <EyeTwoTone/> :
																	 <EyeInvisibleOutlined/>)}
															 placeholder={"Mật khẩu"}/>
						</Form.Item>
						<div className="d-flex justify-content-end">
                    <span style={{
											 color: '#2F6BFF',
											 cursor: "pointer",
											 fontSize: '15px'
										}} onClick={() => {
											 this.props.linkForgetPassOnClick();
											 Ga.pushEventGa('popup_login', 'Click_forgot_password');
										}}>Quên mật khẩu</span>
						</div>
						<Form.Item>
							 <Button type={"default"}
											 block
											 style={{
													marginTop: '16px',
													backgroundColor: "#F54B24",
													height: "40px",
													color: "#ffffff",
													fontSize: '17px'
											 }}
											 loading={submitting}
											 disabled={submitting}
											 htmlType={"submit"}>Đăng nhập</Button>
						</Form.Item>
				 </Form>

				 <LoginWithSocial onLoginFBSuccess={res => {
						this.props.onLoginWithSocialSuccess(res);
						res.status===200 && Ga.pushEventGa('popup_login', 'Click_facebook');
				 }}
													onLoginGGSuccess={res => {
														 this.props.onLoginWithSocialSuccess(res);
														 res.status===200 && Ga.pushEventGa('popup_login', 'Click_google');
													}}/>
				 <span style={{fontSize: '15px', color: '#000000'}}>Nếu chưa có tài khoản nhà bán hàng.&nbsp;<Button
						 style={{
								paddingLeft: 0,
								color: "#2F6BFF",
								fontSize: "15px"
						 }}
						 onClick={() => {
								PopupLoginService.visible = false;
								PopupRegisterService.visible = true;
						 }}
						 type="link">Đăng ký ngay</Button></span>
			</Modal>;
	 }
}

class PopupLoginServiceClass {
	 @observable visible: boolean = false;
	 @observable submitting: boolean = false;
	 @observable keyForm: number = Date.now();
	 @observable username?: string;
	 @observable password?: string;

	 public show(username?: string, password?: string) {
			this.username = username;
			this.password = password;
			this.keyForm = Date.now();
			this.visible = true;
	 }
}

export const PopupLoginService = new PopupLoginServiceClass();
