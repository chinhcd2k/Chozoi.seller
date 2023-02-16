import React from "react";
import {IResponseProduct as IProduct} from "../../../../../../products/manager-product/components/ManagerProductComponent";
import {numberWithCommas} from "../../../../../../../common/functions/FormatFunc";
import * as Sentry from "@sentry/browser";

interface IProductProps {
    data: IProduct
    OnRemoveProduct: () => any
}

export const Product: React.FC<IProductProps> = (props: IProductProps) => {
    try {
        return <div className="product">
            <img className="image" src={props.data.imageVariants[0].image180} alt={props.data.name}/>
            <div className="content">
                <p className="name">{props.data.name}</p>
                {props.data.variants[0].price &&
                <p className="price-sale">{numberWithCommas(props.data.variants[0].price)} đ</p>}
                <p className="price">{numberWithCommas(props.data.variants[0].salePrice)} đ</p>
            </div>
            <div className="remove">
                <i className="fas fa-trash fa-2x" onClick={() => props.OnRemoveProduct()}/>
            </div>
        </div>;
    } catch (e) {
        console.log(e);
        Sentry.captureException(e);
        return null;
    }
};
