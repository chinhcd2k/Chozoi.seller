import * as React from 'react';
import {Table} from "antd";
import * as Sentry from '@sentry/browser';
import {numberWithCommas} from "../../../common/functions/FormatFunc";
import styled from "styled-components";

const TopProductType: React.FC<any> = () => {

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
                render: (data: string) => <div>{data}</div>
            },
            {
                key: 'revenue',
                dataIndex: 'revenue',
                title: 'Doanh thu',
                render: (data: number) => <div>{numberWithCommas(data)} đ</div>
            }
        ]

    const data = [
        {
            key: 1,
            top: 1,
            product: 'product',
            revenue: 1500000
        }
    ]

    try {
        return (
            <Style>
                <div className={'font-weight-bold text-dark'}>Xếp hạng ngành hàng (top 5)</div>
                <div className={'my-4'}>
                <span style={{fontSize: 13, padding: '5px 15px', backgroundColor: '#007AFF', color: 'white', borderRadius: 3, cursor: 'pointer'}}>
                    Theo doanh thu
                </span>
                </div>
                <Table columns={columns} dataSource={data} bordered size={'small'} pagination={false}/>
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
  padding: 15px;
  border-radius: 3px;
  width: 45%;
  margin-right: 15px;
  display: none;

  Table {
    font-size: 13px;

    th {
      font-weight: bold;
    }
  }
`

export default TopProductType