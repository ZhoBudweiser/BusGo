import { DEFAULT_POSITION } from "./defaults";

const staticData = {
  busLines: [],
  busStations: [],
  shuttleLines: [],
  shuttleStations: [],
  stationsBuffer: {},
  locationAuthed: false,
  locationTimer: null,
  activeIndex: 0,
};

const runtimeData = {
  queriedLines: [],
  queriedStations: [],
  userPosition: DEFAULT_POSITION,
  userTimeCost: -1,
  sysQueryFrequency: 20000,
};

const selections = {
  showNavigationPath: false,
  moveToUserPosition: false,
  selectedStopId: "",
  selectedStopName: "",
  selectedBusLineId: "",
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
