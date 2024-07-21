const staticData = {
  busLines: [],
  busStations: [],
  shuttleLines: [],
  shuttleStations: [],
  stationsBuffer: {},
  activeIndex: 0,
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
