import {
  DEFAULT_BUS_ALL_ENDS,
  DEFAULT_BUS_BUFFER_ENDS,
  DEFAULT_SHUTTLE_ALL_ENDS,
  DEFAULT_SHUTTLE_BUFFER_ENDS,
} from "/options/props/defaults";

const busEnds = {
  buffer: DEFAULT_BUS_BUFFER_ENDS,
  all: DEFAULT_BUS_ALL_ENDS
};

const shuttleEnds = {
  buffer: DEFAULT_SHUTTLE_BUFFER_ENDS,
  all: DEFAULT_SHUTTLE_ALL_ENDS
};

const cache = {
  busEnds,
  shuttleEnds,
  busAllStations: null,
  shuttleAllStations: null,
  shuttleAllLines: null,
  busLineStations: {},
  shuttleLineStations: {},
  busStationMap: {},
  shuttleStationMap: {},
};

export default cache;

export const lru = {
  bus: null,
  shuttle: null,
};

export function store(key, data) {
  my.setStorageSync({ key, data });
  console.log("已缓存：", key, data);
}

export function load(key) {
  console.log("已读取缓存：", key);
  return my.getStorageSync({ key });
}

export function storeCache() {
  if (lru.bus != null) cache.busEnds.buffer = lru.bus.getBuffer();
  if (lru.shuttle != null) cache.shuttleEnds.buffer = lru.shuttle.getBuffer();
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
