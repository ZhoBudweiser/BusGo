import { load } from "./cache";
import { popTooFrequent } from "./notification";
import { queryBackend } from "/options/apis/carApis";
import {
  DEFAULT_LOCATION_QUERY_FREQUENCY,
  DEFAULT_STATION,
  DEFAULT_THROTTLE_FREQUENCY,
} from "/options/props/defaults";

export function flip(client, field) {
  client.setData({
    [field]: !client.data[field],
  });
}

export function setLocationTimer(client) {
  my.getLocation({
    type: 0,
    success: (userPosition) => {
      const selectedStation = DEFAULT_STATION;
      const queriedStations = client.data.queriedStations;
      client.setData({ userPosition, selectedStation, queriedStations });
      flip(client, "moveToUserPosition");
    },
    fail: () => console.log("自动定位错误"),
  });
  return setInterval(autoLocate, DEFAULT_LOCATION_QUERY_FREQUENCY, client);
}

export function resetCarTimer(client, dataType, sid, frequency) {
  const timer = client.data.carTimer;
  if (timer != null) clearInterval(timer);
  queryLinesByStationId(client, dataType, sid)();
  const carTimer = setInterval(
    queryLinesByStationId(client, dataType, sid),
    frequency,
  );
  client.setData({ carTimer });
}

export async function selectStation(client, sid) {
  if (sid == "") return;
  const stations = await queryBackend(
    "allStations",
    client.data.activeIndex,
    [],
  );
  const stationName = stations.find(
    (item) => item.station_alias_no === sid,
  ).station_alias;
  console.log("已选择的站点：", stationName);
  client.setData({
    selectedStation: {
      id: sid,
      name: stationName,
    },
  });
}

export function setData(client, key, data) {
  client.setData({ [key]: data });
}

export function loadAndSet(client, key) {
  const res = load(key);
  if (res.success) {
    client.setData({
      [key]: res.data,
    });
    console.log("已存入缓存：", key);
  }
}

export function isThrottle(client) {
  const { throttleTimer: oldTimer, throttle } = client.data;
  const clearTimer = () => {
    client.setData({
      throttle: false,
      throttleTimer: null,
    });
  };
  if (oldTimer) {
    clearTimeout(oldTimer);
  }
  if (throttle) {
    popTooFrequent();
  }
  const throttleTimer = setTimeout(clearTimer, DEFAULT_THROTTLE_FREQUENCY);
  client.setData({
    throttle: true,
    throttleTimer,
  });
  return throttle;
}

function autoLocate(client) {
  my.getLocation({
    type: 0,
    success: (userPosition) => client.setData({ userPosition }),
    fail: () => console.log("自动定位错误"),
  });
  console.log("已获取定位");
}

function queryLinesByStationId(client, dataType, sid) {
  return async () => {
    const { queriedLineIds } = client.data;
    const notfiltered = (bid) =>
      queriedLineIds == null || queriedLineIds.indexOf(bid) !== -1;
    // 可能是稳定排序
    const cmpRunAndDuration = (la, lb) => {
      return Number(lb.runBusInfo != null) - Number(la.runBusInfo != null);
    };
    const carLines = (
      await queryBackend("linesByStationId", dataType, [sid], false)
    )
      .filter((line) => notfiltered(line.bid))
      .toSorted(cmpRunAndDuration);
    client.setData({ carLines });
    console.log("查询到班次：", carLines);
  };
}
