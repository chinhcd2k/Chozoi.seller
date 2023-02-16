import React from "react";
import {Input, Validations, FormGroup} from "../../../common/form";
import Feedback from "../../../common/form/components/Feedback";
import {observer} from "mobx-react";
import * as Sentry from "@sentry/browser";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {DETAIL_PRODUCT_CTRL} from "./DetailProductControl";

interface IRowVariantComponentProps {
    title: string
    value?: {
        id?: number
        image_id?: number
        price?: number
        sale_price: number
        quantity: number
        sku: string
    }
    /*Emit*/
    EmitImageOnClick?: () => any
}

@observer
export default class RowVariantComponent extends React.Component<IRowVariantComponentProps> {

    public handlerOnChange(event: any, key: 'price' | 'sale_price' | 'quantity' | 'sku') {
        if (this.props.value) {
            let value: any = event.currentTarget.value + ''.trim();
            if (key !== "sku") {
                value = value.replace(/([^0-9]|^0)/g, '');
                value = parseInt(value);
                if (!isNaN(value)) {
                    this.props.value[key] = value;
                    event.currentTarget.value = numberWithCommas(value);
                } else {
                    this.props.value[key] = 0;
                    event.currentTarget.value = '';
                }
            } else
                this.props.value.sku = value;
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            if (this.props.value) {
                return <tr>
                    <td>{this.props.title}</td>
                    <td className="image-variant">
                        <div className="image"
                             onClick={() => this.props.value && this.props.value.id !== undefined && !DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS") && this.props.EmitImageOnClick && this.props.EmitImageOnClick()}>
                            <img
                                src={this.getImage}
                                alt={this.getImage ? 'image-variant' : 'Thêm ảnh'}/>
                        </div>
                    </td>
                    <td className="price">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                   defaultValue={this.props.value.price ? numberWithCommas(this.props.value.price) : ''}
                                   onChange={(e: any) => this.handlerOnChange(e, "price")}/>
                        </FormGroup>
                    </td>
                    <td className="sale_price">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                   defaultValue={numberWithCommas(this.props.value.sale_price)}
                                   validations={[new Validations(Validations.greaterThanNumber(0))]}
                                   onChange={(e: any) => this.handlerOnChange(e, "sale_price")}/>
                            <Feedback invalid={"true"}/>
                        </FormGroup>
                    </td>
                    <td className="quantity">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                                   defaultValue={numberWithCommas(this.props.value.quantity)}
                                   validations={[new Validations(Validations.required())]}
                                   onChange={(e: any) => this.handlerOnChange(e, "quantity")}/>
                        </FormGroup>
                    </td>
                    <td><Input className="form-control" type="text"
                               disabled={DETAIL_PRODUCT_CTRL.getDisabledFormField("VARIANTS")}
                               defaultValue={this.props.value.sku}
                               onChange={(e: any) => this.handlerOnChange(e, "sku")}/>
                    </td>
                </tr>;
            } else
                return <tr>
                    <td colSpan={6}>props.value is undefied</td>
                </tr>;
        } catch (e) {
            console.log(e);
            Sentry.captureException(e);
            return <tr>
                <td colSpan={5}>Render error!</td>
            </tr>
        }
    }

    public get getImage(): string {
        const DETAIL_PRODUCT_STORE = DETAIL_PRODUCT_CTRL.getStore;
        if (this.props.value && this.props.value.image_id && DETAIL_PRODUCT_STORE && DETAIL_PRODUCT_STORE.product) {
            const image_id: number = this.props.value.image_id;
            const index = DETAIL_PRODUCT_STORE.product.images.findIndex((value: any) => value.id === image_id);
            if (index !== -1) return DETAIL_PRODUCT_STORE.product.images[index].imageUrl;
        }
        return '';
    }
}
