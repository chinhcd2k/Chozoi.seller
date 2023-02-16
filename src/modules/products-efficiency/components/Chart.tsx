import * as React from 'react';
import {Checkbox, Radio} from 'antd';
import styled from "styled-components";
import {Line} from 'react-chartjs-2';
import {useEffect, useState} from "react";
import {usePrevious} from "../../../common/services/BaseService";
import {IChart} from "../store";
import {getChartChecked, getDataChart} from "../service";

interface IItemCheckBook {
    label: string
    value: any
    disabled: boolean
    defaultChecked?: boolean,
    checked?: boolean
}

const Chart: React.FC<{ state: "ACCESS" | "INTERACTIVE", dataChart: any }> = ({state, dataChart}) => {

    let listCheckInteractive: IItemCheckBook[] = [
        {label: 'Doanh thu', value: "Doanh thu", disabled: false},
        {label: 'Lượt đấu giá', value: "Lượt đấu giá", disabled: false},
        {label: 'Người tham gia', value: "Người tham gia", disabled: false},
        {label: 'Đấu giá thành công', value: "Đấu giá thành công", disabled: false},
        {label: 'Tỉ lệ đấu giá thành công', value: "Tỉ lệ đấu giá thành công", disabled: false},
        {label: 'Thích sản phẩm', value: "Thích sản phẩm", disabled: false},
        {label: 'Chia sẻ sản phẩm', value: "Chia sẻ sản phẩm", disabled: false},
        {label: 'Thêm giỏ hàng', value: "Thêm giỏ hàng", disabled: false},
        {label: 'Tỉ lệ thêm giỏ hàng', value: "Tỉ lệ thêm giỏ hàng", disabled: false},
    ]

    let listCheckAccess: IItemCheckBook[] = [
        {label: 'Tổng lượt xem', value: "Tổng lượt xem", disabled: false},
        {label: 'Lượt xem máy tính', value: "Lượt xem máy tính", disabled: false},
        {label: 'Lượt xem ứng dụng', value: "Lượt xem ứng dụng", disabled: false},
        {label: 'Thời gian xem trung bình', value: "Thời gian xem trung bình", disabled: false},
        {label: 'Tỉ lệ thoát trang', value: "Tỉ lệ thoát trang", disabled: false},
        {label: 'Tổng lượt truy cập', value: "Tổng lượt truy cập", disabled: false},
        {label: 'Lượt truy cập máy tính', value: "Lượt truy cập máy tính", disabled: false},
        {label: 'Lượt truy cập ứng dụng', value: "Lượt truy cập ứng dụng", disabled: false}
    ]

    const defaultChartAccess: string[] = ["Tổng lượt xem", "Lượt xem máy tính", "Lượt xem ứng dụng"];
    const defaultChartInteractive: string[] = ["Doanh thu", "Lượt đấu giá", "Người tham gia"];

    const getDefaultChart = (tab?: string): string [] => {
        if (state === "ACCESS") return defaultChartAccess; else {
            if (tab === "NORMAL") {
                return ["Doanh thu", "Like sản phẩm", "Share sản phẩm"];
            } else
                return defaultChartInteractive
        }
    }

    const [optionsInteractive, setOptionsInteractive] = useState<{ listCheck: IItemCheckBook[] }>({listCheck: listCheckInteractive});
    const [optionsAccess, setOptionsAccess] = useState<{ listCheck: IItemCheckBook[] }>({listCheck: listCheckAccess});
    const [tabRadio, setTabRadio] = useState<"ALL" | "AUCTION" | "NORMAL">("ALL");
    const [valueCheckBox, setValueCheckBox] = useState<any[]>(getDefaultChart());

    const disabledByTabRadio = (value: "ALL" | "AUCTION" | "NORMAL") => {
        // function used to get list checkbook follow tab radio
        const getListCheck = (tab: string): any [] => {
            if (tab === "AUCTION") {
                let newListCheck = [...listCheckInteractive];
                newListCheck[7] = {label: 'Thêm giỏ hàng', value: "Thêm giỏ hàng", disabled: true};
                newListCheck[8] = {label: 'Tỉ lệ thêm giỏ hàng', value: "Tỉ lệ thêm giỏ hàng", disabled: true};
                return newListCheck;
            } else if (tab === "NORMAL") {
                let newListCheck = [...listCheckInteractive];
                newListCheck[1] = {label: 'Lượt đấu giá', value: "Lượt đấu giá", disabled: true};
                newListCheck[2] = {label: 'Người tham gia', value: "Người tham gia", disabled: true};
                newListCheck[3] = {label: 'Đấu giá thành công', value: "Đấu giá thành công", disabled: true};
                newListCheck[4] = {label: 'Tỉ lệ đấu giá thành công', value: "Tỉ lệ đấu giá thành công", disabled: true};
                return newListCheck;
            } else {
                return listCheckInteractive;
            }
        }
        // end function
        setTabRadio(value)
        setTimeout(() => {
            setOptionsInteractive({listCheck: getListCheck(value)})
        }, 0)
    }

    const handleOnChangeRadio = async (value: "ALL" | "AUCTION" | "NORMAL") => {
        clearChart();
        setTabRadio(value);
        setValueCheckBox(getDefaultChart(value));
        let data = await getChart(dataChart.shopId, value, state, dataChart.dateStart, dataChart.dateEnd);
        if (data) {
            setChart(getChartChecked(getDefaultChart(), data));
        }
        if (state === "INTERACTIVE") {
            disabledByTabRadio(value)
        } else {
            setOptionsAccess({listCheck: listCheckAccess})
        }
    }

    const handleCheck = (listChecked: any[]) => {
        setValueCheckBox(listChecked);
        paintChart(listChecked);
        if (listChecked.length >= 4) disableCheck(listChecked); else state === "INTERACTIVE" ? disabledByTabRadio(tabRadio) : setOptionsAccess({listCheck: listCheckAccess})
    }

    // DISABLE WHEN CHECKED 4
    const disableCheck = (list: any[]) => {
        const getNewList = (listChecked: any[]): IItemCheckBook[] => {
            let newList: IItemCheckBook[];
            if (state === "INTERACTIVE") {
                newList = [
                    {label: 'Doanh thu', value: "Doanh thu", disabled: true},
                    {label: 'Lượt đấu giá', value: "Lượt đấu giá", disabled: true},
                    {label: 'Người tham gia', value: "Người tham gia", disabled: true},
                    {label: 'Đấu giá thành công', value: "Đấu giá thành công", disabled: true},
                    {label: 'Tỉ lệ đấu giá thành công', value: "Tỉ lệ đấu giá thành công", disabled: true},
                    {label: 'Thích sản phẩm', value: "Thích sản phẩm", disabled: true},
                    {label: 'Chia sẻ sản phẩm', value: "Chia sẻ sản phẩm", disabled: true},
                    {label: 'Thêm giỏ hàng', value: "Thêm giỏ hàng", disabled: true},
                    {label: 'Tỉ lệ thêm giỏ hàng', value: "Tỉ lệ thêm giỏ hàng", disabled: true},
                ];
            } else {
                newList = [
                    {label: 'Tổng lượt xem', value: "Tổng lượt xem", disabled: true},
                    {label: 'Lượt xem máy tính', value: "Lượt xem máy tính", disabled: true},
                    {label: 'Lượt xem ứng dụng', value: "Lượt xem ứng dụng", disabled: true},
                    {label: 'Thời gian xem trung bình', value: "Thời gian xem trung bình", disabled: true},
                    {label: 'Tỉ lệ thoát trang', value: "Tỉ lệ thoát trang", disabled: true},
                    {label: 'Tổng lượt truy cập', value: "Tổng lượt truy cập", disabled: true},
                    {label: 'Lượt truy cập máy tính', value: "Lượt truy cập máy tính", disabled: true},
                    {label: 'Lượt truy cập ứng dụng', value: "Lượt truy cập ứng dụng", disabled: true}
                ]
            }
            for (let i = 0; i < listChecked.length; i++) {
                for (let j = 0; j < newList.length; j++) {
                    if (listChecked[i] === newList[j].value) {
                        newList[j].disabled = false;
                    }
                }
            }
            return newList;
        }

        setTimeout(() => {
            state === "ACCESS" ? setOptionsAccess({listCheck: getNewList(list)}) : setOptionsInteractive({listCheck: getNewList(list)})
        })
    }

    const preState = usePrevious(state);
    const preDateStart = usePrevious(dataChart.dateStart);
    const preDateEnd = usePrevious(dataChart.dateEnd);
    const [defaultDataChart, setDefaultChart] = useState<IChart>({labels: [], datasets: []});
    const [chart, setChart] = useState<IChart>({
        labels: [],
        datasets: []
    });
    const paintChart = (listLine: string []) => setChart(getChartChecked(listLine, defaultDataChart))
    const clearChart = () => setChart({labels: [], datasets: []})

    const getChart = async (shopId: any, type: "ALL" | "NORMAL" | "AUCTION", state: "ACCESS" | "INTERACTIVE", dateStart: string, dateEnd: string): Promise<any> => {
        try {
            let data = await getDataChart(shopId, type, state, dateStart, dateEnd)
            if (data) {
                setDefaultChart(data);
                return data
            }
        } catch (e) {
            console.error(e)
        }
    }

    const getData = async () => {
        let data = await getChart(dataChart.shopId, tabRadio, state, dataChart.dateStart, dataChart.dateEnd);
        if (data) {
            setChart(getChartChecked(getDefaultChart(), data))
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if ((dataChart.dateStart !== preDateStart || dataChart.dateEnd !== preDateEnd) && preDateStart && preDateEnd) {
            setValueCheckBox(getDefaultChart());
            setTabRadio('ALL');
            clearChart();
            getData()
        }
        if ((state !== preState) && preState) {
            getData();
            clearChart();
        }
        if (preState !== state && preState !== undefined) {
            setValueCheckBox(getDefaultChart());
            setTabRadio('ALL');
        }
    })

    return (
        <Style>
            <div>
                <div className={'font-weight-bold text-dark'}>{`Biểu đồ (${dataChart.dateStart} - ${dataChart.dateEnd})`}</div>
            </div>
            <div className={'my-3'}>
                <div>
                    <span className={'mr-5'} style={{fontSize: 13}}>Kiểu sản phẩm</span>
                    <Radio.Group onChange={(e) => handleOnChangeRadio(e.target.value)} value={tabRadio}>
                        <Radio value={'ALL'} style={{fontSize: 13}}>Tất cả</Radio>
                        <Radio value={'AUCTION'} style={{fontSize: 13}}>Sản phẩm đấu giá</Radio>
                        <Radio value={'NORMAL'} style={{fontSize: 13}}>Sản phẩm thường</Radio>
                    </Radio.Group>
                </div>
                <div className={'mt-2'}>
                    <span className={'mr-5'} style={{fontSize: 13, marginTop: 8}}>Tương tác sản phẩm</span>
                    <Checkbox.Group onChange={handleCheck} value={valueCheckBox}>
                        {
                            ((state === "INTERACTIVE") ? optionsInteractive : optionsAccess).listCheck.map((value, index) =>
                                <Checkbox key={index} defaultChecked={true} value={value.value} disabled={value.disabled}
                                          checked={true}>{value.label}</Checkbox>)
                        }
                    </Checkbox.Group>
                </div>
            </div>
            <div>
                <Line data={chart} height={80}/>
            </div>
        </Style>
    )
}

const Style = styled.div`
  background-color: white;
  padding: 15px;
  margin: 0 15px 15px 15px;
  border-radius: 3px;

  .ant-checkbox-wrapper {
    span {
      font-size: 13px;
    }
  }
`

export default Chart;