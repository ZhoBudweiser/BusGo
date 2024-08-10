import { DEFAULT_STATION, NOP } from "./defaults";

export const data = {
  containerHeight: 300,
  vehicles: [0, 0],
  dist_car: "10%",
  humanDistance: "5%",
  activeTimeIndex: 0,
  showTime: true,
  showRoute: false,
  selectedEnd: "",
  activeCards: Array.from({ length: 100 }),
  destinations: [],
};

export const props = {
  activeIndex: 1,
  selectedStation: DEFAULT_STATION,
  userTimeCost: -1,
  carLines: [],
  shuttleLines: [],
  onMainData: NOP,
  onFlip: NOP,
  onRollback: NOP,
};
