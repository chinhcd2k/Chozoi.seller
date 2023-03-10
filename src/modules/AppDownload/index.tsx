import React, {Component} from "react";
import "./AppDownLoad.scss"
import Footer from "../landing-page/components/Footer";
import {observer} from "mobx-react";
import {LandingPageService} from "../landing-page";
import $ from "jquery"
import {FacebookShareButton} from "react-share";
import {Link} from "react-router-dom";
import {css} from "@emotion/core";

@observer
export default class AppDownload extends Component<any, any> {

  async componentDidMount() {
    await LandingPageService.getConfig();

  }

  scroll() {
    // @ts-ignore
    var clientHeight: number = document.getElementById('height_banner').clientHeight;

    $(document).ready(function () {
      $("html, body").animate({scrollTop: clientHeight - (clientHeight % 8)}, 500);
    })
  }


  async redirectDownloadApp(target: 'ANDROID' | 'IOS') {
    const href = target === "IOS" ? "https://apps.apple.com/vn/app/chozoi-seller-center/id1495609377?l=vi" : "https://play.google.com/store/apps/details?id=com.chozoi.sellercenter";
    window.open(href, "_blank");
  };

  render() {
    return (
      <div className="download-app">
        <div className="header d-flex align-items-center">
          <div className="container w-100">
            <div className="logo">
              <a href={`${(window as any).DOMAIN_BUYER}`}>
                <img src={'./assets/images/login/logo.png'} alt="logo"/>
              </a>
            </div>
          </div>
        </div>

        <div className="banner-header w-100" onClick={() => this.scroll()} id="height_banner">
          <img className="w-100" src="./assets/images/app-download/bannerHeader1.png" alt=""/>
        </div>
        <div className="banner_download mt-5 w-100">
          <div className="container">
            <div className="row">
              <div className="col-md-6 mb-5 text-center">
                <div className="logo w-100">
                  <img className="" style={{width: `309px`}} src="./assets/images/app-download/iphone.png"
                       alt=""/>
                </div>
                <img className="mt-4" style={{width: `206px`, cursor: `pointer`}}
                     src="./assets/images/app-download/app_store.png"
                     onClick={() => this.redirectDownloadApp("IOS")}
                     alt="appstore"/>
              </div>
              <div className="col-md-6 mb-5 text-center">
                <div className="logo w-100">
                  <img className="" style={{width: `309px`}}
                       src="./assets/images/app-download/android.png" alt=""/>
                </div>
                <img className="mt-4" style={{width: `206px`, cursor: `pointer`}}
                     src="./assets/images/app-download/chplay.png"
                     onClick={() => this.redirectDownloadApp("ANDROID")}
                     alt="googleplay"/>
              </div>
            </div>
          </div>

        </div>
        <div className="container w-100 mb-5">
          <img className="w-100" src="./assets/images/app-download/1.png" alt=""/>
          <img className="w-100 mt-5" src="./assets/images/app-download/2.png" alt=""/>
          <img className="w-100 mt-5" src="./assets/images/app-download/3.png" alt=""/>
          <img className="w-100 mt-5" src="./assets/images/app-download/4.png" alt=""/>
          <img className="w-100 mt-5" src="./assets/images/app-download/5.png" alt=""/>
          <div className="sell_2 mt-5">
            <div className="container">
              <div className="title text-center">
                <h2 className="mt-0 mb-0">B???N MU???N KINH DOANH TR??N CHOZOI, B???N L?? NH?? B??N H??NG N??O?</h2>
              </div>

              <div className="table_sell mb-5 mt-2 d-flex">
                <div className="css_234">
                  <table className="table mb-0">
                    <thead css={th}>
                    <tr>
                      <th css={tep1} scope="col text-right">M?? h??nh</th>
                      <th css={th_green} className="position-relative"
                          style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg.svg)'}}
                          scope="col">
                        <div style={{top: `0px`}} className="position-absolute">
                          <img src="./assets/images/landing-page/landing_seller/icon-ca-nhan.png"
                               alt=""/>
                          <span>Nh?? b??n h??ng</span>
                        </div>
                      </th>
                      <th css={th_blue} className="position-relative"
                          style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg1.svg)'}}
                          scope="col">
                        <div style={{top: `0px`}} className="position-absolute">
                          <img
                            src="./assets/images/landing-page/landing_seller/icon-shop kinh doanh.png"
                            alt=""/>
                          <span>Shop kinh doanh</span>
                        </div>
                      </th>
                      <th css={th_purple} className="position-relative"
                          style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg2.svg)'}}
                          scope="col">
                        <div style={{top: `0px`}} className="position-absolute">
                          <img
                            src="./assets/images/landing-page/landing_seller/icon-doanh-nghiep.png"
                            alt=""/>
                          <span>Doanh nghi???p</span>
                        </div>
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr style={{fontSize: "13px"}}>
                      <th css={tep1} style={{borderTop: `none`}} scope="row text-right">Ph?? m??? gian
                        h??ng
                      </th>
                      <td css={green} style={{borderTop: `none`}}>Mi???n ph??</td>
                      <td css={blue} style={{borderTop: `none`}}>Mi???n ph??</td>
                      <td css={purple} style={{borderTop: `none`}}>Mi???n ph??</td>
                    </tr>
                    <tr style={{fontSize: "13px"}}>
                      <th css={tep1} scope="row text-right">?????i t?????ng</th>
                      <td css={green}>Ng?????i b??n kinh doanh ????n l???</td>
                      <td css={blue}>Shop b??n h??ng kinh doanh</td>
                      <td css={purple}>Doanh nghi???p ??a d???ng h??ng h??a</td>
                    </tr>
                    <tr>
                      <th css={tep1} scope="row text-right">Y??u c???u</th>
                      <td css={green}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng y??u c???u GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng y??u c???u ch???ng minh th????ng hi???u
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                          hi???u t???i Chozoi
                        </p>
                      </td>
                      <td css={blue}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng y??u c???u GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          T??n shop kinh doanh - t??n c???a h??ng (n???u c??) ho???c k??nh Social
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                          hi???u t???i Chozoi
                        </p>

                      </td>
                      <td css={purple}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Y??u c???u c?? GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Cung c???p ch???ng t??? h??ng h??a s???n ph???m
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Kh??ng kinh doanh h??ng gi???, h??ng nh??i ho???c h??ng h??a c?? tranh ch???p th????ng
                          hi???u t???i Chozoi
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <th css={tep1} scope="row text-right">Quy???n l???i</th>
                      <td css={green} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          Th???a th??ch b??n ????? ?????c s???n c???a ?????a ph????ng m??nh
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Thanh l?? ????? d??ng c?? nh??n, ????? c??, ????? ??t d??ng
                        </p>
                        <p className="pb-3">
                          <i className="fas fa-check-circle"/>
                          Tham gia - ????ng b??n s???n ph???m ?????U GI??
                        </p>
                        <Link to={`/login`}>
                          <button className="btn btn-green" css={bt_green}>M??? gian h??ng</button>
                        </Link>
                      </td>
                      <td css={blue} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          M??? "s???p h??ng" tr??n Chozoi, th???a th??ch ??am m?? kinh doanh
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Ti???p c???n h??ng tri???u kh??ch h??ng mi???n ph?? t??? qu???ng c??o ??a k??nh c???a Chozoi
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          ??u ????i 0% chi???t kh???u theo t???ng th???i ??i???m
                        </p>
                        <p className="pb-4">
                          <i className="fas fa-check-circle"/>
                          Tham gia - ????ng b??n s???n ph???m ?????U GI??
                        </p>
                        <Link to={`/login`}>
                          <button className="btn" css={bt_blue}>M??? gian h??ng</button>
                        </Link>
                      </td>
                      <td css={purple} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          Gian h??ng Doanh nghi???p v???i nh???ng g??i ??u ????i qu???ng c??o
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          ??u ????i chi???t kh???u l???n
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          ??a d???ng ch????ng tr??nh thu h??t kh??ch h??ng ti???m n??ng
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Tham gia - ????ng b??n s???n ph???m ?????U GI??
                        </p>
                        <Link to={`/login`}>
                          <button className="btn" css={bt_purple}>M??? gian h??ng</button>
                        </Link>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
          <img className="w-100 mt-5 mb-5" src="./assets/images/app-download/download_app_footer.png" alt=""/>
          <div className="w-100 d-flex align-items-center justify-content-center">
            {((): React.ReactNode => {
              // @ts-ignore
              return <FacebookShareButton url={window.location.href}><img className="share_fb"
                                                                          src="./assets/images/app-download/share_fb.png"
                                                                          alt=""/></FacebookShareButton>;
            })()}
          </div>
        </div>
        <Footer/>
      </div>
    );
  }
}


