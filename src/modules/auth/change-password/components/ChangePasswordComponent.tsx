import React from "react";
import {BreadcrumbsService} from "../../../../common/breadcrumbs";
import {Feedback, Form, FormGroup, Input} from "../../../../common/form";
import Validations from "../../../../common/form/components/Validations";
import {service} from "../../AuthService";
import {notify} from "../../../../common/notify/NotifyService";
import {observer} from "mobx-react";
import {IRequestAddPass, IRequestChangePass, store} from "../stores/changePasswordStores";
import "../change-password-style.scss";
import {observable} from "mobx";
import {store as ShopInfomationStore} from "../../../shop/stores/ShopInfomationStore";
import {IResShopProfile} from "../../../../api/shop/interfaces/response";

const DELAY_SEND_OTP_TIME: number = (window as any).DELAY_SEND_OTP_TIME || 0;

@observer
export default class ChangePasswordComponent extends React.Component<any, { disabledOtp: boolean, count: number, renderForm: boolean }> {
    private countdown: any;

    constructor(props: any) {
        super(props);
        if (ShopInfomationStore.shopProfile && ShopInfomationStore.shopProfile.passwordRequire) {
            BreadcrumbsService.loadBreadcrumbs([{title: 'Đổi mật khẩu'}]);
        } else {
            BreadcrumbsService.loadBreadcrumbs([{title: 'Thêm mật khẩu'}]);
        }
        this.state = {
            renderForm: true,
            disabledOtp: false,
            count: DELAY_SEND_OTP_TIME
        };
    }

