import { getBusAllStations, getBusLinesByEnds, getBusLinesByStationId, getBusStationsByBusId } from "./busApis";
import { getShuttleAllStations, getShuttleLinesByEnds, getShuttleLinesByStationId, getShuttleStationsByShuttleId } from "./shuttleApis";

const funcMap = {
    allStations: [
        getBusAllStations,
        getShuttleAllStations
    ],
    linesByStationId: [
        getBusLinesByStationId,
        getShuttleLinesByStationId
    ],
    linesByEnds: [
        getBusLinesByEnds,
        getShuttleLinesByEnds
    ],
    stationsById: [
        getBusStationsByBusId,
        getShuttleStationsByShuttleId
    ],
};

export async function queryBackend(dataName, dataType, parm) {
    return await funcMap[dataName][dataType](...parm);
}