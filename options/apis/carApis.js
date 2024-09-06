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
  allStations: [getBusAllStations, getShuttleAllStations],
  linesByStationId: [getBusLinesByStationId, getShuttleLinesByStationId],
  linesByEnds: [getBusLineIdsByEnds, getShuttleLineIdsByEnds],
  stationsByLineId: [getBusStationsByBusId, getShuttleStationsByShuttleId],
  allEnds: [getBusAllEnds, getShuttleAllEnds]
};

export async function queryBackend(dataName, dataType, parm, show=true) {
  if (show) showQuerying(dataType);
  const ret = await funcMap[dataName][dataType](...parm);
  if (show) hideLoading();
  return ret;
}

