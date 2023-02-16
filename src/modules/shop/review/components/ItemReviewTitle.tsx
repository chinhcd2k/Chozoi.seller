import React from "react";
import {Row, Space, Avatar, Rate, Typography, Tag} from "antd";
import {Link} from "react-router-dom";
import {numberWithCommas} from "../../../../common/functions/FormatFunc";
import {IReview} from "../service";
import {css} from "@emotion/core";

export const ItemReviewTitle: React.FC<{ data: IReview }> = (props: { data: IReview }) => {

    const renderAvatar = (): React.ReactNode => {
        if (props.data.user.id)
            return <a href={`${(window as any).DOMAIN_BUYER}/passport/${props.data.user.id}`}
                      target="_blank">
                <Avatar icon={props.data.user.avatarUrl ? undefined : <i className="fal fa-user"/>}
                        src={props.data.user.avatarUrl ? props.data.user.avatarUrl : undefined}/>
            </a>;
        else
            return <Avatar icon={props.data.user.avatarUrl ? undefined : <i className="fal fa-user"/>}
                           src={props.data.user.avatarUrl ? props.data.user.avatarUrl : undefined}/>

    }

    const renderLink = (): React.ReactNode => {
        if (props.data.user.id)
            return <a href={`${(window as any).DOMAIN_BUYER}/passport/${props.data.user.id}`}
                      style={{color: 'black'}}
                      target="_blank">{props.data.user.name}</a>
        else return props.data.user.name;
    }

    const renderLinkOrder = (): React.ReactNode => {
        const {shopOrderCode, shopOrderId} = props.data;
        if (shopOrderCode)
            return <Link to={`/home/order/package/${shopOrderId}`}
                         className="small">ID đơn hàng
                #{shopOrderCode}</Link>;
        else return null;
    }

    return <Row justify={"space-between"}>
        <Space>
            {renderAvatar()}
            <Space direction="vertical" size="small">
                <Typography.Text>{renderLink()}&nbsp;<Tag
                    color="green">{numberWithCommas(props.data.evaluate || 0)} đánh giá hữu
                    ích</Tag></Typography.Text>
                <div style={{marginTop: '-12px'}} css={css`li.ant-rate-star{margin: 0}`}>
                    <Rate key={props.data.id}
                          defaultValue={props.data.rating}
                          disabled={true} count={5}/>
                </div>
            </Space>
        </Space>
        {renderLinkOrder()}
    </Row>
}