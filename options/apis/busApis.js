import { baseURL, nop } from "./apiConfig";
import cache from "/util/cache";
import { extractLineIds, fmtBusLines, stripData } from "/util/formatter";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/manage/";

export async function getBusAllStations() {
  if (cache.busAllStations != null) return cache.busAllStations;
  cache.busAllStations = await my.request({
    url: derivedURL + "getNearStation?lat=30.30&lon=120.09",
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "站点获取"),
    complete: nop,
  }).then(stripData);
  return cache.busAllStations;
}

export async function getBusLinesByStationId(sid) {
  return await my.request({
    url: derivedURL + "getBcByStationName?bid=&stationName=" + sid,
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "班车路线"),
    complete: nop,
  }).then((res) => fmtBusLines(stripData(res)));
}

export async function getBusLineIdsByEnds(startStationName, endStationName) {
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

export async function getBusStationsByBusId(bid) {
  if (cache.busLineStations.hasOwnProperty(bid))
    return cache.busLineStations[bid];
  cache.busLineStations[bid] = await my.request({
    url: derivedURL + "getBcStationList?bid=" + bid,
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "班车站点"),
    complete: nop,
  }).then(stripData);
  return cache.busLineStations[bid];
}
