import * as React from 'react';
import * as Sentry from '@sentry/browser';
import {useEffect, useState} from "react";
import {Table} from "antd";
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import styled from "styled-components";
import store from "../store";
import {store as ProfileStore} from "../../profile/stores/ProfileStore";
import {useObserver} from "mobx-react";

const TopProduct: React.FC<{ dateStart: any, dateEnd: any }> = ({dateStart, dateEnd}) => {

    const [tab, setTab] = useState<'revenue' | 'view' | 'visit' | 'conversion-rate'>('revenue');
    const onChangeTab = (tabName: 'revenue' | 'view' | 'visit' | 'conversion-rate') => {
        setTab(tabName);
    }

    const styleActiveTab = (tabName: 'revenue' | 'view' | 'visit' | 'conversion-rate', tabActive: 'revenue' | 'view' | 'visit' | 'conversion-rate'): React.CSSProperties => {
        const style: React.CSSProperties = {backgroundColor: '#007AFF', borderRadius: 3, color: "white", padding: '5px 15px'}
        if (tabName === tabActive) return style; else return {padding: '5px 15px'}
    }

    const Header = () => {
        return (
            <div className={'d-flex justify-content-between align-items-end'}>
                <div className={'font-weight-bold text-dark'}>Xếp hạng sản phẩm (top 5)</div>
            </div>
        )
    }

    const Tab = () => {
        return (
            <div className={'d-flex justify-content-between align-items-center my-3'} style={{fontSize: 13, cursor: 'pointer'}}>
                <div onClick={() => onChangeTab('revenue')} style={styleActiveTab('revenue', tab)}>Theo doanh thu</div>
                <div onClick={() => onChangeTab('view')} style={styleActiveTab('view', tab)}>Theo lượt xem</div>
                <div onClick={() => onChangeTab('visit')} style={styleActiveTab('visit', tab)}>Theo lượt truy cập</div>
                <div onClick={() => onChangeTab('conversion-rate')} style={styleActiveTab('conversion-rate', tab)}>Theo tỉ lệ chuyển đổi</div>
            </div>
        )
    }

    const getTitle = (): string => {
        if (tab === "revenue") return "Doanh thu";
        else if (tab === "view") return "Lượt xem";
        else if (tab === "visit") return "Truy cập";
        else return "Tỉ lệ";
    }

    const getSuffix = (): string => {
        if (tab === "revenue") return "đ";
        else if (tab === "conversion-rate") return "%";
        else return ""
    }

    const columns =
        [
            {
                key: 'top',
                dataIndex: 'top',
                title: 'Top',
                render: (data: number) => <div style={{fontWeight: 'bold'}}>{data}</div>
            },
            {
                key: 'product',
                dataIndex: 'product',
                title: 'Sản phẩm',
                render: (data: { image: string, name: string, price: number }) =>
                    <div className={'d-flex'}>
                        <div style={{height: 80, width: 80,flexShrink:'initial'}}>
                            <img src={data.image} alt="img" className={'img-fluid'}/>
                        </div>
                        <div className={'ml-4'}>
                            <div style={{fontWeight: 'bold',width:"300px",wordWrap:"break-word"}}>{data.name}</div>
                          {(data.price !==0)? <div>{data.price!==null?numberWithCommas(data.price):""} đ</div>:""}
                        </div>
                    </div>
            },
            {
                key: 'revenue',
                dataIndex: 'revenue',
                title: getTitle(),
                render: (data: number) => <div>{numberWithCommas(data)} {getSuffix()}</div>
            }
        ]


    useEffect(() => {
        store.getDataProductRanking(ProfileStore.profile!.shopId, dateStart, dateEnd, tab)
    }, [dateStart, dateEnd, tab]);

    try {
        return useObserver(() =>
            <Style>
                {Header()}
                {Tab()}
                <Table loading={store.statusLoadRank} columns={columns} dataSource={store.dataTableProductRanking} bordered size={'small'} pagination={false} style={{fontSize: 13}}/>
            </Style>
        )
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return null;
    }
}

const Style = styled.div`
  background-color: white;
  margin: 0 15px 0 15px;
  padding: 15px;
  border-radius: 3px;
  width: 55%;

  Table {
    font-size: 13px;

    th {
      font-weight: bold;
    }
  }
`

export default TopProduct;