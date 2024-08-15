import { extractAddressName, removeCampusPrefix } from "./formatter";
import { queryBackend } from "/options/apis/carApis";
import {
  BUS_IMG_PATH,
  NOP,
  RED_SHUTTLE_IMG_PATH,
  SELECTED_STATION_IMG_PATH,
  STATION_ID_LABEL,
  UNSELECTED_STATION_IMG_PATH,
  WHITE_SHUTTLE_IMG_PATH,
} from "/options/props/defaults";

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
      id: STATION_ID_LABEL + item.station_alias_no,
      latitude: item.station_lat,
      longitude: item.station_long,
      width: 19,
      height: 31,
      iconPath:
        selectedStationId === item.station_alias_no
          ? SELECTED_STATION_IMG_PATH
          : UNSELECTED_STATION_IMG_PATH,
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
  const sid = STATION_ID_LABEL + selectedStationId;
  const stationMarkers = oldStationMarkers.map((item) => {
    const match = item.id === sid;
    if (match) {
      selectedStationPosition = {
        latitude: item.latitude,
        longitude: item.longitude,
      };
    }
    return {
      ...item,
      iconPath: match ? SELECTED_STATION_IMG_PATH : UNSELECTED_STATION_IMG_PATH,
    };
  });
  return { selectedStationPosition, stationMarkers };
}

export function setCarMarkers(lines) {
  const iconPathSelection = (type) => {
    switch (type) {
      case "2":
        return WHITE_SHUTTLE_IMG_PATH;
      case "3":
        return RED_SHUTTLE_IMG_PATH;
      case "21":
        return WHITE_SHUTTLE_IMG_PATH;
      case "31":
        return RED_SHUTTLE_IMG_PATH;
      default:
        return BUS_IMG_PATH;
    }
  };
  const carPositions = [];
  lines.forEach((item) => {
    if (item.runBusInfo) {
      carPositions.push({
        iconPath: iconPathSelection(item.runBusInfo[0].vehicleType),
        id: Number(item.runBusInfo[0].vehi_num.replace(/\D/g, "")),
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

export function setRoute(stations) {
  const n = stations.length;
  const throughPoints = stations
    .map((item) => {
      return {
        lng: item.station_long,
        lat: item.station_lat,
      };
    })
    .slice(1, n - 1);
  const startPoint = {
    startLat: stations[0].station_lat,
    startLng: stations[0].station_long,
  };
  const endPoint = {
    endLat: stations[n - 1].station_lat,
    endLng: stations[n - 1].station_long,
  };
  return { throughPoints, startPoint, endPoint };
}

export function drawRoute(mapCtx, stations) {
  const { throughPoints, startPoint, endPoint } = setRoute(stations);
  mapCtx.showRoute({
    ...DEFAULT_ROUTE,
    ...startPoint,
    ...endPoint,
    searchType: "drive",
    throughPoints,
  });
}

export function drawCarPositions(mapCtx, carMarkers, add) {
  if (add) {
    mapCtx.changeMarkers({
      add: carMarkers,
    });
    console.log("添加汽车：", carMarkers);
  } else {
    carMarkers.forEach((item) => {
      mapCtx.translateMarker({
        markerId: item.id,
        destination: {
          longitude: Number(item.longitude),
          latitude: Number(item.latitude),
        },
        autoRotate: true,
        duration: 9000,
        animationEnd: NOP,
        success: NOP,
        fail: (err) => console.log("汽车动画遇到错误：", item, err),
        complete: NOP,
      });
    });
    console.log("汽车发生了移动：", carMarkers);
  }
}
