import {IChart, ILineChart, IRowTableAccess, IRowTableInteractive} from "./store";
import {IMetadata} from "../../api";
import {
    getDataChartAccess, getDataChartInteractive,
    getListProDetailAccess,
    getListProDetailInteractive,
    getProductOverviewAccess,
    getProductOverviewInteractive, getProductRanking
} from "../../api/products-efficiency";
import {store as ProfileStore} from "../profile";
import {INodeChart, IResTotalValueAccess, IResTotalValueInteractive} from "../../api/products-efficiency/interface/response";
import {IDataTable} from "./components/TableData";

export const getDataTableDetailAccess = async (
    type: "ALL" | "AUCTION" | "NORMAL",
    dateStart: string,
    dateEnd: string,
    page: number
): Promise<{ table: IRowTableAccess [], metadata: IMetadata }> => {
    try {
        let res = await getListProDetailAccess(ProfileStore.profile!.shopId, page, type, dateStart, dateEnd);
        if (res.status === 200) {
            let resTotalValue: IResTotalValueAccess = res.body.totalValue;
            let dataTable: IRowTableAccess[] = [];
            let totalValue: IRowTableAccess = {
                key: 0,
                productName: {value: "", id: null},
                view: {value: resTotalValue.totalView, percent: -1},
                viewPC: {value: resTotalValue.totalViewWeb, percent: -1},
                viewApp: {value: resTotalValue.totalViewApp, percent: -1},
                access: {value: resTotalValue.totalVisit, percent: -1},
                accessPC: {value: resTotalValue.totalVisitWeb, percent: -1},
                accessApp: {value: resTotalValue.totalVisitApp, percent: -1},
                exitPage: resTotalValue.totalBounceRate,
                timeAvg: resTotalValue.averageOnSite
            }

            dataTable = res.body.products.map((value: any) => {
                return {
                    key: value.id,
                    productName: {value: value.name, id: value.id},
                    view: {value: value.totalView, percent: (value.totalView / totalValue.view.value) * 100},
                    viewPC: {value: value.productViewWeb, percent: (value.productViewWeb / totalValue.viewPC.value) * 100},
                    viewApp: {value: value.productViewApp, percent: (value.productViewApp / totalValue.viewApp.value * 100)},
                    access: {value: value.totalVisit, percent: (value.totalVisit / totalValue.access.value) * 100},
                    accessPC: {value: value.productVisitWeb, percent: (value.productVisitWeb / totalValue.accessPC.value) * 100},
                    accessApp: {value: value.productVisitApp, percent: (value.productVisitApp / totalValue.accessApp.value) * 100},
                    timeAvg: convertSecondsToHhmmss(timeToSecond(value.averageOnSite)),
                    exitPage: value.totalBounceRate

                }
            })
            dataTable.unshift(totalValue);
            return {table: dataTable, metadata: res.body.metadata};
        } else {
            return {table: [], metadata: {page: 0, totalPage: 0, size: 0, total: 0}}
        }
    } catch (e) {
        console.error(e);
        return {table: [], metadata: {page: 0, totalPage: 0, size: 0, total: 0}}
    }
}

