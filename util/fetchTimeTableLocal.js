const axios = require('axios');

const DEFAULT_BUS_END_PAIRS = [{
    startStationName: "紫金港校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "湖滨"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "紫金文苑"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "雅仕苑"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "丰谭路高教二期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "南都德加东"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "城市心境"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "高教一期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "恩济花园"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "高教二期"
  },
  {
    startStationName: "紫金港校区",
    endStationName: "丰谭中学"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "玉泉校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "华家池校区"
  },
  {
    startStationName: "西溪校区",
    endStationName: "之江校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "之江校区",
    endStationName: "西溪校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "紫金港校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "玉泉校区"
  },
  {
    startStationName: "华家池校区",
    endStationName: "西溪校区"
  },
];

const derivedURL = "https://bccx.zju.edu.cn/schoolbus_wx/manage/";
updateData();

/**
 * 更新班车时刻表数据库
 * @param {object} db 数据库
 */
function updateData() {
  fetchData(false).then(async (data) => {
    console.log("data: ", data);
  });
}

/**
 * 获取当天的校车班次数据
 * @param {boolean} mock 是否模拟数据，true-模拟，false-不模拟
 */
async function fetchData(mock) {
  const data = await DEFAULT_BUS_END_PAIRS.map(async (pairs, _id) => {
    const {
      startStationName,
      endStationName
    } = pairs;
    const ids = mock ? [_id + 1] : await getBusLineIdsByEnds(startStationName, endStationName);
    const timestamp = Date.now();
    return {
      _id,
      timestamp,
      startStationName,
      endStationName,
      ids
    };
  });
  return Promise.all(data);
}

/**
 * 根据起点终点获取校车路线 id 数组
 * @param {string} startStationName 起点站点名
 * @param {string} endStationName 终点站点名
 * @returns {string[]} 起点终点之间的校车路线 id 数组
 */
async function getBusLineIdsByEnds(startStationName, endStationName) {
  return await axios.request({
    url: derivedURL + "searchLine",
    method: "POST",
    data: {
      begin_station: startStationName,
      end_station: endStationName,
      date: "00",
      time: "00",
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    success: nop,
    fail: (err) => console.log("查询失败", err, startStationName, endStationName),
    complete: nop,
  }).then((res) => extractLineIds(stripData(res)));
}

function nop() {
  // console.log("done: ", e);
}

/**
 * 提取api返回的数据
 * @param {object} res api返回的数据
 * @returns 提取的数据
 */
function stripData(res) {
  // console.log("raw data: ", res.data.data);
  return res.data.data;
}

/**
 * 提取班车线路ID
 * @param {object[]} carLines 班车线路数组
 * @returns 班车线路id数组
 */
function extractLineIds(carLines) {
  return carLines.map((carLine) => carLine.bid);
}