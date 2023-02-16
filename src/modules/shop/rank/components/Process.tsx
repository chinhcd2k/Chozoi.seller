import React from "react";
import css from "@emotion/css";

interface IProcessProps {
    tag: 'NORMAL' | 'FAVOURITE' | 'POSITIVE'
    percent: number
}

export const Process: React.FC<IProcessProps> = (props: IProcessProps) => {
    const style = css`
        &:after {
            width: ${props.percent}%;
        }
    `;

    return (<div id="process-rank">
        <ul css={style}>
            <li className="active">
                <div className="icon"><i className="fas fa-shopping-bag"/></div>
            </li>
            <li className={props.tag !== "NORMAL" ? 'active' : ''}>
                <div className="icon"><i className="fas fa-thumbs-up"/></div>
            </li>
            <li className={props.tag !== "POSITIVE" && props.tag !== "NORMAL" ? 'active' : ''}>
                <div className="icon"><i className="fas fa-heart"/></div>
            </li>
        </ul>
    </div>)
};