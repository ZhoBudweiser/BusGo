const staticData = {
  busLines: [],
  allBusStations: [],
  shuttleLines: [],
  allShuttleStations: [],
  stationsBuffer: {},
};

const runtimeData = {
  queriedLines: [],
  queriedStations: [],
  userPosition: {
    longitude: 120.090178,
    latitude: 30.303975,
  },
  userTimeCost: -1,
  sysQueryFrequency: 20000,
};

const selections = {
  activeIndex: 0,
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
}