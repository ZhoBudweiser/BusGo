import { popIsSame } from "./notification";
import {
  getBusStationMapByBusId,
  getBusStationsByBusId,
} from "/options/apis/busApis";
import { getShuttleStationMapByShuttleId } from "/options/apis/shuttleApis";
import { DEFAULT_TIME, OUTDATE_STATION_IDS } from "/options/props/defaults";

/**
 * 提取api返回的数据
 * @param {object} res api返回的数据
 * @returns 提取的数据
 */
export function stripData(res) {
  return res.data.data;
}

/**
 * 提取云服务返回的数据
 * @param {object} res 云服务返回的数据
 * @returns 提取的数据
 */
export function stripCloudData(res) {
  return res.result.data;
}

/**
 * 将秒数转换为分钟数
 * @param {number} second 秒数
 * @returns 分钟数
 */
export function second2minute(second) {
  return (second / 60).toFixed(1);
}

/**
 * 根据班车线路去重站点
 * @param {object[]} lines 班车线路
 * @returns 去重后的站点数组
 */
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

/**
 * 提取班车线路ID
 * @param {object[]} carLines 班车线路数组
 * @returns 班车线路id数组
 */
export function extractLineIds(carLines) {
  return carLines.map((carLine) => carLine.bid);
}

/**
 * 提取校区名
 * @param {string} name 带校区和站点的全称
 * @param {number} dataType 类型
 * @returns 提取校区名
 */
export function extractAddressName(name, dataType) {
  if (dataType == 1) return name;
  return name.indexOf("华家池") === -1 ? removeCampusSuffix(name) : "华家池";
}

/**
 * 移除过期的站点
 * @param {object[]} stations 班车站点
 * @param {number} activeIndex 班车类型
 * @returns 
 */
export function removeOutdateStations(stations, activeIndex) {
  return stations.filter((station) => !OUTDATE_STATION_IDS[activeIndex].has(station.station_alias_no));
}

/**
 * 格式化校车线路
 * @param {object[]} busLines 校车线路
 * @returns {object[]} 格式化的校车线路
 */
export async function fmtBusLines(busLines) {
  return await Promise.all(
    busLines.map(async (busLine) => await fmtBusLine(busLine)),
  );
}

/**
 * 格式化校车站点
 * @param {object[]} busStations 校车站点
 * @returns {object[]} 格式化的校车站点
 */
export function fmtBusStations(busStations) {
  return busStations.map((busStation) => fmtBusStation(busStation));
}

/**
 * 格式化小白车线路
 * @param {object[]} shuttleLines 小白车线路
 * @returns {object[]} 格式化的小白车线路
 */
export function fmtShuttleLines(shuttleLines) {
  return shuttleLines.map((shuttleLine) => fmtShuttleLine(shuttleLine));
}

/**
 * 格式化小白车线路ID-站点
 * @param {object[]} lines 小白车线路
 * @returns {object} 格式化的小白车线路
 */
export function fmtShuttleLineStations(lines) {
  return lines.reduce((pre_lines, line) => {
    pre_lines[line.bid] = line.stations;
    return pre_lines;
  }, {});
}

/**
 * 格式化时间
 * @param {number} time 时间戳
 * @param {string} fmt 格式
 * @returns {string} 格式化后的时间
 */
