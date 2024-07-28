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

export function resetCarTimer(client, dataType, sid, frequency) {
  const timer = client.data.carTimer;
  if (timer != null) clearInterval(timer);
  const func = funcMap["linesByStationId"][dataType];
  queryLinesByStationId(client, func, sid)();
  const carTimer = setInterval(
    queryLinesByStationId(client, func, sid),
    frequency,
  );
  client.setData({ carTimer });
}

function queryLinesByStationId(client, func, sid) {
  return async () => {
    const { queriedLineIds } = client.data;
    const notfiltered = (bid) => queriedLineIds == null || queriedLineIds.indexOf(bid) !== -1;
    const busLines = (await func(sid)).filter((line) => notfiltered(line.bid));
    client.setData({ busLines });
  };
}
