import { dynamicData } from "/options/props/realTimeQuery";
import { queryBackend } from "/options/apis/carApis";
import { resetCarTimer } from "/util/client";
import { store } from "/util/cache";
import { setNearestStationId, setStation, setSysQueryFrequency } from "/util/setters";
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
  const { activeIndex } = this.data;
  const { userPosition } = this.data;
  const stationId = setNearestStationId(stations, userPosition);
  const selectedStation = await setStation(activeIndex, stationId);
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

function queriedLineIds(ids) {
  if (!ids) return;
  if (ids.length === 0) popNoCar();
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  if (selectedStation.id == "") return;
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
}
