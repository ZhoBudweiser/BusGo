import {
  DEFAULT_BUS_END_PAIRS
} from "../props/defaults";
import {
  baseURL,
  nop
} from "./apiConfig";
import {
  LRUArray
} from "/beans/LRUArray";
import cache, {
  lru
} from "/util/cache";
import {
  extractLineIds,
  fmtBusLines,
  fmtBusStations,
  removeOutdateStations,
  stripData,
  stripCloudData
} from "/util/formatter";
import {
  popQueryError
} from "/util/notification";

const derivedURL = baseURL + "/manage/";

/**
 * 获取校车所有的站点
 * @returns {object[]} 所有班车站点
 */
export async function getBusAllStations() {
  if (cache.busAllStations != null) return cache.busAllStations;
  cache.busAllStations = await my.request({
    url: derivedURL + "getNearStation?lat=30.30&lon=120.09",
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "站点获取"),
    complete: nop,
  }).then((res) => removeOutdateStations(stripData(res), 0));
  return cache.busAllStations;
}

/**
 * 获取经过某站点的所有校车路线
 * @param {string} sid 站点 id
 * @returns {object[]} 该站点的所有校车路线
 */
export async function getBusLinesByStationId(sid) {
  return await my.request({
    url: derivedURL + "getBcByStationName?bid=&stationName=" + sid,
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "班车路线"),
    complete: nop,
  }).then(async (res) => await fmtBusLines(stripData(res)));
}

/**
 * 根据起点终点获取校车路线 id 数组
 * @param {string} startStationName 起点站点名
 * @param {string} endStationName 终点站点名
 * @returns {string[]} 起点终点之间的校车路线 id 数组
 */
export async function getBusLineIdsByEnds(startStationName, endStationName) {
  const onCloud = DEFAULT_BUS_END_PAIRS.find(
    (item) => item.startStationName.includes(startStationName) &&
    item.endStationName.includes(endStationName)
  );
  console.log("云函数查询：", onCloud);
  const ids = onCloud ? await getBusLineIdsByEndsCloud(onCloud.startStationName, onCloud.endStationName)
   : await getBusLineIdsByEndsURL(startStationName, endStationName);
  console.log("查询实时班车结果：", ids);
  return ids;
}

/**
 * 根据校车路线 id 获取校车路线的所有站点
 * @param {string} bid 校车路线 id
 * @returns {object[]} 校车路线的所有站点
 */
export async function getBusStationsByBusId(bid) {
  if (cache.busLineStations.hasOwnProperty(bid))
    return cache.busLineStations[bid];
  cache.busLineStations[bid] = await my.request({
    url: derivedURL + "getBcStationList?bid=" + bid,
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "班车站点"),
    complete: nop,
  }).then((res) => fmtBusStations(stripData(res)));
  return cache.busLineStations[bid];
}

/**
 * 根据校车 id 获取校车站点映射
 * @param {string} bid 校车 id
 * @returns 校车站点映射
 */
export async function getBusStationMapByBusId(bid) {
  if (cache.busStationMap.hasOwnProperty(bid))
    return cache.busStationMap[bid];
  cache.busStationMap[bid] = {};
  const stations = await getBusStationsByBusId(bid);
  stations.forEach(
    (station, i) => (cache.busStationMap[bid][station.station_alias_no] = i),
  );
  return cache.busStationMap[bid];
}

/**
 * 获取校车路线的所有站点
 * @param {string} selectedStation 所选择的站点
 * @returns 所有的校车终点站点
 */
export async function getBusAllEnds(selectedStation) {
  if (cache.busEnds.buffer == null) {
    // TODO: 云端获取
  }
  if (cache.busEnds.all == null) {
    // TODO: 云端获取
  }
  if (lru.bus == null) {
    lru.bus = new LRUArray(cache.busEnds.buffer, cache.busEnds.all);
  }
  return lru.bus.update(selectedStation);
}

/**
 * 通过 URL 直接根据起点终点获取校车路线 id 数组
 * @param {string} startStationName 起点站点名
 * @param {string} endStationName 终点站点名
 * @returns {string[]} 起点终点之间的校车路线 id 数组
 */
async function getBusLineIdsByEndsURL(startStationName, endStationName) {
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
    fail: (err) => popQueryError(err, "路线搜索"),
    complete: nop,
  }).then((res) => extractLineIds(stripData(res)));
}

/**
 * 通过云函数直接根据起点终点获取校车路线 id 数组
 * @param {string} startStationName 起点站点名
 * @param {string} endStationName 终点站点名
 * @returns {string[]} 起点终点之间的校车路线 id 数组
 */
async function getBusLineIdsByEndsCloud(startStationName, endStationName) {
  const context = await my.getCloudContext();
  return await new Promise((resolve, reject) =>
    context.callFunction({
      name: "queryTimeTable",
      data: {
        startStationName,
        endStationName,
      },
      success: (res) => resolve(stripCloudData(res)[0].ids),
      fail: (err) => reject(console.log("查询实时班车错误：", err)),
      complete: nop,
    }),
  );
}