export const getDataTableDetailInteractive = async (
    type: "ALL" | "AUCTION" | "NORMAL",
    dateStart: string,
    dateEnd: string,
    page: number
): Promise<{ table: IRowTableInteractive [], metadata: IMetadata }> => {
    try {
        let res = await getListProDetailInteractive(ProfileStore.profile!.shopId, page, type, dateStart, dateEnd);
        if (res.status === 200) {
            let resTotalValue: IResTotalValueInteractive = res.body.totalValue
            let dataTable: IRowTableInteractive [] = [];
            let totalValue: IRowTableInteractive = {
                key: 0,
                productName: {value: "", id: null},
                revenue: {value: resTotalValue.totalRevenue, percent: -1},
                auction: {value: resTotalValue.totalAuction, percent: -1},
                peopleJoin: {value: resTotalValue.totalParticipants, percent: -1},
                auctionSuccess: {value: resTotalValue.totalAuctionSuccess, percent: -1},
                percentAucSuc: {value: resTotalValue.totalAuctionRatio, percent: -1},
                likePro: {value: resTotalValue.totalFavorites, percent: -1},
                sharePro: {value: resTotalValue.totalShare, percent: -1},
                addCart: resTotalValue.totalAddToCart,
                percentAddCart: resTotalValue.totalAddToCartRatio
            }

            dataTable = res.body.productInteraction.map((value) => {
                return {
                    key: 0,
                    productName: {value: value.name, id: value.id},
                    revenue: {value: value.totalRevenue, percent: (value.totalRevenue / totalValue.revenue.value) * 100},
                    auction: {value: value.totalAuction, percent: (value.totalAuction / totalValue.auction.value) * 100},
                    peopleJoin: {value: value.totalParticipants, percent: (value.totalParticipants / totalValue.peopleJoin.value) * 100},
                    auctionSuccess: {value: value.totalAuctionSuccess, percent: (value.totalAuctionSuccess / totalValue.auctionSuccess.value) * 100},
                    percentAucSuc: {value: value.totalAuctionRatio, percent: (value.totalAuctionRatio / totalValue.percentAucSuc.value) * 100},
                    likePro: {value: value.totalFavorites, percent: (value.totalFavorites / totalValue.likePro.value) * 100},
                    sharePro: {value: value.totalShare, percent: (value.totalShare / totalValue.sharePro.value) * 100},
                    addCart: value.totalAddToCart,
                    percentAddCart: value.addToCartRatio
                }
            })

            dataTable.unshift(totalValue);

            return {table: dataTable, metadata: res.body.metadata}
        } else {
            return {table: [], metadata: {page: 0, totalPage: 0, size: 0, total: 0}}
        }
    } catch (e) {
        console.error(e);
        return {table: [], metadata: {page: 0, totalPage: 0, size: 0, total: 0}}
    }
}

