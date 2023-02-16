import React from "react";
import {Input, Validations, FormGroup} from "../../../common/form";
import Feedback from "../../../common/form/components/Feedback";
import {observer} from "mobx-react";
import * as Sentry from "@sentry/browser";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {MAX_VARIANT_QUANTITY} from "./CreateProductControl";

interface IRowVariantComponentProps {
    title: string
    value: {
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }
}

@observer
export default class RowVariantComponent extends React.Component<IRowVariantComponentProps> {

    public handlerOnChange(event: any, key: 'price' | 'sale_price' | 'quantity' | 'sku') {
        let value: any = event.currentTarget.value + ''.trim();
        if (key !== "sku") {
            value = value.replace(/([^0-9]|^0)/g, '');
            value = parseInt(value);
            if (!isNaN(parseInt(value))) {
                if (key === "quantity" && value > MAX_VARIANT_QUANTITY) value = MAX_VARIANT_QUANTITY;
                this.props.value[key] = value;
                event.currentTarget.value = numberWithCommas(value);
            } else {
                this.props.value[key] = 0;
                event.currentTarget.value = '';
            }
        } else
            this.props.value.sku = value;
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            const defaultValue = this.props.value;
            return <tr>
                <td>{this.props.title}</td>
                <td className="price">
                    <FormGroup>
                        <Input className="form-control" type="text"
                               defaultValue={defaultValue.price ? numberWithCommas(defaultValue.price) : ''}
                               onChange={(e: any) => this.handlerOnChange(e, "price")}/>
                    </FormGroup>
                </td>
                <td className="sale_price">
                    <FormGroup>
                        <Input className="form-control" type="text"
                               defaultValue={numberWithCommas(defaultValue.sale_price)}
                               validations={[new Validations(Validations.greaterThanNumber(0))]}
                               onChange={(e: any) => this.handlerOnChange(e, "sale_price")}/>
                        <Feedback invalid={"true"}/>
                    </FormGroup>
                </td>
                <td className="quantity">
                    <FormGroup>
                        <Input className="form-control" type="text"
                               defaultValue={numberWithCommas(defaultValue.quantity)}
                               validations={[new Validations(Validations.greaterThanNumber(0))]}
                               onChange={(e: any) => this.handlerOnChange(e, "quantity")}/>
                    </FormGroup>
                </td>
                <td><Input className="form-control" type="text"
                           defaultValue={defaultValue.sku}
                           onChange={(e: any) => this.handlerOnChange(e, "sku")}/>
                </td>
            </tr>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return <tr>
                <td colSpan={5}>Render error!</td>
            </tr>
        }
    }
}
