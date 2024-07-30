import {
  getBusStationMapByBusId,
  getBusStationsByBusId,
} from "/options/apis/busApis";
import { getShuttleStationMapByShuttleId } from "/options/apis/shuttleApis";
import { DEFAULT_TIME } from "/options/props/defaults";

export function stripData(res) {
  return res.data.data;
}

export function distinctStations(lines) {
  const visits = new Set();
  return lines.reduce((pre_stations, cur_list) => {
    return pre_stations.concat(
      cur_list.reduce((pres, station) => {
        if (visits.has(station.station_alias_no)) {
          return pres;
        } else {
          visits.add(station.station_alias_no);
          return pres.concat([station]);
        }
      }, []),
    );
  }, []);
}

export function extractLineIds(busLines) {
  return busLines.map((busLine) => busLine.bid);
}

export function extractAddressName(name, dataType) {
  if (dataType == 1) return name;
  return name.indexOf("华家池") === -1
    ? name.replace(/校区(.*)/g, "")
    : "华家池";
}

export async function fmtBusLines(busLines) {
  return await Promise.all(
    busLines.map(async (busLine) => await fmtBusLine(busLine)),
  );
}

export function fmtBusStations(busStations) {
  return busStations.map((busStation) => fmtBusStation(busStation));
}

export function fmtShuttleLines(shuttleLines) {
  return shuttleLines.map((shuttleLine) => fmtShuttleLine(shuttleLine));
}

export function fmtShuttleLineStations(lines) {
  return lines.reduce((pre_lines, line) => {
    pre_lines[line.bid] = line.stations;
    return pre_lines;
  }, {});
}

async function fmtBusLine(busLine) {
  return {
    ...busLine,
    stations: await getBusStationsByBusId(busLine.bid),
    station_map: await getBusStationMapByBusId(busLine.bid),
    duration: makeDuration(busLine.start_time, busLine.arrive_time),
    start_address: removeCampusSuffix(busLine.start_address),
    end_address: removeCampusSuffix(busLine.end_address),
    remark: busLine.memo,
  };
}

function makeDuration(startTime, arriveTime) {
  return removeSeconds(startTime) + "-" + removeSeconds(arriveTime);
}

function removeSeconds(time) {
  return time ? time.replace(/:\d{2}$/, "") : DEFAULT_TIME;
}

function removeCampusSuffix(address) {
  return address ? address.replace(/校区(.*)/g, "") : "";
}

function fmtShuttleLine(shuttleLine) {
  const item = replaceKeys(shuttleLine);
  const stations = item.station_list;
  const n = stations.length;
  const endIndex = n - 3 > 0 ? n - 3 : 0;
  return {
    stations,
    station_map: getShuttleStationMapByShuttleId(item.lid, stations),
    bid: item.lid,
    start_address: extractAlias(stations[0]),
    end_address: extractAlias(stations[endIndex]),
    runBusInfo: null,
    line_alias: item.line_alias,
    duration: item.line_alias,
    remark: "",
  };
}

function extractAlias(station) {
  return station ? station.station_alias : "";
}

function replaceKeys(obj) {
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceKeys(item));
  } else {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = convertNameStyle(key) || key;
      acc[newKey] = replaceKeys(obj[key]);
      return acc;
    }, {});
  }
}

function convertNameStyle(str) {
  let temp = str.replace(/[A-Z]/g, function (i) {
    return "_" + i.toLowerCase();
  });
  if (temp.slice(0, 1) === "_") {
    temp = temp.slice(1);
  }
  return temp;
}

function fmtBusStation(busStation) {
  return {
    ...busStation,
    station_alias: removeCampusPrefix(busStation.station_alias)
  };
}

function removeCampusPrefix(address) {
  return address ? address.replace(/(.*?)校区(?=.)/g, "") : "";
}
