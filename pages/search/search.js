const query_lines = [{
    "cycle": "1,2,3,4,5",
    "endStationId": "9",
    "sort": "25",
    "remark": "此趟次玉泉校区只停靠教十二北面，此趟次学生请勿搭乘",
    "busId": "2",
    "state": "1",
    "endTime": "1850",
    "startStationId": "6",
    "id": "31",
    "startTime": "1737",
    "busName": "教师2号班车",
    "endStationName": "之江校区",
    "carNumber": "浙A.2F260",
    "lineName": "2号紫玉之江",
    "busLineId": "166",
    "startStationName": "紫金港校区"
  },
  {
    "cycle": "1,2,3,4,5",
    "endStationId": "9",
    "sort": "107",
    "remark": "此趟次紫金港校区只停靠生活区、理工组团西和风雨操场，之江校区乘客优先，此趟次学生请勿搭乘",
    "busId": "16",
    "state": "1",
    "endTime": "830",
    "startStationId": "6",
    "id": "114",
    "startTime": "700",
    "busName": "教师16号班车",
    "endStationName": "之江校区",
    "carNumber": "测试",
    "lineName": "16号班车紫-文西-高一-西溪-玉-之江",
    "busLineId": "61",
    "startStationName": "紫金港校区"
  }
];

const query_stations = [
  [{
      "id": 6,
      "time": 1737,
      "name": "紫金港校区",
      "state": 1
    },
    {
      "id": 16,
      "time": "",
      "name": "玉泉校区教十二北面",
      "state": 1
    },
    {
      "id": 9,
      "time": 1850,
      "name": "之江校区",
      "state": 1
    }
  ],
  [{
      "id": 6,
      "time": 700,
      "name": "紫金港校区",
      "state": 1
    },
    {
      "id": 5,
      "time": "",
      "name": "紫金文苑西",
      "state": 1
    },
    {
      "id": 13,
      "time": "",
      "name": "高教一期",
      "state": 1
    },
    {
      "id": 8,
      "time": 745,
      "name": "西溪校区",
      "state": 1
    },
    {
      "id": 16,
      "time": 755,
      "name": "玉泉校区教十二北面",
      "state": 1
    },
    {
      "id": 9,
      "time": 830,
      "name": "之江校区",
      "state": 1
    }
  ]
]

Page({
  data: {
    lines: query_lines.map(item => {
      return {
        ...item,
        startTime: item.startTime.slice(0, -2) + ":" + item.startTime.slice(-2),
        endTime: item.endTime.slice(0, -2) + ":" + item.endTime.slice(-2),
        startStationName: item.startStationName.replace(/校区/g, ''),
        endStationName: item.endStationName.replace(/校区/g, ''),
        isWeekend: item.cycle.indexOf('7') === -1,
      };
    }),
    stations: query_stations.map(item => {
      const mapped = item.map(jtem => {
        const res = jtem.name.match(/校区(.+)/);
        const str = String(jtem.time);
        const t = str ? str.slice(0, -2) + ":" + str.slice(-2) : "";
        return {
          ...jtem,
          "station_alias": res ? res[1] : jtem.name,
          "time": t
        }
      });
      return mapped;
    }),
  },
  onLoad() {},
});