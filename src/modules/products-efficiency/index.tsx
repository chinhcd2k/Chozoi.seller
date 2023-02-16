import * as React from 'react'
import FilterTime from "./components/FilterTime";
import TableData from "./components/TableData";
import TopProduct from "./components/TopProduct";
import TopProductType from "./components/TopProductType";
import Chart from "./components/Chart";
import App from "../../App";
import {useEffect, useState} from "react";
import {useObserver} from "mobx-react";
import store from "./store";
import * as Sentry from "@sentry/browser";
import {store as ProfileStore} from "../profile/stores/ProfileStore";
import {BreadcrumbsService} from "../../common/breadcrumbs";
import {store as HomeStore} from "../home/stores/HomeStore"

const ProductsEfficiency: React.FC<{ history: any }> = ({history}) => {

    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get("state");
    const timeStart = urlParams.get("timeStart");
    const timeEnd = urlParams.get("timeEnd");

    const [dateStart, setDateStart] = useState(timeStart);
    const [dateEnd, setDateEnd] = useState(timeEnd);

    // const preSearchParam = usePrevious(history.location.search);
    const [tabs, setTabs] = useState<"ACCESS" | "INTERACTIVE">(state as "ACCESS" | "INTERACTIVE");

    const pushParams = (state?: any, timeStart?: any, timeEnd?: any) => {
        let params = `?state=${state}&timeStart=${timeStart}&timeEnd=${timeEnd}`;
        App.history.push(params);
    }

    const handleOnChangeTab = (tabs: "INTERACTIVE" | "ACCESS") => {
        pushParams(tabs, timeStart, timeEnd);
        setTabs(tabs);
    }

    const handleOnChangeDate = (timeStart: any, timeEnd: any) => {
        setDateStart(timeStart);
        setDateEnd(timeEnd);
        pushParams(state, timeStart, timeEnd)
    }

    const getData = async (state: "ACCESS" | "INTERACTIVE", dateStart: any, dateEnd: any) => {
        store.getDataOverview(state, dateStart, dateEnd);
    }

    useEffect(() => {
        if (history.location.search) {
            getData(state as "ACCESS" | "INTERACTIVE", timeStart, timeEnd)
        }
        HomeStore.menuActive = [5, 1]
        BreadcrumbsService.loadBreadcrumbs([{title: "Hiệu quả sản phẩm"}])
    }, [state, timeEnd, timeStart, history.location.search])

    try {
        return useObserver(() =>
            <div style={{position: 'relative'}}>
                <FilterTime onChaneDate={handleOnChangeDate} defaultTime={`${timeStart} --- ${timeEnd}`}/>
                {/*<FilterTime onChaneDate={handleOnChangeDate} defaultTime={`Hôm nay`}/>*/}
                <TableData onChange={(tabs) => handleOnChangeTab(tabs)} defaultTab={state as 'INTERACTIVE' | 'ACCESS'}/>
                <Chart state={tabs} dataChart={{shopId: ProfileStore.profile!.shopId, dateStart: dateStart, dateEnd: dateEnd}}/>
                <div className={'d-flex'}>
                    <TopProduct dateStart={dateStart} dateEnd={dateEnd}/>
                    <TopProductType/>
                </div>
            </div>
        )
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return null
    }
}

export default ProductsEfficiency