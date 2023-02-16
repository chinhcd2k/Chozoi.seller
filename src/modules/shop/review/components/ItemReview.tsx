import React from "react";
import {ItemReviewTitle} from "./ItemReviewTitle";
import {Col, Typography, Image, Row, Space, Button, Input, Tooltip, Card} from "antd";
import {Link} from "react-router-dom";
import {Moment} from "../../../../common/functions/Moment";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {notify} from "../../../../common/notify/NotifyService";
import {IReview} from "../service";
import * as Sentry from "@sentry/browser";

interface IItemReviewProps {
    data: IReview,
    onReply: (text: string, callback: (success: boolean) => any) => any
}

const {Form} = require("antd");

@observer
export default class ItemReview extends React.Component<IItemReviewProps, any> {
    @observable textArea: boolean = false;
    @observable disabledSubmit: boolean = false;
    @observable replyValue: string = '';
    @observable replyed: boolean = false;

    constructor(props: IItemReviewProps) {
        super(props);
        if (props.data.reply !== null) {
            this.replyValue = props.data.reply;
            this.replyed = true;
        }
    }

    handlerReply() {
        this.disabledSubmit = true;
        this.props.onReply(this.replyValue.trim(), success => {
            this.disabledSubmit = false;
            if (success) {
                this.props.data.reply = this.replyValue.trim();
                this.replyed = true;
                this.textArea = false;
                this.props.data.replyCount += 1;
            }
        });
    }

    render() {
        try {
            const {product: {id, type}} = this.props.data;
            return <Card title={<ItemReviewTitle data={this.props.data}/>}>
                <Row>
                    <Col lg={6}>
                        <Space align="start">
                            <Space style={{width: '80px', height: '80px'}}><Image
                                src={this.props.data.product.images[0].imageUrl}/></Space>
                            <Link
                                to={`/home/${type === "NORMAL" ? 'product' : 'auction'}/detail/${id}`}>{this.props.data.product.name}</Link>
                        </Space>
                    </Col>
                    <Col lg={12} style={{padding: '0 16px'}}>
                        <Space direction="vertical">
                            <Typography.Text>{this.props.data.text}</Typography.Text>
                            <Space direction={"horizontal"}>
                                {(this.props.data.images || []).map((value, index) =>
                                    <Space key={index} style={{width: '80px', height: '80px'}}>
                                        <Image src={value}/>
                                    </Space>)}
                            </Space>
                            <Typography.Text
                                type="secondary">{Moment.getDate(this.props.data.createdAt, 'dd/mm/yyyy')} {Moment.getTime(this.props.data.createdAt, 'hh:mm')}</Typography.Text>
                        </Space>
                    </Col>
                    <Col lg={6}>
                        {this.replyed && !this.textArea && <div>
                            <p className="ant-tag ant-tag-cyan pb-3 position-relative"
                               style={{display: 'block', whiteSpace: 'normal'}}>
                                {this.props.data.reply}
                                &nbsp;{this.props.data.replyCount < 2 &&
                            <Tooltip title="Sửa">
                                <i className="fal fa-edit position-absolute"
                                   style={{cursor: 'pointer', bottom: '4px', right: '4px'}}
                                   onClick={() => {
                                       this.textArea = true;
                                       this.replyValue = this.props.data.reply || '';
                                       notify.show('Chú ý: Bạn chỉ được thay đổi đánh giá 1 lần duy nhât', "warning", 7);
                                   }}/>
                            </Tooltip>}
                            </p>
                        </div>}
                        {!this.replyed && !this.textArea &&
                        <Button type={"primary"} onClick={() => this.textArea = true}>Phản hồi</Button>}
                        {this.textArea && <Space direction="vertical" className="w-100">
                            <Form initialValues={{reply: this.props.data.reply}} onFinish={() => this.handlerReply()}>
                                <Form.Item
                                    name="reply"
                                    rules={[
                                        {required: true, message: 'Vui lòng nhập nội dung đánh giá!'},
                                        {min: 3, message: 'Tối thiểu 3 ký tự!'},
                                        {max: 500, message: 'Tối đa 500 ký tự!'}
                                    ]}>
                                    <Input.TextArea
                                        value={this.replyValue}
                                        onChange={e => this.replyValue = e.currentTarget.value}/>
                                </Form.Item>
                                <Form.Item>
                                    <Space direction="horizontal">
                                        <Button loading={this.disabledSubmit} disabled={this.disabledSubmit}
                                                type={"primary"}
                                                htmlType="submit">{this.replyed ? 'Cập nhật' : 'Gửi phản hồi'}</Button>
                                        {this.replyed && this.textArea &&
                                        <Button type="primary" danger onClick={() => this.textArea = false}>Hủy
                                            bỏ</Button>}
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Space>}
                        {this.replyed && !this.textArea &&
                        <Typography.Text type="success" className="mt-3"><i
                            className="fal fa-check"/> Đã phản hồi</Typography.Text>}
                    </Col>
                </Row>
            </Card>;
        } catch (e) {
            console.error(e);
            Sentry.captureException(e);
            return null;
        }
    }
}
