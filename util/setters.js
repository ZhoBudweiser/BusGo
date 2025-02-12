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
  UNSELECTED_STATION_IMG_PATH,
  WHITE_SHUTTLE_IMG_PATH,
} from "/options/props/defaults";

/**
 * 设置日期、星期、问候语
 * @param {Number} time 时间戳
 * @returns {Object} 日期、星期、问候语
 */
export function setDate(time) {
  const d = new Date(time);
  const datelist = ["日", "一", "二", "三", "四", "五", "六"];
  const date = d.getMonth() + 1 + " 月 " + d.getDate() + " 日";
  const week = "星期" + datelist[d.getDay()];
  const greeting = setGreeting(d.getHours(), d.getDay());
  return { date, week, greeting };
}

/**
 * 根据目标Y坐标和状态边界数组设置状态
 * @param {number} targetY 目标Y坐标
 * @param {number[]} stateBoders 状态边界数组
 * @returns 状态
 */
export function setState(targetY, stateBoders) {
  for (let i = stateBoders.length - 1; i >= 0; --i) {
    if (targetY > stateBoders[i]) {
      return i + 1;
    }
  }
  return 0;
}

/**
 * 设置时间表最近的站点
 * @returns {Promise} 最近的站点
 */
export function setTimeTableNearestStation() {
  return new Promise((resolve, reject) =>
    my.getLocation({
      type: 0,
      success: (userPosition) => resolve(setNearestStationId(DEFAULT_QUERY_ALL_ENDS_POSITIONS ,userPosition)),
      fail: reject,
    }),
  );
}

/**
 * 设置查询的频率
 * @param {object[]} lines 班车路线数组
 * @returns {number} 查询的频率
 */
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

/**
 * 根据用户的位置返回最近的站点 id
 * @param {object[]} stations 站点数组
 * @param {Object} userPosition 用户的位置
 * @returns {string} 最近的站点 id
 */
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

/**
 * 根据用户的位置返回最近的校区索引
 * @param {object[]} stations 校区中心点位置数组
 * @param {Object} userPosition 用户的位置
 * @returns 最近的校区索引
 */
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

/**
 * 展开正在运行的班车卡片
 * @param {object[]} lines 班车路线数组
 * @returns 班车卡片激活数组
 */
export function setActiveCards(lines) {
  return lines.map((item) => item.runBusInfo !== null);
}

/**
 * 设置用户在概览卡片中的位置
 * @param {number} t 时间花费
 * @returns 位置（百分位）
 */
export function setHumanDistance(t) {
  const tt = Number(t);
  if (tt > 15) {
    return "5%";
  } else {
    const percentage = (35 - (tt / 35) * 100).toFixed(1) + "%";
    return percentage;
  }
}

/**
 * 根据起止点查询班车线路
 * @param {number} activeIndex 班车类型
 * @param {string} startStationName 起点名称
 * @param {string} endStationName 终点名称
 * @returns 查询的班车线路 id 数组
 */
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

/**
 * 设置站点对象
 * @param {number} activeIndex 班车类型
 * @param {string} sid 站点 id
 * @returns {object} 站点对象
 */
export async function setStationObj(activeIndex, sid) {
  if (sid == "") return null;
  const stations = await queryBackend("allStations", activeIndex, [], false);
  const ret = stations.find((item) => item.station_alias_no === sid);
  return ret
    ? { ...ret, longitude: ret.station_long, latitude: ret.station_lat }
    : ret;
}

/**
 * 设置所选站点
 * @param {number} activeIndex 班车类型
 * @param {string} sid 站点 id
 * @returns {object} 所选站点
 */
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

/**
 * 根据路线 id 查询途径站点
 * @param {number[]} lineIds 路线 id 数组
 * @param {number} activeIndex 班车类型
 * @returns {object[]} 查询路线的途径站点数组
 */
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

/**
 * 替换站点标记数组
 * @param {object} mapCtx 地图上下文
 * @param {object[]} stations 站点数组
 * @param {number} selectedStation 所选的站点
 * @param {number} length 最短的合并站点距离
 * @param {object[]} oldStationMarkers 旧的站点标记数组
 * @returns 新的站点标记数组
 */
