import { extractAddressName, removeCampusPrefix } from "./formatter";
import { queryBackend } from "/options/apis/carApis";
import {
  BUS_IMG_PATH,
  DEFAULT_CAR_QUERY_FREQUENCY_NOCAR,
  DEFAULT_CAR_QUERY_FREQUENCY_RUNING,
  DEFAULT_CAR_QUERY_FREQUENCY_WAIT,
  DEFAULT_QUERY_ALL_ENDS_POSITIONS,
  DEFAULT_ROUTE,
  DEFAULT_STATION,
  GREETINGS,
  NOP,
  RED_SHUTTLE_IMG_PATH,
  SELECTED_STATION_IMG_PATH,
  STATION_ID_LABEL,
  UNION_LENGTH,
  UNSELECTED_STATION_IMG_PATH,
  WHITE_SHUTTLE_IMG_PATH,
} from "/options/props/defaults";

export function setDate(time) {
  const d = new Date(time);
  const datelist = ["日", "一", "二", "三", "四", "五", "六"];
  const date = d.getMonth() + 1 + " 月 " + d.getDate() + " 日";
  const week = "星期" + datelist[d.getDay()];
  const greeting = setGreeting(d.getHours(), d.getDay());
  return { date, week, greeting };
}

export function setState(targetY, stateBoders) {
  for (let i = stateBoders.length - 1; i >= 0; --i) {
    if (targetY > stateBoders[i]) {
      return i + 1;
    }
  }
  return 0;
}

export function setTimeTableNearestStation() {
  return new Promise((resolve, reject) =>
    my.getLocation({
      type: 0,
      success: (userPosition) => resolve(setNearestStationId(DEFAULT_QUERY_ALL_ENDS_POSITIONS ,userPosition)),
      fail: reject,
    }),
  );
}

export function setSysQueryFrequency(lines) {
  if (lines.length == 0) {
    return DEFAULT_CAR_QUERY_FREQUENCY_NOCAR;
  } else {
    if (lines.find((line) => line.runBusInfo !== null)) {
      return DEFAULT_CAR_QUERY_FREQUENCY_RUNING;
    } else {
      return DEFAULT_CAR_QUERY_FREQUENCY_WAIT;
    }
  }
}

export function setNearestStationId(stations, userPosition) {
  if (stations.length === 0) return "";
  const { latitude, longitude } = userPosition;
  const stationDistances = stations.map((item) => {
    const { station_lat: stationLatitude, station_long: stationLongitude } =
      item;
    const dist =
      (stationLatitude - latitude) * (stationLatitude - latitude) +
      (stationLongitude - longitude) * (stationLongitude - longitude);
    return dist;
  });
  let minIndex = 0;
  for (let i = 0; i < stationDistances.length; ++i) {
    if (stationDistances[minIndex] > stationDistances[i]) {
      minIndex = i;
    }
  }
  return stations[minIndex].station_alias_no;
}

export function setNearestCampusIndex(stations, userPosition) {
  if (stations.length === 0) return "";
  const { latitude, longitude } = userPosition;
  const stationDistances = stations.map((item) => {
    const { latitude: stationLatitude, longitude: stationLongitude } = item;
    const dist =
      (stationLatitude - latitude) * (stationLatitude - latitude) +
      (stationLongitude - longitude) * (stationLongitude - longitude);
    return dist;
  });
  let minIndex = 0;
  for (let i = 0; i < stationDistances.length; ++i) {
    if (stationDistances[minIndex] > stationDistances[i]) {
      minIndex = i;
    }
  }
  return minIndex;
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

export async function setStationObj(activeIndex, sid) {
  if (sid == "") return null;
  const stations = await queryBackend("allStations", activeIndex, [], false);
  const ret = stations.find((item) => item.station_alias_no === sid);
  return ret
    ? { ...ret, longitude: ret.station_long, latitude: ret.station_lat }
    : ret;
}

export async function setStation(activeIndex, sid) {
  if (sid == "") return DEFAULT_STATION;
  const stationObj = await setStationObj(activeIndex, sid);
  if (!stationObj) return DEFAULT_STATION;
  const stationName = stationObj.station_alias;
  console.log("已选择的站点：", stationObj);
  const selectedStation = {
    id: sid,
    name: stationName,
  };
  return selectedStation;
}

export async function setLineStations(lineIds, activeIndex) {
  const allStations = await Promise.all(
    lineIds.map(
      async (id) =>
        await queryBackend("stationsByLineId", activeIndex, [id], false),
    ),
  );
  const queriedStations = [];
  const visit = new Set();
  for (let i = 0; i < allStations.length; ++i) {
    allStations[i].forEach((station) => {
      if (!visit.has(station.station_alias_no)) {
        queriedStations.push(station);
        visit.add(station.station_alias_no);
      }
    });
  }
  return queriedStations;
}

export function changeStationMarkers(
  mapCtx,
  stations,
  selectedStation,
  length,
  oldStationMarkers,
) {
  if (oldStationMarkers.length !== 0) {
    mapCtx.changeMarkers({
      remove: oldStationMarkers,
    });
    console.log("清空了站点：", oldStationMarkers);
  }
  const stationMarkers = setStationMarkers(
    stations,
    selectedStation.id,
    length,
  );
  mapCtx.changeMarkers({
    add: stationMarkers,
  });
  console.log("添加了站点：", stationMarkers);
  return stationMarkers;
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

export function drawCarPositions_old(mapCtx, carMarkers, add) {
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
        duration: DEFAULT_CAR_QUERY_FREQUENCY_RUNING * 0.8,
        animationEnd: NOP,
        success: NOP,
        fail: (err) => console.log("汽车动画遇到错误：", item, err),
        complete: NOP,
      });
    });
    console.log("汽车发生了移动：", carMarkers);
  }
}

