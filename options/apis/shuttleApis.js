import { baseURL, nop } from "./apiConfig";
import cache from "/util/cache";
import {
  distinctStations,
  extractLineIds,
  fmtShuttleLines,
  fmtShuttleLineStations,
  stripData,
} from "/util/formatter";
import { popQueryError } from "/util/notification";

const derivedURL = baseURL + "/xbc/";

export async function getShuttleAllStations() {
  if (cache.shuttleAllStations != null) return cache.shuttleAllStations;
  const lineStations = await getShuttleALLLineStations();
  cache.shuttleAllStations = distinctStations(Object.values(lineStations));
  return cache.shuttleAllStations;
}

export async function getShuttleLinesByStationId(sid) {
  const lines = await getShuttleALLLines();
  const filteredLines = findShttleLinesByStationId(lines, sid);
  const filteredPoses = await Promise.all(
    await filteredLines.map(async (flines) =>
      getShuttlePositionByLineId(flines.bid),
    ),
  );
  const filteredInfos = await Promise.all(
    await filteredLines.map(async (flines) =>
      getShuttleInfoByLineIdAndStationId(flines.bid, sid),
    ),
  );
  return matchShuttleRunInfo(lines, filteredPoses, filteredInfos);
}

export async function getShuttleLineIdsByEnds(
  startStationName,
  endStationName,
) {
  const lines = await getShuttleALLLines();
  const filteredLines = findShttleLinesByEnds(
    lines,
    startStationName,
    endStationName,
  );
  return extractLineIds(filteredLines);
}

export async function getShuttleStationsByShuttleId(lid) {
  const lineStations = await getShuttleALLLineStations();
  return lineStations[lid];
}

async function getShuttleALLLineStations() {
  if (Object.keys(cache.shuttleLineStations).length !== 0)
    return cache.shuttleLineStations;
  const lines = await getShuttleALLLines();
  cache.shuttleLineStations = fmtShuttleLineStations(lines);
  return cache.shuttleLineStations;
}

async function getShuttleALLLines() {
  if (cache.shuttleAllLines != null) return cache.shuttleAllLines;
  cache.shuttleAllLines = await my.request({
    url: derivedURL + "getXbcLine",
    method: "POST",
    success: nop,
    fail: (err) => popQueryError(err, "校车站点"),
    complete: nop,
  }).then((res) => fmtShuttleLines(stripData(res)));
  return cache.shuttleAllLines;
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
    success: nop,
    fail: (err) => popQueryError(err, "班车信息"),
    complete: nop,
  }).then(stripData);
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
    success: nop,
    fail: (err) => popQueryError(err, "班车位置"),
    complete: nop,
  }).then(stripData);
}

function findShttleLinesByEnds(lines, startStationName, endStationName) {
  const filteredLines = lines.filter((stationLine) => {
    let startStationIndex = -1;
    let endStationIndex = -1;
    let match = false;
    stationLine.station_list.forEach((station) => {
      if (station.station_alias == startStationName) {
        startStationIndex = i;
      } else if (station.station_alias == endStationName) {
        endStationIndex = i;
        if (startStationIndex !== -1 && startStationIndex < endStationIndex) {
          match = true;
        }
      }
    });
    return match;
  });
  return filteredLines;
}

function findShttleLinesByStationId(lines, sid) {
  const filteredLines = lines.filter((stationLine) =>
    stationLine.station_list.some((station) => sid == station.station_alias_no),
  );
  return filteredLines;
}

function matchShuttleRunInfo(lines, poses, infos) {
  return lines
    .map((lineInfo, i) => {
      const runInfos = poses[i].map((pos) => {
        const info = infos[i].find((i) => pos.vehiNum === i.vehiNum);
        return {
          ...lineInfo,
          runBusInfo: [
            {
              vehi_num: info ? info.vehiNum : "无信号班车",
              near_distance: info ? info.costStationCount : 1,
              about_minute: info ? info.costMinute : 0,
              next_station: info ? info.nextStation : 0,
              px: pos.px,
              py: pos.py,
              vehicleType: pos.vehicleType + (info ? "" : "1"),
            },
          ],
        };
      });
      return runInfos;
    })
    .flat(1);
}