export function changeStationMarkers(
  mapCtx,
  stations,
  selectedStation,
  length,
  oldStationMarkers,
) {
  // 清空旧站点
  if (oldStationMarkers.length !== 0) {
    mapCtx.changeMarkers({
      remove: oldStationMarkers,
    });
    console.log("清空了站点：", oldStationMarkers);
  }
  // 添加新站点
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

/**
 * 根据所选站点 id 更新地图上的图标
 * @param {object[]} oldStationMarkers 旧的站点标记数组
 * @param {number} selectedStationId 所选站点的 id
 * @returns 所选站点的经纬度和新的站点标记数组
 */
export function updateStationMarkers(oldStationMarkers, selectedStationId) {
  let selectedStationPosition;
  const sid = STATION_ID_LABEL + selectedStationId;
  const stationMarkers = oldStationMarkers.map((item) => {
    const match = item.id === sid;
    // 找到所选站点的经纬度
    if (match) {
      selectedStationPosition = {
        latitude: item.latitude,
        longitude: item.longitude,
      };
    }
    return {
      ...item,
      // 更新图标路径
      iconPath: match ? SELECTED_STATION_IMG_PATH : UNSELECTED_STATION_IMG_PATH,
    };
  });
  return { selectedStationPosition, stationMarkers };
}

/**
 * 根据班车位置设置班车标记数组
 * @param {object[]} lines 班车线路数组
 * @returns 班车标记数组
 */
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
    // 班车正在运行
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

/**
 * 绘制班车路线
 * @param {object} mapCtx 地图上下文
 * @param {object[]} stations 站点数组
 */
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

/**
 * @deprecated 请使用 drawCarPositions
 * @param {Object} mapCtx 地图上下文
 * @param {object[]} carMarkers 班车标记数组
 * @param {boolean} add 是否添加新的班车标记
 */
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

/**
 * 绘制班车位置
 * @param {object} mapCtx 地图上下文
 * @param {object[]} newCarMarkers 新的汽车标记数组
 * @param {object[]} oldCarMarkers 旧的汽车标记数组
 */
export function drawCarPositions(mapCtx, newCarMarkers, oldCarMarkers) {
  const carIds = new Set(newCarMarkers.map((item) => item.id));
  // 去除消失的汽车标记，添加新的汽车标记
  mapCtx.changeMarkers({
    remove: oldCarMarkers.filter((item) => !carIds.has(item.id)),
    add: oldCarMarkers.filter((item) => carIds.has(item.id)),
  });
  // 移动汽车标记
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

/**
 * 设置班车卡片高度
 * @param {object[]} lines 班车路线数组
 * @returns {object[]} 班车卡片高度数组
 */
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

/**
 * 设置问候语
 * @param {number} hour 小时
 * @param {Number} day 星期
 * @returns {string} 问候语
 */
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

/**
 * 根据站点数组获取路径参数
 * @param {object[]} stations 站点数组
 * @returns 途径站点数组、起点、终点
 */
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

/**
 * 设置站点标记数组
 * @param {object[]} stations 站点数组
 * @param {number} selectedStationId 选择的站点 id
 * @param {number} length 站点之间合并的最短距离
 * @returns {object[]} 站点标记数组
 */
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

/**
 * 合并所有相似站点
 * @param {object[]} allStations 所有站点
 * @param {number} minMatchLength 最短合并站点名称距离
 * @returns {object[]} 合并后的站点
 */
function mergeSimilarStations(allStations, minMatchLength) {
  const mergedStations = [];
  const stations = allStations.concat();
  if (minMatchLength > 20) return stations;
  // TODO: 优化合并算法复杂度
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
      // 合并站点
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

/**
 * 获取两个字符串的公共子串
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns 公共子串
 */
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

/**
 * 合并两个站点
 * @param {object} stationA 站点 A
 * @param {object} stationB 站点 B
 * @param {string} commonSubstring 公共名称
 * @returns {object} 合并后的站点
 */
function mergeStations(stationA, stationB, commonSubstring) {
  return {
    station_alias: commonSubstring,
    station_alias_no: stationA.station_alias_no,
    station_long: (stationA.station_long + stationB.station_long) / 2,
    station_lat: (stationA.station_lat + stationB.station_lat) / 2,
  };
}
