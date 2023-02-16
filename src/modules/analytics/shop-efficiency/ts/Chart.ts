import {numberWithCommas} from "../../../../common/functions/FormatFunc";

export const chartDataDashboard: any = {
  labels: [],
  datasets: [
    {
      label: 'Doanh thu',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#1b7ee0',
      borderColor: '#1b7ee0',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#1b7ee0',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#1b7ee0',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: []
    }
  ]
};
export const chartDataDashboardAuction: any = {
  labels: [],
  datasets: [
    {
      label: 'Doanh thu đấu giá',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#1b7ee0',
      borderColor: '#1b7ee0',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#1b7ee0',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#1b7ee0',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: []
    }
  ]
};
export const chartOptionsDashboard = {
  legend: {
    display: false
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem: any) => {
        return numberWithCommas(tooltipItem.yLabel, 'đ');
      }
    }
  },
  scales: {
    xAxes: [
      {
        ticks: {
          callback: function (label: number, index: number) {
            const temp: number = Math.floor(chartDataDashboard.labels.length / 6);
            return index % temp === 0 ? label : '';
          }
        },
        gridLines: {
          color: "rgba(229, 229, 229, .35)",
        }
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          callback: function (label: number) {
            return label > 10 ? numberWithCommas(label) : label;
          }
        },
        gridLines: {
          color: "rgba(229, 229, 229, .35)",
        }
      }
    ]
  }
};
export const chartData: any = {
  labels: [],
  datasets: [
    {
      label: 'Doanh thu',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#cf2a27',
      borderColor: '#cf2a27',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#cf2a27',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#cf2a27',
      pointHoverBorderColor: '#cf2a27',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [23, 65, 95, 56],
      hidden: false
    },
    {
      label: 'Lượt xem',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#ff9900',
      borderColor: '#ff9900',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#ff9900',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#ff9900',
      pointHoverBorderColor: '#ff9900',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [23, 25, 55, 96],
      hidden: true
    },
    {
      label: 'Lượt truy cập',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#009e0f',
      borderColor: '#009e0f',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#009e0f',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#009e0f',
      pointHoverBorderColor: '#009e0f',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [10, 36, 33, 69],
      hidden: true
    },
    {
      label: 'Đơn hàng',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#00ffff',
      borderColor: '#00ffff',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#00ffff',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#00ffff',
      pointHoverBorderColor: '#00ffff',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [5, 33, 22, 50],
      hidden: true,
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#2b78e4',
      borderColor: '#2b78e4',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#2b78e4',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#2b78e4',
      pointHoverBorderColor: '#2b78e4',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [2, 55, 66, 85],
      hidden: true
    },
    {
      label: 'Doanh thu/Đơn hàng',
      fill: false,
      lineTension: 0.1,
      backgroundColor: '#ff00ff',
      borderColor: '#ff00ff',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: '#ff00ff',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#ff00ff',
      pointHoverBorderColor: '#ff00ff',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [],
      hidden: true
    }
  ]
};
export const chartOptions = {
  scales: {
    xAxes: [
      {
        ticks: {
          callback: function (label: number, index: number) {
            const temp: number = Math.floor(chartData.labels.length / 6);
            return index % temp === 0 ? label : '';
          }
        },
        gridLines: {
          color: "rgba(206, 206, 206, .35)",
        }
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          callback: function (label: number) {
            return label > 0 ? label : label;
          }
        },
        gridLines: {
          color: "rgba(206, 206, 206, .35)",
        },
      }
    ]
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem: any) => {
        // return numberWithCommas(tooltipItem.yLabel);
        return tooltipItem.yLabel > 0 ? tooltipItem.yLabel + '' : 0 + '';
      }
    }
  }
};

export const chartPieOptions = {
  plugins: {
    legend: {
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Average Rainfall per month',
        fontSize: 20
      },
    },
    title: {
      display: true,
      text: 'Average Rainfall per month',
      fontSize: 20
    },
    // layout:{
    //     padding:{
    //         left:0,
    //         top:0,
    //         bottom:0,
    //         right:0
    //     }
    // }
  }
}
export const chartDoughnutOptions: any = {
  plugins: {
    title: {
      display: true,
      text: 'Average Rainfall per month',
      fontSize: 20
    },
    // layout:{
    //     padding:{
    //         left:0,
    //         top:0,
    //         bottom:0,
    //         right:0
    //     }
    // }
  }
}
export const dataChartPie: any = {
  labels: ['Doanh thu từ sản phẩm thường', 'Doanh thu từ đấu giá', 'Doanh thu từ flashbid'],
  datasets: [
    {
      label: 'Rainfall',
      fill: false,
      backgroundColor: ['#cf2a27', '#ff9900', '#2b78e4'],
      borderColor: ['#cf2a27', '#ff9900', '#2b78e4'],
      borderWidth: 2,
      data: [],
      pointHoverBorderWidth: 2,
      pointBorderWidth: 1,
    },
  ]
};
export const dataChartView: any = {
  labels: ['Lượt xem máy tính', 'Lượt xem ứng dụng'],
  datasets: [
    {
      label: 'Rainfall',
      fill: false,
      backgroundColor: ['#2b78e4', '#ff9900'],
      borderColor: ['#2b78e4', '#ff9900'],
      borderWidth: 2,
      data: [],
      pointHoverBorderWidth: 2,
      pointBorderWidth: 1,
    },
  ]
};
export const dataChartAccess: any = {
  labels: ['Lượt truy cập máy tính', 'Lượt truy cập ứng dụng'],
  datasets: [
    {
      label: 'Rainfall',
      fill: false,
      backgroundColor: ['#2b78e4', '#ff9900'],
      borderColor: ['#2b78e4', '#ff9900'],
      borderWidth: 2,
      data: [],
      pointHoverBorderWidth: 2,
      pointBorderWidth: 1,
    },
  ]
};

