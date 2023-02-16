import React from "react";
import {FormGroupContext, IFormGroupContext} from "./FormGroup";
import {css} from "@emotion/core";
import {IFormContext, FormContext} from "./Form";

interface ISelectProps {
    className?: string,
    required?: boolean,
    name?: string,
    disabled?: boolean,
    ref?: any,
    defaultValue: string,
    onChange?: (e?: any) => void,
    validations?: any
}

export default class Select extends React.Component<ISelectProps, { defaultValue: string | string[] | undefined }> {
    public FormContext!: IFormContext;
    public FormGroupContext!: IFormGroupContext;
    public key!: number;
    public _ref = React.createRef();

    set value(value: string | string[] | undefined) {
        this.setState({
            defaultValue: value
        });
    }

    constructor(props: any) {
        super(props);
        this.key = Math.floor(Math.random() * Date.now());
        this.state = {
            defaultValue: this.props.defaultValue
        }
    }

    componentDidMount(): void {
        if (this.props.validations) {
            this.FormContext.updateFieldValid(this.key, this.FormContext.noValidate, this._ref);
            this.FormGroupContext.updateInvalid(true);
            this.FormGroupContext.updateFeedbackMessage(this.props.validations ? this.props.validations[0].feedbackMessage : '');
        }
        this.validate(this.props.defaultValue === '0' ? "" : this.props.defaultValue);
    }

    componentWillUnmount() {
        this.FormContext.removeFieldValid(this.key);
    }

    onChange(e: any) {
        this.FormGroupContext && !this.FormGroupContext.validated && this.FormGroupContext.updateValidated(true);
        this.validate(e.currentTarget.value);
        this.props.onChange && this.props.onChange(e);
    }

    private validate(value: string) {
        const list_validate = this.props.validations;
        if (Array.isArray(list_validate)) {
            let valid: boolean = true;
            for (let i = 0; i < list_validate.length; i++) {
                valid = list_validate[i].validate.isValid(value);
                this.FormGroupContext.updateFeedbackMessage(list_validate[i].feedbackMessage);
            }
            this.FormGroupContext.updateInvalid(!valid);
            this.FormContext.updateFieldValid(this.key, valid, this._ref);
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <FormContext.Consumer>
            {(form_context: any) => {
                this.FormContext = form_context;
                return <FormGroupContext.Consumer>
                    {(form_group_context: any) => {
                        this.FormGroupContext = form_group_context;
                        let makeCss = css``;
                        if ((this.FormGroupContext.validated || this.FormContext.validated) && !this.FormContext.noValidate) {
                            makeCss = css`
                                border: solid 1px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                &:focus{
                                    border: solid 1px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                    box-shadow: 0 0 6px 0px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                }
                            `;
                        }
                        return <select
                            disabled={this.props.disabled}
                            ref={this._ref}
                            {...this.props} css={makeCss}
                            defaultValue={this.state.defaultValue}
                            onChange={(e: any) => this.onChange(e)}>{this.props.children}</select>;
                    }}
                </FormGroupContext.Consumer>
            }}
        </FormContext.Consumer>;
    }
}
