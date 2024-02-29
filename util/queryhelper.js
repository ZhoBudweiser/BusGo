import {
  replaceKeys,
  toCampus,
  fmtBusLine,
  distinctStops,
} from "/util/fmtUnit";
import {
  endAddresses
} from "/util/data";

const getNearestStop = (poses, lat, lon) => {
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


export const getBusStops = (client, lat, lon) => {
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getNearStation?lat=' + lat + '&lon=' + lon,
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const poses = res.data.data;
      const stopid = getNearestStop(poses, lat, lon);
      client.setData({
        selectedStop: stopid,
        stops: poses
      });
    },
    fail: function (error) {
      console.error('fail: ', JSON.stringify(error));
    },
    complete: function (res) {
      my.hideLoading();
    },
  });
};

export const getShuttleStops = (client, lat, lon) => {
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/xbc/getXbcLine',
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const lines = replaceKeys(res.data.data);
      const stations = distinctStops(lines.map(item => item.station_list));
      const stopid = getNearestStop(stations, lat, lon);
      client.setData({
        selectedStop: stopid,
        stops: stations
      });
    },
    fail: function (error) {
      console.error('fail: ', JSON.stringify(error));
    },
    complete: function (res) {
      my.hideLoading();
    },
  });
};

const getAllAvailableDestinationsByStart = (client) => {
  const currentLocation = toCampus(client.data.selectedStopName);
  const availableDestinations = endAddresses.map(end => my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/searchLine',
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
    fail: (error) => console.error('fail: ', JSON.stringify(error)),
  }).then(res => res.data.data));
  Promise.all(availableDestinations).then(res => console.log(res));
  // console.log(Promise.all(availableDestinations));
}

export const getAvailableBusLineByStart = (client) => {
  my.showLoading({
    content: '查询中...'
  });
  const currentLocation = toCampus(client.props.nearest_stop_name);
  const endLocation = toCampus(client.data.selectedEnd);
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/searchLine',
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
    fail: (error) => console.error('fail: ', JSON.stringify(error)),
  }).then(res => client.props.onSetBusLines(res.data.data));
}

export const getStopsByBusLines = async (client, busLines) => {
  const queryRes = await busLines.map(async item => {
    return my.request({
      url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getBcByStationName?bid=' + item.bid + '&stationName=',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      dataType: 'json',
      success: res => res,
      fail: function (error) {
        console.error('fail: ', JSON.stringify(error));
      },
      complete: function (res) {
  
      },
    }).then(res => fmtBusLine(res.data.data[0], client));
  });
  const results = await Promise.all(queryRes);
  console.log(results);
  client.setData({
    busLines: results
  });
  return results;
}


// ------------------------------

const queryBusStopsByBid = async (bid) => {
  try {
    let result = await my.request({
      url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getBcStationList?bid=' + bid,
      method: 'POST',
      headers: {
        'content-type': 'application/json', //默认值  
      },
      dataType: 'json',
    });
    return result;
  } catch (error) {
    console.log(error);
  }
}

export const queryBusLinesByStop = (parm) => {
  const client = parm.obj;
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getBcByStationName?bid=' + parm.bid + '&stationName=' + parm.stopId,
    method: 'POST',
    headers: {
      'content-type': 'application/json', //默认值
    },
    dataType: 'json',
    success: async function (res) {
      const queryRes = await res.data.data.map(async item => fmtBusLine(item, client));
      const results = await Promise.all(queryRes);
      client.setData({
        busLines: results
      });
      my.hideLoading();
    },
    fail: function (error) {
      console.error('fail: ', JSON.stringify(error));
    },
    complete: function (res) {

    },
  });
}