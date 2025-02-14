const cloud = require("@alipay/faas-server-sdk");
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

exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();
  // const collection = db.collection(collectionName);
  // insertData(collection);
  updateData(db);
};

/**
 * 插入模拟的数据
 * @param {object} collection 集合
 */
async function insertData(collection) {
  const data = await fetchData(true);
  console.log(collection, "insert data: ", data);
  try {
    // 使用 add 方法批量插入数据
    const result = await collection.add({
      data
    });
    console.log("Data inserted successfully:", result);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

/**
 * 更新班车时刻表数据库
 * @param {object} db 数据库
 */
function updateData(db) {
  fetchData(false).then(async (data) => {
    // console.log("data: ", data);
    const collectionName = "bus-run-infos";
    try {
      await db.runTransaction(async transaction => {
        const collection = transaction.collection(collectionName);
        await collection.remove();
        console.log("Data removed successfully:");
        await collection.add({
          data
        });
        console.log("Data added successfully:");
      });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  });
}

/**
 * 删除集合中的所有记录
 * @param {object} collection 集合
 */
async function removeData(collection) {
  try {
    const result = await collection.remove();
    console.log("Data removed successfully:", result);
  } catch (error) {
    console.error("Error removing data:", error);
  }
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
    return {
      _id,
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