import { DEFAULT_TABS } from "./defaults";
import { nop } from "/options/apis/apiConfig";

export const data = {
  top: 0
};

export const props = {
  tabs: DEFAULT_TABS,
  activeIndex: 1,
  onMainData: nop,
};
