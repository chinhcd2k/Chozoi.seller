import React, {useEffect, useState} from "react";
import {notify} from "../../../common/notify/NotifyService";
import {Button, Feedback, Form, FormGroup, Input, Validations} from "../../../common/form";
import {service, VerifyParams} from "../AuthService";
import "../containers/VerifyStyle.scss";

interface IVerifyProps {
    className?: string
    username: string,
    onVerify: (success: boolean) => void
}

const DELAY_SEND_OTP_TIME: number = (window as any).DELAY_SEND_OTP_TIME || 0;
const verifyParams = new VerifyParams();

export const VerifyComponent: React.FC<IVerifyProps> = (props) => {
    const codeRef = React.createRef<Input>();
    const [enableSendOtp, setEnableSendOtp] = useState(true);

    useEffect(() => {
        verifyParams.username = props.username;
    });


    const onSubmit = async (e: any) => {
        const response = await service.verify(verifyParams);
        props.onVerify(response.status === 200);
    };

    const reSendOtp = async () => {
        setEnableSendOtp(false);
        const response = await service.reSendOtpVerifyAccount(props.username);
        if (response.status === 200) {
            if (codeRef.current) {
                codeRef.current.value = "";
                verifyParams.active_code = "";
            }
            notify.show(`Mã xác nhận mới đã được gửi tới ${props.username.replace(/.{4}$/, "****")}`, "success");
            setTimeout(() => setEnableSendOtp(true), DELAY_SEND_OTP_TIME * 1000);
        } else if (response.body.message) {
            notify.show(JSON.stringify(response.body.message), "error");
        } else {
            notify.show('Lỗi không xác định', "error");
        }
    };

    return (<div style={{width: `500px`}} className="auth-verify-otp text-center">
        <p className="title">Mã kích hoạt đã được gửi tới số {props.username.replace(/.{4}$/, "****")}</p>
        <Form onSubmit={(e: any) => onSubmit(e)}>
            <div className="code d-flex">
                <FormGroup className="form_activation_code">
                    <Input
                        ref={codeRef}
                        onChange={(e: any) => verifyParams.active_code = e.currentTarget.value}
                        validations={[new Validations(Validations.regexp(/^\d{6,}$/), "Mã xác thực bao gồm 6 chữ số")]}
                        className="form-control" placeholder="Mã xác nhận" autoFocus={true}/>
                    <Feedback invalid="true"/>
                </FormGroup>
                <div className="resend_the_code">
                    <button type={"button"} disabled={!enableSendOtp} onClick={() => reSendOtp()}>Gửi lại mã</button>
                </div>
            </div>
            <div className="confirm">
                <Button type={"submit"} className="btn_confirm">Xác nhận</Button>
            </div>
        </Form>
    </div>);
};