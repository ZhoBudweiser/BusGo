import {
  getBusAllEnds,
  getBusAllStations,
  getBusLineIdsByEnds,
  getBusLinesByStationId,
  getBusStationsByBusId
} from "./busApis";
import {
  getShuttleAllEnds,
  getShuttleAllStations,
  getShuttleLineIdsByEnds,
  getShuttleLinesByStationId,
  getShuttleStationsByShuttleId
} from "./shuttleApis";
import { hideLoading, showQuerying } from "/util/notification";

const funcMap = {
  // 获取所有站点
  allStations: [getBusAllStations, getShuttleAllStations],
  // 根据站点id获取线路
  linesByStationId: [getBusLinesByStationId, getShuttleLinesByStationId],
  // 根据起止点获取线路id
  linesByEnds: [getBusLineIdsByEnds, getShuttleLineIdsByEnds],
  // 根据线路id获取站点
  stationsByLineId: [getBusStationsByBusId, getShuttleStationsByShuttleId],
  // 获取所有目的地
  allEnds: [getBusAllEnds, getShuttleAllEnds]
};

/**
 * 统一的后端查询方法
 * @param {string} dataName 查询方法
 * @param {number} dataType 班车类型
 * @param {object} parm 查询参数
 * @param {boolean} show 展示查询中
 * @returns {Promise} 查询结果
 */
export async function queryBackend(dataName, dataType, parm, show=true) {
  if (show) showQuerying();
  const ret = await funcMap[dataName][dataType](...parm);
  if (show) hideLoading();
  return ret;
}

