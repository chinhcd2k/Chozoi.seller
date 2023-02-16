import React, {useState} from "react";
import {observer} from "mobx-react";
import {Form, Modal, Input, Button} from "antd";
import {observable} from "mobx";
import ReCAPTCHA from "react-google-recaptcha";
import {getRequest, handlerRequestError, putRequest} from "../../../../common/services/BaseService";
import {partiallyHidden} from "../../../../common/functions/FormatFunc";
import {notify} from "../../../../common/notify/NotifyService";
import {PopupLoginService} from "./PopupLogin";

@observer
export default class PopupForgetPassword extends React.Component<any, any> {
    private static instance: PopupForgetPassword = undefined as any;
    private username?: string;
    private code?: string

    @observable private visiable: boolean = false;
    @observable private step: 1 | 2 | 3 = 1;

    constructor(props: any) {
        super(props);
        PopupForgetPassword.instance = this;
    }

    public show() {
        this.step = 1;
        this.visiable = true;
    }

    render() {
        return <Modal visible={this.visiable}
                      footer={null}
                      title={<p style={{
                          color: "#000000",
                          textAlign: "center",
                          fontSize: '19px',
                          fontFamily: "OpenSans-Semibold",
                          marginBottom: 0
                      }}>Quên mật khẩu</p>}
                      onCancel={() => this.visiable = false}
                      maskClosable={false}>
            {this.getContent}
        </Modal>;
    }

    private get getContent(): React.ReactNode {
        switch (this.step) {
            case 1:
                return <VerifyAccount
                    onCancer={() => this.visiable = false}
                    onNext={username => {
                        this.username = username;
                        this.step++;
                    }}/>
            case 2:
                return <VerifyCode username={this.username as string}
                                   onBack={() => this.step--}
                                   onNext={code => {
                                       this.code = code;
                                       this.step++;
                                   }}/>;
            case 3:
                return <NewPassword username={this.username as string}
                                    code={this.code as string}
                                    onBack={() => this.visiable = false}
                                    onFinish={password => {
                                        notify.show('Mật khẩu mới đã được cập nhật', "success");
                                        this.visiable = false;
                                        PopupLoginService.show(this.username, password);
                                    }}/>
            default:
                return null;
        }
    }

    static get getInstance(): PopupForgetPassword {
        return PopupForgetPassword.instance;
    }
}

