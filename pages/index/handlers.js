import { getStart } from "/util/data";
import { flip, setStation } from "/util/setters";
import { authGuideLocation } from "/options/apis/locationApis";
import { queryBackend } from "/options/apis/carApis";
import {
  loadAndSet,
  selectStation,
  setData,
  setLocationTimer,
} from "/util/client";
import { load, store } from "/util/cache";

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
  console.log(field);
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
