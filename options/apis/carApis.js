import {
  getBusAllStations,
  getBusLineIdsByEnds,
  getBusLinesByStationId,
  getBusStationsByBusId
} from "./busApis";
import {
  getShuttleAllStations,
  getShuttleLineIdsByEnds,
  getShuttleLinesByStationId,
  getShuttleStationsByShuttleId
} from "./shuttleApis";

const funcMap = {
  allStations: [getBusAllStations, getShuttleAllStations],
  linesByStationId: [getBusLinesByStationId, getShuttleLinesByStationId],
  linesByEnds: [getBusLineIdsByEnds, getShuttleLineIdsByEnds],
  stationsByLineId: [getBusStationsByBusId, getShuttleStationsByShuttleId]
};

export async function queryBackend(dataName, dataType, parm) {
  return await funcMap[dataName][dataType](...parm);
}

