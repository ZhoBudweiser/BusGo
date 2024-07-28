import {
  distinctStops,
  getFormatedBusLines,
  getFormatedShuttleLines,
} from "/util/fmtUnit";
import { getStart } from "/util/data";
import { flip } from "/util/setters";
import {
  authGuideLocation,
  setLocationTimer,
} from "/options/apis/locationApis";
import { queryBackend, resetCarTimer } from "/options/apis/carApis";
import { popNoCar } from "/util/notification";
import { extractAddressName } from "/util/formatter";

const eventHandlers = {
  onActive,
  onSetTimeCost,
  onSelectedStop,
  onSetBusLines,
  onSetStopsByBusLines,
  onClearTimer,
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

function onSelectedStop(id) {
  this.setData({
    selectedStationId: id,
  });
}

async function onSetBusLines(startStationName, endStationName) {
  const { activeIndex, selectedStationId, sysQueryFrequency } = this.data;
  const sname = extractAddressName(startStationName);
  const ename = extractAddressName(endStationName);
  const newBusLineIds = await queryBackend("linesByEnds", activeIndex, [sname, ename]);
  if (newBusLineIds.length === 0) popNoCar();
  this.setData({
    queriedLineIds: newBusLineIds,
  });
  // 请求实时数据
  resetCarTimer(this, activeIndex, selectedStationId, sysQueryFrequency);
  // 过滤其他站点
  // ...
}

function onSetStopsByBusLines(formatBusLines) {
  const newStops = distinctStops(formatBusLines);
  this.setData({
    queriedStations: newStops,
  });
}

function onClearTimer() {
  if (this.timer) clearInterval(this.timer);
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
  const index_res = my.getStorageSync({
    key: "activeIndex",
  });
  if (index_res.success) {
    this.setData({
      activeIndex: index_res.data,
    });
  }
  const stations_res = my.getStorageSync({
    key: "stationsBuffer",
  });
  if (stations_res.success) {
    this.setData({
      stationsBuffer: stations_res.data,
    });
  }
  const news_res = my.getStorageSync({
    key: "noticeShow",
  });
  if (!news_res.data) {
    getStart();
  }
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

async function onReady() {
}

function onUnload() {
  console.log("已清除定时器");
  clearInterval(this.data.locationTimer);
  my.setStorageSync({
    key: "stationsBuffer",
    data: this.data.stationsBuffer,
  });
}
