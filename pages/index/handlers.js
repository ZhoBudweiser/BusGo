import { getStart } from "/util/data";
import { flip } from "/util/setters";
import {
  authGuideLocation,
} from "/options/apis/locationApis";
import { queryBackend } from "/options/apis/carApis";
import { popNoCar } from "/util/notification";
import { extractAddressName } from "/util/formatter";
import { loadAndSet, resetCarTimer, selectStation, setData, setLocationTimer } from "/util/client";
import { load, store } from "/util/cache";

const eventHandlers = {
  onMainData,
  onFlip,
  onRollback,
  onSelectStation,
  onSetCarLines,
};

const lifeHandlers = {
  onLoad,
  onShow,
  onUnload,
};

const handlers = {
  ...eventHandlers,
  ...lifeHandlers,
};

export default handlers;

function onMainData(key, data) {
  setData(this, key, data);
}

function onFlip(field) {
  flip(this, field);
}

async function onRollback() {
  this.setData({
    queriedStations: await queryBackend("allStations", i, []),
    queriedLineIds: null,
  });
}

async function onSelectStation(sid) {
  selectStation(this, sid);
}

async function onSetCarLines(startStationName, endStationName) {
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
  // 定时请求数据
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
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

function onUnload() {
  clearInterval(this.data.locationTimer);
  console.log("已清除定时器");
  store("stationsBuffer", this.data.stationsBuffer);
}

