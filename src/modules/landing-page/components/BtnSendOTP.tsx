import React, {CSSProperties} from "react";
import {Button} from "antd";
import {observer} from "mobx-react";
import {observable} from "mobx";

interface IProps {
    timeSecond: number
    instance?: (self: BtnSendOTP) => any
    onClick: () => any
}

@observer
export default class BtnSendOTP extends React.Component<IProps & { style: CSSProperties }, any> {
    private interval?: any;
    @observable disabledCode: boolean = true;
    @observable countdown: number = this.props.timeSecond;

    constructor(props: IProps & { style: CSSProperties }) {
        super(props);
        this.props.instance && this.props.instance(this);
    }

    countDown() {
        this.disabledCode = true;
        this.interval && clearInterval(this.interval);
        this.countdown = this.props.timeSecond;
        this.interval = setInterval(() => {
            this.countdown--;
            if (this.countdown < 1) {
                clearInterval(this.interval);
                this.disabledCode = false;
            }
        }, 1000);
    }

    handlerOnClick() {
        this.countDown();
        this.props.onClick();
    }

    render() {
        return <Button type={"default"}
                       style={{
                           backgroundColor: this.disabledCode ? "#ECECEC" : "#F54B24",
                           color: this.disabledCode ? "#999999" : "#ffffff",
                           ...this.props.style,
                       }}
                       disabled={this.disabledCode}
                       onClick={() => this.handlerOnClick()}
        >Gửi lại mã{this.countdown ? ` (${this.countdown}s)` : ''}</Button>;
    }

    componentDidMount() {
        this.countDown();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
}