const bt_green = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #5BBF1B;

  &:hover {
    color: #000000 !important;
  }
`;

const bt_blue = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #218BE7;

  &:hover {
    color: #000000 !important;
  }
`;

const bt_purple = css`
  width: 212px;
  height: 40px;
  color: white !important;
  position: absolute;
  bottom: -19px;
  right: 37px;
  font-size: 13px;
  border-radius: 50px;
  background-color: #971BBF;

  &:hover {
    color: #000000 !important;
  }
`;

const blue = css`
  width: 304px;
  color: #000000;
  background-color: #E8F3FD;

  i {
    margin-right: 5px;
    color: #218be7 !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const green = css`
  width: 304px;
  color: #000000;
  background-color: #E6F6DC;

  i {
    margin-right: 5px;
    color: #5bbf1b !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const th = css`
  th {
    border-bottom-width: 0 !important;
  }
`;

const purple = css`
  width: 304px;
  color: #000000;
  background-color: #F8E9FA;

  i {
    margin-right: 5px;
    color: #971bbf !important;
  }

  p {
    color: #000000;
    font-size: 13px;
  }
`;

const tep1 = css`
  color: #000000;
  font-size: 15px;
  padding-right: 20px !important;
  text-align: right !important;
`;

const th_blue = css`
  color: white;
  height: 120px;
  background-color: #E8F3FD;

  span {
    font-size: 17px !important;
  }

`;

const th_green = css`
  color: white;
  height: 120px;
  background-color: #E6F6DC;

  span {
    font-size: 17px !important;
  }
`;

const th_purple = css`
  color: white;
  height: 120px;
  background-color: #F8E9FA;

  span {
    font-size: 17px !important;
  }
`;