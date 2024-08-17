import { DEFAULT_STATION, DEFAULT_TABS, NOP } from "../defaults";

export const headerProps = {
  activeIndex: 1,
  carLines: [],
  selectedStation: DEFAULT_STATION,
  userTimeCost: -1,
  onMainData: NOP,
  onFlip: NOP,
  onRollback: NOP,
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

export const bodyProps = {
  carLines: [],
};

export const bodyData = {
  activeCards: Array.from({ length: 100 }),
};

export const data = {};

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
