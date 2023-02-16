import {getRequest, IApiResponse} from "../index";
import {
  IResDataChartAccess,
  IResDataChartInteractive, IResExportExcelDetailAccessProductEfficiency, IResExportExcelDetailInterProductEfficiency,
  IResExportExcelProductEfficiency,
  IResExportExcelProductInterEfficiency,
  IResListProDetail,
  IResListProDetailInteractive,
  IResProductOverviewAccess,
  IResProductOverviewInteractive,
  IResProductRanking
} from "./interface/response";

// GET DATA PRODUCT DETAIL TAB ACCESS
export const getListProDetailAccess = async (shopId: any, page: number, type: 'ALL' | 'AUCTION' | 'NORMAL', dateStart: string, dateEnd: string): Promise<IApiResponse<IResListProDetail>> => {
  let url = `/v1/statistics/shops/${shopId}/products/visits?type=${type}&start-date=${dateStart}&end-date=${dateEnd}&page=${page}&size=10`;
  return getRequest(url, true);
}

// GET DATA PRODUCT DETAIL TAB INTERACTIVE
export const getListProDetailInteractive = async (shopId: any, page: number, type: 'ALL' | 'AUCTION' | 'NORMAL', dateStart: string, dateEnd: string): Promise<IApiResponse<IResListProDetailInteractive>> => {
  let url = `/v1/statistics/shops/${shopId}/products/interaction?type=${type}&start-date=${dateStart}&end-date=${dateEnd}&page=${page}&size=10`;
  return getRequest(url, true);
}

// GET DATA PRODUCT OVERVIEW TAB ACCESS
export const getProductOverviewAccess = async (shopId: any, fromDate: any, toDate: any): Promise<IApiResponse<IResProductOverviewAccess>> => {
  let url = `/v1/statistics/shops/${shopId}/products/visits/overviews?collection=search&start-date=${fromDate}&end-date=${toDate}`;
  return getRequest(url, true);
}
// GET DATA PRODUCT OVERVIEW TAB INTERACTIVE
export const getProductOverviewInteractive = async (shopId: any, fromDate: any, toDate: any): Promise<IApiResponse<IResProductOverviewInteractive>> => {
  let url = `/v1/statistics/shops/${shopId}/products/interaction/overviews?start-date=${fromDate}&end-date=${toDate}`;
  return getRequest(url, true);
}

// GET DATA CHART TAB PRODUCT OVERVIEW ACCESS
export const getDataChartAccess = async (shopId: any, type: "ALL" | "NORMAL" | "AUCTION", dateStart: string, dateEnd: string): Promise<IApiResponse<IResDataChartAccess>> => {
  let url = `/v1/statistics/shops/${shopId}/products/visits/charts?start-date=${dateStart}&end-date=${dateEnd}&type=${type}`;
  return getRequest(url, true);
}

export const getDataChartInteractive = async (shopId: any, type: "ALL" | "NORMAL" | "AUCTION", dateStart: string, dateEnd: string): Promise<IApiResponse<IResDataChartInteractive>> => {
  let url = `/v1/statistics/shops/${shopId}/products/interaction/charts?start-date=${dateStart}&end-date=${dateEnd}&type=${type}`;
  return getRequest(url, true);
}

// GET PRODUCT RANKING
export const getProductRanking = async (shopId: any, dateStart: string, dateEnd: any, type: string): Promise<IApiResponse<IResProductRanking>> => {
  let url = `/v1/statistics/shops/${shopId}/products/ranking?start-date=${dateStart}&end-date=${dateEnd}&type=${type}`;
  return getRequest(url, true);
}

//GET DATA EXPORT EXCEL PRODUCT VISIT
export const getProductVisitExcel = async (shopId: any, dateStart: string, dateEnd: any): Promise<IApiResponse<IResExportExcelProductEfficiency>> => {
  let url = `/v1/statistics/shops/${shopId}/products/visits/overviews/export-excel?start-date=${dateStart}&end-date=${dateEnd}`;
  return getRequest(url, true);
}

//GET DATA EXPORT EXCEL PRODUCT INTERACTION
export const getProductInteractionExcel = async (shopId: any, dateStart: string, dateEnd: any): Promise<IApiResponse<IResExportExcelProductInterEfficiency>> => {
  let url = `/v1/statistics/shops/${shopId}/products/interaction/overviews/export-excel?start-date=${dateStart}&end-date=${dateEnd}`;
  return getRequest(url, true);
}

//GET DATA EXPORT EXCEL DETAIL PRODUCT EFFICIENCY
export const getDetailProductAccessExcel = async (type: 'ALL' | 'AUCTION' | 'NORMAL',shopId: any, dateStart: string, dateEnd: any): Promise<IApiResponse<IResExportExcelDetailAccessProductEfficiency>> => {
  let url = `/v1/statistics/shops/${shopId}/products/visits/export-excel?start-date=${dateStart}&end-date=${dateEnd}&type=${type}`;
  return getRequest(url, true);
}

//GET DATA EXPORT EXCEL DETAIL PRODUCT EFFICIENCY
export const getDetailProductInteractiveExcel = async (type: 'ALL' | 'AUCTION' | 'NORMAL',shopId: any, dateStart: string, dateEnd: any): Promise<IApiResponse<IResExportExcelDetailInterProductEfficiency>> => {
  let url = `/v1/statistics/shops/${shopId}/products/interaction/export-excel?start-date=${dateStart}&end-date=${dateEnd}&type=${type}`;
  return getRequest(url, true);
}