import { DEFAULT_POSITION, DEFAULT_STATION, DEFAULT_STATION_ID, DEFAULT_TABS, GUIDANCE_IMGS } from "../defaults";

const staticData = {
  locationAuthed: false,
  locationTimer: null,
  carTimer: null,
  activeIndex: 0,
  guidanceShowed: false,
  tabs: DEFAULT_TABS,
  guidanceImgs: GUIDANCE_IMGS,
};

const runtimeData = {
  carLines: [],
  queriedLineIds: null,
  queriedStations: [],
  userPosition: DEFAULT_POSITION,
  userTimeCost: -1,
  sysQueryFrequency: 20000,
};

const selections = {
  showNavigationPath: false,
  moveToUserPosition: false,
  selectedStation: DEFAULT_STATION,
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
