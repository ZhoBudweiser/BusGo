import { setStation } from "/util/setters";
import { flip } from "/util/client";
import { authGuideLocation } from "/options/apis/locationApis";
import { queryBackend } from "/options/apis/carApis";
import {
  loadAndSet,
  setData,
  setLocationTimer,
} from "/util/client";
import { load, loadCache, store, storeCache } from "/util/cache";
import { alertLocationNotAuthed } from "/util/notification";

const eventHandlers = {
  onMainData,
  onFlip,
  onRollback,
  onSelectStation,
  onCloseGuidance,
};

const lifeHandlers = {
  onLoad,
  onShow,
  onUnload,
};

const handlers = {
  ...eventHandlers,
  ...lifeHandlers,
};

export default handlers;

/**
 * @event 设置根组件数据
 * @param {string} key 键名
 * @param {object} data 值
 */
function onMainData(key, data) {
  setData(this, key, data);
}

/**
 * @event 切换根组件数据
 * @param {string} field 键名
 */
function onFlip(field) {
  flip(this, field);
}

/**
 * @event 回滚选择的目的地
 */
async function onRollback() {
  const { activeIndex } = this.data;
  this.setData({
    queriedStations: await queryBackend("allStations", activeIndex, []),
    queriedLineIds: null,
  });
}

/**
 * @event 选择站点
 * @param {string} sid 站点 id
 */
async function onSelectStation(sid) {
  const { activeIndex } = this.data;
  const selectedStation = await setStation(activeIndex, sid);
  this.setData({ selectedStation });
}

/**
 * @event 关闭引导
 */
function onCloseGuidance() {
  const guidanceShowed = true;
  this.setData({ guidanceShowed });
  store("guidanceShowed", guidanceShowed);
}

/**
 * 导入缓存
 * @param {object} query 查询参数
 */
function onLoad(query) {
  console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  loadAndSet(this, "activeIndex");
  loadAndSet(this, "guidanceShowed");
  loadCache();
}

/**
 * 设置自动定位定时器
 */
async function onShow() {
  const app = getApp();
  // const locationAuthed = await authGuideLocation();
  const locationAuthed = app.locationAuthed;
  if (!locationAuthed) alertLocationNotAuthed();
  const locationTimer = locationAuthed ? setLocationTimer(this) : null;
  this.setData({
    locationTimer,
    queriedStations: await queryBackend(
      "allStations",
      this.data.activeIndex,
      [],
    ),
  });
}

/**
 * 清除定时器，保存缓存到本地
 */
function onUnload() {
  clearInterval(this.data.locationTimer);
  clearInterval(this.data.carTimer);
  console.log("已清除定时器");
  storeCache();
}
