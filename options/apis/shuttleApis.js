import { baseURL, nop, stripData } from "./apis";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/xbc/";

export async function getShuttleStations() {
  return await my.request({
    url: derivedURL + "getXbcLine",
    method: "POST",
    success: stripData,
    fail: (err) => popQueryError(err, "校车站点"),
    complete: nop,
  });
}

export async function getShuttleInfoByLineIdAndStationId(lid, sid) {
  return await my.request({
    url: derivedURL + "getXbcVehicleRun",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      lid: lid,
      stationAliasNo: sid,
    },
    success: stripData,
    fail: (err) => popQueryError(err, "班车信息"),
    complete: nop,
  });
}

export async function getShuttlePositionByLineId(lid) {
  return await my.request({
    url: derivedURL + "getXbcVehicleByLine",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      lid: lid,
    },
    success: stripData,
    fail: (err) => popQueryError(err, "班车位置"),
    complete: nop,
  });
}
