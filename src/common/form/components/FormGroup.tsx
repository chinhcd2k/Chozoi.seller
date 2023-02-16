import React from "react";

interface IFormGroupProps {
    className?: string,
    id?: string
}

interface IFormGroupState {
    invalid: boolean,
    feedbackMessage: string,
    validated: boolean
}

export interface IFormGroupContext {
    invalid: boolean,
    validated: boolean,
    feedbackMessage: string,
    updateInvalid: (value: boolean) => {}
    updateValidated: (value: boolean) => {}
    updateFeedbackMessage: (value: string) => {}
}

export const FormGroupContext = React.createContext({
    invalid: false,
    validated: false,
    feedbackMessage: '',
    updateInvalid: (value: boolean) => {
    },
    updateValidated: (value: boolean) => {
    },
    updateFeedbackMessage: (value: string) => {
    }
});

export default class FormGroup extends React.Component<IFormGroupProps, IFormGroupState> {
    constructor(props: IFormGroupProps) {
        super(props);
        this.state = {
            invalid: false,
            feedbackMessage: '',
            validated: false
        };
        this.updateInvalid = this.updateInvalid.bind(this);
        this.updateValidated = this.updateValidated.bind(this);
        this.updateFeedbackMessage = this.updateFeedbackMessage.bind(this);
    }

    updateInvalid(value: boolean) {
        this.setState({
            invalid: value
        });
    }

    updateValidated(value: boolean) {
        this.setState({validated: value});
    }

    updateFeedbackMessage(value: string) {
        this.setState({
            feedbackMessage: value
        })
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <FormGroupContext.Provider value={{
            invalid: this.state.invalid,
            validated: this.state.validated,
            feedbackMessage: this.state.feedbackMessage,
            updateInvalid: this.updateInvalid,
            updateValidated: this.updateValidated,
            updateFeedbackMessage: this.updateFeedbackMessage
        }}>
            <div {...this.props}>
                {this.props.children}
            </div>
        </FormGroupContext.Provider>
    }
}
