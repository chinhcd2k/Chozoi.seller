import React from "react";
import {Button} from "antd";
import {css} from "@emotion/core";
import {StatusCampaign} from "./StatusCampaign";
import {Moment} from "../../../common/functions/Moment";

interface IItemDataSource {
    id: number
    title: string
    state: "finished" | "processing" | "comingsoon" | string
    banner: string
    shopCondition: boolean
    timeRegisterBegin: string
    timeRegisterEnd: string
    timeStartBegin: string
    timeStartEnd: string
    shopStatus: "none" | "qualify" | "pending" | "approve" | "joined"
}

interface IProps {
    dataSource: IItemDataSource[],
    onChange: (id: number) => any
}

export const TimeSlot: React.FC<IProps> = (props) => {
    const renderAction = (item: IItemDataSource): React.ReactNode => {
        if (item.state === "comingsoon" && item.shopCondition) {
            return <Button type={"primary"}
                           onClick={() => props.onChange(item.id)}
                           size={"small"}>Đăng ký sản phẩm</Button>;
        } else if ((item.shopStatus === "joined" || item.shopStatus === "pending") && item.state !== "comingsoon" && item.shopCondition) {
            return <Button type={"primary"}
                           style={{backgroundColor: "#ffb80f", borderColor: "#ffb80f"}}
                           onClick={() => props.onChange(item.id)}
                           size={"small"}>Xem chi tiết</Button>;
        } else return null;
    };

    if (props.dataSource.length > 0) {
        const style = {
            ul: {
                listStyle: "none",
                paddingLeft: 0
            },
            div_container: {
                display: "flex",
                alignItems: "center",
                padding: "8px 0"
            },
            li_div_1: {
                width: "280px"
            },
            li_div_1_img: {
                maxWidth: "280px",
                maxHeight: "120px"
            },
            li_div_2: {
                flexGrow: 1,
                paddingLeft: "16px",
                alignSelf: "flex-start"
            },
            li_div_3: {
                textAlign: "end"
            }
        };
        const enumState: any = {
            finished: "FINISH",
            processing: "HAPPENING",
            comingsoon: "UPCOMING"
        };
        return (<ul style={style.ul} css={css`li:not(:first-of-type) {border-top: dashed 1px #d9d9d9;}`}>
            {props.dataSource.map((value, index) =>
                <li key={value.id}>
                    <div style={style.div_container}>
                        <div style={style.li_div_1}>
                            <img style={style.li_div_1_img}
                                 src={value.banner}
                                 alt=""/>
                        </div>
                        <div style={style.li_div_2}>
                            <p>
                                <StatusCampaign type={enumState[value.state]}/>
                                <span className="font-weight-bold">&nbsp;{value.title}</span>
                            </p>
                            <p>Thời gian chương trình: Từ {Moment.getTime(value.timeRegisterBegin, "hh:mm")}
                                &nbsp;- {Moment.getDate(value.timeRegisterBegin, "dd/mm/yyyy")} đến
                                &nbsp;{Moment.getTime(value.timeRegisterEnd, "hh:mm")}
                                &nbsp;- {Moment.getDate(value.timeRegisterEnd, "dd/mm/yyyy")}</p>
                            <p>Khung {index + 1}: Từ {Moment.getTime(value.timeStartBegin, "hh:mm")}
                                &nbsp;- {Moment.getDate(value.timeStartBegin, "dd/mm/yyyy")} đến
                                &nbsp;{Moment.getTime(value.timeStartEnd, "hh:mm")}
                                &nbsp;- {Moment.getDate(value.timeStartEnd, "dd/mm/yyyy")}</p>
                        </div>
                        <div>{renderAction(value)}</div>
                    </div>
                </li>)}
        </ul>);
    } else return null;
}
