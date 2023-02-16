import {getRequest, IApiResponse} from "../index";
import {
    IResExportExcel,
    IResShopDashboardAuction,
    IResShopDashboardRevenue,
    IResShopDashboardValue,
    IResShopEfficiencyAccess,
    IResShopEfficiencyRevenue, IResShopEfficiencyRevenuePie
} from "./interfaces/response";

function getShopOverview(shopId:number,startTime:string,endTime:string): Promise<IApiResponse<IResShopEfficiencyAccess>> {
    return getRequest(`/v1/statistics/shops/${shopId}/visits/overviews?start-date=${startTime}&end-date=${endTime}`, true);
}
function getShopChart(shopId:number,startTime:string,endTime:string):Promise<IApiResponse<IResShopEfficiencyRevenue>>{
    return getRequest(`/v1/statistics/shops/${shopId}/visits/charts?start-date=${startTime}&end-date=${endTime}`,true);
}
function getShopChartDashboardRevenue(shopId:number,time:string):Promise<IApiResponse<IResShopDashboardRevenue>>{
    return getRequest(`/v1/statistics/shops/${shopId}/revenues/overviews?date=${time}`,true);
}
function getShopChartDashboardAuction(shopId:number,time:string):Promise<IApiResponse<IResShopDashboardAuction>>{
    return getRequest(`/v1/statistics/shops/${shopId}/revenues/charts?date=${time}`,true);
}
function getShopChartDashboardValue(shopId:number,time:string):Promise<IApiResponse<IResShopDashboardValue>>{
    return getRequest(`/v1/statistics/shops/${shopId}/values?date=${time}`,true);
}
function getDetailRevenue(shopId:number,startTime:string,endTime:string):Promise<IApiResponse<IResShopEfficiencyRevenuePie>>{
    return getRequest(`/v1/statistics/shops/${shopId}/revenue/charts?start-date=${startTime}&end-date=${endTime}`,true)
}
function getDataExportExcel(shopId:number,startTime:string,endTime:string):Promise<IApiResponse<IResExportExcel>>{
    return getRequest(`/v1/statistics/shops/${shopId}/export-excel?start-date=${startTime}&end-date=${endTime}`,true)
}
export {
    getShopOverview,
    getShopChart,
    getShopChartDashboardRevenue,
    getShopChartDashboardAuction,
    getShopChartDashboardValue,
    getDetailRevenue,
    getDataExportExcel
}