import { getBusAllStations, getBusLinesByEnds, getBusLinesByStationId, getBusStationsByBusId } from "./busApis";
import { getShuttleAllStations, getShuttleLinesByEnds, getShuttleLinesByStationId, getShuttleStationsByShuttleId } from "./shuttleApis";

const funcMap = {
    allStations: [
        getBusAllStations,
        getShuttleAllStations
    ],
    linesByEnds: [
        getBusLinesByEnds,
        getShuttleLinesByEnds
    ],
    stationsById: [
        getBusStationsByBusId,
        getShuttleStationsByShuttleId
    ],
    linesByStationId: [
        getBusLinesByStationId,
        getShuttleLinesByStationId
    ],
};

export async function queryBackend(dataName, dataType, parm) {
    return funcMap[dataName][dataType](...parm);
}