const VerifyAccount: React.FC<{ onCancer: () => any, onNext: (username: string) => any }> = (props) => {
    const [recaptchaResponse, setRecaptchaResponse] = useState('');
    const {GOOGLE_RECAPTCHA_CLIENT} = window as any;

    const handlerOnSubmit = async (store: { username: string }) => {
        const res = await getRequest(`/v1/auth/forgot_password?username=${store.username}&captcha=${recaptchaResponse}`, false);
        if (res.status === 200)
            props.onNext(store.username);
        else handlerRequestError(res);
    }

    return (<>
        <p style={{
            color: "#000000",
            fontSize: '15px',
        }}>Vui lòng nhập số điện thoại hoặc email bạn đã đăng ký trên Chozoi</p>
        <Form onFinish={(value: { username: string }) => handlerOnSubmit(value)}>
            <Form.Item name={"username"} rules={[
                {required: true, message: 'Không được bỏ trống'},
                {
                    pattern: /(^\d{10}$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/,
                    message: 'Số điện thoại gồm 10 chữ số hoặc email'
                }
            ]}>
                <Input style={{height: '40px'}}
                       prefix={<i className="fal fa-mobile"/>}
                       placeholder="Số điện thoại hoặc email"/>
            </Form.Item>
            <ReCAPTCHA
                sitekey={GOOGLE_RECAPTCHA_CLIENT}
                onChange={e => setRecaptchaResponse(e || '')}
            />
            <Form.Item style={{marginTop: '36px'}}>
                <div className='d-flex justify-content-center'>
                    <Button style={{width: "172px"}} onClick={() => props.onCancer()}>Bỏ qua</Button>
                    <Button style={{width: "172px", marginLeft: '24px'}}
                            disabled={!recaptchaResponse}
                            type={"primary"}
                            htmlType={"submit"}>Tiếp tục</Button>
                </div>
            </Form.Item>
        </Form>
    </>);
}

const VerifyCode: React.FC<{ username: string, onBack: () => any, onNext: (code: string) => any }> = (props) => {
    const handlerOnSubmit = async (code: string) => {
        const res = await getRequest(`/v1/auth/check_otp?username=${props.username}&otp=${code}`, false);
        if (res.status === 200) props.onNext(code);
        else handlerRequestError(res);
    }
    return (<>
        <p style={{
            color: "#000000",
            fontSize: '15px',
        }}>Chúng tôi đã gửi mã xác nhận đến {partiallyHidden(props.username)}</p>
        <Form onFinish={(store: { code: string }) => handlerOnSubmit(store.code)}>
            <Form.Item name="code"
                       style={{flexGrow: 1}}
                       rules={[
                           {required: true, message: 'Không được bỏ trống'},
                           {pattern: /^\d{6}$/, message: 'Mã xác nhận gồm 6 chữ số'}
                       ]}
            >
                <Input type="number"
                       style={{height: '40px'}}
                       placeholder={"Nhập mã xác nhận"}
                       prefix={<i className="fal fa-shield"/>}
                />
            </Form.Item>
            <Form.Item style={{marginTop: '36px'}}>
                <div className='d-flex justify-content-center'>
                    <Button style={{width: "172px"}} onClick={() => props.onBack()}>Quay lại</Button>
                    <Button style={{width: "172px", marginLeft: '24px'}}
                            type={"primary"}
                            htmlType={"submit"}>Tiếp tục</Button>
                </div>
            </Form.Item>
        </Form>
    </>)
}

const NewPassword: React.FC<{ username: string, code: string, onBack: () => any, onFinish: (password: string) => any, }> = (props) => {
    const {EyeInvisibleOutlined, EyeTwoTone} = require('@ant-design/icons');
    const handlerOnSubmit = async (password: string, confirmPassword: string) => {
        const res = await putRequest('/v1/auth/forgot_password', {
            username: props.username,
            password: password,
            confirmPassword: confirmPassword,
            otp: props.code
        }, false);
        if (res.status === 200) props.onFinish(password);
        else handlerRequestError(res);
    }
    return (<>
        <Form onFinish={store => handlerOnSubmit(store.password, store.confirmPassword)}>
            <Form.Item name={"password"}
                       rules={[
                           {required: true, message: 'Không được bỏ trống'},
                           {min: 6, message: 'Tối thiểu 6 ký tự và tối đa 80 ký tự'},
                           {max: 80, message: 'Tối thiểu 6 ký tự và tối đa 80 ký tự'},
                       ]}>
                <Input.Password type={"password"}
                                autoFocus={true}
                                prefix={<i className="fal fa-unlock-alt"/>}
                                iconRender={(visible => visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                                style={{height: '40px'}}
                                placeholder={"Mật khẩu mới"}/>
            </Form.Item>
            <Form.Item name={"confirmPassword"}
                       dependencies={['password']}
                       rules={[
                           {required: true, message: 'Không được bỏ trống'},
                           ({getFieldValue}) => ({
                               validator(rule, value) {
                                   if (!value || getFieldValue('password') === value) {
                                       return Promise.resolve();
                                   }
                                   return Promise.reject('Mật khẩu nhập lại không chính xác');
                               },
                           })
                       ]}>
                <Input.Password type={"password"}
                                prefix={<i className="fal fa-unlock-alt"/>}
                                iconRender={(visible => visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                                style={{height: '40px'}}
                                placeholder={"Nhập lại mật khẩu mới"}/>
            </Form.Item>
            <Form.Item style={{marginTop: '36px'}}>
                <div className='d-flex justify-content-center'>
                    <Button style={{width: "172px"}} onClick={() => props.onBack()}>Quay lại</Button>
                    <Button style={{width: "172px", marginLeft: '24px'}}
                            type={"primary"}
                            htmlType={"submit"}>Xác nhận</Button>
                </div>
            </Form.Item>
        </Form>
    </>)
}