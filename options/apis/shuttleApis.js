import { baseURL, nop } from "./apis";
import { fmtShuttleLines, stripData } from "/util/formatter";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/xbc/";

export async function getShuttleAllStations() {
}

export async function getShuttleLinesByEnds(startStation, endStation) {
}

export async function getShuttleStationsByShuttleId(bid) {
}

export async function getShuttleLinesByStationId(sid) {
}

async function getShuttleALLLines() {
  return await my.request({
    url: derivedURL + "getXbcLine",
    method: "POST",
    success: (res) => fmtShuttleLines(stripData(res)),
    fail: (err) => popQueryError(err, "校车站点"),
    complete: nop,
  });
}

async function getShuttleInfoByLineIdAndStationId(lid, sid) {
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

async function getShuttlePositionByLineId(lid) {
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