export function fmtTime(time, fmt = "YYYY-MM-DD hh:mm:ss") {
  const dte = new Date(time);

  function getYearWeek(date) {
    var date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var date2 = new Date(date.getFullYear(), 0, 1);

    //获取1月1号星期（以周一为第一天，0周一~6周日）
    var dateWeekNum = date2.getDay() - 1;
    if (dateWeekNum < 0) {
      dateWeekNum = 6;
    }
    if (dateWeekNum < 4) {
      // 前移日期
      date2.setDate(date2.getDate() - dateWeekNum);
    } else {
      // 后移日期
      date2.setDate(date2.getDate() + 7 - dateWeekNum);
    }
    var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
    if (d < 0) {
      var date3 = new Date(date1.getFullYear() - 1, 11, 31);
      return getYearWeek(date3);
    } else {
      // 得到年数周数
      var year = date1.getFullYear();
      var week = Math.ceil((d + 1) / 7);
      return week;
    }
  }

  var o = {
    "M+": dte.getMonth() + 1, // 月份
    "D+": dte.getDate(), // 日
    "h+": dte.getHours(), // 小时
    "m+": dte.getMinutes(), // 分
    "s+": dte.getSeconds(), // 秒
    "q+": Math.floor((dte.getMonth() + 3) / 3), // 季度
    S: dte.getMilliseconds(), // 毫秒
    "W+": getYearWeek(dte), // 周数
  };
  if (/(Y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (dte.getFullYear() + "").substr(4 - RegExp.$1.length),
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length),
      );
    }
  return fmt;
}

/**
 * 格式化时间表查询结果
 * @param {object} info 查询的信息
 * @param {object[]} queryResult 查询的结果
 * @returns 
 */
export function fmtTimeTableQueryResults(info, queryResult) {
  return queryResult
    .map((item) =>
      item.length
        ? fmtQueryArrayResult(info, item)
        : fmtQueryResult(info, item),
    )
    .sort((l1, l2) => {
      const n1 = l1.sortNum ? l1.sortNum : l1[0].sortNum;
      const n2 = l2.sortNum ? l2.sortNum : l2[0].sortNum;
      return n1 < n2 ? -1 : n1 == n2 ? 0 : 1;
    });
}

/**
 * 判断两个查询信息是否相同
 * @param {object} a 查询信息 a
 * @param {object} b 查询信息 b
 * @returns {boolean} 是否相同
 */
export function isSameQuery(a, b) {
  if (isObjectValueEqual(a, b)) {
    popIsSame();
    return true;
  } else {
    return false;
  }
}

/**
 * 格式化校车线路对象
 * @param {object} busLine 校车线路对象
 * @returns {object} 格式化后的校车线路对象
 */
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

/**
 * 格式化时间
 * @param {string} startTime 出发时间
 * @param {string} arriveTime 到达时间
 * @returns 格式化的时间
 */
function makeDuration(startTime, arriveTime) {
  return removeSeconds(startTime) + "-" + removeSeconds(arriveTime);
}

/**
 * 去除时间的秒
 * @param {string} time 带有秒的时间
 * @returns 去除秒的时间
 */
function removeSeconds(time) {
  return time ? time.replace(/:\d{2}$/, "") : DEFAULT_TIME;
}

/**
 * 去除校区名之外的后缀
 * @param {string} address 带站点的校区全称
 * @returns 校区名
 */
function removeCampusSuffix(address) {
  return address ? address.replace(/校区(.*)/g, "") : "";
}

/**
 * 格式化小白车线路对象
 * @param {object} shuttleLine 小白车线路对象
 * @returns {object} 格式化的小白车线路对象
 */
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
    duration: "间隔发车",
    remark: "",
  };
}

/**
 * 提取站点名称
 * @param {object} station 站点对象
 * @returns 站点名称
 */
function extractAlias(station) {
  return station ? station.station_alias : "";
}

/**
 * 修改对象的键名
 * @param {object} obj 被修改的对象
 * @returns 修改后的对象
 */
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

/**
 * 将驼峰命名转换为下划线命名
 * @param {string} str 名称
 * @returns 下划线命名
 */
function convertNameStyle(str) {
  let temp = str.replace(/[A-Z]/g, function (i) {
    return "_" + i.toLowerCase();
  });
  if (temp.slice(0, 1) === "_") {
    temp = temp.slice(1);
  }
  return temp;
}

/**
 * 去除校区前缀
 * @param {string} address 带有校区的地址
 * @returns 去除校区前缀的地址
 */
export function removeCampusPrefix(address) {
  return address ? address.replace(/(.*?)校区(?=.)/g, "") : "";
}

