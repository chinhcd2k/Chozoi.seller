import React from "react";
import {Button, DatePicker, Input, Row, Space} from "antd";
import moment from "moment";
import {observable} from "mobx";
import {observer} from "mobx-react";
import {Moment} from "../../../../common/functions/Moment";
import {RangeValue} from "rc-picker/lib/interface";

interface ISearchProps {
    productName?: string
    buyerName?: string
    date?: [string, string]
    onSeach: (productName?: string, buyerName?: string, dateString?: [string, string]) => any
}

@observer
export default class Search extends React.Component<ISearchProps, any> {
    @observable productName?: string = this.props.productName;
    @observable buyerName?: string = this.props.buyerName;
    @observable fromDate: moment.Moment = moment();
    @observable toDate: moment.Moment = moment();
    private dateString?: [string, string];

    constructor(props: ISearchProps) {
        super(props);
        this.dateString = [
            Moment.getDate(this.fromDate.toDate().getTime(), 'yyyy-mm-dd'),
            Moment.getDate(this.toDate.toDate().getTime(), 'yyyy-mm-dd')
        ];
    }

    private handlerOnSearch() {
        this.props.onSeach(this.productName, this.buyerName, this.dateString);
    }

    private handlerOnChangeDate(date: [moment.Moment, moment.Moment], dateString: [string, string]) {
        if (date && dateString) {
            this.fromDate = date[0];
            this.toDate = date[1];
            this.dateString = [
                Moment.getDate(date[0].toDate().getTime(), 'yyyy-mm-dd'),
                Moment.getDate(date[1].toDate().getTime(), 'yyyy-mm-dd')
            ];
        }
    }

    componentDidUpdate(prevProps: Readonly<ISearchProps>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.date !== this.props.date) {
            this.dateString = this.props.date;
            if (this.props.date) {
                this.fromDate = moment(this.props.date[0]);
                this.toDate = moment(this.props.date[1]);
            }
        }
        if (prevProps.productName !== this.props.productName) this.productName = this.props.productName;
        if (prevProps.buyerName !== this.props.buyerName) this.buyerName = this.props.buyerName;
    }

    render() {
        return <Row id="review-search">
            <Space>
                <Input placeholder="Nhập tên sản phẩm" value={this.productName}
                       onChange={e => this.productName = e.currentTarget.value}/>
                <Input placeholder="Nhập tên người mua" value={this.buyerName}
                       onChange={e => this.buyerName = e.currentTarget.value}/>
                <DatePicker.RangePicker
                    inputReadOnly={true}
                    suffixIcon={<i className="fas fa-calendar"/>}
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={[this.fromDate, this.toDate]}
                    onChange={(date: RangeValue<any>, dateString: [string, string]) => this.handlerOnChangeDate(date as [moment.Moment, moment.Moment], dateString)}
                />
                <Button type="primary" icon={<i className="fal fa-search"/>}
                        onClick={() => this.handlerOnSearch()}>&nbsp;Tìm kiếm</Button>
            </Space>
        </Row>;
    }
}