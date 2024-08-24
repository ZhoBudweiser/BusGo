import { setStation } from "/util/setters";
import { flip } from "/util/client";
import { authGuideLocation } from "/options/apis/locationApis";
import { queryBackend } from "/options/apis/carApis";
import {
  loadAndSet,
  setData,
  setLocationTimer,
} from "/util/client";
import { load, loadCache, store, storeCache } from "/util/cache";
import { alertStart } from "/util/notification";

const eventHandlers = {
  onMainData,
  onFlip,
  onRollback,
  onSelectStation,
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
  const { activeIndex } = this.data;
  this.setData({
    queriedStations: await queryBackend("allStations", activeIndex, []),
    queriedLineIds: null,
  });
}

async function onSelectStation(sid) {
  const { activeIndex } = this.data;
  const selectedStation = await setStation(activeIndex, sid);
  this.setData({ selectedStation });
}

function onLoad(query) {
  console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  loadAndSet(this, "activeIndex");
  loadCache();
  !load("noticeShow").data && alertStart();
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
  storeCache();
}