export function drawCarPositions(mapCtx, newCarMarkers, oldCarMarkers) {
  const carIds = new Set(newCarMarkers.map((item) => item.id));
  mapCtx.changeMarkers({
    remove: oldCarMarkers.filter((item) => !carIds.has(item.id)),
    add: oldCarMarkers.filter((item) => carIds.has(item.id)),
  });
  newCarMarkers.forEach((item) => {
    mapCtx.translateMarker({
      markerId: item.id,
      destination: {
        longitude: item.longitude,
        latitude: item.latitude,
      },
      autoRotate: true,
      duration: DEFAULT_CAR_QUERY_FREQUENCY_RUNING * 0.8,
      animationEnd: NOP,
      success: NOP,
      fail: (err) => console.log("汽车动画遇到错误：", item, err),
      complete: NOP,
    });
  });
  console.log("汽车发生了移动：", newCarMarkers);
}

export function setCardHeights(lines) {
  return lines.map((item) => {
    if (!item.length) {
      if (item.remark) {
        return ["85rpx", "240rpx"];
      } else {
        return ["50rpx", "200rpx"];
      }
    } else {
      let minH = 0,
        maxH = 0;
      item.forEach((l) => {
        if (l.remark) {
          minH += 97;
          maxH += 240;
        } else {
          minH += 57;
          maxH += 200;
        }
      });
      return [minH + "rpx", maxH + "rpx"];
    }
  });
}

function setGreeting(hour, day) {
  let hGreeting = "晚上";
  if (hour >= 5 && hour < 11) {
    hGreeting = "早上";
  } else if (hour >= 11 && hour < 13) {
    hGreeting = "中午";
  } else if (hour >= 13 && hour < 18) {
    hGreeting = "下午";
  }
  return hGreeting + "好！" + GREETINGS[day];
}

function setRoute(stations) {
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

function setStationMarkers(stations, selectedStationId, length) {
  const markers = mergeSimilarStations(stations, length).map((item) => {
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

function mergeSimilarStations(allStations, minMatchLength) {
  const mergedStations = [];
  const stations = allStations.concat();
  if (minMatchLength > 20) return stations;
  while (stations.length > 0) {
    const currentStation = stations.shift();
    let merged = false;
    for (let i = 0; i < mergedStations.length; i++) {
      const mergedStation = mergedStations[i];
      const commonSubstring = findCommonSubstring(
        currentStation.station_alias,
        mergedStation.station_alias,
      );
      const matchLength = commonSubstring.length;
      if (
        matchLength >= minMatchLength ||
        matchLength == currentStation.station_alias.length
      ) {
        mergedStations[i] = mergeStations(
          mergedStation,
          currentStation,
          commonSubstring,
        );
        merged = true;
        break;
      }
    }
    if (!merged) {
      mergedStations.push(currentStation);
    }
  }
  return mergedStations;
}

function findCommonSubstring(str1, str2) {
  let common = "";
  for (let i = 0; i < str1.length; i++) {
    for (let j = i; j < str1.length; j++) {
      const substring = str1.substring(i, j + 1);
      if (str2.indexOf(substring) !== -1 && substring.length > common.length) {
        common = substring;
      }
    }
  }
  return common;
}

function mergeStations(stationA, stationB, commonSubstring) {
  return {
    station_alias: commonSubstring,
    station_alias_no: stationA.station_alias_no,
    station_long: (stationA.station_long + stationB.station_long) / 2,
    station_lat: (stationA.station_lat + stationB.station_lat) / 2,
  };
}
