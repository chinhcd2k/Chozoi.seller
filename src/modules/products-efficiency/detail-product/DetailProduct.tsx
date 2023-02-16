import React, {useEffect, useState} from 'react';
import {Space, Select, Table, Pagination} from "antd";
import {DatePickerComponent} from "../components/FilterTime";
import store from "../store";
import {useObserver} from "mobx-react";
import App from "../../../App";
import styled from "styled-components";
import {store as HomeStore} from "../../home";
import {BreadcrumbsService} from "../../../common/breadcrumbs";
import {ExportCSV} from "../../../common/export-excel/ExportCSV";
import {store as ShopInfo} from "../../shop/stores/ShopInfomationStore";
import {Moment} from "../../../common/functions/Moment";

const {Option} = Select;

const columnsAccess = [
  {
    title: 'Sản phẩm',
    dataIndex: 'productName',
    key: 'productName',
    render: (data: any) => <a href={`/home/product/detail/${data.id}`} style={{fontWeight: "bold"}}>{data.value}</a>,
  },
  {
    title: 'Lượt xem',
    dataIndex: 'view',
    width: 150,
    key: 'view',
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt xem máy tính',
    dataIndex: 'viewPC',
    key: 'viewPC',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt xem ứng dụng',
    dataIndex: 'viewApp',
    key: 'viewApp',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt truy cập',
    dataIndex: 'access',
    key: 'access',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt truy cập máy tính',
    dataIndex: 'accessPC',
    key: 'accessPC',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt truy cập ứng dụng',
    dataIndex: 'accessApp',
    key: 'accessApp',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Thời gian xem trung bình',
    dataIndex: 'timeAvg',
    key: 'timeAvg',
    width: 150,
    render: (text: any) => <div>{text ? text : "___"}</div>,
  },
  {
    title: 'Tỉ lệ thoát trang',
    dataIndex: 'exitPage',
    key: 'exitPage',
    width: 150,
    render: (text: any) => <div>{text ? text.toFixed(2) + "%" : "___"}</div>,
  },
]

const columnsInteractive = [
  {
    title: 'Sản phẩm',
    dataIndex: 'productName',
    key: 'productName',
    render: (data: any) => <a href={`/home/product/detail/${data.id}`} style={{fontWeight: "bold"}}>{data.value}</a>,
  },
  {
    title: 'Doanh thu',
    dataIndex: 'revenue',
    key: 'revenue',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Lượt đấu giá',
    dataIndex: 'auction',
    width: 150,
    key: 'auction',
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Người tham gia',
    dataIndex: 'peopleJoin',
    key: 'peopleJoin',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Đấu giá thành công',
    dataIndex: 'auctionSuccess',
    key: 'auctionSuccess',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Tỉ lệ đấu giá thành công',
    dataIndex: 'percentAucSuc',
    key: 'percentAucSuc',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Thích sản phẩm',
    dataIndex: 'likePro',
    key: 'likePro',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Chia sẻ sản phẩm',
    dataIndex: 'sharePro',
    key: 'sharePro',
    width: 150,
    render: (data: any) => <div>{renderItemTable(data)}</div>,
  },
  {
    title: 'Thêm giỏ hàng',
    dataIndex: 'addCart',
    key: 'addCart',
    width: 150,
    render: (text: any) => <div>{text ? text : "___"}</div>,
  },
  {
    title: 'Tỉ lệ thêm giỏ hàng',
    dataIndex: 'percentAddCart',
    key: 'percentAddCart',
    width: 150,
    render: (text: any) => <div>{text ? text.toFixed(2) + "%" : "___"}</div>,
  },
]

const renderItemTable = (data: any) => {
  const renderPercent = () => {
    if (data.percent) {
      if (data.percent !== -1) {
        if (isFinite(data.percent)) return "(" + data.percent.toFixed(2) + "%)"
        else return <span/>
      } else return <span/>
    } else return <span>___</span>
  }
  return (
    <div>
      <span className={"mr-2"}>{data.value ? data.value : "___"}</span>
      <span>{renderPercent()}</span>
    </div>
  )
}

const Tab: React.FC<{ tab: 'ALL' | 'AUCTION' | 'NORMAL', onChangeTab: (tab: 'ALL' | 'AUCTION' | 'NORMAL') => any,select:any }> = ({
                                                                                                                         tab,
                                                                                                                         onChangeTab,select
                                                                                                                       }) => {
  const styleActive = (tabActive: 'ALL' | 'AUCTION' | 'NORMAL', tabName: 'ALL' | 'AUCTION' | 'NORMAL'): React.CSSProperties => {
    const style: React.CSSProperties = {backgroundColor: '#007AFF', borderRadius: 4, color: 'white'};
    if (tabActive === tabName) return style;
    return {}
  }
  return useObserver (()=>
    <div className="d-flex justify-content-between" style={{backgroundColor: "white", padding: 15, margin: 15, borderRadius: 4,alignItems:"center"}}>
      <div style={{display: "flex", alignItems: "center", fontWeight: 'bold'}}>
        <div onClick={() => onChangeTab('ALL')}
             style={{...styleActive(tab, 'ALL'), padding: '8px 25px', cursor: "pointer"}}>Tất cả
        </div>
        <div onClick={() => onChangeTab('AUCTION')}
             style={{...styleActive(tab, 'AUCTION'), padding: '8px 25px', cursor: "pointer"}}>
          Sản phẩm đấu giá
        </div>
        <div onClick={() => onChangeTab('NORMAL')}
             style={{...styleActive(tab, 'NORMAL'), padding: '8px 25px', cursor: "pointer"}}>
          Sản phẩm thường
        </div>
      </div>
      {select==="access"?
        <div className="export-excel">
          <ExportCSV csvData={store.exportDetailAllAccess} fileName={`${ShopInfo.shopProfile!.name}/hieuquasanpham/${Moment.getDate(Date.now(), "dd-mm-yyyy")}`} sheetName={tab}/>
        </div>:
        <div className="export-excel">
          <ExportCSV csvData={store.exportDetailAllInteractive} fileName={`${ShopInfo.shopProfile!.name}/hieuquasanpham/${Moment.getDate(Date.now(), "dd-mm-yyyy")}`} sheetName={tab}/>
        </div>
      }
    </div>
  )
}

