import styled from "@emotion/styled";
import React from "react";

const DOMAIN_BUYER: string = (window as any).DOMAIN_BUYER || '';

export const Footer = () => {
    return (<FooterStyle className="footer">
        <p>Chozoi - Kênh người bán</p>
        <a href={DOMAIN_BUYER}>{DOMAIN_BUYER.replace("https://", "")}</a>
    </FooterStyle>)
};

const FooterStyle = styled.div`
    width: 100%;
    text-align: center;
    margin: 40px 0;
    font-size: 20px;
    opacity: 0.4;
    color: rgba(57, 64, 71, 0.4);

    p {
      font-weight: 700;
      margin: 0;
    }
`;