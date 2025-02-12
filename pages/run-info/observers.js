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
import { popMatchStationNearBy } from "/util/notification";

const observers = {
  activeIndex,
  queriedStations,
  carLines,
  "sysQueryFrequency, selectedStation": thisResetCarTimer,
  queriedLineIds,
};

export default observers;

/**
 * 重置页面数据
 * @param {number} i 班车类型
 */
async function activeIndex(i) {
  this.setData({
    ...dynamicData,
    carLines: this.data.carLines,
    queriedStations: await queryBackend("allStations", i, []),
    userPosition: this.data.userPosition,
  });
  store("activeIndex", i);
}

/**
 * 匹配最近站点
 * @param {object} stations 查询到的站点数组
 */
async function queriedStations(stations) {
  if (!stations || !stations.length) return;
  const { activeIndex, selectedStation: oldSelectedStation } = this.data;
  const { userPosition } = this.data;
  const sourcePosition =
    oldSelectedStation.id == ""
      ? userPosition
      : await setStationObj(activeIndex, oldSelectedStation.id);
  const stationId = setNearestStationId(stations, sourcePosition);
  const selectedStation = await setStation(activeIndex, stationId);
  console.log("已用", sourcePosition, "匹配最近站点", selectedStation);
  popMatchStationNearBy();
  this.setData({ selectedStation });
}

/**
 * 更新班车查询频率
 * @param {object} lines 班车线路数组
 */
function carLines(lines) {
  if (!lines) return;
  const freq = setSysQueryFrequency(lines);
  if (freq !== this.data.sysQueryFrequency)
    this.setData({
      sysQueryFrequency: freq,
    });
}

/**
 * 重置班车查询定时器
 */
function thisResetCarTimer() {
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  if (selectedStation.id == "") return;
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
}

/**
 * 更新查询的线路id对应的站点
 * @param {number[]} ids 查询的线路id数组
 */
async function queriedLineIds(ids) {
  if (!ids) return;
  const { activeIndex, selectedStation, sysQueryFrequency } = this.data;
  if (selectedStation.id == "") return;
  const queriedStations = await setLineStations(ids, activeIndex);
  this.setData({ queriedStations });
  resetCarTimer(this, activeIndex, selectedStation.id, sysQueryFrequency);
}