const Filter: React.FC<{
  onChangeTime: (dateStart: string, dateEnd: string) => any,
  onChangeSelect: (state: string) => any, defaultSelect: "access" | "interactive",
  defaultTime: any
}> = ({onChangeTime, onChangeSelect, defaultSelect, defaultTime}) => {
  return (
    <div style={{backgroundColor: "white", padding: 15, margin: 15, borderRadius: 4}}>
      <Space direction={'horizontal'} size={12}>
        <DatePickerComponent
          onChaneDate={(dateStart, dateEnd) => onChangeTime(dateStart as string, dateEnd as string)}
          disabled={{
            today: false,
            followDay: false,
            followWeek: false,
            weekAgo: false,
            followMonth: false,
            monthAgo: false,
            yesterday: false
          }}
          defaultTime={defaultTime}
        />
        <Select defaultValue={defaultSelect} style={{width: 220}} onChange={onChangeSelect}>
          <Option value="access">Truy cập sản phẩm</Option>
          <Option value="interactive">Tương tác sản phẩm</Option>
        </Select>
      </Space>
    </div>
  )
}

const DetailProduct: React.FC<{ history: any }> = ({history}) => {

  const urlParams = new URLSearchParams(window.location.search);
  const page: number = parseInt(urlParams.get("page") || '0');
  const type = urlParams.get("type") || "ALL";
  const state = urlParams.get("state") || "access";
  const dateStart = urlParams.get("dateStart");
  const dateEnd = urlParams.get("dateEnd");

  const [tab, setTab] = useState<'ALL' | 'AUCTION' | 'NORMAL'>(type as 'ALL' | 'AUCTION' | 'NORMAL');
  const [select, setSelect] = useState(state);

  const setSearchParams = (page: any, type: any, state: any, dateStart: any, dateEnd: any) => {
    App.history.push(`?type=${type}&state=${state}&dateStart=${dateStart}&dateEnd=${dateEnd}&page=${page}&size=10`)
  }


  const onChangePagination = (page: number) => setSearchParams(page - 1, type, state, dateStart, dateEnd)
  const onChangTab = (tabActive: 'ALL' | 'AUCTION' | 'NORMAL') => {
    setTab(tabActive);
    setSearchParams(0, tabActive, state, dateStart, dateEnd)
  }
  const onChangeDate = (dateStart: string, dateEnd: string) => setSearchParams(page, type, state, dateStart, dateEnd)
  const onChangeState = (stateActive: string) => {
    setSelect(stateActive);
    setSearchParams(page, type, stateActive, dateStart, dateEnd)
  }

  useEffect(() => {
    HomeStore.menuActive = [5, 1]
    BreadcrumbsService.loadBreadcrumbs([{title: "Hiệu quả sản phẩm"}, {title: "Chi tiết"}])
    if (history.location.search) {
      store.getDataDetail(type as 'ALL' | 'AUCTION' | 'NORMAL', dateStart as string, dateEnd as string, state as 'interactive' | 'access', page);
    }
  }, [dateEnd, dateStart, history.location.search, page, state, type]);

  return useObserver(() => (
    <Style>
      <Tab tab={tab} onChangeTab={(tab) => onChangTab(tab)} select={select}/>
      <Filter
        onChangeTime={onChangeDate}
        onChangeSelect={(stateActive) => onChangeState(stateActive)}
        defaultSelect={state as "access" | "interactive"}
        defaultTime={dateStart + " --- " + dateEnd}
        // defaultTime={"Hôm nay"}
      />
      <div style={{backgroundColor: "white", padding: 15, margin: 15, borderRadius: 4}}>
        {
          select === "access" ?
            <Table bordered columns={columnsAccess} dataSource={store.dataTableDetailAccess}
                   pagination={false}
                   loading={store.statusLoading}/>
            :
            <Table bordered columns={columnsInteractive}
                   dataSource={store.dataTableDetailInteractive}
                   pagination={false}
                   loading={store.statusLoading}/>
        }
        <div className={'d-flex justify-content-end mt-3'}>
          <Pagination current={store.metadata.page + 1}
                      total={store.metadata.total}
                      pageSize={10}
                      onChange={onChangePagination}
          />
        </div>
      </div>
    </Style>
  ))
}

const Style = styled.div`
  table {
    tr:first-child {
      font-weight: bold;
      color: #1b7ee0;
    }

    th {
      font-weight: bold;
    }
  }
`

export default DetailProduct;