/**
 * 判断两个对象是否相等
 * @param {object} a 对象 a
 * @param {objectj} b 对象 b
 * @returns {boolean} 是否相等
 */
function isObjectValueEqual(a, b) {
  if (!a || !b) return false;
  // 判断两个对象是否指向同一内存，指向同一内存返回true
  if (a === b) return true;
  // 获取两个对象键值数组
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);
  // 判断两个对象键值数组长度是否一致，不一致返回false
  if (aProps.length !== bProps.length) return false;
  // 遍历对象的键值
  for (let prop in a) {
    // 判断a的键值，在b中是否存在，不存在，返回false
    if (b.hasOwnProperty(prop)) {
      // 判断a的键值是否为对象，是则递归，不是对象直接判断键值是否相等，不相等返回false
      if (typeof a[prop] === "object") {
        if (!isObjectValueEqual(a[prop], b[prop])) return false;
      } else if (a[prop] !== b[prop]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

/**
 * 格式化校车站点对象
 * @param {object} busStation 校车站点对象
 * @returns {object} 格式化的校车站点对象
 */
function fmtBusStation(busStation) {
  return {
    ...busStation,
    station_alias: removeCampusPrefix(busStation.station_alias),
  };
}

/**
 * 格式化时间表查询结果
 * @param {object} info 查询信息
 * @param {object} item 查询的结果
 * @returns {object} 格式化后的查询结果
 */
function fmtQueryResult(info, item) {
  const stations = item["stations"];
  const startTime = "" + item.startTime,
    endTime = "" + item.endTime;
  const yuquan = passByYuquan(stations);
  return {
    ...item,
    remark: fmtYuquan(item, yuquan),
    sortNum: Number(item.startTime),
    startTime: startTime.slice(0, -2) + ":" + startTime.slice(-2),
    endTime: endTime.slice(0, -2) + ":" + endTime.slice(-2),
    startStationName: item.startStation.replace(/校区(.*)/g, ""),
    endStationName: item.endStation.replace(/校区(.*)/g, ""),
    isWeekend: item.cycle === 7 || item.cycle.indexOf("6") !== -1,
    stations: fmtStations(info, stations),
  };
}

/**
 * 
 * @param {object} info 查询信息
 * @param {object} items 查询结果数组
 * @returns {object[]} i格式化的查询结果数组
 */
function fmtQueryArrayResult(info, items) {
  return items.map((item) => fmtQueryResult(info, item));
}

/**
 * 格式化站点
 * @param {object} info 查询信息
 * @param {object[]} stations 站点数组
 * @returns {object[]} 格式化的站点数组
 */
function fmtStations(info, stations) {
  return stations.map((jtem) => {
    const res = jtem.name.match(/校区(.+)/);
    const str = String(jtem.time);
    const t = str ? str.slice(0, -2) + ":" + str.slice(-2) : "";
    return {
      ...jtem,
      station_alias: res
        ? jtem.name.indexOf("玉泉校区") === -1
          ? res[1]
          : "玉泉校区"
        : jtem.name,
      time: t,
      start: jtem.name.indexOf(info.startAddress) !== -1,
      end: jtem.name.indexOf(info.endAddress) !== -1,
    };
  });
}

/**
 * 提取玉泉校区站点
 * @param {object[]} stations 站点数组
 * @returns {string} 玉泉校区站点
 */
function passByYuquan(stations) {
  const station = stations.filter(
    (item) => item.name.indexOf("玉泉校区") !== -1,
  );
  if (!station.length) return "";
  else return station[0].name;
}

/**
 * 为经过玉泉校区的班车信息添加途径点备注
 * @param {object} item 班车信息
 * @param {string} yuquan 玉泉途径点
 * @returns 带有途径点的班车信息
 */
function fmtYuquan(item, yuquan) {
  return (
    (yuquan ? "班车途经" + yuquan + (item.remark ? "； " : "") : "") +
    item.remark
  );
}
