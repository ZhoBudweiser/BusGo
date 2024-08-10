import { locate } from "/util/maphelper";
import { getNearestStationId } from "/util/queryhelper";
import { dynamicData } from "/options/props/realTimeQuery";
import { showQuerying } from "/util/notification";
import { queryBackend } from "/options/apis/carApis";
import { resetCarTimer, selectStation } from "/util/client";
import { store } from "/util/cache";
import { setSysQueryFrequency } from "/util/setters";

const observers = {
  activeIndex,
  queriedStations,
  carLines,
  sysQueryFrequency,
};

export default observers;

async function activeIndex(i) {
  showQuerying();
  this.setData({
    ...dynamicData,
    queriedStations: await queryBackend("allStations", i, []),
  });
  store("activeIndex", i);
}

function queriedStations(stations) {
  if (!stations || !stations.length) return;
  const { latitude, longitude } = this.data.userPosition;
  const stationId = getNearestStationId(stations, latitude, longitude);
  selectStation(this, stationId);
}

function carLines(lines) {
  if (!lines) return;
  const freq = setSysQueryFrequency(lines);
  if (freq !== this.data.sysQueryFrequency)
    this.setData({
      sysQueryFrequency: freq,
    });
}

function sysQueryFrequency(frequency) {
  const { activeIndex, selectedStation } = this.data;
  if (selectedStation.id == "") return;
  resetCarTimer(this, activeIndex, selectedStation.id, frequency);
}
