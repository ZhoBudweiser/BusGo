import { DEFAULT_CAMPUS, DEFAULT_POSITION, DEFAULT_STATION, NOP } from "../defaults";

export const data = {
  stationMarkers: [],
  carMarkers: [],
  length: 40,
  displayMode: true,
  selectedStationPosition: DEFAULT_POSITION,
  campus: DEFAULT_CAMPUS,
  campusIndex: 0,
};

export const props = {
  position: DEFAULT_POSITION,
  stations: [],
  selectedStation: DEFAULT_STATION,
  selectedBusLineId: "-1",
  showNavigationPath: false,
  moveToUserPosition: false,
  lines: [],
  onSelectStation: NOP,
  onMainData: NOP,
};
