import {
  distinctStops,
  getFormatedBusLines,
  getFormatedShuttleLines,
} from "/util/fmtUnit";
import { showQuerying } from "/util/notification";
import { getStart } from "/util/data";
import { flip } from "/util/setters";
import {
  authGuideLocation,
} from "/options/apis/locationApis";
import { queryBackend } from "/options/apis/carApis";
import { popNoCar } from "/util/notification";
import { extractAddressName } from "/util/formatter";
import { loadAndSet, resetCarTimer, selectStation, setLocationTimer } from "/util/client";
import { load, store } from "/util/cache";

const eventHandlers = {
  onActive,
  onSetTimeCost,
  onSelectedStop,
  onSetBusLines,
  onSetStopsByBusLines,
  onSetSelectedBusLine,
  onFlip,
  onRollback,
};

const lifeHandlers = {
  onShow,
  onLoad,
  onReady,
  onUnload,
};

const handlers = {
  ...eventHandlers,
  ...lifeHandlers,
};

export default handlers;

function onActive(id) {
  this.setData({
    activeIndex: id,
  });
}

function onSetTimeCost(time) {
  this.setData({
    userTimeCost: (time / 60).toFixed(1),
  });
}

async function onSelectedStop(sid) {
  selectStation(this, sid);
}

async function onSetBusLines(startStationName, endStationName) {
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  const sname = extractAddressName(startStationName);
  const ename = extractAddressName(endStationName);
  const newBusLineIds = await queryBackend("linesByEnds", activeIndex, [
    sname,
    ename,
  ]);
  if (newBusLineIds.length === 0) popNoCar();
  this.setData({
    queriedLineIds: newBusLineIds,
  });
  // 请求实时数据
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
  // 过滤其他站点
  // ...
}

function onSetStopsByBusLines(formatBusLines) {
  const newStops = distinctStops(formatBusLines);
  this.setData({
    queriedStations: newStops,
  });
}

function onSetSelectedBusLine(bid) {
  this.setData({
    selectedLineId: bid,
  });
}

function onFlip(field) {
  flip(this, field);
}

function onRollback() {
  this.setData({
    queriedStations:
      this.data.activeIndex == 0
        ? this.data.busStations
        : this.data.shuttleStations,
    queriedLineIds: null,
  });
}

function onLoad(query) {
  // 页面加载
  console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  loadAndSet(this, "activeIndex");
  loadAndSet(this, "stationsBuffer");
  loadAndSet(this, "stationsBuffer");
  !load("noticeShow").data && getStart();
}

async function onShow() {
  const locationAuthed = await authGuideLocation();
  const locationTimer = locationAuthed ? setLocationTimer(this) : null;
  this.setData({
    locationTimer,
    queriedStations: await queryBackend(
      "allStations",
      this.data.activeIndex,
      [],
    ),
  });
}

async function onReady() {}

function onUnload() {
  console.log("已清除定时器");
  clearInterval(this.data.locationTimer);
  store("stationsBuffer", this.data.stationsBuffer);
}

