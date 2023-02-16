import React from "react";
import {FormContext} from "./Form";

interface IButtonProps {
    type?: "submit" | "reset" | "button",
    className?: string,
    id?: string,
    disabled?: boolean,
    onClick?: any
}

export default class Button extends React.Component<IButtonProps> {
    static defaultProps = {
        type: 'button'
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <FormContext.Consumer>
            {(form_context) => <button
                onClick={(e: any) => this.props.onClick && this.props.onClick(e)}
                {...this.props}>{this.props.children}</button>}
        </FormContext.Consumer>;
    }
}
