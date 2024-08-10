const cache = {
  busAllStations: null,
  shuttleAllStations: null,
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