export const timeToSecond = (time: string): number => {
    let [h, m, s] = time.split(':');
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) * 1;
}
export const getSecond = (time1: number, time2: number): number => {
    return time1 + time2;
}
export const pad = (num: number, size: number): string => {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
export const convertSecondsToHhmmss = (seconds: number) => {
    if (seconds === 0) return seconds; else {
        let hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
    }
}

export const getDataTableTabAccess = async (dateStart: any, dateEnd: any): Promise<{ key: number, title: { value: string, hover: string }, all: IDataTable | null, productNormal: IDataTable | null, productBid: IDataTable | null } []> => {
    try {
        let res = await getProductOverviewAccess(ProfileStore.profile!.shopId, dateStart, dateEnd);
        if (res.status === 200) {
            let {productNormal} = res.body;
            let {productAuction} = res.body;
            let dataTableDefaultAccess: { key: number, title: { value: string, hover: string }, all: IDataTable | null, productNormal: IDataTable | null, productBid: IDataTable | null } [] =
                [
                    {
                        key: 1,
                        title: {
                            value: 'T???ng l?????t xem',
                            hover: 'T???ng s??? l?????t xem trang s???n ph???m c???a shop, trong th???i gian ???? ch???n (Bao g???m tr??n m??y t??nh v?? ???ng d???ng)'
                        },
                        all: {
                            num: Math.abs(productNormal.totalView.totalView + productAuction.totalView.totalView),
                            percent: Math.abs(productNormal.totalView.totalViewPercent + productAuction.totalView.totalViewPercent),
                            type: (productNormal.totalView.totalViewPercent + productAuction.totalView.totalViewPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalView.totalView),
                            percent: Math.abs(productNormal.totalView.totalViewPercent),
                            type: productNormal.totalView.totalViewPercent < 0 ? 'down' : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalView.totalView),
                            percent: Math.abs(productAuction.totalView.totalViewPercent),
                            type: productAuction.totalView.totalViewPercent < 0 ? 'down' : "up"
                        },
                    },
                    {
                        key: 2,
                        title: {value: 'T???ng l?????t xem m??y t??nh', hover: 'T???ng s??? l?????t xem trang s???n ph???m c???a shop, trong th???i gian ???? ch???n tr??n m??y t??nh'},
                        all: {
                            num: Math.abs(productNormal.totalViewWeb.totalViewWeb + productAuction.totalViewWeb.totalViewWeb),
                            percent: Math.abs(productNormal.totalViewWeb.totalViewWebPercent + productAuction.totalViewWeb.totalViewWebPercent),
                            type: (productNormal.totalViewWeb.totalViewWebPercent + productAuction.totalViewWeb.totalViewWebPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalViewWeb.totalViewWeb),
                            percent: Math.abs(productNormal.totalViewWeb.totalViewWebPercent),
                            type: productNormal.totalViewWeb.totalViewWebPercent < 0 ? "down" : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalViewWeb.totalViewWeb),
                            percent: Math.abs(productAuction.totalViewWeb.totalViewWebPercent),
                            type: productAuction.totalViewWeb.totalViewWebPercent < 0 ? "down" : "up"
                        }
                    },
                    {
                        key: 3,
                        title: {value: 'T???ng l?????t xem ???ng d???ng', hover: 'T???ng s??? l?????t trang s???n ph???m c???a shop, trong th???i gian ???? ch???n tr??n ???ng d???ng'},
                        all: {
                            num: Math.abs(productNormal.totalViewApp.totalViewApp + productAuction.totalViewApp.totalViewApp),
                            percent: Math.abs(productNormal.totalViewApp.totalViewAppPercent + productAuction.totalViewApp.totalViewAppPercent),
                            type: (productNormal.totalViewApp.totalViewAppPercent + productAuction.totalViewApp.totalViewAppPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalViewApp.totalViewApp),
                            percent: Math.abs(productNormal.totalViewApp.totalViewAppPercent),
                            type: productNormal.totalViewApp.totalViewAppPercent < 0 ? "down" : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalViewApp.totalViewApp),
                            percent: Math.abs(productAuction.totalViewApp.totalViewAppPercent),
                            type: productAuction.totalViewApp.totalViewAppPercent < 0 ? "down" : "up"
                        }
                    },
                    {
                        key: 4,
                        title: {value: 'Th???i gian xem trung b??nh', hover: 'Th???i gian trung b??nh 1 kh??ch truy c???p xem trang s???n ph???m c???a shop'},
                        all: {
                            num: convertSecondsToHhmmss(getSecond(timeToSecond(productNormal.totalOnSite.averageOnSite), timeToSecond(productAuction.totalOnSite.averageOnSite))),
                            percent: Math.abs(productNormal.totalOnSite.averageOnSitePercent + productAuction.totalOnSite.averageOnSitePercent),
                            type: (productNormal.totalOnSite.averageOnSitePercent + productAuction.totalOnSite.averageOnSitePercent) < 0 ? "down" : 'up'
                        },
                        productNormal: {
                            num: convertSecondsToHhmmss(timeToSecond(productNormal.totalOnSite.averageOnSite)),
                            percent: Math.abs(productNormal.totalOnSite.averageOnSitePercent),
                            type: productNormal.totalOnSite.averageOnSitePercent < 0 ? 'down' : "up"
                        },
                        productBid: {
                            num: convertSecondsToHhmmss(timeToSecond(productAuction.totalOnSite.averageOnSite)),
                            percent: Math.abs(productAuction.totalOnSite.averageOnSitePercent),
                            type: productAuction.totalOnSite.averageOnSitePercent < 0 ? "down" : 'up'
                        }
                    },
                    {
                        key: 5,
                        title: {
                            value: 'T??? l??? tho??t trang',
                            hover: 'T??? l??? kh??ch truy c???p duy nh???t v??o trang s???n ph???m c???a b???n nh??ng r???i ??i m?? kh??ng thao t??c th??m (v?? d???: b???m xem th??m, l?????t ???nh, l??u gi??? h??ng....)'
                        },
                        all: {
                            num: Math.abs(productNormal.totalBounceRate.totalBounceRate + productAuction.totalBounceRate.totalBounceRate),
                            percent: Math.abs(productNormal.totalBounceRate.totalBounceRatePercent + productAuction.totalBounceRate.totalBounceRatePercent),
                            type: (productNormal.totalBounceRate.totalBounceRatePercent + productAuction.totalBounceRate.totalBounceRatePercent) < 0 ? "down" : 'up',
                            suffixes: "%"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalBounceRate.totalBounceRate),
                            percent: Math.abs(productNormal.totalBounceRate.totalBounceRatePercent),
                            type: productNormal.totalBounceRate.totalBounceRatePercent < 0 ? 'down' : "up",
                            suffixes: "%"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalBounceRate.totalBounceRate),
                            percent: Math.abs(productAuction.totalBounceRate.totalBounceRatePercent),
                            type: productAuction.totalBounceRate.totalBounceRatePercent < 0 ? "down" : 'up',
                            suffixes: "%"
                        }
                    },
                    {
                        key: 6,
                        title: {
                            value: 'T???ng l?????t truy c???p',
                            hover: 'T???ng s??? kh??ch truy c???p duy nh???t ???? xem trang s???n ph???m c???a shop trong kho???ng th???i gian ???????c ch???n. M???i kh??ch xem m???t trang s???n ph???m nhi???u l???n ???????c t??nh l?? l?????t truy c???p duy nh???t'
                        },
                        all: {
                            num: Math.abs(productNormal.totalVisit.totalVisit + productAuction.totalVisit.totalVisit),
                            percent: Math.abs(productNormal.totalVisit.totalVisitPercent + productAuction.totalVisit.totalVisitPercent),
                            type: (productNormal.totalVisit.totalVisitPercent + productAuction.totalVisit.totalVisitPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalVisit.totalVisit),
                            percent: Math.abs(productNormal.totalVisit.totalVisitPercent),
                            type: productNormal.totalVisit.totalVisitPercent < 0 ? "down" : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalVisit.totalVisit),
                            percent: Math.abs(productAuction.totalVisit.totalVisitPercent),
                            type: productAuction.totalVisit.totalVisitPercent < 0 ? "down" : "up"
                        }
                    },
                    {
                        key: 7,
                        title: {value: 'L?????t truy c???p m??y t??nh', hover: 'T???ng s??? kh??ch truy c???p duy nh???t ???? xem trang s???n ph???m c???a shop trong kho???ng th???i gian ???????c ch???n tr??n m??y t??nh. M???i kh??ch xem m???t trang s???n ph???m nhi???u l???n ???????c t??nh l?? l?????t truy c???p duy nh???t'},
                        all: {
                            num: Math.abs(productNormal.totalVisitWeb.totalVisitWeb + productAuction.totalVisitWeb.totalVisitWeb),
                            percent: Math.abs(productNormal.totalVisitWeb.totalVisitWebPercent + productAuction.totalVisitWeb.totalVisitWebPercent),
                            type: (productNormal.totalVisitWeb.totalVisitWebPercent + productAuction.totalVisitWeb.totalVisitWebPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalVisitWeb.totalVisitWeb),
                            percent: Math.abs(productNormal.totalVisitWeb.totalVisitWebPercent),
                            type: productNormal.totalVisitWeb.totalVisitWebPercent < 0 ? "down" : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalVisitWeb.totalVisitWeb),
                            percent: Math.abs(productAuction.totalVisitWeb.totalVisitWebPercent),
                            type: productAuction.totalVisitWeb.totalVisitWebPercent < 0 ? "down" : "up"
                        }
                    },
                    {
                        key: 8,
                        title: {value: 'L?????t truy c???p ???ng d???ng', hover: 'T???ng s??? kh??ch truy c???p duy nh???t ???? xem trang s???n ph???m c???a shop trong kho???ng th???i gian ???????c ch???n tr??n ???ng d???ng. M???i kh??ch xem m???t trang s???n ph???m nhi???u l???n ???????c t??nh l?? l?????t truy c???p duy nh???t'},
                        all: {
                            num: Math.abs(productNormal.totalVisitApp.totalVisitApp + productAuction.totalVisitApp.totalVisitApp),
                            percent: Math.abs(productNormal.totalVisitApp.totalVisitAppPercent + productAuction.totalVisitApp.totalVisitAppPercent),
                            type: (productNormal.totalVisitApp.totalVisitAppPercent + productAuction.totalVisitApp.totalVisitAppPercent) < 0 ? "down" : "up"
                        },
                        productNormal: {
                            num: Math.abs(productNormal.totalVisitApp.totalVisitApp),
                            percent: Math.abs(productNormal.totalVisitApp.totalVisitAppPercent),
                            type: productNormal.totalVisitApp.totalVisitAppPercent < 0 ? "down" : "up"
                        },
                        productBid: {
                            num: Math.abs(productAuction.totalVisitApp.totalVisitApp),
                            percent: Math.abs(productAuction.totalVisitApp.totalVisitAppPercent),
                            type: productNormal.totalVisitApp.totalVisitAppPercent < 0 ? "down" : "up"
                        }
                    }
                ]

            return dataTableDefaultAccess;
        } else {
            return []
        }
    } catch (e) {
        console.error(e);
        return []
    }
}

