import { queryBusStopsByBid } from "/util/queryhelper"

var jsUnitRpx = 'false';
/* eslint-disable no-continue, prefer-spread */

export default function fmtUnit(oldUnit) {
  var getUnit = oldUnit;

  if (jsUnitRpx === 'true') {
    if (typeof getUnit === 'string' && getUnit === 'px') {
      getUnit = 'rpx';
    } else if (typeof getUnit === 'number') {
      getUnit *= 2;
    } else if (typeof getUnit === 'string') {
      getUnit = oldUnit.match(/(\d+|\d+\.\d+)(px)/)[1] * 2 + 'rpx';
    }
  }

  return getUnit;
}

export const timeFormat = (time, fmt = 'YYYY-MM-DD hh:mm:ss') => {
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
    'M+': dte.getMonth() + 1, // 月份
    'D+': dte.getDate(), // 日
    'h+': dte.getHours(), // 小时
    'm+': dte.getMinutes(), // 分
    's+': dte.getSeconds(), // 秒
    'q+': Math.floor((dte.getMonth() + 3) / 3), // 季度
    S: dte.getMilliseconds(), // 毫秒
    'W+': getYearWeek(dte), // 周数
  };
  if (/(Y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (dte.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      );
    }
  return fmt;
}

const convertNameStyle = (str) => {
  let temp = str.replace(/[A-Z]/g, function(i) {
      return '_' + i.toLowerCase();
  })
  if (temp.slice(0,1) === '_') {
      temp = temp.slice(1);
  }
  return temp;
}

export const replaceKeys = (obj) => {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceKeys(item));
  } else {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = convertNameStyle(key) || key;
      acc[newKey] = replaceKeys(obj[key]);
      return acc;
    }, {});
  }
};

export const toCampus = (name) => {
  return name.indexOf("华家池") === -1 ? name.replace(/校区(.*)/g, '') : "华家池";
}

const fmtBusLine = async function (client, item) {
  try {
    let stations;
    if (client.data.stationsBuffers.hasOwnProperty(item.bid)) {
      stations = client.data.stationsBuffers[item.bid];
    } else {
      stations = await queryBusStopsByBid(item.bid);
      stations = stations.data.data;
      client.data.stationsBuffers[item.bid] = stations;
    }
    return {
      ...item,
      line_alias: item.line_alias,
      station_map: stations ? stations.map(item => item.station_alias_no).reduce((acc, currentValue, index) => {
        acc[currentValue] = index;
        return acc;
      }, {}) : null,
      duration: item.start_time.replace(/:\d{2}$/, '') + '-' + (item.arrive_time ? item.arrive_time.replace(/:\d{2}$/, '') : "22:40"),
      start_address: item.start_address.replace(/校区(.*)/g, ''),
      end_address: item.end_address.replace(/校区(.*)/g, ''),
      remark: item.memo,
      stations: stations ? stations.map(item => {
        const res = item.station_alias.match(/校区(.+)/);
        return {
          ...item,
          "station_alias": res ? res[1] : item.station_alias
        }
      }) : null,
    };
  } catch (err) {
    console.log(err);
  }
}

export async function getFormatedBusLines(client, res) {
  const queryRes = await res.map(async item => fmtBusLine(client, item));
  const results = await Promise.all(queryRes);
  client.setData({
    busLines: results
  });
  my.hideLoading();
  return results;
}

export function distinctStops(lines) {
  const visits = new Set();
  return lines.reduce((pre_stations, cur_list) => {
    return pre_stations.concat(cur_list.reduce((pres, station) => {
      if (visits.has(station.station_alias_no)) {
        return pres;
      } else {
        visits.add(station.station_alias_no);
        return pres.concat([station]);
      }
    }, []));
  }, []);
}