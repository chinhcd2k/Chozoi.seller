import React, {Component, CSSProperties} from 'react';
import {css} from "@emotion/core";

export interface IProps {
    style: CSSProperties,
    content1: string,
    content2: string,
    content3: string
    content4: string
}

export interface IState {
    status: boolean
}

class NotifyWarning extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            status: true
        }
    }

    render() {
        let {style, content1, content2, content3, content4} = this.props;
        if (this.state.status && (content1 !== '' || content2 !== '' || content3 !== '' || content4 !== '')) {
            return (
                <div style={style} css={styleWarning} className={"notify-warning"}>
                    <div style={{flexGrow: 1}}>
                        <div>{content1}</div>
                        <div>{content2}</div>
                        <div>{content3}</div>
                        <div>{content4}</div>
                    </div>
                    <i className="fal fa-times-circle" onClick={() => this.setState({status: false})}/>
                </div>
            );
        } else return null;
    }
}

const styleWarning = css`
		background-color: rgba(254, 243, 236, 1);
		border-radius: 12px;
		border: 1px solid rgba(245, 75, 36, 1);
		border-style: dashed;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px 64px 20px 20px;
		font-size: 17px;
		color: black;
		position: relative;
		
		.fa-times-circle{
			position: absolute;
			top: 10px;
			right: 10px;
			color: rgba(245, 75, 36, 1);
			font-size: 16px;
			cursor: pointer;
		}
`;

export default NotifyWarning;