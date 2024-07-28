import { DEFAULT_POSITION, DEFAULT_STATION_ID } from "./defaults";

const staticData = {
  busStations: [],
  shuttleLines: [],
  shuttleStations: [],
  stationsBuffer: {},
  locationAuthed: false,
  locationTimer: null,
  carTimer: null,
  activeIndex: 0,
};

const runtimeData = {
  busLines: [],
  queriedLineIds: null,
  queriedStations: [],
  userPosition: DEFAULT_POSITION,
  userTimeCost: -1,
  sysQueryFrequency: 20000,
};

const selections = {
  showNavigationPath: false,
  moveToUserPosition: false,
  selectedStationId: DEFAULT_STATION_ID,
  selectedStationName: "",
  selectedLineId: "",
};

export const realTimeQueryProps = {
  ...staticData,
  ...runtimeData,
  ...selections,
};

export const dynamicData = {
  ...runtimeData,
  ...selections,
};
