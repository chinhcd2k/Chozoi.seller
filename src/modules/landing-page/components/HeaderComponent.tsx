import React from 'react';
import {css} from "@emotion/core";
import {store as ProfileStore} from "../../profile/stores/ProfileStore";
import {Button} from "antd";
import Ga from '../../../init-ga';
import {IResProfile} from "../../../api/auth/interfaces/response";

interface IProps {
    account?: IResProfile,
    btnLoginOnClick: () => any
    btnRegisterOnClick: (register?: boolean) => any,
}

export const HeaderLanding: React.FC<IProps> = (props: IProps) => {
    const renderWithNotLogin = (): React.ReactNode => {
        const style = css`
          &.not-login {
            button {
              background-color: white;
              border-radius: 20px;
              color: #000000;
              height: 32px;
              padding: 0;
              width: 110px;

              i {
                font-size: 12px;
              }
              
              &:last-of-type {
                margin-left: 12px;
              }

              &:first-of-type {
                background-color: #F54B24;
                color: white;
              }

              @media screen and (min-width: 576px) {
                width: 150px;
                height: 40px;

                span, i {
                  font-size: 15px !important;
                }
              }
            }
          }
        `;
        return !props.account ? <div className="not-login d-flex align-items-center" css={style}>
            <Button type={"primary"}
                    id="login_" data-toggle="modal" data-target="#modal-login"
                    onClick={() => {
                        props.btnLoginOnClick();
                        Ga.pushEventGa('Landing_login', 'Click_login');
                    }}>Đăng nhập <i
                className="fal ml-2 fa-arrow-right"/></Button>
            <Button
                type={"primary"}
                onClick={() => {
                    props.btnRegisterOnClick();
                    Ga.pushEventGa('Landing_login', 'Click_register');
                }}>Đăng ký<i
                className="fal ml-2 fa-arrow-right"/></Button>
        </div> : null;
    }

    const handlerOnLogout = () => {
        localStorage.removeItem("token");
        ProfileStore.profile = undefined;
    }

    const renderWithLogin = (): React.ReactNode => {
        const {account} = props;
        if (account) {
            const {user: {isSeller}, name} = account;
            const style = css`
              font-size: 13px;
              color: #000000;

              i.fa-user-circle {
                color: #F54B24;
                font-size: 36px;
                @media screen and (max-width: 420px) {
                  display: none;
                }
              }

              div.decription {
                margin-left: 8px;

                p.name {
                  white-space: normal;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  max-width: 100%;
                }

                p.not-seller span {
                  color: #2F6BFF;
                  font-family: "OpenSans-Semibold", serif;
                  cursor: pointer;
                }

                @media screen and (max-width: 328px) {
                  font-size: 12px;
                }
              }
            `;
            return <div className="logined" css={style}>
                <div className="d-flex align-items-center">
                    <i className="fas fa-user-circle"/>
                    <div className="decription">
                        <p className="mb-0 name">Xin chào, <b>{name}</b></p>
                        {!isSeller &&
                        <p className="mb-0 not-seller">Bạn chưa là seller. <span
                            onClick={() => props.btnRegisterOnClick(true)}>Đăng ký</span>&nbsp;|&nbsp;
                            <span onClick={() => handlerOnLogout()}>Đăng xuất</span>
                        </p>}
                    </div>
                </div>
            </div>
        } else return null;
    }

    const headerCss = css`
      div.logo img {
        height: 50px;
        @media screen and (max-width: 379.9px) {
          height: 30px;
        }
        @media screen and (max-width: 359.9px) {
          height: 20px;
        }
      }
    `;

    return (
        <div className="header" css={headerCss}>
            <div className="container">
                <div className="d-flex w-100 align-items-center justify-content-between">
                    <div className="logo">
                        <a href={`${(window as any).DOMAIN_BUYER}`}>
                            <img src={'./assets/images/login/logo.png'} alt="logo"/>
                        </a>
                    </div>
                    {renderWithNotLogin()}
                    {renderWithLogin()}
                </div>
            </div>
        </div>
    );
}
export default HeaderLanding;