export const getDataTableTabInteractive = async (dateStart: any, dateEnd: any): Promise<{ key: number, title: { value: string, hover: string }, all: IDataTable | null, productNormal: IDataTable | null, productBid: IDataTable | null } []> => {
    let res = await getProductOverviewInteractive(ProfileStore.profile!.shopId, dateStart, dateEnd);
    if (res.status === 200) {
        let {productNormal} = res.body;
        let {productAuction} = res.body;

        let dataTableDefaultInteractive: { key: number, title: { value: string, hover: string }, all: IDataTable | null, productNormal: IDataTable | null, productBid: IDataTable | null } [] =
            [
                {
                    key: 1,
                    title: {value: 'Doanh thu', hover: 'T????ng gia?? tri?? ca??c ????n trong th????i gian ba??o ca??o, bao g????m ca?? ????n ch??a thanh toa??n.'},
                    all: {
                        num: Math.abs(productNormal.totalRevenue.revenue + productAuction.totalRevenue.revenue),
                        percent: Math.abs(productNormal.totalRevenue.revenuePercent + productAuction.totalRevenue.revenuePercent),
                        type: (productNormal.totalRevenue.revenuePercent + productAuction.totalRevenue.revenuePercent) < 0 ? "down" : 'up',
                        suffixes: "??"
                    },
                    productNormal: {
                        num: Math.abs(productNormal.totalRevenue.revenue),
                        percent: Math.abs(productNormal.totalRevenue.revenuePercent),
                        type: productNormal.totalRevenue.revenuePercent < 0 ? 'down' : "up",
                        suffixes: "??"
                    },
                    productBid: {
                        num: Math.abs(productAuction.totalRevenue.revenue),
                        percent: Math.abs(productAuction.totalRevenue.revenuePercent),
                        type: productAuction.totalRevenue.revenuePercent < 0 ? "down" : 'up',
                        suffixes: "??"
                    }
                },
                {
                    key: 2,
                    title: {
                        value: 'L?????t ?????u gi??',
                        hover: 'T????ng s???? l??????t tra?? gia?? cho sa??n ph????m ??????u gia?? trong th????i gian ba??o ca??o t???? Chozoi t???? web va?? ????ng du??ng Chozoi.'
                    },
                    all: {
                        num: productNormal.totalAuction.totalAuction + productAuction.totalAuction.totalAuction,
                        percent: Math.abs(productNormal.totalAuction.totalAuctionPercent + productAuction.totalAuction.totalAuctionPercent),
                        type: (productNormal.totalAuction.totalAuctionPercent + productAuction.totalAuction.totalAuctionPercent) < 0 ? "down" : "up"
                    },
                    productNormal: {
                        num: productNormal.totalAuction.totalAuction,
                        percent: Math.abs(productNormal.totalAuction.totalAuctionPercent),
                        type: productNormal.totalAuction.totalAuctionPercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: productAuction.totalAuction.totalAuction,
                        percent: Math.abs(productAuction.totalAuction.totalAuctionPercent),
                        type: productAuction.totalAuction.totalAuctionPercent < 0 ? "down" : 'up'
                    }
                },
                {
                    key: 3,
                    title: {
                        value: 'Ng?????i tham gia',
                        hover: 'T????ng s???? ng??????i tham gia tra?? gia?? cho sa??n ph????m ??????u gia?? trong th????i gian ba??o ca??o t???? Chozoi t???? web va?? ????ng du??ng Chozoi.'
                    },
                    all: {
                        num: productNormal.totalParticipants.totalParticipants + productAuction.totalParticipants.totalParticipants,
                        percent: Math.abs(productNormal.totalParticipants.totalParticipantsPercent + productAuction.totalParticipants.totalParticipantsPercent),
                        type: (productNormal.totalParticipants.totalParticipantsPercent + productAuction.totalParticipants.totalParticipantsPercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: productNormal.totalParticipants.totalParticipants,
                        percent: Math.abs(productNormal.totalParticipants.totalParticipantsPercent),
                        type: productNormal.totalParticipants.totalParticipantsPercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: productAuction.totalParticipants.totalParticipants,
                        percent: Math.abs(productAuction.totalParticipants.totalParticipantsPercent),
                        type: productAuction.totalParticipants.totalParticipantsPercent < 0 ? 'down' : "up"
                    }
                },
                {
                    key: 4,
                    title: {value: '?????u gi?? th??nh c??ng', hover: 'T???ng s??? s???n ph???m ?????u gi?? c?? ng?????i chi???n th???ng trong th???i gian b??o c??o'},
                    all: {
                        num: productNormal.totalAuctionSuccess.totalAuctionSuccess + productAuction.totalAuctionSuccess.totalAuctionSuccess,
                        percent: Math.abs(productNormal.totalAuctionSuccess.totalAuctionSuccessPercent + productAuction.totalAuctionSuccess.totalAuctionSuccessPercent),
                        type: (productNormal.totalAuctionSuccess.totalAuctionSuccessPercent + productAuction.totalAuctionSuccess.totalAuctionSuccessPercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: productNormal.totalAuctionSuccess.totalAuctionSuccess,
                        percent: Math.abs(productNormal.totalAuctionSuccess.totalAuctionSuccessPercent),
                        type: productNormal.totalAuctionSuccess.totalAuctionSuccessPercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: productAuction.totalAuctionSuccess.totalAuctionSuccess,
                        percent: Math.abs(productAuction.totalAuctionSuccess.totalAuctionSuccessPercent),
                        type: productAuction.totalAuctionSuccess.totalAuctionSuccessPercent < 0 ? 'down' : "up"
                    }
                },
                {
                    key: 5,
                    title: {
                        value: 'T??? l??? ?????u gi?? th??nh c??ng',
                        hover: 'T????ng s???? sa??n ph????m ????????c tra?? gia?? tha??nh c??ng tr??n t????ng s???? sa??n ph????m ??????u gia?? ????ng ba??n.'
                    },
                    all: {
                        num: productNormal.totalAuctionRatio.totalAuctionRatio + productAuction.totalAuctionRatio.totalAuctionRatio,
                        percent: Math.abs(productNormal.totalAuctionRatio.totalAuctionRatioPercent + productAuction.totalAuctionRatio.totalAuctionRatioPercent),
                        type: (productNormal.totalAuctionRatio.totalAuctionRatioPercent + productAuction.totalAuctionRatio.totalAuctionRatioPercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: productNormal.totalAuctionRatio.totalAuctionRatio,
                        percent: Math.abs(productNormal.totalAuctionRatio.totalAuctionRatioPercent),
                        type: productNormal.totalAuctionRatio.totalAuctionRatioPercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: productAuction.totalAuctionRatio.totalAuctionRatio,
                        percent: Math.abs(productAuction.totalAuctionRatio.totalAuctionRatioPercent),
                        type: productAuction.totalAuctionRatio.totalAuctionRatioPercent < 0 ? 'down' : "up"
                    }
                },
                {
                    key: 6,
                    title: {value: 'Y??u th??ch s???n ph???m', hover: 'T???ng s??? l???n s???n ph???m ???????c b???m like'},
                    all: {
                        num: Math.abs(productNormal.totalFavorite.totalFavorite + productAuction.totalFavorite.totalFavorite),
                        percent: Math.abs(productNormal.totalFavorite.totalFavoritePercent + productAuction.totalFavorite.totalFavoritePercent),
                        type: (productNormal.totalFavorite.totalFavoritePercent + productAuction.totalFavorite.totalFavoritePercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: Math.abs(productNormal.totalFavorite.totalFavorite),
                        percent: Math.abs(productNormal.totalFavorite.totalFavoritePercent),
                        type: productNormal.totalFavorite.totalFavoritePercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: Math.abs(productAuction.totalFavorite.totalFavorite),
                        percent: Math.abs(productAuction.totalFavorite.totalFavoritePercent),
                        type: productAuction.totalFavorite.totalFavoritePercent < 0 ? 'down' : "up"
                    }
                },
                {
                    key: 7,
                    title: {value: 'Chia s??? s???n ph???m', hover: 'T???ng s??? l???n s???n ph???m ???????c b???m share'},
                    all: {
                        num: Math.abs(productNormal.totalShare.totalShare + productAuction.totalShare.totalShare),
                        percent: Math.abs(productNormal.totalShare.totalSharePercent + productAuction.totalShare.totalSharePercent),
                        type: (productNormal.totalShare.totalSharePercent + productAuction.totalShare.totalSharePercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: Math.abs(productNormal.totalShare.totalShare),
                        percent: Math.abs(productNormal.totalShare.totalSharePercent),
                        type: productNormal.totalShare.totalSharePercent < 0 ? "down" : 'up'
                    },
                    productBid: {
                        num: Math.abs(productAuction.totalShare.totalShare),
                        percent: Math.abs(productAuction.totalShare.totalSharePercent),
                        type: productAuction.totalShare.totalSharePercent < 0 ? "down" : 'up'
                    }
                },
                {
                    key: 8,
                    title: {value: 'Th??m gi??? h??ng', hover: 'T???ng s??? s???n ph???m ???????c th??m v??o gi??? h??ng theo th???i gian ???? ch???n'},
                    all: {
                        num: Math.abs(productNormal.totalAddToCart.totalAddToCart + productAuction.totalAddToCart.totalAddToCart),
                        percent: Math.abs(productNormal.totalAddToCart.totalAddToCartPercent + productAuction.totalAddToCart.totalAddToCartPercent),
                        type: (productNormal.totalAddToCart.totalAddToCartPercent + productAuction.totalAddToCart.totalAddToCartPercent) < 0 ? "down" : 'up'
                    },
                    productNormal: {
                        num: Math.abs(productNormal.totalAddToCart.totalAddToCart),
                        percent: Math.abs(productNormal.totalAddToCart.totalAddToCartPercent),
                        type: productNormal.totalAddToCart.totalAddToCartPercent < 0 ? 'down' : "up"
                    },
                    productBid: {
                        num: Math.abs(productAuction.totalAddToCart.totalAddToCart),
                        percent: Math.abs(productAuction.totalAddToCart.totalAddToCartPercent),
                        type: productAuction.totalAddToCart.totalAddToCartPercent < 0 ? 'down' : "up"
                    }
                },
                {
                    key: 9,
                    title: {value: 'T??? l??? th??m gi??? h??ng', hover: 'T???ng s??? l?????t truy c???p th??m v??o gi??? h??ng chia cho s??? l?????t truy c???p v??o s???n ph???m'},
                    all: {
                        num: Math.abs(productNormal.totalAddToCartRatio.totalAddToCartRatio + productAuction.totalAddToCartRatio.totalAddToCartRatio),
                        percent: Math.abs(productNormal.totalAddToCartRatio.totalAddToCartRatioPercent + productAuction.totalAddToCartRatio.totalAddToCartRatioPercent),
                        type: (productNormal.totalAddToCartRatio.totalAddToCartRatioPercent + productAuction.totalAddToCartRatio.totalAddToCartRatioPercent) < 0 ? "down" : "up",
                        isString: true,
                        suffixes: "%"
                    },
                    productNormal: {
                        num: Math.abs(productNormal.totalAddToCartRatio.totalAddToCartRatio),
                        percent: Math.abs(productNormal.totalAddToCartRatio.totalAddToCartRatioPercent),
                        type: productNormal.totalAddToCartRatio.totalAddToCartRatioPercent < 0 ? 'down' : "up",
                        isString: true,
                        suffixes: "%"
                    },
                    productBid: {
                        num: Math.abs(productAuction.totalAddToCartRatio.totalAddToCartRatio),
                        percent: Math.abs(productAuction.totalAddToCartRatio.totalAddToCartRatioPercent),
                        type: productAuction.totalAddToCartRatio.totalAddToCartRatioPercent < 0 ? "down" : 'up',
                        isString: true,
                        suffixes: "%"
                    }
                }
            ]

        return dataTableDefaultInteractive;
    } else {
        return []
    }
}

export const getDataChart = async (shopId: any, type: "ALL" | "NORMAL" | "AUCTION", state: "ACCESS" | "INTERACTIVE", dateStart: string, dateEnd: string): Promise<IChart> => {
    try {
        const getValueLineChart = (data: INodeChart []): number [] => {
            let result: number [] = [];
            data.forEach(value => result.push(value.value));
            return result;
        }
        const getLaybel = (data: INodeChart []): string [] => {
            let result: string [] = [];
            data.forEach(value => result.push(value.key))
            return result;
        }

        let labels: string [] = [];
        let datasets: ILineChart [] = [];
        if (state === "ACCESS") {
            let res = await getDataChartAccess(shopId, type, dateStart, dateEnd);
            if (res.status === 200) {
                labels = getLaybel(res.body.totalView);
                datasets.push({label: "T???ng l?????t xem", data: getValueLineChart(res.body.totalView), fill: false, borderColor: "#f5222d"})
                datasets.push({label: "L?????t xem m??y t??nh", data: getValueLineChart(res.body.totalViewWeb), fill: false, borderColor: "#fadb14"})
                datasets.push({label: "L?????t xem ???ng d???ng", data: getValueLineChart(res.body.totalViewApp), fill: false, borderColor: "#a0d911"})
                datasets.push({label: "Th???i gian xem trung b??nh", data: getValueLineChart(res.body.totalOnSite), fill: false, borderColor: "#13c2c2"})
                datasets.push({label: "T??? l??? tho??t trang", data: getValueLineChart(res.body.totalBounceRate), fill: false, borderColor: "#1890ff"})
                datasets.push({label: "T???ng l?????t truy c???p", data: getValueLineChart(res.body.totalVisit), fill: false, borderColor: "#722ed1"})
                datasets.push({label: "L?????t truy c???p m??y t??nh", data: getValueLineChart(res.body.totalVisitWeb), fill: false, borderColor: "#eb2f96"})
                datasets.push({label: "L?????t truy c???p ???ng d???ng", data: getValueLineChart(res.body.totalViewApp), fill: false, borderColor: "#613400"})
                return {labels: labels, datasets: datasets}
            } else {
                return {labels: [], datasets: []};
            }
        } else {
            let res = await getDataChartInteractive(shopId, type, dateStart, dateEnd);
            if (res.status === 200) {
                labels = getLaybel(res.body.totalRevenues);
                datasets.push({label: "Doanh thu", data: getValueLineChart(res.body.totalRevenues), fill: false, borderColor: "#f5222d"})
                datasets.push({label: "L?????t ?????u gi??", data: getValueLineChart(res.body.totalAuctions), fill: false, borderColor: "#fadb14"})
                datasets.push({label: "Ng?????i tham gia", data: getValueLineChart(res.body.totalParticipants), fill: false, borderColor: "#a0d911"})
                datasets.push({label: "?????u gi?? th??nh c??ng", data: getValueLineChart(res.body.totalAuctionSuccesses), fill: false, borderColor: "#13c2c2"})
                datasets.push({label: "T??? l??? ?????u gi?? th??nh c??ng", data: getValueLineChart(res.body.totalAuctionRatios), fill: false, borderColor: "#1890ff"})
                datasets.push({label: "Th??ch s???n ph???m", data: getValueLineChart(res.body.totalFavorites), fill: false, borderColor: "#722ed1"})
                datasets.push({label: "Chia s??? s???n ph???m", data: getValueLineChart(res.body.totalShares), fill: false, borderColor: "#eb2f96"})
                datasets.push({label: "Th??m gi??? h??ng", data: getValueLineChart(res.body.totalAddToCarts), fill: false, borderColor: "#613400"})
                datasets.push({label: "T??? l??? th??m gi??? h??ng", data: getValueLineChart(res.body.totalAddToCartRatios), fill: false, borderColor: "#000000"})
                return {labels: labels, datasets: datasets}
            } else {
                return {labels: [], datasets: []};
            }
        }

    } catch (e) {
        console.error(e);
        return {datasets: [], labels: []};
    }
}

export const getChartChecked = (listCheck: string[], dataChart: IChart): IChart => {
    let labels: string [] = dataChart.labels;
    let datasets: ILineChart [] = [];

    listCheck.forEach(value => {
        dataChart.datasets.forEach(value1 => {
            if (value === value1.label) {
                datasets.push(value1)
            }
        })
    })

    return {labels: labels, datasets: datasets};
}

export const getDataTableProRank = async (shopId: any, dateStart: string, dateEnd: any, type: string):Promise<{ key: number, top: number, product: { image: string, name: string, price: number }, revenue: number } []> => {
    try {
        let result: { key: number, top: number, product: { image: string, name: string, price: number }, revenue: number } [] = [];
        let res = await getProductRanking(shopId, dateStart, dateEnd, type);

        if (res) {
            res.body.products.forEach((value, index) => {
                result.push({
                    key: index,
                    top: index + 1,
                    product: {
                        image: value.imageUrl,
                        price: value.salePrice,
                        name: value.name
                    },
                    revenue: value.value
                })
            })
        }

        return result;
    } catch (e) {
        console.error(e);
        return []
    }
}
