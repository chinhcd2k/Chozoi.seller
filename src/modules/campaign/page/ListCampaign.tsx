import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import Store from '../services/StoreListCampaign';
import {store as ProfileStore} from "../../profile";
import App from "../../../App";
import * as Sentry from '@sentry/browser';
import {Link} from "react-router-dom";
import {Empty, Input, Pagination} from 'antd';
import {css} from "@emotion/core";
import {IResProfile} from "../../../api/auth/interfaces/response";

const {Search} = Input;

interface IProps {
    location: any
}

@observer
export default class ListCampaign extends React.Component<IProps> {
    @observable activeBtn: 'ALL' | 'REGISTERED' | 'PENDING' = 'ALL';
    @observable pageCurrent: string = '0';
    private renderBtnFilter = (text: string, active: 'ALL' | 'REGISTERED' | 'PENDING', inner: 'ALL' | 'REGISTERED' | 'PENDING', page: number, name: string) => {
        let activeBtn = () => {
            this.activeBtn = inner;
        }
        return (
            <button type="button"
                    className={`btn-filter-campaign mr-3 ${active === inner && `btn-filter-campaign__active`}`}
                    onClick={() => {
                        activeBtn();
                        this.pushParams(0, inner, name);
                    }}>{text}</button>
        )
    }
    private renderCampaignItem = (id: string, status_campaign: 'UPCOMING' | 'FINISH' | 'HAPPENING', title: string, content: string, date_start: string, date_end: string, notify: 'ELIGIBLE' | 'PENDING' | 'JOINED' | 'NONE', status_btn: 'JOIN' | 'DETAILT', url_img?: string) => {
        let renderStatusCampaign = () => {
            if (status_campaign === "UPCOMING") {
                return (<div className={`status-campaign upcoming`}>Sắp diễn ra</div>)
            } else if (status_campaign === "HAPPENING") {
                return (<div className={"status-campaign happening"}>Đang diễn ra</div>)
            } else {
                return <div className={"status-campaign finish"}>Đã kết thúc</div>
            }
        }
        let renderNotifyCampaign = () => {
            if (notify === "ELIGIBLE") {
                // return (
                //     <div style={{fontSize: "13px", color: "blue"}}>Cửa hàng đủ điều kiện tham gia chương trình này</div>
                // )
                return null;
            } else if (notify === "PENDING") {
                return (
                    <div style={{fontSize: "13px", color: "#ffb700"}}>
                        <i className="fal fa-clock mr-2"/>
                        <span>Cửa hàng đang gửi yêu cầu tham gia - chờ phê duyệt</span>
                    </div>
                )
            } else if (notify === "JOINED") {
                return (
                    <div style={{fontSize: "13px", color: "green"}}>
                        <i className="fal fa-check-circle mr-2"/>
                        <span>Cửa hàng đang tham gia chương trình</span>
                    </div>
                )
            } else return (
                <div style={{fontSize: "13px", color: "red"}}>
                    <i className="fal fa-exclamation-triangle mr-2"/>
                    <span>Cửa hàng không đủ điều kiện tham gia chương trình</span>
                </div>
            )
        }
        let renderBtnCampaign = (id: string, title: string) => {
            return (
                <Link to={{pathname: `/home/campaign/${id}`, state: {id: id, title: title}}}>
                    <div
                        className={status_btn === 'JOIN' ? 'join' : 'detailt'}>{status_btn === 'JOIN' ? 'Tham gia ngay' : 'Xem chi tiết'}</div>
                </Link>
            )
        }
        return (
            <div className={"campaign-item mb-3"}>
                <div className={'wrapper-img'}>
                    <div className={'wrapper-img'}>
                        {url_img && <img src={url_img} alt="img" className={"img-fluid"}/>}
                    </div>
                </div>
                <div className={"campaign-item__content ml-4"}>
                    <div style={{display: "flex"}}>
                        <div style={{width: "100px"}}>{renderStatusCampaign()}</div>
                        <div className={"title-campaign ml-3"}>{title}</div>
                    </div>
                    <div
                        style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div className={"content-campaign"}>{content}</div>
                        {renderBtnCampaign(id, title)}
                    </div>
                    <div className={"date-campaign"}>Thời gian diễn ra: Từ {date_start} đến {date_end}</div>
                    {renderNotifyCampaign()}
                </div>
            </div>
        )
    }

