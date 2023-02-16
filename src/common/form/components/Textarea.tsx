import React, {RefObject} from "react";
import {IFormContext, FormContext} from "./Form";
import {IFormGroupContext, FormGroupContext} from "./FormGroup";
import {Validations} from "../index";
import {css} from "@emotion/core";

interface ITextareaProps {
    ref?: any,
    name?: string,
    id?: string,
    className?: string,
    placeholder?: string,
    disabled?: boolean,
    rows?: number,
    defaultValue?: string,
    validations?: Validations[],
    onChange?: (e: any) => void
}

export default class Textarea extends React.Component<ITextareaProps, { value: string }> {
    public FormContext!: IFormContext;
    public FormGroupContext!: IFormGroupContext;
    public key!: number;
    public _ref: RefObject<any>;

    set value(value: string) {
        new Promise(resolve => {
            this.setState({
                value: value
            });
            resolve(value);
        }).then(() => {
            const event = new Event('textarea', {bubbles: true});
            this._ref.current.dispatchEvent(event);
        });
    }

    focus() {
        this._ref.current.focus();
    }

    constructor(props: any) {
        super(props);
        this.key = Math.floor(Math.random() * Date.now());
        this._ref = React.createRef();
        this.state = {
            value: this.props.defaultValue ? this.props.defaultValue : ''
        }
    }

    componentDidMount(): void {
        if (this.props.validations) {
            this.FormContext.updateFieldValid(this.key, this.FormContext.noValidate, this._ref);
            this.FormGroupContext.updateInvalid(true);
            this.FormGroupContext.updateFeedbackMessage(this.props.validations ? this.props.validations[0].feedbackMessage : '');
        }

        if (this.props.defaultValue) {
            this.validate(this.props.defaultValue);
        }
    }

    componentWillUnmount(): void {
        this.FormContext.removeFieldValid(this.key);
    }

    private validate(value: string) {
        const list_validate = this.props.validations;
        if (Array.isArray(list_validate)) {
            let valid: boolean = true;
            for (let i = 0; i < list_validate.length; i++) {
                valid = list_validate[i].validate.isValid(value);
                this.FormGroupContext.updateFeedbackMessage(list_validate[i].feedbackMessage);

                if (!valid) {
                    break;
                }
            }
            this.FormGroupContext.updateInvalid(!valid);
            this.FormContext.updateFieldValid(this.key, valid, this._ref);
        }
    }

    onChange(event: any) {
        this.FormGroupContext && !this.FormGroupContext.validated && this.FormGroupContext.updateValidated(true);
        this.validate(event.currentTarget.value);
        this.props.onChange && this.props.onChange(event);
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
                        return <textarea {...this.props} css={makeCss}
                                         disabled={this.props.disabled}
                                         ref={this._ref}
                                         onChange={(e: any) => this.onChange(e)}/>;
                    }}
                </FormGroupContext.Consumer>
            }}
        </FormContext.Consumer>;
    }
}
