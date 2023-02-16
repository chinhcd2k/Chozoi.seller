import React, {RefObject} from "react";
import {FormContext, IFormContext} from "./Form";
import {FormGroupContext, IFormGroupContext} from "./FormGroup";
import {css} from "@emotion/core";

interface IPropsInput {
    ref?: any,
    name?: string,
    id?: string,
    className?: string,
    placeholder?: string,
    defaultValue?: string,
    autoFocus?: boolean,
    required?: boolean,
    type?: string,
    validations?: any[],
    disabled?: boolean,
    invalid_css?: any,
    onChange?: (e: any) => void
}

interface IStateInput {
    disabled: boolean
}

export default class Input extends React.Component<IPropsInput, IStateInput> {
    public FormContext!: IFormContext;
    public FormGroupContext!: IFormGroupContext;
    public key!: number;
    public _ref: RefObject<any>;

    set value(value: string) {
        this.validate(value);
        if (this._ref.current) {
            const nativeInputValueSetter = (Object as any).getOwnPropertyDescriptor((window as any).HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(this._ref.current, value);
            const eventOnChange = new Event('input', {bubbles: true});
            this._ref.current.dispatchEvent(eventOnChange);
        }
    }

    set disabled(value: boolean) {
        this.setState({
            disabled: value
        })
    }

    public focus() {
        this._ref.current && this._ref.current.focus();
    }

    constructor(props: any) {
        super(props);
        this.key = Math.floor(Math.random() * Date.now());
        this._ref = React.createRef();
        this.state = {
            disabled: Boolean(this.props.disabled)
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
            this.props.onChange && this.props.onChange({
                preventDefault: (): boolean => false,
                currentTarget: this._ref.current,
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<IPropsInput>, prevState: Readonly<IStateInput>, snapshot?: any): void {
        if (prevProps.disabled !== this.props.disabled && this.props.disabled !== undefined) {
            this.setState({disabled: this.props.disabled});
        }
    }

    componentWillUnmount() {
        this.FormContext.removeFieldValid(this.key);
    }

    public validate(value: string) {
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
                        if ((form_group_context.validated || form_context.validated) && !this.FormContext.noValidate) {
                            makeCss = this.props.invalid_css ? this.props.invalid_css : css`
                                border: solid 1px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                &:focus{
                                    border: solid 1px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                    box-shadow: 0 0 6px 0px ${this.FormGroupContext.invalid ? 'red' : 'green'};
                                }
                            `;
                        }
                        return <input {...this.props} css={makeCss}
                                      ref={this._ref}
                                      disabled={this.state.disabled}
                                      onChange={(e: any) => this.onChange(e)}/>;
                    }}
                </FormGroupContext.Consumer>
            }}
        </FormContext.Consumer>;
    }
}