    render() {
        let searchParams: any = new URLSearchParams(window.location.search);
        let page: string = searchParams.get('page');
        let campaign: 'ALL' | 'REGISTERED' | 'PENDING' = searchParams.get('campaign') || 'ALL';
        let name: string = searchParams.get('name');
        try {
            return <div className="container-fluid py-4" style={{backgroundColor: "white"}} css={styleListCampaign}>
                <div className={"wrapper-btn-filter"}>
                    {this.renderBtnFilter('Tất cả', this.activeBtn, 'ALL', parseInt(page), name)}
                    {this.renderBtnFilter('Đã đăng kí', this.activeBtn, 'REGISTERED', parseInt(page), name)}
                    {this.renderBtnFilter('Chờ xác nhận', this.activeBtn, 'PENDING', parseInt(page), name)}
                </div>
                <div className={"campaign-search my-5"}>
                    <div className={"ml-5"} style={{position: "relative"}}>
                        <Search placeholder=""
                                onSearch={(value, event) => this.handleEventSearch(value, page, campaign)}
                                style={{width: 200, outline: "none"}}/>
                    </div>
                </div>
                <div className={"list-campaign"}>
                    {Store.listCampaign.length === 0 && <div>
                        <Empty description={"Không tìm thấy dữ liệu"}/>
                    </div>}
                    {
                        Store.listCampaign.map((value, index) => {
                            if (value.onpenCampaign === 'OPENED') {
                                return (
                                    <div
                                        key={index}>{this.renderCampaignItem(
                                        value.id,
                                        value.statusCampaign,
                                        value.title,
                                        value.briefContent,
                                        value.dateStart,
                                        value.dateEnd,
                                        value.notify,
                                        value.statusBtn,
                                        value.urlImg)}</div>
                                )
                            }
                        })
                    }
                </div>
                <div className={'text-center'}>
                    {/*<PaginationComponent total={Store.total} defaultActive={parseInt(this.pageCurrent)} number={5}*/}
                    {/*                     emitOnChangePage={page => {*/}
                    {/*                         this.pushParams(page - 1, campaign, name);*/}
                    {/*                         window.scroll(0, 0);*/}
                    {/*                     }}/>*/}

                    <Pagination total={Store.total} current={parseInt(this.pageCurrent) + 1} pageSize={5}
                                onChange={page1 => {
                                    this.pushParams(page1 - 1, campaign, name);
                                    window.scroll(0, 0);
                                }}/>
                </div>
            </div>;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }

    private shopId: number = (ProfileStore.profile as IResProfile).shopId as number;

    componentDidMount() {
        this.onLoad();
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.location.search !== this.props.location.search && this.props.location.search) {
            this.onLoad();
        }
    }

    pushParams = (page: number, campaign?: 'ALL' | 'REGISTERED' | 'PENDING', name?: string) => {
        const search = `?page=${page}&size=5${campaign ? `&campaign=${campaign}` : ``}${name ? `&name=${name}` : ``}`;
        if (App.history && search !== window.location.search) {
            App.history.push(search);
        }
    }

    private onLoad = () => {
        let searchParams: any = new URLSearchParams(window.location.search);
        let page: number = searchParams.get('page') || 0;
        let campaign: 'ALL' | 'REGISTERED' | 'PENDING' = searchParams.get('campaign') || 'ALL';
        let name: string = searchParams.get('name');
        this.activeBtn = campaign;
        this.pageCurrent = page.toString();
        Store.getListCampaign(this.shopId, page, 5, (campaign === 'REGISTERED') ? 'APPROVED' : campaign, name);
    }

    private handleEventSearch = (searchText: string, page: string, campaign: "ALL" | "REGISTERED" | "PENDING") => {
        this.pushParams(parseInt(page), campaign, searchText);
    }
}

const styleListCampaign = css`
  .wrapper-btn-filter {
    display: flex;

    .btn-filter-campaign {
      background-color: rgba(128, 128, 128, .1);
      border: none;
      outline: none;
      color: rgba(128, 128, 128, 1);
      height: 30px;
      width: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .btn-filter-campaign__active {
      background-color: transparent;
      color: #ffb700;
      border: 1px solid #ffb700;
    }
  }

  .campaign-search {
    height: 50px;
    width: 100%;
    background-color: rgba(128, 128, 128, .1);
    display: flex;
    align-items: center;

    .campaign-search__input {
      border: 1px solid black;
      outline: none;
      border-radius: 16px;
      padding-left: 25px;
    }

    .fa-search {
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(50%, 50%);
      color: black;
    }
  }

  .list-campaign {
    .campaign-item {
      display: flex;
      box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
      padding: 10px 5px;

      .wrapper-img {
        height: 140px;
        width: 270px;

        img {
          max-height: 140px;
          max-width: 270px;
        }
      }

      .campaign-item__content {
        flex-grow: 1;
        min-width: 200px;

        .status-campaign {
          font-size: 13px !important;
          height: 20px;
          width: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
        }

        .happening {
          background-color: #1fc20d;

        }

        .upcoming {
          background-color: #ffb700;
        }

        .finish {
          background-color: red;
        }

        .happening, .upcoming, .finish {
          border-radius: 4px;
        }

        .title-campaign {
          //text-transform: uppercase;
          color: black;
          width: 850px;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .content-campaign {
          font-size: 13px;
          width: 65%;
          max-height: 60px;
          overflow: hidden;
        }

        .date-campaign {
          font-size: 12px;
          font-style: italic;
        }

        .join, .detailt {
          border-radius: 2px;
          height: 30px;
          width: 130px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .join {
          background-color: red;
          font-size: 13px;
          color: white;
        }

        .detailt {
          color: #ffb700;
          border: 1px solid #ffb700;
        }
      }
    }
  }
`
