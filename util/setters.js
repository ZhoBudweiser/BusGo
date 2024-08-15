import { extractAddressName, removeCampusPrefix } from "./formatter";
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

export function setStationMarkers(stations, selectedStationId) {
  const markers = stations.map((item) => {
    return {
      ...item,
      id: item.station_alias_no,
      latitude: item.station_lat,
      longitude: item.station_long,
      width: 19,
      height: 31,
      iconPath:
        selectedStationId === item.station_alias_no
          ? "/images/mark_stop.png"
          : "/images/mark_bs.png",
      label: {
        content: removeCampusPrefix(item.station_alias),
        color: "#a2a2a2",
        fontSize: 14,
        borderRadius: 3,
        bgColor: "#ffffff",
        padding: 5,
      },
      markerLevel: 2,
    };
  });
  return markers;
}

export function updateStationMarkers(oldStationMarkers, selectedStationId) {
  let selectedStationPosition;
  const stationMarkers = oldStationMarkers.map((item) => {
    const match = item.id === selectedStationId;
    if (match) {
      selectedStationPosition = {
        latitude: item.latitude,
        longitude: item.longitude,
      };
    }
    return {
      ...item,
      iconPath: match ? "/images/mark_stop.png" : "/images/mark_bs.png",
    };
  });
  return { selectedStationPosition, stationMarkers };
}

export function setCarPositions(lines) {
  const iconPathSelection = (type) => {
    switch (type) {
      case "2":
        return "/images/map_shuttle.png";
      case "3":
        return "/images/map_babybus.png";
      case "21":
        return "/images/map_shuttle_no.png";
      case "31":
        return "/images/map_babybus_no.png";
      default:
        return "/images/map_bus.png";
    }
  };
  const carPositions = [];
  lines.forEach((item) => {
    if (item.runBusInfo) {
      carPositions.push({
        iconPath: iconPathSelection(item.runBusInfo[0].vehicleType),
        id: Number(item.runBusInfo[0].vehi_num.replace(/\D/g, "") * 1767),
        latitude: Number(item.runBusInfo[0].py),
        longitude: Number(item.runBusInfo[0].px),
        width: 30,
        height: 40,
        markerLevel: 3,
      });
    }
  });
  return carPositions;
}
