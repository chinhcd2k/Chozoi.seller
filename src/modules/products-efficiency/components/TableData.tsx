import * as React from 'react'
import styled from "styled-components";
import {Link} from "react-router-dom";
import {useState} from "react";
import {Table, Tooltip} from 'antd';
import * as Sentry from '@sentry/browser';
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import {Moment} from "../../../common/functions/Moment";
import store from "../store";
import {useObserver} from "mobx-react";
import {ExportCSV} from "./ExportExcel";
import {store as ShopInfo} from "../../shop/stores/ShopInfomationStore"

interface IProps {
  onChange?: (tabName: 'INTERACTIVE' | 'ACCESS') => any,
  defaultTab?: 'INTERACTIVE' | 'ACCESS',
}

export interface IDataTable {
  num: any,
  percent: number,
  type: 'up' | 'down',
  isString?: boolean,
  suffixes?: string
}

const TableData: React.FC<IProps> = ({onChange, defaultTab}) => {
  // function logic
  const [tab, setTab] = useState<'INTERACTIVE' | 'ACCESS'>(defaultTab as 'INTERACTIVE' | 'ACCESS');
  const activeTab = (tabName: 'INTERACTIVE' | 'ACCESS', tabActive: 'INTERACTIVE' | 'ACCESS') => {
    if (tabName === tabActive) return true; else return false;
  }
  const onChangeTab = (tabName: 'INTERACTIVE' | 'ACCESS') => {
    setTab(tabName);
    onChange && onChange(tabName);
  }
  // function to render
  const Tab = () => {
    return (
      <div className={'d-flex justify-content-between align-items-end '}>
        <div className={'tab'}>
                    <span className={`tab-item ${activeTab('INTERACTIVE', tab) ? 'tab-item-active' : ''}`}
                          onClick={() => onChangeTab('INTERACTIVE')}>
                        Tương tác sản phẩm
                    </span>
          <span className={`tab-item ml-5 ${activeTab('ACCESS', tab) ? 'tab-item-active' : ''}`}
                onClick={() => onChangeTab('ACCESS')}>
                        Truy cập sản phẩm
                    </span>
        </div>
        <div className={'link'}>
          <Link
            to={`/home/products-efficiency/detail-product?type=ALL&state=access&dateStart=${Moment.getDate(new Date(Date.now()).toDateString(), "yyyy-mm-dd")}&dateEnd=${Moment.getDate(new Date(Date.now()).toDateString(), "yyyy-mm-dd")}&page=0&size=10`}>
            Xem chi tiết sản phẩm
          </Link>
        </div>
      </div>
    )
  }
  // table
  const Item = (data: IDataTable, type?: "ACCESS" | "INTERACTIVE") => {
    const getValue = () => {
      if (data.isString) {
        if (data.num)
          return data.num.toFixed(2) + (data.suffixes ? data.suffixes : ""); else return "___"
      } else {
        if (data.num)
          return data.num + (data.suffixes ? data.suffixes : ""); else return "___"
      }
    }
    return (
      <div style={{fontSize: 14}}>
                    <span>
                        {
                          type === "INTERACTIVE" ?
                            <span style={{marginRight: 15}}>{getValue()}</span> :
                            <span style={{marginRight: 15}}>{getValue()}</span>
                        }
                    </span>

        <span>
                        {
                          data.percent ?
                            <span>{data.type === 'up' ? <i className="fas fa-long-arrow-alt-up text-success"/> :
                              <i
                                className="fas fa-long-arrow-alt-down text-danger"/>}{+data.percent.toFixed(2)}%</span> : "___"
                        }
                    </span>
      </div>
    )
  }

  const columns = [
    {
      title: '',
      dataIndex: 'title',
      key: 'title',
      render: (title: { value: string, hover: string }) =>
        <div style={{fontWeight: 'bold'}}>
          <span className={'mr-2'}>{title.value}</span>
          <Tooltip placement="topLeft" title={title.hover}>
            <i className="fa fa-info-circle"
               data-toggle="tooltip"
               data-placement="top"
            />
          </Tooltip>
        </div>,
    },
    {
      title: 'Tất cả',
      dataIndex: 'all',
      key: 'all',
      render: (data: IDataTable) => Item(data, tab),
    },
    {
      title: 'Sản phẩm thường',
      dataIndex: 'productNormal',
      key: 'productNormal',
      render: (data: IDataTable) => Item(data, tab),
    },
    {
      title: 'Sản phẩm đấu giá',
      dataIndex: 'productBid',
      key: 'product-bid',
      render: (data: IDataTable) => Item(data, tab),
    }
  ]

  try {
    return useObserver(() =>
      <Style>
        {Tab()}
        <Table columns={columns} dataSource={store.dataTable} pagination={false} size={'middle'} style={{marginTop: 20}}
               bordered
               loading={store.statusLoading}/>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 30}}>
          {
            tab === "INTERACTIVE" ?
              <ExportCSV dataCSV={{
                all: store.exportOverviewAllInteractive,
                normal: store.exportOverviewNormalInteractive,
                auction: store.exportOverviewAuctionInteractive
              }}
                         fileName={`${ShopInfo.shopProfile!.name}/hieuquasanpham/${Moment.getDate(Date.now(), "dd-mm-yyyy")}`}
              />
              : <ExportCSV dataCSV={{
                all: store.exportOverviewAllAccess,
                normal: store.exportOverviewNormalAccess,
                auction: store.exportOverviewAuctionAccess
              }}
                           fileName={`${ShopInfo.shopProfile!.name}/hieuquasanpham/${Moment.getDate(Date.now(), "dd-mm-yyyy")}`}
              />
          }
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
  padding: 30px 15px;
  margin: 15px;

  background-color: white;
  border-radius: 3px;

  table {
    th {
      font-weight: bold;
    }
  }

  .tab {
    font-weight: bold;
    cursor: pointer;

    .tab-item-active {
      background-color: #007AFF;
      color: white;
      padding: 8px 15px;
      border-radius: 3px;
    }
  }

  .link {
    font-size: 12px;
  }
`

export default TableData