import { baseURL, nop } from "./apis";
import { shuttleAllStations, shuttleLineStations } from "/util/cache";
import { distinctStations, fmtShuttleLines, stripData } from "/util/formatter";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/xbc/";

export async function getShuttleAllStations() {
  if (shuttleAllStations != null) return shuttleAllStations;
  const lineStations = await getShuttleALLLineStations();
  shuttleAllStations = distinctStations(Object.values(lineStations));
  return shuttleAllStations;
}

export async function getShuttleLinesByEnds(startStation, endStation) {}

export async function getShuttleStationsByShuttleId(sid) {
  if (shuttleLineStations.hasOwnProperty(sid)) return shuttleLineStations[sid];
  getShuttleALLLineStations();
  return shuttleLineStations[sid];
}

export async function getShuttleLinesByStationId(sid) {}

async function getShuttleALLLineStations() {
  if (Object.keys(shuttleLineStations).length !== 0) return shuttleLineStations;
  shuttleLineStations = await my.request({
    url: derivedURL + "getXbcLine",
    method: "POST",
    success: (res) => fmtShuttleLines(stripData(res)),
    fail: (err) => popQueryError(err, "校车站点"),
    complete: nop,
  });
  return shuttleLineStations;
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
