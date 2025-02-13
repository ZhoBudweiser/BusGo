

const cloud = require("@alipay/faas-server-sdk");
const DEFAULT_BUS_ALL_ENDS = [
  "紫金港校区",
  "玉泉校区",
  "西溪校区",
  "华家池校区",
  "之江校区",
  "湖滨",
  "紫金文苑",
  "雅仕苑",
  "丰谭路高教二期",
  "南都德加东",
  "城市心境",
  "高教一期",
  "恩济花园",
  "高教二期",
  "丰谭中学",
];

const derivedURL = "https://bccx.zju.edu.cn/schoolbus_wx/manage/";

exports.main = async (event, context) => {
  insertData();
};

async function insertData() {
  const collection = cloud.database().collection('bus-run-infos');
  const data = await fetchData(true).map((item) => {
    return {
      insertOne: {
        document: item
      }
    };
  });
  collection.bulkWrite(data);
}

async function fetchData(mock) {
  const data = [];
  DEFAULT_BUS_ALL_ENDS.forEach((startStationName) => {
    DEFAULT_BUS_ALL_ENDS.forEach(async (endStationName) => {
      if (startStationName === endStationName) return;
      const ids = mock ? [] : await getBusLineIdsByEnds(startStationName, endStationName);
      data.push({ startStationName, endStationName, ids });
    })
  });
}

/**
 * 根据起点终点获取校车路线 id 数组
 * @param {string} startStationName 起点站点名
 * @param {string} endStationName 终点站点名
 * @returns {string[]} 起点终点之间的校车路线 id 数组
 */
async function getBusLineIdsByEnds(startStationName, endStationName) {
  return await my.request({
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

}

/**
 * 提取api返回的数据
 * @param {object} res api返回的数据
 * @returns 提取的数据
 */
function stripData(res) {
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