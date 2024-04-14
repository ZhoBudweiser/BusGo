import {
  replaceKeys,
  toCampus,
  getFormatedBusLines,
  getFormatedShuttleLines,
  distinctStops,
} from "/util/fmtUnit";
import {
  endAddresses
} from "/util/data";
import {
  findShttleLinesByStartOnly
} from "./shuttlehelper";

export const getNearestStop = (poses, lat, lon) => {
  let min_dist = 9999,
    target_id = "1007";
  poses.forEach(item => {
    const cur_lat = item.station_lat,
      cur_lon = item.station_long;
    const dist = (cur_lat - lat) * (cur_lat - lat) + (cur_lon - lon) * (cur_lon - lon);
    if (dist < min_dist) {
      min_dist = dist;
      target_id = item.station_alias_no;
    }
  });
  return target_id;
}

const baseURL = "https://bccx.zju.edu.cn";

export const getBusStops = (client, lat, lon) => {
  my.request({
    url: baseURL + '/schoolbus_wx/manage/getNearStation?lat=' + lat + '&lon=' + lon,
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const poses = res.data.data;
      client.setData({
        stops: poses,
        allstops: poses,
      });
    },
    fail: function (error) {
      console.log('fail: ', JSON.stringify(error));
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
    complete: function (res) {
      // my.hideLoading();
    },
  });
};

export const getShuttleStops = (client, lat, lon) => {
  const shuttleStops_res = my.getStorageSync({
    key: 'shuttleStops'
  });
  if (shuttleStops_res.success) {
    client.setData({
      shuttleLines: shuttleStops_res.data.lines,
      stops: shuttleStops_res.data.stations,
      allstops: shuttleStops_res.data.stations,
    });
    return;
  }
  my.request({
    url: baseURL + '/schoolbus_wx/xbc/getXbcLine',
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const lines = replaceKeys(res.data.data);
      const stations = distinctStops(lines.map(item => item.station_list));
      client.setData({
        shuttleLines: lines,
        stops: stations,
        allstops: stations,
      });
      my.setStorageSync({
        key: 'shuttleStops',
        data: {lines, stations},
      });
    },
    fail: function (error) {
      console.log('fail: ', JSON.stringify(error));
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
    complete: function (res) {
      // my.hideLoading();
    },
  });
};

const getAllAvailableDestinationsByStart = (client) => {
  const currentLocation = toCampus(client.data.selectedStopName);
  const availableDestinations = endAddresses.map(end => my.request({
    url: baseURL + '/schoolbus_wx/manage/searchLine',
    method: 'POST',
    data: {
      begin_station: currentLocation,
      end_station: end,
      data: '00',
      time: '00',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    dataType: 'json',
    success: (res) => res,
    fail: (error) => console.log('fail: ', JSON.stringify(error)),
  }).then(res => res.data.data));
  Promise.all(availableDestinations).then(res => console.log(res));
  // console.log(Promise.all(availableDestinations));
}

export const getAvailableBusLineByStart = (client) => {
  const currentLocation = toCampus(client.props.nearest_stop_name);
  const endLocation = toCampus(client.data.selectedEnd);
  my.request({
    url: baseURL + '/schoolbus_wx/manage/searchLine',
    method: 'POST',
    data: {
      begin_station: currentLocation,
      end_station: endLocation,
      date: '00',
      time: '00',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    dataType: 'json',
    success: (res) => res,
    fail: (error) => {
      console.log('fail: ', JSON.stringify(error));
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
  }).then(res => client.props.onSetBusLines(res.data.data));
}


// ------------------------------

export const queryBusStopsByBid = async (bid) => {
  try {
    let result = await my.request({
      url: baseURL + '/schoolbus_wx/manage/getBcStationList?bid=' + bid,
      method: 'POST',
      headers: {
        'content-type': 'application/json', //默认值  
      },
      dataType: 'json',
    });
    return result;
  } catch (error) {
    console.log(error);
    my.alert({
      title: '查询服务',
      content: '当前实时定位异常，先试试静态查询吧',
      buttonText: '确定',
    });
  }
}

export const queryBusLinesByStop = (parm) => {
  const client = parm.obj;
  if (parm.stopId == 0) return;
  my.request({
    url: baseURL + '/schoolbus_wx/manage/getBcByStationName?bid=' + parm.bid + '&stationName=' + parm.stopId,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    dataType: 'json',
    success: async (res) => getFormatedBusLines(client, res.data.data),
    fail: function (error) {
      console.log('fail: ', JSON.stringify(error));
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
    complete: function (res) {
      // my.hideLoading();
    },
  });
}

export const queryShttleLinesByStop = (parm) => {
  const client = parm.obj;
  getFormatedShuttleLines(client, findShttleLinesByStartOnly(client));
}

export const queryRunInfo = async (client, item) => {
  return await my.request({
    url: baseURL + '/schoolbus_wx/xbc/getXbcVehicleRun',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    dataType: 'json',
    data: {
      lid: item.bid,
      stationAliasNo: client.data.selectedStop,
    },
    success: (res) => res,
    fail: function (error) {
      console.log('fail: ', error);
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
    complete: function (res) {},
  });
}

export const queryRunPos = async (lid) => {
  return await my.request({
    url: baseURL + '/schoolbus_wx/xbc/getXbcVehicleByLine',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    dataType: 'json',
    data: {
      lid: lid,
    },
    success: (res) => res,
    fail: function (error) {
      console.log('fail: ', error);
      my.alert({
        title: '查询服务',
        content: '当前实时定位异常，先试试静态查询吧',
        buttonText: '确定',
      });
    },
    complete: function (res) {
      // my.hideLoading();
    },
  });
}


export const setTimer = (client) => {
  if (client.timer)
    clearInterval(client.timer);
  if (client.data.activeIndex === 0) {
    queryBusLinesByStop({
      bid: '',
      stopId: client.data.selectedStop,
      obj: client
    });
    client.timer = setInterval(queryBusLinesByStop, client.data.queryFrequency, {
      bid: '',
      stopId: client.data.selectedStop,
      obj: client
    });
  } else if (client.data.activeIndex === 1) {
    queryShttleLinesByStop({
      obj: client
    });
    client.timer = setInterval(queryShttleLinesByStop, client.data.queryFrequency, {
      obj: client
    });
  }
}

export function isObjectValueEqual(a, b) {
  if (!a || !b) return false;
  // 判断两个对象是否指向同一内存，指向同一内存返回true
  if (a === b) return true
  // 获取两个对象键值数组
  let aProps = Object.getOwnPropertyNames(a)
  let bProps = Object.getOwnPropertyNames(b)
  // 判断两个对象键值数组长度是否一致，不一致返回false
  if (aProps.length !== bProps.length) return false
  // 遍历对象的键值
  for (let prop in a) {
    // 判断a的键值，在b中是否存在，不存在，返回false
    if (b.hasOwnProperty(prop)) {
      // 判断a的键值是否为对象，是则递归，不是对象直接判断键值是否相等，不相等返回false
      if (typeof a[prop] === 'object') {
        if (!isObjectValueEqual(a[prop], b[prop])) return false
      } else if (a[prop] !== b[prop]) {
        return false
      }
    } else {
      return false
    }
  }
  return true
}