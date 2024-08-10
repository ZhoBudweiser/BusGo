import { DEFAULT_BUS_ALL_ENDS, DEFAULT_SHUTTLE_ALL_ENDS } from "/options/props/defaults";

const cache = {
  busAllStations: null,
  shuttleAllStations: null,
  busAllEnds: DEFAULT_BUS_ALL_ENDS,
  shuttleAllEnds: DEFAULT_SHUTTLE_ALL_ENDS,
  shuttleAllLines: null,
  busLineStations: {},
  shuttleLineStations: {},
  busStationMap: {},
  shuttleStationMap: {},
};

export default cache;

export function store(key, data) {
  my.setStorageSync({ key, data });
  console.log("已缓存：", key);
}

export function load(key) {
  return my.getStorageSync({ key });
}
