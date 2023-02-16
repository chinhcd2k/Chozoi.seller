import * as React from 'react'
import {DatePicker, Space, Select} from "antd"
import styled from 'styled-components'
import {useState} from "react";
import {Moment} from "../../../common/functions/Moment";
import * as Sentry from "@sentry/browser";

const {Option} = Select;
const {RangePicker} = DatePicker;

interface IDisabled {
    today: boolean
    yesterday: boolean
    weekAgo: boolean
    monthAgo: boolean
    followDay: boolean
    followWeek: boolean
    followMonth: boolean
}

export const DatePickerComponent: React.FC<{ disabled: IDisabled, onChaneDate: (timeStart?: string, timeEnd?: string) => any, defaultTime?: any }>
    = ({disabled, onChaneDate, defaultTime}) => {

    const [openSelect, setOpenSelect] = useState(false);
    const [openDate, setOpenDate] = useState(false);
    const [openWeek, setOpenWeek] = useState(false);
    const [openMonth, setOpenMonth] = useState(false);
    const [valueSelect, setValueSelect] = useState<string>(defaultTime);

    const closeAllPicker = () => {
        setOpenDate(false);
        setOpenWeek(false);
        setOpenMonth(false);
    }

    const handleOpenSelect = () => {
        closeAllPicker();
        setTimeout(() => {
            setOpenSelect(!openSelect);
        }, 0)
    };

    const handleOpenDate = () => setOpenDate(!openDate);
    const handleOpenWeek = () => setOpenWeek(!openWeek);
    const handleOpenMonth = () => setOpenMonth(!openMonth);

    const handleOnChange = (value: any) => {
        if (value === "Hôm nay" || value === "Hôm qua" || value === "Trong 7 ngày qua" || value === "Trong 30 ngày qua") {
            closeAllPicker();
            setTimeout(() => {
                handleOpenSelect();
                setValueSelect(value);
            })
            // handle onChangeDay
            if (value === "Hôm nay") {
                onChaneDate(convertDateFC(new Date(), "increment", 0), convertDateFC(new Date(), "increment", 0))
            } else if (value === "Hôm qua") {
                onChaneDate(convertDateFC(new Date(), "decrement", 1), convertDateFC(new Date(), "decrement", 1))
            } else if (value === "Trong 7 ngày qua") {
                onChaneDate(convertDateFC(new Date(), "decrement", 6), convertDateFC(new Date(), "decrement", 0))
            } else {
                onChaneDate(convertDateFC(new Date(), "decrement", 30), convertDateFC(new Date(), "decrement", 0))
            }
        } else if (value === "Theo ngày") {
            setOpenMonth(false);
            setOpenWeek(false);
        } else if (value === "Theo tuần") {
            handleOpenWeek();
            setOpenMonth(false);
            setOpenDate(false);
        } else {
            handleOpenMonth();
            setOpenDate(false);
            setOpenWeek(false);
        }

    }

    const convertDateFC = (date: any, type: "increment" | "decrement", numberDay: number): string => {
        const chooseDate = new Date(date);
        if (type === "increment") {
            chooseDate.setDate(chooseDate.getDate() + numberDay)
            return Moment.getDate(chooseDate.getTime(), "yyyy-mm-dd");
        } else {
            chooseDate.setDate(chooseDate.getDate() - numberDay)
            return Moment.getDate(chooseDate.getTime(), "yyyy-mm-dd");
        }
    }

    const closeAll = () => {
        closeAllPicker();
        setTimeout(() => {
            setOpenSelect(false);
        })
    }

    const handleChangeDate = (dates: any, dateStrings: any) => {
        handleOpenDate();
        setTimeout(() => {
            handleOpenSelect();
        }, 0);
        setValueSelect(dateStrings[0] + " --- " + dateStrings[1]);
        onChaneDate(dateStrings[0], dateStrings[1]);
    }

    const handleChangeWeek = (date: any, dateString: any) => {
        handleOpenWeek();
        setTimeout(() => {
            handleOpenSelect();
        }, 0);
        setValueSelect(dateString);
        onChaneDate(convertDateFC(date, "increment", 0), convertDateFC(date, "increment", 6))
    }

    const handleChangeMonth = (date: any, dateString: any) => {
        handleOpenMonth();
        setTimeout(() => {
            handleOpenSelect();
        }, 0);
        setValueSelect(dateString);
        onChaneDate(convertDateFC(date, "decrement", (new Date(date).getDate()) - 1), convertDateFC(date, "increment", 30 - (new Date(date).getDate())))
    }

    try {
        return (
            <div style={{position: 'relative'}} className={'wrapper-picker'}>
                {
                    openSelect &&
                    <div className={"mask"}
                         onClick={closeAll}
                         style={{position: "fixed", backgroundColor: "rgba(255, 255, 255, 0)", height: "100vh", width: "100vw", zIndex: 1, transform: "translate(-10%, -15%)"}}/>
                }
                <div style={{position: "relative", zIndex: 2}}>
                    <div onClick={handleOpenSelect}
                         style={{height: '100%', width: 240, backgroundColor: 'rgba(255, 255, 255, 0)', position: 'absolute', zIndex: 2}}/>
                    <Space direction={'horizontal'} size={12}>
                        <Select open={openSelect} value={valueSelect} defaultValue="Hôm nay" style={{width: 240}} onChange={value => handleOnChange(value)}>
                            <Option value="Hôm nay" disabled={disabled.today}>Hôm nay</Option>
                            <Option value="Hôm qua" disabled={disabled.yesterday}>Hôm qua</Option>
                            <Option value="Trong 7 ngày qua" disabled={disabled.weekAgo}>Trong 7 ngày qua</Option>
                            <Option value="Trong 30 ngày qua" disabled={disabled.monthAgo}>Trong 30 ngày qua</Option>
                            <Option value="Theo ngày" disabled={disabled.followDay}>
                                <div style={{position: 'relative'}}>
                                    <div onClick={handleOpenDate}>Theo ngày</div>
                                    <div>
                                        <RangePicker open={openDate} value={[null, null]} onChange={handleChangeDate}
                                                     style={{position: 'absolute', transform: 'translate(105%, 0%)'}}
                                        />
                                    </div>
                                </div>
                            </Option>
                            <Option value="Theo tuần" disabled={disabled.followWeek}>
                                <div style={{overflow: "hidden", position: 'relative'}}>
                                    Theo tuần
                                    <DatePicker open={openWeek} picker={"week"} onChange={(date, dateString) => handleChangeWeek(date, dateString)}
                                                style={{position: 'absolute', transform: 'translate(105%, 0%)'}}
                                    />
                                </div>
                            </Option>
                            <Option value="Theo tháng" disabled={disabled.followMonth}>
                                <div style={{overflow: "hidden", position: 'relative'}}>
                                    Theo tháng
                                    <DatePicker picker={'month'} open={openMonth} style={{position: 'absolute', transform: 'translate(105%, 0%)'}}
                                                onChange={(date, dateString) => handleChangeMonth(date, dateString)}
                                    />
                                </div>
                            </Option>
                        </Select>
                    </Space>
                </div>
            </div>
        )
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return null;
    }
}

const FilterTime: React.FC<{ onChaneDate: (time?: string, timeStart?: string, timeEnd?: string) => any, defaultTime?: any }> = ({onChaneDate, defaultTime}) => {
    try {
        return (
            <Style>
                <div style={{display: "flex", alignItems: "flex-end"}}>
                    <DatePickerComponent
                        onChaneDate={(timeStart, timeEnd) => onChaneDate(timeStart, timeEnd)}
                        disabled={{followMonth: false, followWeek: false, followDay: false, monthAgo: false, weekAgo: false, yesterday: false, today: false}}
                        defaultTime={defaultTime}
                    />
                    <span className={'ml-2'}>(Các chỉ số sẽ được so sánh hiệu quả với thời điểm cùng kì trước đó)</span>
                </div>
            </Style>
        )
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return null
    }
}

const Style = styled.div`
  padding: 15px;
  margin: 15px;
  border-radius: 3px;
  background-color: white;
`

export default FilterTime