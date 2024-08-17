import { popIsSame } from "./notification";
import {
  getBusStationMapByBusId,
  getBusStationsByBusId,
} from "/options/apis/busApis";
import { getShuttleStationMapByShuttleId } from "/options/apis/shuttleApis";
import { DEFAULT_TIME } from "/options/props/defaults";

export function stripData(res) {
  return res.data.data;
}

export function stripCloudData(res) {
  return res.result.data;
}

export function second2minute(second) {
  return (second / 60).toFixed(1);
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

export function extractLineIds(carLines) {
  return carLines.map((carLine) => carLine.bid);
}

export function extractAddressName(name, dataType) {
  if (dataType == 1) return name;
  return name.indexOf("华家池") === -1 ? removeCampusSuffix(name) : "华家池";
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

export function isSameQuery(a, b) {
  if (isObjectValueEqual(a, b)) {
    popIsSame();
    return true;
  } else {
    return false;
  }
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

export function removeCampusPrefix(address) {
  return address ? address.replace(/(.*?)校区(?=.)/g, "") : "";
}

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

function fmtBusStation(busStation) {
  return {
    ...busStation,
    station_alias: removeCampusPrefix(busStation.station_alias),
  };
}

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

function fmtQueryArrayResult(info, items) {
  return items.map((item) => fmtQueryResult(info, item));
}

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

function passByYuquan(stations) {
  const station = stations.filter(
    (item) => item.name.indexOf("玉泉校区") !== -1,
  );
  if (!station.length) return "";
  else return station[0].name;
}

function fmtYuquan(item, yuquan) {
  return (
    (yuquan ? "班车途经" + yuquan + (item.remark ? "； " : "") : "") +
    item.remark
  );
}
