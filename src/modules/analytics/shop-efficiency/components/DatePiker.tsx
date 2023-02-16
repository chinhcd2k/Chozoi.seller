import * as React from 'react'
import {DatePicker, Space, Select} from "antd"
import {useEffect, useState} from "react";
import {Moment} from "../../../../common/functions/Moment";
import {store} from "../stores/ShopEfficiencyStore";

const {Option} = Select;

interface IDatePicker {
  onChoseDate: (startTime: string, endTime: string, type: string) => any
}

export const DatePickerComponent: React.FC<IDatePicker> = ({onChoseDate}) => {
  const [openSelect, setOpenSelect] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [openWeek, setOpenWeek] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [valueSelect, setValueSelect] = useState<string>("Hôm nay");
  const datePiker = React.createRef<HTMLDivElement>();
  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })
  const handleClickOutside = (e: any) => {
    const node = datePiker.current;
    const {target} = e;
    if (node) {
      if (!node.contains(target)) {
        setOpenSelect(false);
      }
    }
  }
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
    let startDate: string = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let lastStartDate: string = '';
    let endDate: string = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let lastEndDate: string = '';
    let yesterday: Date = new Date();
    switch (value) {
      case "Hôm nay":
        closeAllPicker();
        setTimeout(() => {
          handleOpenSelect();
          setValueSelect(value);
        })
        endDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        onChoseDate(endDate, endDate, value);
        break;
      case "Hôm qua":
        closeAllPicker();
        setTimeout(() => {
          handleOpenSelect();
          setValueSelect(value);
        })
        yesterday.setDate(yesterday.getDate() - 1);
        endDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        onChoseDate(endDate, endDate, value);
        break;
      case "Trong 7 ngày qua":
        closeAllPicker();
        setTimeout(() => {
          handleOpenSelect();
          setValueSelect(value);
        });
        endDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 6);
        startDate = Moment.getDate(yesterday.getTime(), 'yyyy-mm-dd', false);
        yesterday.setDate(yesterday.getDate() - 1);
        lastEndDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 6);
        lastStartDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        onChoseDate(startDate, endDate, value);
        break;
      case "Trong 30 ngày qua":
        closeAllPicker();
        setTimeout(() => {
          handleOpenSelect();
          setValueSelect(value);
        });
        endDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 30);
        startDate = Moment.getDate(yesterday.getTime(), 'yyyy-mm-dd', false);
        yesterday.setDate(yesterday.getDate() - 1);
        lastEndDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        yesterday.setDate(yesterday.getDate() - 30);
        lastStartDate = Moment.getDate(yesterday.getTime(), "yyyy-mm-dd", false);
        onChoseDate(startDate, endDate, value);
        break;
      default:
        if (value === "Theo ngày") {
          handleOpenDate();
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
        // const day: Date = new Date(valueSelect);
        // store.filterDateValue = Moment.getDate(valueSelect, "dd/mm/yyyy", false);
        // day.setDate(day.getDate() - 1);
        // startDate = Moment.getDate(day.getTime(), "yyyy-mm-dd", false);
        // endDate = Moment.getDate(valueSelect, "yyyy-mm-dd", false);
        break;
    }
    // if (value === "Hôm nay" || value === "Hôm qua" || value === "Trong 7 ngày qua" || value === "Trong 30 ngày qua") {
    //     closeAllPicker();
    //     setTimeout(() => {
    //         handleOpenSelect();
    //         setValueSelect(value);
    //     })
    // } else if (value === "Theo ngày") {
    //     handleOpenDate();
    //     setOpenMonth(false);
    //     setOpenWeek(false);
    // } else if (value === "Theo tuần") {
    //     handleOpenWeek();
    //     setOpenMonth(false);
    //     setOpenDate(false);
    // } else {
    //     handleOpenMonth();
    //     setOpenDate(false);
    //     setOpenWeek(false);
    // }

  }

  const handleChangeDate = (date: any, dateString: any) => {
    // let startDate:string;
    let endDate: string;

    handleOpenDate();
    setTimeout(() => {
      handleOpenSelect();
    }, 0);
    setValueSelect(dateString);

    const day: Date = new Date(dateString);
    store.filterDateValue = Moment.getDate(dateString, "dd/mm/yyyy", false);
    day.setDate(day.getDate() - 1);
    // startDate = Moment.getDate(day.getTime(), "yyyy-mm-dd", false);
    endDate = Moment.getDate(dateString, "yyyy-mm-dd", false);
    onChoseDate(endDate, endDate, "Theo ngày");
  }

  const handleChangeWeek = (date: any, dateString: any) => {
    handleOpenWeek();
    setTimeout(() => {
      handleOpenSelect();
    }, 0);
    const startDate: string = Moment.getDate(new Date(date).getTime(), "yyyy-mm-dd", false);
    let endDate: Date = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const startTime = Moment.getDate(new Date(date).getTime(), "yyyy-mm-dd", false);
    const endTime = Moment.getDate(endDate.getTime(), "yyyy-mm-dd", false);
    setValueSelect(`${startTime}/${endTime}`);
    onChoseDate(startTime, endTime, "Theo tuần");
  }

  const handleChangeMonth = (date: any, dateString: any) => {
    handleOpenMonth();
    setTimeout(() => {
      handleOpenSelect();
    }, 0);
    const dateStart: string = `${dateString}-01`
    let endDate: Date = new Date(dateStart);
    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
    const startDate: Date = new Date(dateStart);
    const startTime: string = Moment.getDate(startDate.getTime(), "yyyy-mm-dd", false)
    const endTime: string = Moment.getDate(endDate.getTime(), "yyyy-mm-dd", false)
    setValueSelect(`${startTime}/${endTime}`);
    onChoseDate(startTime, endTime, "Theo tháng");
  }
  return (
    <div style={{position: 'relative'}} ref={datePiker}>
      <div onClick={handleOpenSelect}
           style={{
             height: '100%',
             width: 200,
             backgroundColor: 'rgba(255, 255, 255, 0)',
             position: 'absolute',
             zIndex: 1
           }}
      />
      <Space direction={'horizontal'} size={12}>
        <Select
          open={openSelect} value={valueSelect} defaultValue="Hôm nay" style={{width: 200}}
          onChange={(value) => {
            handleOnChange(value)
          }}
        >
          <Option value="Hôm nay">Hôm nay</Option>
          <Option value="Hôm qua">Hôm qua</Option>
          <Option value="Trong 7 ngày qua">Trong 7 ngày qua</Option>
          <Option value="Trong 30 ngày qua">Trong 30 ngày qua</Option>
          <Option value="Theo ngày">
            <div style={{overflow: "hidden", position: 'relative'}}>
              Theo ngày
              <DatePicker open={openDate}
                          onChange={(date, dateString) => {
                            handleChangeDate(date, dateString)
                          }}
                          style={{position: 'absolute', transform: 'translate(105%, 0%)'}}
              />
            </div>
          </Option>
          <Option value="Theo tuần">
            <div style={{overflow: "hidden", position: 'relative'}}>
              Theo tuần
              <DatePicker open={openWeek}
                          picker={"week"}
                          onChange={(date, dateString) => {
                            handleChangeWeek(date, dateString)
                          }}
                          style={{position: 'absolute', transform: 'translate(105%, 0%)'}}
              />
            </div>
          </Option>
          <Option value="Theo tháng">
            <div style={{overflow: "hidden", position: 'relative'}}>
              Theo tháng
              <DatePicker picker={'month'} open={openMonth}
                          onChange={(date, dateString) => {
                            handleChangeMonth(date, dateString)
                          }}
                          style={{
                            position: 'absolute',
                            transform: 'translate(105%, 0%)'
                          }}
              />
            </div>
          </Option>
        </Select>
      </Space>
    </div>
  )
}