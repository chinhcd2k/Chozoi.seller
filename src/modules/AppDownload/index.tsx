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
                <h2 className="mt-0 mb-0">BẠN MUỐN KINH DOANH TRÊN CHOZOI, BẠN LÀ NHÀ BÁN HÀNG NÀO?</h2>
              </div>

              <div className="table_sell mb-5 mt-2 d-flex">
                <div className="css_234">
                  <table className="table mb-0">
                    <thead css={th}>
                    <tr>
                      <th css={tep1} scope="col text-right">Mô hình</th>
                      <th css={th_green} className="position-relative"
                          style={{backgroundImage: 'url(./assets/images/landing-page/landing_seller/Mask_svg.svg)'}}
                          scope="col">
                        <div style={{top: `0px`}} className="position-absolute">
                          <img src="./assets/images/landing-page/landing_seller/icon-ca-nhan.png"
                               alt=""/>
                          <span>Nhà bán hàng</span>
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
                          <span>Doanh nghiệp</span>
                        </div>
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr style={{fontSize: "13px"}}>
                      <th css={tep1} style={{borderTop: `none`}} scope="row text-right">Phí mở gian
                        hàng
                      </th>
                      <td css={green} style={{borderTop: `none`}}>Miễn phí</td>
                      <td css={blue} style={{borderTop: `none`}}>Miễn phí</td>
                      <td css={purple} style={{borderTop: `none`}}>Miễn phí</td>
                    </tr>
                    <tr style={{fontSize: "13px"}}>
                      <th css={tep1} scope="row text-right">Đối tượng</th>
                      <td css={green}>Người bán kinh doanh đơn lẻ</td>
                      <td css={blue}>Shop bán hàng kinh doanh</td>
                      <td css={purple}>Doanh nghiệp đa dạng hàng hóa</td>
                    </tr>
                    <tr>
                      <th css={tep1} scope="row text-right">Yêu cầu</th>
                      <td css={green}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không yêu cầu GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không yêu cầu chứng minh thương hiệu
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                          hiệu tại Chozoi
                        </p>
                      </td>
                      <td css={blue}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không yêu cầu GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Tên shop kinh doanh - tên cửa hàng (nếu có) hoặc kênh Social
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                          hiệu tại Chozoi
                        </p>

                      </td>
                      <td css={purple}>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Yêu cầu có GPKD
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Cung cấp chứng từ hàng hóa sản phẩm
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Không kinh doanh hàng giả, hàng nhái hoặc hàng hóa có tranh chấp thương
                          hiệu tại Chozoi
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <th css={tep1} scope="row text-right">Quyền lợi</th>
                      <td css={green} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          Thỏa thích bán đồ đặc sản của địa phương mình
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Thanh lý đồ dùng cá nhân, đồ cũ, đồ ít dùng
                        </p>
                        <p className="pb-3">
                          <i className="fas fa-check-circle"/>
                          Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                        </p>
                        <Link to={`/login`}>
                          <button className="btn btn-green" css={bt_green}>Mở gian hàng</button>
                        </Link>
                      </td>
                      <td css={blue} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          Mở "sạp hàng" trên Chozoi, thỏa thích đam mê kinh doanh
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Tiếp cận hàng triệu khách hàng miễn phí từ quảng cáo đa kênh của Chozoi
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Ưu đãi 0% chiết khấu theo từng thời điểm
                        </p>
                        <p className="pb-4">
                          <i className="fas fa-check-circle"/>
                          Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                        </p>
                        <Link to={`/login`}>
                          <button className="btn" css={bt_blue}>Mở gian hàng</button>
                        </Link>
                      </td>
                      <td css={purple} style={{height: `200px`}} className="position-relative">
                        <p>
                          <i className="fas fa-check-circle"/>
                          Gian hàng Doanh nghiệp với những gói ưu đãi quảng cáo
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Ưu đãi chiết khấu lớn
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Đa dạng chương trình thu hút khách hàng tiềm năng
                        </p>
                        <p>
                          <i className="fas fa-check-circle"/>
                          Tham gia - Đăng bán sản phẩm ĐẤU GIÁ
                        </p>
                        <Link to={`/login`}>
                          <button className="btn" css={bt_purple}>Mở gian hàng</button>
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