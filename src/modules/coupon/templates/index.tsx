import React from "react";
import Steep from "./Steep";
import "./style.scss";
import FormInput from "./FormInput";
import ListProduct from "./ListProduct";
import PopupListProduct from "./popup";
import {TEMPLATE_CTRL} from "./controls";

interface ITemplateCouponProps {
    type: 'CREATE' | 'UPDATE',
}

export default class Template extends React.Component<ITemplateCouponProps, any> {
    componentDidMount() {
        TEMPLATE_CTRL.GET_getListCategoryLevel1().then();
    }

    render() {
        return <div className="container" id="coupon-template-site">
            <Steep/>
            <FormInput type={this.props.type}/>
            <ListProduct type={this.props.type}/>
            <PopupListProduct/>
        </div>;
    }
}