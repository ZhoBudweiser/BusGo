import { baseURL, nop } from "./apis";
import { busAllStations, busLineStations } from "/util/cache";
import { extractLineIds, fmtBusLines, stripData } from "/util/formatter";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/manage/";

export async function getBusAllStations() {
  if (busAllStations != null) return busAllStations;
  busAllStations = await my.request({
    url: derivedURL + "getNearStation?lat=30.30&lon=120.09",
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "站点获取"),
    complete: nop,
  });
  return busAllStations;
}

export async function getBusLinesByStationId(sid) {
  return my.request({
    url: derivedURL + "getBcByStationName?bid=&stationName=" + sid,
    method: "POST",
    success: (res) => fmtBusLines(stripData(res)),
    fail: (err) => popQueryError(err, "班车路线"),
    complete: nop,
  });
}

export async function getBusLineIdsByEnds(startStation, endStation) {
  return await my.request({
    url: derivedURL + "searchLine",
    method: "POST",
    data: {
      begin_station: startStation,
      end_station: endStation,
      date: "00",
      time: "00",
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    success: (res) => extractLineIds(stripData(res)),
    fail: (err) => popQueryError(err, "路线搜索"),
    complete: nop,
  });
}

export async function getBusStationsByBusId(bid) {
  if (busLineStations.hasOwnProperty(bid)) return busLineStations[bid];
  busLineStations[bid] = await my.request({
    url: derivedURL + "getBcStationList?bid=" + bid,
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "班车站点"),
    complete: nop,
  });
  return busLineStations[bid];
}
