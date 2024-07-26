const DEFAULT_ARRIVE_TIME = "22:40";

export function stripData(res) {
  return res.data.data;
}

export function fmtBusLines(busLines) {
  return busLines.map((busLine) => fmtBusLine(busLine));
}

export function fmtShuttleLines(shuttleLines) {
    return shuttleLines.map((shuttleLine) => fmtShuttleLine(shuttleLine));
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
  return removeSeconds(startTime) + "-" + arriveTime
    ? removeSeconds(arriveTime)
    : DEFAULT_ARRIVE_TIME;
}

function removeSeconds(time) {
  return time.replace(/:\d{2}$/, "");
}

function removeCampusPrefix(address) {
  return address.replace(/校区(.*)/g, "");
}

function fmtShuttleLine(shuttleLine) {
  return replaceKeys(shuttleLine);
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

function distinctStops(lines) {
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
