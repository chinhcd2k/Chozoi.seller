import React from "react";
import {Link} from "react-router-dom";
import {css} from "@emotion/core";
import ga from '../../../init-ga';

export const BtnQuickNewProduct: React.FC = () => {
    const style = css`
        position: fixed;
        bottom: 1em;
        left: 1em;
        display: flex;
        align-items: center;
        z-index: 10000;
        background-color: #1976D2;
        border-radius: 12px;
        width: 184px;
        height: 64px;
        padding: 12px;
        
        img {
            width: 40px;
            height: 36px;
        }
        
        span {
            position: relative;
            margin-left: 12px;
            padding-left: 12px;
            font-size: 13px;
            font-family: "OpenSans-Semibold";
            text-align: center;
            color: #ffffff;
            
            &:before {
                content: "";
                position: absolute;
                width: 1px;
                left: 0;
                bottom: 0;
                background-color: #ffffff;
                height: 100%;
            }
        }
    `;
    return <Link to={"/home/product/add"} css={style} onClick={() => ga.pushEventGa('Home_seller', 'Click_submit_product')}>
        <img src="/assets/icons/ico-up.png" alt="up"/>
        <span>Đăng bán<br/>sản phẩm ngay</span>
    </Link>
}