import { DEFAULT_POSITION, DEFAULT_STATION, NOP } from "./defaults";

export const data = {
  stationMarkers: [],
  buses: [],
  displayMode: true,
  stationPosition: DEFAULT_POSITION,
};

export const props = {
  position: DEFAULT_POSITION,
  stops: [],
  selectedStation: DEFAULT_STATION,
  selectedBusLineId: "-1",
  showNavigationPath: false,
  moveToUserPosition: false,
  lines: [],
  onSelectStation: NOP,
  onMainData: NOP,
};
