import { baseURL, nop } from "./apiConfig";
import { calculateDistance } from "./locationApis";
import { LRUArray } from "/beans/LRUArray";
import cache, { lru } from "/util/cache";
import {
  distinctStations,
  extractLineIds,
  fmtShuttleLines,
  fmtShuttleLineStations,
  removeOutdateStations,
  stripData,
} from "/util/formatter";
import { popQueryError } from "/util/notification";
import { setStationObj } from "/util/setters";

const derivedURL = baseURL + "/xbc/";

export async function getShuttleAllStations() {
  if (cache.shuttleAllStations != null) return cache.shuttleAllStations;
  const lineStations = await getShuttleALLLineStations();
  cache.shuttleAllStations = removeOutdateStations(
    distinctStations(Object.values(lineStations)),
    1,
  );
  return cache.shuttleAllStations;
}

export async function getShuttleLinesByStationId(sid) {
  const lines = await getShuttleALLLines();
  const stationObj = await setStationObj(1, sid);
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
  return await matchShuttleRunInfo(
    filteredLines,
    filteredPoses,
    filteredInfos,
    stationObj,
  );
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

export function getShuttleStationMapByShuttleId(lid, stations) {
  if (cache.shuttleStationMap.hasOwnProperty(lid))
    return cache.shuttleStationMap[lid];
  cache.shuttleStationMap[lid] = {};
  stations.forEach(
    (station, i) =>
      (cache.shuttleStationMap[lid][station.station_alias_no] = i),
  );
  return cache.shuttleStationMap[lid];
}

export async function getShuttleAllEnds(selectedStation) {
  if (cache.shuttleEnds.buffer == null) {
    // TODO: 云端获取
  }
  if (cache.shuttleEnds.all == null) {
    // TODO: 云端获取
  }
  if (lru.shuttle == null) {
    lru.shuttle = new LRUArray(cache.shuttleEnds.buffer, cache.shuttleEnds.all);
  }
  return lru.shuttle.update(selectedStation);
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
  cache.shuttleAllLines = await my
    .request({
      url: derivedURL + "getXbcLine",
      method: "POST",
      success: nop,
      fail: (err) => popQueryError(err, "校车站点"),
      complete: nop,
    })
    .then((res) => fmtShuttleLines(stripData(res)));
  return cache.shuttleAllLines;
}

async function getShuttleInfoByLineIdAndStationId(lid, sid) {
  return await my
    .request({
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
    })
    .then(stripData);
}

async function getShuttlePositionByLineId(lid) {
  return await my
    .request({
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
    })
    .then(stripData);
}

function findShttleLinesByEnds(lines, startStationName, endStationName) {
  const filteredLines = lines.filter((stationLine) => {
    let startStationIndex = -1;
    let endStationIndex = -1;
    let match = false;
    stationLine.stations.forEach((station, i) => {
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
    stationLine.stations.some((station) => sid == station.station_alias_no),
  );
  return filteredLines;
}

async function matchShuttleRunInfo(lines, poses, infos, stationObj) {
  return (
    await Promise.all(
      lines.map(async (lineInfo, i) => {
        return await Promise.all(
          poses[i].map(async (pos) => {
            const info = infos[i].find((i) => pos.vehiNum === i.vehiNum);
            return {
              ...lineInfo,
              runBusInfo: info
                ? [
                    {
                      vehi_num: info.vehiNum,
                      near_distance: await calculateDistance(
                        stationObj,
                        {
                          longitude: pos.px,
                          latitude: pos.py,
                        },
                        "drive",
                      ),
                      about_minute: info.costMinute,
                      next_station: info.nextStation,
                      ...pos,
                    },
                  ]
                : null,
            };
          }),
        );
      }),
    )
  ).flat(1);
}
