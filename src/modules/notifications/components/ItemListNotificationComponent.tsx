import * as React from "react";
import {Moment} from "../../../common/functions/Moment";
import "../containers/ItemListNotificationStyle.scss";
import {Link} from "react-router-dom";

interface IItemListNotificationComponentProps {
    //Data read-only
    length?: number
    title: string
    content: string
    createdAt: string
    order: {
        shopOrderCode: number
    } | null
    type: 'PRODUCT' | 'AUCTION' | 'ORDER' | 'EVENT' | 'SYSTEM'
    readAt?: string
    link?: string

    //Action
    emitActionReaded: () => void
}

export const ItemListNotificationComponent: React.FC<IItemListNotificationComponentProps> = (props: IItemListNotificationComponentProps) => {
    const getIcon = (): string => {
        if (props.type === 'SYSTEM' || props.type === "AUCTION" || props.type === "PRODUCT") return "fa fa-home";
        else if (props.type === 'ORDER') return "fa fa-file-alt";
        else if (props.type === 'EVENT') return "fa fa-percent";
        else return "";
    };

    return (<li
        onClick={() => props.emitActionReaded()}
        className={`notification-item ${props.readAt ? '' : 'unread'}`}>
        <i className={getIcon()}/>
        <div className="content">
            {(props.link && /^(http|https)/.test(props.link)) &&
            <a href={props.link} target={"_blank"}>{props.title}</a>}
            {(!props.link || (props.link && !/^(http|https)/.test(props.link))) &&
            <Link to={props.link ? props.link : '#'} className="title">{props.title}</Link>}
            <div>
                <span>{props.length ? props.content.substr(0, props.length) : props.content} {props.length && props.content.length > props.length &&
                <span className="text-info cursor-pointer">...</span>}</span>
            </div>
            <p className="create">{Moment.getDate(props.createdAt, "dd/mm/yyyy")} {Moment.getTime(props.createdAt, "hh:mm:ss")}</p>
        </div>
    </li>);
};