import {
  DEFAULT_BUS_ALL_ENDS,
  DEFAULT_BUS_BUFFER_ENDS,
  DEFAULT_SHUTTLE_ALL_ENDS,
  DEFAULT_SHUTTLE_BUFFER_ENDS,
} from "/options/props/defaults";

// 校车目的地
const busEnds = {
  buffer: DEFAULT_BUS_BUFFER_ENDS,
  all: DEFAULT_BUS_ALL_ENDS,
};

// 小白车目的地
const shuttleEnds = {
  buffer: DEFAULT_SHUTTLE_BUFFER_ENDS,
  all: DEFAULT_SHUTTLE_ALL_ENDS,
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

/**
 * 缓存数据
 * @param {string} key 键
 * @param {object} data 数据
 */
export function store(key, data) {
  my.setStorageSync({ key, data });
  console.log("已缓存：", key, data);
}

/**
 * 读取缓存数据
 * @param {string} key 键
 * @returns {object} 缓存数据
 */
export function load(key) {
  console.log("已读取缓存：", key);
  return my.getStorageSync({ key });
}

/**
 * 缓存所有数据
 */
export function storeCache() {
  // 如果没有设置过期时间，则设置
  if (!loadValue("expiration").state) {
    setExpiration();
  }
  if (lru.bus != null) cache.busEnds.buffer = lru.bus.getBuffer();
  if (lru.shuttle != null) cache.shuttleEnds.buffer = lru.shuttle.getBuffer();
  Object.keys(cache).forEach((key) => store(key, cache[key]));
}

/**
 * 读取所有缓存数据
 */
export function loadCache() {
  // 如果缓存过期，则清空所有缓存
  if (isExpired()) {
    clearAllCache();
    return;
  }
  Object.keys(cache).forEach((key) => {
    const { state, data } = loadValue(key);
    if (state) {
      cache[key] = data;
    }
  });
}

/**
 * 读取缓存数据并判定是否成功
 * @param {string} key 键
 * @returns {object} 是否读取成功，缓存的数据
 */
function loadValue(key) {
  const res = load(key);
  let state = false,
    data = null;
  if (res.success && res.data !== null) {
    data = res.data;
    state = true;
  }
  return { state, data };
}

/**
 * 设置缓存过期时间
 */
function setExpiration() {
  const expiration = new Date();
  // 默认一周后过期
  expiration.setDate(expiration.getDate() + 7);
  store("expiration", expiration.getTime());
}

/**
 * 检查缓存是否过期
 * @returns {boolean} 是否过期
 */
function isExpired() {
  const { state, data: expiration } = loadValue("expiration");
  console.log("缓存过期时间：", new Date(expiration));
  if (!state) return true;
  return Date.now() > expiration;
}

/**
 * 清空所有缓存
 */
function clearAllCache() {
  Object.keys(cache).forEach((key) => {
    my.removeStorage({ key });
  });
  my.removeStorage({ key: "expiration" });
  console.log("所有缓存已清空");
}
