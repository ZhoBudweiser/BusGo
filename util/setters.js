import { extractAddressName } from "./formatter";
import { queryBackend } from "/options/apis/carApis";

export function debounce(fn, wait) {
  var timeout;
  return function () {
    var ctx = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(ctx, args);
    }, wait);
  };
}

export function flip(client, field) {
  client.setData({
    [field]: !client.data[field],
  });
}

export function setSysQueryFrequency(lines) {
  if (lines.length == 0) {
    return 600000;
  } else {
    if (lines.find((line) => line.runBusInfo !== null)) {
      return 10000;
    } else {
      return 60000;
    }
  }
}

export function setActiveCards(lines) {
  return lines.map((item) => item.runBusInfo !== null);
}

export function setHumanDistance(t) {
  const tt = Number(t);
  if (tt > 15) {
    return "5%";
  } else {
    const percentage = (35 - (tt / 35) * 100).toFixed(1) + "%";
    return percentage;
  }
}

export async function setCarLines(
  activeIndex,
  startStationName,
  endStationName,
) {
  const sname = extractAddressName(startStationName, activeIndex);
  const ename = extractAddressName(endStationName, activeIndex);
  const newBusLineIds = await queryBackend("linesByEnds", activeIndex, [
    sname,
    ename,
  ]);
  return newBusLineIds;
}

export async function setStation(activeIndex, sid) {
  if (sid == "") return;
  const stations = await queryBackend("allStations", activeIndex, []);
  const stationName = stations.find(
    (item) => item.station_alias_no === sid,
  ).station_alias;
  console.log("已选择的站点：", stationName);
  const selectedStation = {
    id: sid,
    name: stationName,
  };
  return selectedStation;
}
