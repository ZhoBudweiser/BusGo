import { DEFAULT_STATION, DEFAULT_TABS, NOP } from "./defaults";

export const headerProps = {
  carLines: [],
  selectedStation: DEFAULT_STATION,
  userTimeCost: -1,
  onFlip: NOP,
};

export const headerData = {
  dist_car: "10%",
  humanDistance: "5%",
  activeTimeIndex: 0,
  showTime: true,
  showRoute: false,
  destinations: [],
  selectedEnd: "",
};

export const data = {
  ...headerData,
  containerHeight: 300,
  activeCards: Array.from({ length: 100 }),
};

export const props = {
  activeIndex: 1,
  tabs: DEFAULT_TABS,
  selectedStation: DEFAULT_STATION,
  userTimeCost: -1,
  carLines: [],
  onMainData: NOP,
  onFlip: NOP,
  onRollback: NOP,
};
