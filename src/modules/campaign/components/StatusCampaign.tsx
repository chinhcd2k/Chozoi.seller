import React from 'react';
import {css} from "@emotion/core";

export interface IProps {
	 type: 'UPCOMING' | 'FINISH' | 'HAPPENING'
}

export const StatusCampaign: React.FC<IProps> = ({type}) => {
	 let renderContent = (status_campaign: 'UPCOMING' | 'FINISH' | 'HAPPENING') => {
			if (status_campaign === "UPCOMING") {
				 return <span className={'status-campaign'} style={{backgroundColor: "#ffb700", borderRadius: "4px"}}>Sắp diễn ra</span>
			} else if (status_campaign === "HAPPENING") {
				 return <span className={'status-campaign'} style={{backgroundColor: "#1fc20d", borderRadius: "4px"}}>Đang diễn ra</span>
			} else return <span className={'status-campaign'} style={{backgroundColor: "red", borderRadius: "4px"}}>Đã kết thúc</span>
	 }
	 return (
			 <span css={styleCampaign}>
					{renderContent(type)}
			 </span>
	 );
};

const styleCampaign = css`
.status-campaign {
		font-size: 13px !important;
		padding: 2px 15px;
		color: white;
    }
`
