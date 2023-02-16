interface IResShopEfficiencyAccess {
  "totalView": {
    "totalView": number,
    "totalViewPercent": number
  },
  "totalViewWeb": {
    "totalViewWeb": number,
    "totalViewWebPercent": number
  },
  "totalViewApp": {
    "totalViewApp": number,
    "totalViewAppPercent": number
  },
  "totalVisit": {
    "totalVisit": number,
    "totalVisitPercent": number
  },
  "totalVisitWeb": {
    "totalVisitWeb": number,
    "totalVisitWebPercent": number
  },
  "totalVisitApp": {
    "totalVisitApp": number,
    "totalVisitAppPercent": number
  },
  "totalOnSite": {
    "averageOnSite": string,
    "averageOnSitePercent": number
  },
  "totalBounceRate": {
    "totalBounceRate": number,
    "totalBounceRatePercent": number
  },
  "totalFollow": {
    "totalFollow": number,
    "totalFollowPercent": number
  }
}

interface IResShopEfficiencyRevenue {
  "value": {
    "revenues": {
      "revenue": 0,
      "revenuePercent": 0
    },
    "totalView": {
      "totalView": 44,
      "totalViewPercent": 100
    },
    "totalVisit": {
      "totalVisit": 41,
      "totalVisitPercent": 100
    },
    "orders": {
      "totalOrder": 0,
      "totalOrderPercent": 0
    },
    "conversionRates": {
      "conversionRate": 0,
      "conversionRatePercent": 0
    },
    "orderAverages": {
      "orderAverage": 0,
      "orderAveragePercent": 0
    }
  },
  "chart": {
    "revenues": {
      "key": string,
      "value": number
    }[],
    "totalViews":
      {
        "key": string,
        "value": number
      }[],
    "totalVisits":
      {
        "key": string,
        "value": number
      }[],
    "orders": {
      "key": string,
      "value": number
    }[],
    "conversionRates": {
      "key": string,
      "value": number
    }[],
    "orderAverages": {
      "key": string,
      "value": number
    }[]
  }
}

interface IResShopDashboardRevenue {
  "value": {
    "order": {
      "totalOrderDraft": number,
      "totalOrderNew": number,
      "totalOrderShipping": number,
      "totalOrderCanceled": number,
      "totalOrderReturned": number
    },
    "product": {
      "totalProductPublic": number,
      "totalProductPending": number,
      "totalProductReported": number,
      "totalProductOutOfStock": number,
      "totalProductReturned": number
    }
  },
  "chart": {
    "totalRevenue": {
      "revenue": number,
      "revenuePercent": number
    },
    "revenues": [
      {
        "key": string,
        "value": number
      }
    ]
  }
}

interface IResShopDashboardAuction {
  "totalAuctionRevenue": {
    "revenue": number,
    "revenuePercent": number
  },
  "numberOfAuction": number,
  "numberOfParticipants": number,
  "productsOnAuction": number,
  "revenues":
    {
      "key": string,
      "value": number
    }[]
}

interface IResShopDashboardValue {
  "totalView": {
    "totalView": number,
    "totalViewPercent": number
  },
  "totalVisit": {
    "totalVisit": number,
    "totalVisitPercent": number
  },
  "totalOrder": {
    "totalOrder": number,
    "totalOrderPercent": number
  },
  "totalConversionRate": {
    "conversionRate": number,
    "conversionRatePercent": number
  },
  "totalFollow": {
    "totalFollow": number,
    "totalFollowPercent": number
  }
}

interface IResShopEfficiencyRevenuePie {
  "totalRevenue": {
    "totalRevenue": number,
    "totalRevenuePercent": number
  },
  "totalRevenueProduct": {
    "totalRevenueProduct": number,
    "totalRevenueProductPercent": number
  },
  "totalRevenueAuction": {
    "totalRevenueAuction": number,
    "totalRevenueAuctionPercent": number
  },
  "totalRevenueFlashbid": {
    "totalRevenueFlashbid": number,
    "totalRevenuePercentFlashbid": number
  }
}
interface IResExportExcel{
  "properties":{
    "key": "2021-05-26",
    "value": {
      "revenues": {
        "revenue": 0,
        "revenuePercent": 0
      },
      "totalView": {
        "totalView": 0,
        "totalViewPercent": 0
      },
      "totalVisit": {
        "totalVisit": 0,
        "totalVisitPercent": 0
      },
      "orders": {
        "totalOrder": 0,
        "totalOrderPercent": 0
      },
      "conversionRates": {
        "conversionRate": 0,
        "conversionRatePercent": 0
      },
      "orderAverages": {
        "orderAverage": 0,
        "orderAveragePercent": 0
      },
      "totalRevenue": {
        "revenue": 0,
        "revenuePercent": 0
      },
      "totalViewWeb": {
        "totalViewWeb": 0,
        "totalViewWebPercent": 0
      },
      "totalViewApp": {
        "totalViewApp": 0,
        "totalViewAppPercent": 0
      },
      "totalVisitWeb": {
        "totalVisitWeb": 0,
        "totalVisitWebPercent": 0
      },
      "totalVisitApp": {
        "totalVisitApp": 0,
        "totalVisitAppPercent": 0
      }
    }
  }[]
}
export type {
  IResShopEfficiencyAccess,
  IResShopEfficiencyRevenue,
  IResShopDashboardRevenue,
  IResShopDashboardAuction,
  IResShopDashboardValue,
  IResShopEfficiencyRevenuePie,
  IResExportExcel
}