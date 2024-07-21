import { baseURL, nop, stripData } from "./apis";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/manage/";

export async function getBusStationsByPosition(lat, lon) {
  return await my.request({
    url: derivedURL + "getNearStation?lat=" + lat + "&lon=" + lon,
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "站点获取"),
    complete: nop,
  });
}

export async function getBusLinesByStart(startStation, endStation) {
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
    success: stripData,
    fail: (err) => popQueryError(err, "路线搜索"),
    complete: nop,
  });
}

export async function getBusStationsByBusId(bid) {
  return await my.request({
    url: derivedURL + "getBcStationList?bid=" + bid,
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "班车站点"),
    complete: nop,
  });
}

export async function getBusLinesByBusIdAndStationId(bid, sid) {
  return my.request({
    url: derivedURL + "getBcByStationName?bid=" + bid + "&stationName=" + sid,
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "班车路线"),
    complete: nop,
  });
}
