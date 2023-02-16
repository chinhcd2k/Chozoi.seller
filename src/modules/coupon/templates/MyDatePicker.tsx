import React from "react";
import $ from "jquery";

interface IDatePickerProps {
    id: number | string
    placeholder?: string
    setDate?: number
    disabled: boolean
    OnChangeDate: (timestamp: number) => any
}

export default class MyDatePicker extends React.Component<IDatePickerProps, any> {
    componentDidMount() {
        const el = $(`div.date#${this.props.id}`);
        el.datepicker({
            format: 'dd/mm/yyyy',
            autoclose: true,
            todayBtn: true,
            todayHighlight: true
        });
        // set date
        this.props.setDate && this.setDate(this.props.setDate);
        // hanlder onchage date
        el.on('changeDate', e => {
            const date_selected: Date = new Date(e.date);
            this.props.OnChangeDate(date_selected.getTime() / 1000);
        })
    }

    componentDidUpdate(prevProps: Readonly<IDatePickerProps>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.setDate !== this.props.setDate && this.props.setDate) {
            this.setDate(this.props.setDate);
        }
    }

    componentWillUnmount() {
        $(`div.date#${this.props.id}`).off('changeDate');
    }

    protected setDate(timestamp: number) {
        const el = $(`div.date#${this.props.id}`);
        if (timestamp.toString().length === 10) timestamp *= 1000;
        timestamp !== 0 && el.datepicker("setDate", new Date(timestamp));
    }

    render() {
        return <div id={this.props.id.toString()} className="input-group date">
            <input type="text"
                   disabled={this.props.disabled}
                   placeholder={this.props.placeholder || ''}
                   className="form-control datepicker"
            />
            <div className="input-group-addon">
                <i className="fas fa-calendar-alt"/>
            </div>
        </div>;
    }
}