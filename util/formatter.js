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

export function fmtBusLines(busLines) {
  return busLines.map((busLine) => fmtBusLine(busLine));
}

export function fmtShuttleLines(shuttleLines) {
  return shuttleLines.map((shuttleLine) => fmtShuttleLine(shuttleLine));
}

export function fmtShuttleLineStations(lines) {
  return lines.reduce((pre_lines, line) => {
    pre_lines[line.bid] = line.station_list;
    return pre_lines;
  }, {});
}

function fmtBusLine(busLine) {
  return {
    ...busLine,
    duration: makeDuration(busLine.start_time, busLine.arrive_time),
    start_address: removeCampusPrefix(busLine.start_address),
    end_address: removeCampusPrefix(busLine.end_address),
    remark: busLine.memo,
  };
}

function makeDuration(startTime, arriveTime) {
  return removeSeconds(startTime) + "-" + removeSeconds(arriveTime);
}

function removeSeconds(time) {
  return time ? time.replace(/:\d{2}$/, "") : DEFAULT_TIME;
}

function removeCampusPrefix(address) {
  return address ? address.replace(/校区(.*)/g, "") : "";
}

function fmtShuttleLine(shuttleLine) {
  const item = replaceKeys(shuttleLine);
  const station_list = item.station_list;
  const n = station_list.length;
  const endIndex = n - 3 > 0 ? n - 3 : 0;
  return {
    station_list,
    bid: item.lid,
    start_address: extractAlias(station_list[0]),
    end_address: extractAlias(station_list[endIndex]),
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
