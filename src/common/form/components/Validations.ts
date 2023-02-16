export default class Validations {
    public feedbackMessage: string;
    public validate: any;

    constructor(validate_type: any, feedback_message: string = '') {
        this.feedbackMessage = feedback_message;
        this.validate = validate_type;
    }

    public static compare(current: any, _toRef: string) {
        return {
            isValid: (source: string, funcRef = _toRef) => {
                if (current[funcRef]) {
                    let value: string = current[funcRef]._ref.current.value.toString().replace(/[^\d]/mg, "");
                    let value_source: string = source.toString().replace(/[^\d]/mg, "");
                    value = value ? value : "0";
                    value_source = value_source ? value_source : "0";
                    return parseFloat(value_source) === parseFloat(value);
                } else
                    return true;
            },
            type: "compare"
        }
    }

    public static greaterThan(current: any, _toRef: string) {
        return {
            isValid: (source: string, funcRef: string = _toRef) => {
                if (current[funcRef]) {
                    let value: string = current[funcRef]._ref.current.value.toString().replace(/[^\d]/mg, "");
                    let value_source: string = source.toString().replace(/[^\d]/mg, "");
                    value = value ? value : "0";
                    value_source = value_source ? value_source : "0";
                    return parseFloat(value_source) > parseFloat(value);
                } else
                    return true;
            },
            type: "greaterThan"
        }
    }

    public static greaterThanEqual(current: any, _toRef: string) {
        return {
            isValid: (source: string, funcRef: string = _toRef) => {
                if (current[funcRef]) {
                    let value: string = current[funcRef]._ref.current.value.toString().replace(/[^\d]/mg, "");
                    let value_source: string = source.toString().replace(/[^\d]/mg, "");
                    value = value ? value : "0";
                    value_source = value_source ? value_source : "0";
                    return parseFloat(value_source) >= parseFloat(value);
                } else
                    return true;
            },
            type: "greaterThanEqual"
        }
    }

    public static lessThan(current: any, _toRef: any) {
        return {
            isValid: (source: string, funcRef = _toRef) => {
                if (current[funcRef]) {
                    let value: string = current[funcRef]._ref.current.value.toString().replace(/[^\d]/mg, "");
                    let value_source: string = source.toString().replace(/[^\d]/mg, "");
                    value = value ? value : "0";
                    value_source = value_source ? value_source : "0";
                    return parseFloat(value_source) < parseFloat(value);
                } else
                    return true;
            },
            type: "lessThan"
        }
    }

    public static lessThanEqual(current: any, _toRef: any) {
        return {
            isValid: (source: string, funcRef = _toRef) => {
                if (current[funcRef]) {
                    let value: string = current[funcRef]._ref.current.value.toString().replace(/[^\d]/mg, "");
                    let value_source: string = source.toString().replace(/[^\d]/mg, "");
                    value = value ? value : "0";
                    value_source = value_source ? value_source : "0";
                    return parseFloat(value_source) <= parseFloat(value);
                } else
                    return true;
            },
            type: "lessThanEqual"
        }
    }

    public static greaterThanNumber(number: number) {
        return {
            isValid: (source: string) => {
                let value_source: string = source.toString().replace(/[^\d]/mg, "");
                return parseFloat(value_source) > number
            },
            type: "greaterThanNumber"
        }
    }

    public static lessThanNumber(number: number) {
        return {
            isValid: (source: string) => {
                let value_source: string = source.toString().replace(/[^\d]/mg, "");
                return parseFloat(value_source) < number
            },
            type: "lessThanNumber"
        }
    }

    public static lessThanEqualNumber(number: number) {
        return {
            isValid: (source: string) => {
                let value_source: string = source.toString().replace(/[^\d]/mg, "");
                return parseFloat(value_source) <= number
            },
            type: "lessThanEqualNumber"
        }
    }

    public static email() {
        return {
            isValid: (source: string) => {
                if (!source) {
                    return false;
                }
                //eslint-disable-next-line
                //eslint-disable-next-line
                const re = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                return re.test(source);
            },
            type: "email"
        }
    }

    public static required() {
        return {isValid: (source: string) => source}
    }

    public static minLength(num: number) {
        return {
            // tslint:disable-next-line:variable-name
            isValid: (source: string, _number: number = num) => source && source.length >= num,
            type: 'minLength'
        }
    }

    public static maxLength = (num: number) => {
        return {
            // tslint:disable-next-line:variable-name
            isValid: (source: string, _number = num) => source && source.length <= _number,
            type: 'maxLength'
        }
    };

    public static regexp = (pattern: RegExp | any) => {
        return {
            isValid: (source: string, _pattern = pattern) => {
                if (!source) {
                    return false;
                }
                const re = new RegExp(_pattern);
                return re.test(source);
            },
        }
    }
}
