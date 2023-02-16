import React, {RefObject} from "react";
import {observer} from "mobx-react";
import {notify} from "../../notify/NotifyService";

interface IFormProps {
    onSubmit?: any,
    noValidate?: boolean,
    className?: string,
    id?: string
}

interface IFormState {
    validated: boolean,
    noValidate: boolean
}

export interface IFormContext {
    validated: boolean,
    noValidate: boolean,
    updateValidated: (value: boolean) => {}
    updateFieldValid: (key: number | string, value: boolean, target: any) => {},
    removeFieldValid: (key: number | string) => {},
}

export const FormContext = React.createContext({
    validated: false,
    noValidate: false,
    updateValidated: (value: boolean) => {
    },
    updateFieldValid: (key: number | string, value: boolean, target: any) => {
    },
    removeFieldValid: (key: number | string) => {
    },
});

@observer
export default class Form extends React.Component<IFormProps, IFormState> {
    fieldValidate: { key: number | string, valid: boolean, target: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> }[] = [];
    static defaultProps = {
        noValidate: false
    };

    constructor(props: any) {
        super(props);
        this.state = {
            validated: false,
            noValidate: this.props.noValidate ? this.props.noValidate : false
        };
        this.updateValidated = this.updateValidated.bind(this);
        this.updateFieldValid = this.updateFieldValid.bind(this);
        this.removeFieldValid = this.removeFieldValid.bind(this);
    }

    public onSubmit(e: any) {
        e.preventDefault();
        this.setState({
            validated: true
        });

        let valid = true;

        for (let i = 0; i < this.fieldValidate.length; i++) {
            if (!this.props.noValidate && !this.fieldValidate[i].valid) {
                console.log(`invalid: Fields ${this.fieldValidate[i].target}`);
                try {
                    // Focus to field invalid
                    if (this.fieldValidate[i] && this.fieldValidate[i].target && this.fieldValidate[i].target.current !== null) {
                        // @ts-ignore
                        this.fieldValidate[i].target.current.focus();
                    }
                    valid = false;
                    break;
                } catch (e) {
                    console.log(e);
                }
            }
        }

        if (valid || this.props.noValidate) {
            this.props.onSubmit(e);
        } else if (!valid && !this.props.noValidate) {
            notify.show('Vui lòng nhập đầy đủ thông tin', "error");
            console.log('Validate form invalid');
        }
    }

    updateValidated(value: boolean) {
        this.setState({
            validated: value
        })
    }

    async updateFieldValid(key: number | string, value: boolean, target: any) {
        let filter: { key: string | number, valid: boolean | undefined, target?: any }[] | { key: string | number, valid: boolean | undefined, target?: any } | [] = this.fieldValidate.filter((value: { key: string | number, valid: boolean | undefined, target?: any }) => value.key === key);
        if (filter.length === 0) {
            this.fieldValidate.push({key: key, valid: value, target: target});
        } else if (filter.length > 1) {
            console.log('Error duplicate key');
        } else if (Array.isArray(filter)) {
            filter = filter[0];
            filter.valid = value;
        }
    }

    async removeFieldValid(key: number | string) {
        this.fieldValidate = this.fieldValidate.reduce((previousValue: { key: number | string, valid: boolean, target: any }[], currentValue: { key: number | string, valid: boolean, target: any }) => {
            if (currentValue.key !== key) {
                previousValue.push(currentValue);
            }
            return previousValue;
        }, []);
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <form {...this.props} onSubmit={(e: any) => this.onSubmit(e)}>
            <FormContext.Provider value={{
                validated: this.state.validated,
                noValidate: this.state.noValidate,
                // @ts-ignore
                fieldValidate: this.state.fieldValidate,
                updateValidated: this.updateValidated,
                updateFieldValid: this.updateFieldValid,
                removeFieldValid: this.removeFieldValid
            }}>
                {this.props.children}
            </FormContext.Provider>
        </form>
    }
}
