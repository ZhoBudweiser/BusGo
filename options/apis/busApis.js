import { baseURL, nop } from "./apiConfig";
import { LRUArray } from "/beans/LRUArray";
import cache, { lru } from "/util/cache";
import { extractLineIds, fmtBusLines, fmtBusStations, removeOutdateStations, stripData } from "/util/formatter";
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
  }).then((res) => removeOutdateStations(stripData(res), 0));
  return cache.busAllStations;
}

export async function getBusLinesByStationId(sid) {
  return await my.request({
    url: derivedURL + "getBcByStationName?bid=&stationName=" + sid,
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "班车路线"),
    complete: nop,
  }).then(async (res) => await fmtBusLines(stripData(res)));
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
  }).then((res) => fmtBusStations(stripData(res)));
  return cache.busLineStations[bid];
}

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