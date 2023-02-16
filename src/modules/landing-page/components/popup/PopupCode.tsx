import React, {SyntheticEvent} from "react";
import {observable} from "mobx";
import {Form, Modal, Input, Button} from "antd";
import {observer} from "mobx-react";
import BtnSendOTP from "../BtnSendOTP";
import {BaseService} from "../../../../common/services/BaseService";
import {notify} from "../../../../common/notify/NotifyService";
import {partiallyHidden} from "../../../../common/functions/FormatFunc";
import ga from "../../../../init-ga";

interface IProps {
    onFinish: (username: string, password: string, code: string, current: "LOGIN" | "REGISTER") => any
}

@observer
export default class PopupCode extends React.Component<IProps, any> {
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

    handlerOnCancer() {
        PopupCodeService.visible = false;
        PopupCodeService.keyForm = Date.now();
    }

    handlerOnChangeInputCode(event: SyntheticEvent<HTMLInputElement>) {
        const {value} = event.currentTarget;
        PopupCodeService.disabledSubmit = !/^\d{6}$/.test(value);
    }

    async handlerOnSubmit(code: string) {
        PopupCodeService.disabledSubmit = true;
        this.props.onFinish(PopupCodeService.username as string, PopupCodeService.password as string, code, PopupCodeService.current);
    }

    render() {
        const {
            visible,
            username,
            disabledSubmit,
            keyForm,
            loading,
            handlerOnReSendCode
        } = PopupCodeService;
        return <Modal title={this.renderModalTitle}
                      width={'500px'}
                      visible={visible}
                      onCancel={() => this.handlerOnCancer()}
                      maskClosable={false}
                      closable={false}
                      footer={null}>
            <p style={{
                fontFamily: "OpenSans-Semibold",
                color: "#000000",
                fontSize: '15px',
                textAlign: 'center'
            }}>Mã xác nhận kích hoạt được gửi tới {partiallyHidden(username as string)}</p>
            <Form key={keyForm}
                  onFinish={(value: { code: string }) => this.handlerOnSubmit(value.code)}>
                <div style={{display: 'flex'}}>
                    <Form.Item name="code"
                               initialValue=""
                               style={{flexGrow: 1}}
                               rules={[
                                   {required: true, message: 'Không được bỏ trống'},
                                   {pattern: /^\d{6}$/, message: 'Mã xác nhận gồm 6 chữ số'}
                               ]}
                    >
                        <Input type="text"
                               autoFocus={true}
                               style={{height: '40px'}}
                               onChange={e => this.handlerOnChangeInputCode(e)}
                               placeholder={"Nhập mã xác nhận"}
                               prefix={<i className="fal fa-shield"/>}
                        />
                    </Form.Item>
                    <BtnSendOTP timeSecond={60}
                                instance={self => PopupCodeService.BtnSendCodeInstance = self}
                                style={{
                                    width: '110px',
                                    height: '40px',
                                    marginLeft: '16px',
                                    fontSize: "13px",
                                    padding: 0,
                                }}
                                onClick={() => {
                                    // let numberRs: number = 0;
                                    // numberRs++;
                                    handlerOnReSendCode.bind(PopupCodeService)();
                                    ga.pushEventGa('popup_otp', 'Click_resend_otp');
                                }}
                    />
                </div>
                <Form.Item>
                    <Button type={"default"}
                            block
                            style={{
                                backgroundColor: disabledSubmit ? "#ECECEC" : "#F54B24",
                                color: disabledSubmit ? "#999999" : "#ffffff",
                                height: "40px",
                                fontFamily: "OpenSans-Semibold",
                                fontSize: '17px'
                            }}
                            loading={loading}
                            disabled={disabledSubmit}
                            htmlType={"submit"}>Gửi mã xác nhận</Button>
                </Form.Item>
            </Form>
        </Modal>;
    }
}

class PopupCodeServiceClass {
    public BtnSendCodeInstance?: BtnSendOTP;
    public current: "LOGIN" | "REGISTER" = "REGISTER";
    public password?: string;
    @observable visible: boolean = false;
    @observable username?: string;
    @observable disabledSubmit: boolean = true;
    @observable disabledCode: boolean = true;
    @observable loading: boolean = false;
    @observable keyForm: number = Date.now();

    async show(username: string, password: string, current: "LOGIN" | "REGISTER", getCode?: boolean) {
        this.password = password;
        this.current = current;
        this.disabledSubmit = true;
        this.username = username;
        this.keyForm = Date.now();
        if (getCode) await this.handlerOnReSendCode();
        this.visible = true;
    }

    async handlerOnReSendCode() {
        const service = new BaseService();
        const {username} = PopupCodeService;
        const res = await service.postRequest('/v1/auth/resend_register_code', {username: username}, false);
        if (res.status === 200) {
            notify.show('Mã xác nhận đã được gửi', "success");
            if (this.BtnSendCodeInstance) this.BtnSendCodeInstance.countDown();
        } else service.pushNotificationRequestError(res);
    }
}

export const PopupCodeService = new PopupCodeServiceClass();
