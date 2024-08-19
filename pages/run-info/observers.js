import { dynamicData } from "/options/props/run-info/run-info";
import { queryBackend } from "/options/apis/carApis";
import { resetCarTimer } from "/util/client";
import { store } from "/util/cache";
import {
  setLineStations,
  setNearestStationId,
  setStation,
  setStationObj,
  setSysQueryFrequency,
} from "/util/setters";
import { popNoCar } from "/util/notification";

const observers = {
  activeIndex,
  queriedStations,
  carLines,
  "sysQueryFrequency, selectedStation": thisResetCarTimer,
  queriedLineIds,
};

export default observers;

async function activeIndex(i) {
  this.setData({
    ...dynamicData,
    queriedStations: await queryBackend("allStations", i, []),
  });
  store("activeIndex", i);
}

async function queriedStations(stations) {
  if (!stations || !stations.length) return;
  const { activeIndex, selectedStation: oldSelectedStation } = this.data;
  const { userPosition } = this.data;
  const sourcePosition =
    oldSelectedStation.id === ""
      ? userPosition
      : await setStationObj(activeIndex, oldSelectedStation.id);
  const stationId = setNearestStationId(stations, sourcePosition);
  const selectedStation = await setStation(activeIndex, stationId);
  console.log("已用", sourcePosition, "匹配最近站点", selectedStation);
  this.setData({ selectedStation });
}

function carLines(lines) {
  if (!lines) return;
  const freq = setSysQueryFrequency(lines);
  if (freq !== this.data.sysQueryFrequency)
    this.setData({
      sysQueryFrequency: freq,
    });
}

function thisResetCarTimer() {
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  if (selectedStation.id == "") return;
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
}

async function queriedLineIds(ids) {
  if (!ids) return;
  if (ids.length === 0) popNoCar();
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  if (selectedStation.id == "") return;
  const queriedStations = await setLineStations(ids, activeIndex);
  this.setData({ queriedStations });
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
}
