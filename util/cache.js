import {
  DEFAULT_BUS_ALL_ENDS,
  DEFAULT_SHUTTLE_ALL_ENDS,
} from "/options/props/defaults";

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
  console.log("已缓存：", key, data);
}

export function load(key) {
  console.log("已读取缓存：", key);
  return my.getStorageSync({ key });
}

export function storeCache() {
  Object.keys(cache).forEach((key) => store(key, cache[key]));
}

export function loadCache() {
  Object.keys(cache).forEach((key) => {
    const { state, data } = loadValue(key);
    if (state) {
      cache[key] = data;
    }
  });
}

function loadValue(key) {
  const res = load(key);
  let state = false, data = null;
  if (res.success && res.data !== null) {
    data = res.data;
    state = true;
  }
  return { state, data };
}
