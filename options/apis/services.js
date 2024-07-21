import { getBusAllStations, getBusLinesByEnds, getBusLinesByStationId, getBusStationsByBusId } from "./busApis";
import { getShuttleAllStations } from "./shuttleApis";

const funcMap = {
    allStations: [
        getBusAllStations,
        getShuttleAllStations
    ],
    linesByEnds: [
        getBusLinesByEnds,
    ],
    stationsById: [
        getBusStationsByBusId,
    ],
    linesByStationId: [
        getBusLinesByStationId,
    ],
};

export async function queryBackend(dataName, dataType, parm) {
    return funcMap[dataName][dataType](...parm);
}