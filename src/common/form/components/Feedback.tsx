import {css} from "@emotion/core";
import React from "react";
import {FormGroupContext} from "./FormGroup";
import {FormContext} from "./Form";

interface IFeedbackProps {
    className?: string,
    invalid?: "true",
    valid?: "true"
}

export default class Feedback extends React.Component<IFeedbackProps> {
    public FormContext: any;
    public FormGroupContext: any;

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        const style = css`
            text-align: left;
            padding-top: 4px;
            font-size: 12px;         
        `;
        return <FormContext.Consumer>
            {(form_context) => {
                this.FormContext = form_context;
                return <FormGroupContext.Consumer>
                    {(form_group_context) => {
                        this.FormGroupContext = form_group_context;
                        if ((form_group_context.validated || form_context.validated) && !form_context.noValidate && (this.props.valid === "true" || this.props.invalid === "true")) {
                            if ((this.props.valid === "true" && !form_group_context.invalid) || (this.props.invalid === "true" && form_group_context.invalid)) {
                                return <p {...this.props} css={style}
                                          style={{color: form_group_context.invalid ? 'red' : 'green'}}>{form_group_context.feedbackMessage}{this.props.children}</p>;
                            } else return "";
                        } else return "";
                    }}
                </FormGroupContext.Consumer>
            }}
        </FormContext.Consumer>;
    }
}
