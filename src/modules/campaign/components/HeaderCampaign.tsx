import React from "react";
import {css} from "@emotion/core";
import * as Sentry from "@sentry/browser";
import {Moment} from "../../../common/functions/Moment";

export interface IProps {
    onChangTabs?: (tabs: 'DETAIL' | 'CONDITION') => any
    urlImg?: string,
    titleHeaderCampaign?: string,
    timeStartRegister?: string,
    timeEndRegister?: string,
    timeSlotRegister?: number,
    timeSlotRegistered?: number,
    timeStart?: string,
    timeEnd?: string,
    timeSlotStarting?: number,
    contentTabDetail?: string,
    contentTabCondition?: [string, string]
}
export const HeaderCampaign: React.FC<IProps> = ({titleHeaderCampaign, urlImg, timeStartRegister, timeEndRegister, timeSlotRegister, timeSlotRegistered, timeStart, timeEnd, timeSlotStarting, onChangTabs, contentTabDetail, contentTabCondition}) => {
	 const [tabs, setTabs] = React.useState('detail');
	 const [extendContent, setExtendContent] = React.useState(false);
	 let contentRef = React.useRef<HTMLDivElement>(null);
	 let extendContentRef = React.useRef<HTMLDivElement>(null);
	 React.useEffect(() => {
			if (contentRef.current) {
				 if (contentRef.current.offsetHeight < 45) {
						if (extendContentRef.current) {
							 extendContentRef.current.style.visibility = 'hidden';
						}
				 } else if (contentRef.current.offsetHeight > 45 && extendContentRef) {
						if (extendContentRef.current) {
							 extendContentRef.current.style.visibility = 'visible';
						}
				 }
			}
	 },);
	 let renderTimeHeader = (time_start_register?: string, time_end_rgister?: string, time_register_slot?: number, time_registered?: number, time_start?: string, time_end?: string, time_slot_happening?: number, url_img?: string) => {
			return (
					<div className={"time-campaign"}>
						 <div className={'wrapper-img d-flex align-items-center'}>
								{url_img && <img src={url_img} alt="img" className={"img-fluid mx-auto d-block"} style={{maxHeight: "120px"}}/>}
						 </div>
						 <div className={'container-fluid wrapper-time ml-4'}>
								<div className={"row"} style={{height: "100%"}}>
									 <div className={"col-md-6"} style={{height: "100%"}}>
											<div className={"time-register"}>
												 <div className={"title"}>THỜI GIAN ĐĂNG KÝ</div>
												 <div className={"time"}>Từ {Moment.getTime(time_start_register? time_start_register : '', 'hh:mm:ss')} - {Moment.getDate(time_start_register? time_start_register : '', 'dd/mm/yyyy')} đến {Moment.getTime(time_end_rgister? time_end_rgister : '', 'hh:mm:ss')} - {Moment.getDate(time_end_rgister? time_end_rgister : '', 'dd/mm/yyyy')}</div>
												 <div className={"time-slot"}>
														<div>Tổng cộng <span>{time_register_slot}</span> khung giờ có thể đăng kí</div>
														<div>(bạn đã tham gia <span>{time_registered}</span> khung giờ)</div>
												 </div>
											</div>
									 </div>
									 <div className={"col-md-6"} style={{height: "100%"}}>
											<div className={"time-start"}>
												 <div className={"title"}>THỜI GIAN DIỄN RA</div>
												 <div className={"time"}>Từ {Moment.getTime(time_start? time_start : '', 'hh:mm:ss')} - {Moment.getDate(time_start? time_start : '', 'dd/mm/yyyy')} đến {Moment.getTime(time_end? time_end : '', 'hh:mm:ss')} - {Moment.getDate(time_end? time_end : '', 'dd/mm/yyyy')}</div>
												 <div className={"time-slot"}>
														<div>Tổng cộng <span>{time_slot_happening}</span> khung giờ đang diễn ra</div>
														<div style={{opacity: 0}}>0</div>
												 </div>
											</div>
									 </div>
								</div>
						 </div>
					</div>
			)
	 }
	 try {
			return (
					<div className={"header-campaign"} css={style}>
						 <div className={"title-header-campaign mb-5 mt-3"}>{titleHeaderCampaign}</div>
						 {renderTimeHeader(timeStartRegister, timeEndRegister, timeSlotRegister, timeSlotRegistered, timeStart, timeEnd, timeSlotStarting, urlImg)}
						 <div className={'detail mt-5'}>
								<div className={'tabs-campaign'}>
									 <div className={`tabs-item ${tabs === 'detail' && `tabs-selected`}`} onClick={() => {
											setTabs('detail')
											onChangTabs && onChangTabs("DETAIL");
									 }}>Chi tiết chương trình
									 </div>
									 <div className={`tabs-item ${tabs === 'condition' && `tabs-selected`}`} onClick={() => {
											setTabs('condition')
											onChangTabs && onChangTabs("CONDITION");
									 }}>Điều kiện tham gia
									 </div>
								</div>
								<div className={'content mx-3 my-3'}>
									 <div className={`main-content ${extendContent && `extend-content`}`}>
											<div ref={contentRef}>
												{tabs === 'detail' && <p style={{whiteSpace: "pre"}}>{contentTabDetail}</p>}
												{(tabs !== "detail" && contentTabCondition) && <ul>
													<li>{contentTabCondition[0]}</li>
													<li>{contentTabCondition[1]}</li>
												</ul>}
											</div>
									 </div>
									 <div style={{color: "blue", fontSize: "13px", margin: "10px 0", cursor: "pointer"}} onClick={() => {
											setExtendContent(!extendContent);
									 }} ref={extendContentRef}>{extendContent? `Ẩn bớt` : `Xem thêm`}
									 </div>
								</div>
						 </div>
					</div>
			);
	 } catch (e) {
			console.error(e);
			Sentry.captureException(e);
			return null;
	 }
}
const style = css`
.title-header-campaign{
        font-size: 22px;
        color: black;
    }
    .time-campaign{
        display: flex;
        .wrapper-img{
            height: 120px;
            width: 300px;
            background-color: white;
            img{
               @extend .wrapper-img;
            }
        }
        .wrapper-time{
            padding: 0;
            margin: 0;
            width: 100%;
        }
        .time-register, .time-start{
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .time{
                font-size: 13px;
                font-style: italic;
            }
            .time-slot{
                font-size: 13px;
            }
            span{
                color: red;
            }
        }
    }
    .detail{
        width: 100%;
        padding-bottom: 10px;
        background-color: rgba(217, 217, 217, .25);
        .tabs-campaign{
            display: flex;
            .tabs-item{
                height: 40px;
                width: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-bottom: 1px solid;
                cursor: pointer;
            }
            .tabs-selected{
                color: #ffb700;
                border-bottom: 1px solid #ffb700;
            }
        }
        .main-content{
            max-height: 45px;
            overflow: hidden;
        }
        .extend-content{
            max-height: 100%;
        }
    }
`
export default HeaderCampaign;
