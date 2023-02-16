import React from "react";
import {observer} from "mobx-react";
import {Space, Radio, Row} from "antd";

interface IFilterProps {
    status: '' | 'reply' | 'unreply'
    rate: '' | 1 | 2 | 3 | 4 | 5
    onFilter: (type: 'status' | 'rate', value: string | number) => any
}

@observer
export default class Filter extends React.Component<IFilterProps, any> {
    render() {
        return <div id="review-filter">
            <Row style={{marginTop: '1em'}}>
                <Radio.Group value={this.props.status} onChange={e => this.props.onFilter('status', e.target.value)}>
                    <Space>
                        <Radio.Button value="">Tất cả</Radio.Button>
                        <Radio.Button value="unreply">Chưa phản hồi</Radio.Button>
                        <Radio.Button value="reply">Đã phản hồi</Radio.Button>
                    </Space>
                </Radio.Group>
            </Row>
            <Row style={{marginTop: '1em'}}>
                <Radio.Group value={this.props.rate} onChange={e => this.props.onFilter('rate', e.target.value)}>
                    <Radio.Button value="">Tất cả</Radio.Button>
                    {[5, 4, 3, 2, 1].map((value, index) =>
                        <Radio.Button key={index}
                                      value={value}>{value} sao</Radio.Button>)}
                </Radio.Group>
            </Row>
        </div>;
    }
}