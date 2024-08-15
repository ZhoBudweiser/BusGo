import { DEFAULT_POSITION, DEFAULT_STATION, NOP } from "./defaults";

export const data = {
  stationMarkers: [],
  carMarkers: [],
  displayMode: true,
  selectedStationPosition: DEFAULT_POSITION,
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