    private countDown() {
        let count = this.state.count - 1;
        this.countdown = setInterval(() => {
            this.setState({count: count});
            count -= 1;
            if (count === 0) {
                setTimeout(() => {
                    clearInterval(this.countdown);
                    this.setState({disabledOtp: false, count: DELAY_SEND_OTP_TIME});
                }, 1000);
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.countdown);
    }


    public IRequestChangePass: IRequestChangePass = {
        old_password: '',
        new_password: '',
        confirm_password: '',
        code: '',
    };

    public IRequestAddPass: IRequestAddPass = {
        new_password: '',
        confirm_password: '',
        code: ''
    }

    async getCodeChangePass() {
        this.setState({disabledOtp: true, count: DELAY_SEND_OTP_TIME});
        this.countDown();
        const response = await service.getOtpChangePassword();
        if (response.status === 202) {
            notify.show(response.body.message, "success");
            store.codeChangePass = response.body;
        } else {
            notify.show('Đã có lỗi sảy ra', 'error');
            store.codeChangePass = response.body;
        }
    }

    private handlerInputOnChange(e: HTMLInputElement, key: 'code', value: string, type: 'string' | 'number' = "string") {
        const {passwordRequire} = ShopInfomationStore.shopProfile as IResShopProfile;
        if (type === "string") {
            value = value.toLowerCase();
            value = value.replace(/([a-z])/, '');
            value = value.replace(/([^0-9a-z-\s])/g, '');
            value = value.replace(/(\s+)/g, '');
            e.value = value;
            if (key === "code" && value.length > 6) {
                if (passwordRequire) {
                    e.value = this.IRequestChangePass.code;
                } else {
                    e.value = this.IRequestAddPass.code;
                }
                return;
            } else
                this.IRequestChangePass[key] = value.trim()
        } else {
            value = value.replace(/([^0-9]|^0)/, '');

            if (passwordRequire) {
                // @ts-ignore
                this.IRequestChangePass[key] = parseInt(value);
            } else {
                //@ts-ignore
                this.IRequestAddPass[key] = parseInt(value);
            }

            e.value = value;
        }
    }

    private async onSubmitForm(e: any) {
        const responsive = await service.changePassword(this.IRequestChangePass);
        if (responsive.status === 200) {
            notify.show('Đổi mật khẩu thành công', 'success');
            store.changePass = responsive.body;
            this.setState({renderForm: false});
            setTimeout(() => this.setState({renderForm: true}));
        } else if (responsive.body.message && typeof responsive.body.message === 'string')
            notify.show(responsive.body.message, 'error');
        else
            notify.show('Đã có lỗi xảy ra!', 'error');
    }

    @observable isDisableButton: boolean = false;

    async confirmAddPass() {
        if (!this.IRequestAddPass.new_password) {
            notify.show('Vui lòng nhập mật khẩu', "warning");
            return false;
        }
        if (!this.IRequestAddPass.confirm_password) {
            notify.show('Vui lòng nhập lại mật khẩu', "warning");
            return false;
        }
        if (!this.IRequestAddPass.code) {
            notify.show('Vui lòng nhập mã xác minh', "warning");
            return false;
        }
        if (this.IRequestAddPass.new_password !== this.IRequestAddPass.confirm_password) {
            notify.show('Mật khẩu nhập lại không chính xác', "warning")
            return false;
        }
        let response = await service.addNewPassword(this.IRequestAddPass);
        if (response.status === 200) {
            notify.show('Thêm mật khẩu thành công', "success");
            window.location.href = '/home/shop';

        } else {
            notify.show(response.body.message, 'error');
        }
    }

    goBack() {
        this.props.history.goBack();
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        if (ShopInfomationStore.shopProfile && ShopInfomationStore.shopProfile.passwordRequire) {
            return (
                <div className="container" id="change-password">
                    <div className="card p-5">
                        <div className="row">
                            <div className="col-xs-12 col-lg-4">
                                {this.state.renderForm && <Form onSubmit={(e: any) => this.onSubmitForm(e)}>
                                    <div className="title">
                                        <h4>Đổi mật khẩu</h4>
                                    </div>
                                    <FormGroup className="form-group">
                                        <label>Mật khẩu cũ</label>
                                        <Input type="password"
                                               onChange={(e: any) => this.IRequestChangePass.old_password = e.currentTarget.value}
                                               validations={[
                                                   new Validations(Validations.required(), 'Vui lòng nhập mật khẩu hiện tại'),
                                                   new Validations(Validations.minLength(6), 'Mật khẩu phải từ 6->20 ký tự')
                                               ]} className="form-control"/>
                                        <Feedback className="error" invalid={"true"}/>
                                    </FormGroup>
                                    <FormGroup className="form-group">
                                        <label>Mật khẩu mới</label>
                                        <Input type="password"
                                               onChange={(e: any) => this.IRequestChangePass.new_password = e.currentTarget.value}
                                               validations={[
                                                   new Validations(Validations.minLength(6), 'Mật khẩu phải từ 6->20 ký tự'),
                                                   new Validations(Validations.maxLength(20), 'Mật khẩu phải từ 6->20 ký tự')]}
                                               className="form-control"/>
                                        <Feedback className="error" invalid={"true"}/>
                                    </FormGroup>
                                    <FormGroup className="form-group">
                                        <label>Nhập lại mật khẩu</label>
                                        <Input type="password"
                                               onChange={(e: any) => this.IRequestChangePass.confirm_password = e.currentTarget.value}
                                               validations={[
                                                   new Validations(Validations.minLength(6), 'Mật khẩu phải từ 6->20 ký tự'),
                                                   new Validations(Validations.maxLength(20), 'Mật khẩu phải từ 6->20 ký tự')]}
                                               className="form-control"/>
                                        <Feedback className="error" invalid={"true"}/>
                                    </FormGroup>
                                    <FormGroup className="form-group">
                                        <label>Mã xác minh</label>
                                        <FormGroup>
                                            <div className="d-flex justify-content-between">
                                                <Input
                                                    onChange={(e: any) => this.handlerInputOnChange(e.currentTarget, "code", e.currentTarget.value)}
                                                    validations={[new Validations(Validations.minLength(1), 'Vui lòng nhập mã xác minh'),
                                                        new Validations(Validations.minLength(6), 'Mã xác minh gồm 6 số'),]}
                                                    className="form-control  input_code_change_pass"/>
                                                <button type="button"
                                                        disabled={this.state.disabledOtp}
                                                        onClick={() => this.getCodeChangePass()}
                                                        className="btn btn-warning code_change_pass">{!this.state.disabledOtp ? 'Gửi mã' : `${this.state.count}s`}
                                                </button>
                                            </div>
                                            <Feedback invalid={"true"} className="w-100"/>
                                        </FormGroup>
                                    </FormGroup>
                                    <div className="d-flex btn-direction">
                                        <div className="btn-cancel" onClick={() => this.goBack()}>
                                            <button type={"button"}>Bỏ qua</button>
                                        </div>
                                        <div className="btn-update">
                                            <button type={"submit"}>Cập nhập</button>
                                        </div>
                                    </div>

                                </Form>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='container' id='add-password'>
                    <div className="form-addPassword">
                        <div className="title">
                            <h2>Thêm mật khẩu</h2>
                        </div>
                        <div className="addPassword">
                            <form>
                                <div className="input-pass">
                                    <div className="title">
                                        <p>Mật khẩu</p>
                                        <span className='obligatory'>*</span>
                                    </div>
                                    <FormGroup>
                                        <Input type="password"
                                               placeholder="Nhập mật khẩu"
                                               onChange={(e: any) => this.IRequestAddPass.new_password = e.currentTarget.value}
                                               validations={[
                                                   new Validations(Validations.minLength(6), 'Mật khẩu phải từ 6->20 ký tự'),
                                                   new Validations(Validations.maxLength(20), 'Mật khẩu phải từ 6->20 ký tự')]}
                                               className="form-control"
                                        />
                                        <Feedback className="error" invalid={"true"}/>
                                    </FormGroup>
                                </div>
                                <div className="re-input-pass ">
                                    <div className="title">
                                        <p>Nhập lại mật khẩu</p>
                                        <span className='obligatory'>*</span>
                                    </div>
                                    <div className="input-re-pas">
                                        <FormGroup>
                                            <Input type="password"
                                                   placeholder="Nhập lại mật khẩu"
                                                   onChange={(e: any) => this.IRequestAddPass.confirm_password = e.currentTarget.value}
                                                   validations={[
                                                       new Validations(Validations.minLength(6), 'Mật khẩu phải từ 6->20 ký tự'),
                                                       new Validations(Validations.maxLength(20), 'Mật khẩu phải từ 6->20 ký tự')]}
                                            />
                                            <Feedback className="error" invalid={"true"}/>
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="Verification-code">
                                    <div className="title">
                                        <p>Mã xác minh</p>
                                    </div>
                                    <div className="d-flex">
                                        <div className="input-code">
                                            <FormGroup>
                                                <Input type="text"
                                                       placeholder="Nhập mã"
                                                       onChange={(e: any) => this.IRequestAddPass.code = e.currentTarget.value}
                                                       validations={[new Validations(Validations.minLength(1), 'Vui lòng nhập mã xác minh'),
                                                           new Validations(Validations.minLength(6), 'Mã xác minh gồm 6 số'),]}
                                                />
                                                <Feedback className="error" invalid={"true"}/>
                                            </FormGroup>
                                        </div>
                                        <div className="send-code">
                                            <button type="button"
                                                    disabled={this.state.disabledOtp}
                                                    onClick={() => this.getCodeChangePass()}
                                                    className="btn btn-warning code_change_pass">{!this.state.disabledOtp ? 'Gửi  mã' : `Gủi lại mã (${this.state.count}s)`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="btn-direction d-flex">
                            <div className="cancel" onClick={() => this.goBack()}>
                                <div>
                                    <button>Bỏ qua</button>
                                </div>
                            </div>
                            <div className="update">
                                <button disabled={false}
                                        onClick={() => this.confirmAddPass()}>Cập nhập
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

    }
}
