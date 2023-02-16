import React, {useState} from "react";
import {css} from "@emotion/core";
import {Button} from "antd";
import {Link} from "react-router-dom";

export const MobileDownload: React.FC = () => {
  const [isMobile] = useState(/(Android|iPhone)/i.test(navigator.userAgent));
  const [visiable, setVisiable] = useState(true);

  const openMarketApp = () => {
    const isAndroid = /(Android|iPhone)/i.test(navigator.userAgent)
    window.open(isAndroid ? "https://play.google.com/store/apps/details?id=com.chozoi.sellercenter" : "https://apps.apple.com/vn/app/chozoi-seller-center/id1495609377?l=vi", "_black");
  }

  if (isMobile && visiable) {
    const style = css`
      position: relative;
      width: 100%;
      height: 112px;
      overfolow: hidden;
      padding: 8px 20px;
      background-color: #FFE8DA;
      top: -3px;

      i.close {
        position: absolute;
        right: 8px;
        top: 8px;
        font-size: 24px;
        color: #F54B24;
      }
    `;
    return (<div css={style}>
      <i className="close fal fa-times-circle"
         onClick={() => setVisiable(false)}/>
      <div className="d-flex align-items-center">
        <img width={"56px"} height={"56px"} src="/assets/icons/app-seller.png" alt="app-seller"/>
        <div style={{marginLeft: "12px"}}>
          <h3 style={{
            fontSize: '13px',
            fontFamily: "OpenSans-Semibold",
            color: "#000000",
            marginBottom: 0
          }}>BÁN HÀNG TRÊN
            APP</h3>
          <p style={{fontSize: '11px', color: "#000000", marginBottom: 0}}>Trải nghiệm vô vàn ưu đãi trên ứng
            dụng</p>
        </div>
      </div>
      <Button style={{
        marginTop: "8px",
        width: '100%',
        fontSize: "13px",
        height: "32px"
      }} type={"primary"} onClick={openMarketApp}>Đến ứng dụng ngay</Button>
    </div>);
  } else return null;
}