import React, {CSSProperties} from "react";
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import {css} from "@emotion/core";
import {BaseService, IApiResponse} from "../../../common/services/BaseService";

interface IProps {
    onLoginFBSuccess: (response: IApiResponse) => any
    onLoginGGSuccess: (response: IApiResponse) => any
}

export const LoginWithSocial: React.FC<IProps> = (props: IProps) => {

    const request = new BaseService();

    const {FACEBOOK_APP_ID, GOOGLE_APP_ID} = window as any;

    const renderDivider = (): React.ReactNode => {
        return <div style={{
            height: '1px',
            backgroundColor: '#999999',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <span style={{
                color: '#999999',
                fontSize: '15px',
                position: 'relative',
                lineHeight: '20px',
                top: '-10px',
                height: '20px',
                backgroundColor: '#ffffff',
                padding: '0 12px'
            }}>HOẶC ĐĂNG NHẬP BẰNG</span>
        </div>
    }

    const handlerResponseGoogle = async (data: { accessToken: string }) => {
        const response = await request.postRequest('/v1/auth/callback/google', {access_token: data.accessToken}, false);
        props.onLoginGGSuccess(response);
    }

    const handlerResponseFacebook = async (data: { accessToken: string }) => {
        const response = await request.postRequest('/v1/auth/callback/facebook', {access_token: data.accessToken}, false);
        props.onLoginFBSuccess(response);
    }

    return (<div className="via-social">
        {renderDivider()}
        <div className="d-flex justify-content-center" style={{margin: '30px 0 20px 0'}}>
            <div style={{
                ...boxStyle as CSSProperties,
                marginRight: '28px'
            }}>
                <div css={makeStyle}>
                    <FacebookLogin appId={FACEBOOK_APP_ID}
                                   fields="name,email,picture"
                                   callback={data => handlerResponseFacebook(data as any)}/>
                </div>
                <img src="/assets/icons/loginFB.png"
                     alt="login with facebook"/>
            </div>
            <div style={boxStyle as CSSProperties}>
                <div css={makeStyle}>
                    <GoogleLogin
                        clientId={GOOGLE_APP_ID}
                        buttonText="LOGIN WITH GOOGLE"
                        onSuccess={data => handlerResponseGoogle(data as any)}/>
                </div>
                <img src="/assets/icons/loginGG.png"
                     alt="login with google"/>
            </div>
        </div>
    </div>)
}

const boxStyle = {
    width: '52px',
    height: '52px',
    overflow: "hidden",
    borderRadius: '50%',
    cursor: "pointer",
    position: 'relative'
}

const makeStyle = css`
    opacity: 0;
    position: absolute;
    top: 0;
    right: 0; 
    bottom: 0; 
    left: 0;
    overflow: hidden;
    & > span > button, & > button {
        width: 52px;
        height: 52px;
        cursor: pointer;
    }
`;
