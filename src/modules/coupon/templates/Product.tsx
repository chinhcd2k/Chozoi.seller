import React from "react";
import {IProduct} from "./store";
import * as Sentry from "@sentry/browser";
import {Link} from "react-router-dom";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {Checkbox} from "./Checkbox";

interface IProductProps {
    type: 'SELECTED' | 'POPUP'
    data: IProduct
    disabled?: boolean
    OnChange?: (checked: boolean) => any
    OnDelete?: () => any
}

export const Product: React.FC<IProductProps> = (props: IProductProps) => {
    const td = (): React.ReactNode => {
        if ((props.type !== "POPUP" && !props.disabled) || (props.type === "POPUP" && !props.disabled))
            return <Checkbox
                defaultChecked={!!props.data.selected}
                onChange={checked => props.OnChange && props.OnChange(checked)}
            />;
        else return null;
    }
    const getStatus = (): string => {
        if (props.data.inserted) return 'Đang áp dụng';
        else if (props.disabled && props.type === "SELECTED") return "Đang xử lý";
        else if (props.type === "POPUP" && props.data.selected) return 'Đã thêm';
        return ''; // default
    }
    try {
        return (<tr className="product">
            <td>{td()}</td>
            <td>
                <Link to={"#"}><img src={props.data.imageVariants[0].image180} alt={props.data.name}/></Link>
                <div>
                    <p>ID: {props.data.id}</p>
                    <Link to={"#"}>{props.data.name}</Link>
                </div>
            </td>
            <td>
                {/^(NORMAL|CLASSIFIER)$/.test(props.data.type) && <div className="product">
                    <p className="sale-price">{numberWithCommas(props.data.variants[0].salePrice)} đ</p>
                    {props.data.variants[0].price > 0 && <p className="price">{numberWithCommas(props.data.variants[0].price)} đ</p>}
                </div>}
                {/^(AUCTION|AUCTION_SALE)$/.test(props.data.type) && <p><i className="fas fa-gavel"/> {numberWithCommas((props.data.auction as any).startPrice)} đ</p>}
            </td>
            <td>{getStatus()}</td>
            {props.type === "SELECTED" && <td>
                {props.OnDelete && <button className="btn btn-default" onClick={() => props.OnDelete && props.OnDelete()}><i className="fas fa-trash"/></button>}
            </td>}
        </tr>);
    } catch (e) {
        console.log(e);
        Sentry.captureException(e);
        return null;
    }
}