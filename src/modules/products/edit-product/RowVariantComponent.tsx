import React from "react";
import {Input, Validations, FormGroup} from "../../../common/form";
import Feedback from "../../../common/form/components/Feedback";
import {observer} from "mobx-react";
import * as Sentry from "@sentry/browser";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {EDIT_PRODUCT_CTRL} from "./EditProductControl";
import {MAX_VARIANT_QUANTITY} from "../create-product/CreateProductControl";
import {notify} from "../../../common/notify/NotifyService";

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
                value = parseInt(value)
                if (!isNaN(value)) {
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
    }

    handlerImageOnClick() {
        console.log(JSON.stringify(this.props.value));
        if (!this.props.value || (this.props.value && !this.props.value.id))
            notify.show('Vui lòng lưu phân loại mới thêm trước khi cập nhật ảnh cho phân loại', "warning");
        else this.props.EmitImageOnClick && this.props.EmitImageOnClick()
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        try {
            if (this.props.value) {
                return <tr>
                    <td>{this.props.title}</td>
                    <td className="image-variant">
                        <div className="image"
                             onClick={() => this.handlerImageOnClick()}>
                            {this.getImage && <img
                                src={this.getImage || ''}
                                alt='image-variant'/>}
                            {!this.getImage && <div className="h-100 cursor-pointer d-flex flex-column align-items-center justify-content-center"><i className="fal fa-plus"/> Thêm ảnh</div>}
                        </div>
                    </td>
                    <td className="price">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   defaultValue={this.props.value.price ? numberWithCommas(this.props.value.price) : ''}
                                   onChange={(e: any) => this.handlerOnChange(e, "price")}/>
                        </FormGroup>
                    </td>
                    <td className="sale_price">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   defaultValue={numberWithCommas(this.props.value.sale_price)}
                                   validations={[new Validations(Validations.greaterThanNumber(0))]}
                                   onChange={(e: any) => this.handlerOnChange(e, "sale_price")}/>
                            <Feedback invalid={"true"}/>
                        </FormGroup>
                    </td>
                    <td className="quantity">
                        <FormGroup>
                            <Input className="form-control" type="text"
                                   defaultValue={numberWithCommas(this.props.value.quantity)}
                                   validations={[new Validations(Validations.greaterThanNumber(0))]}
                                   onChange={(e: any) => this.handlerOnChange(e, "quantity")}/>
                        </FormGroup>
                    </td>
                    <td><Input className="form-control" type="text"
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
        const EDIT_PRODUCT_STORE = EDIT_PRODUCT_CTRL.getStore;
        if (this.props.value && this.props.value.image_id && EDIT_PRODUCT_STORE && EDIT_PRODUCT_STORE.product) {
            const image_id: number = this.props.value.image_id;
            const index = EDIT_PRODUCT_STORE.product.images.findIndex((value: any) => value.id === image_id);
            if (index !== -1) return EDIT_PRODUCT_STORE.product.images[index].imageUrl;
        }
        return '';
    }
}
