import { DEFAULT_CAMPUS, STATION_ID_LABEL, UNION_LENGTH } from "/options/props/defaults";
import { flip } from "/util/client";
import { setNearestCampusIndex } from "/util/setters";

export const methods = {
  onMarkerTap,
  onSwitchMode,
  onRegionChange,
  onSelectLocation
};

export const lifeHanders = {
  onInit,
};

/**
 * @event 点击班车站点标记
 * @param {*} e 带标记 id 的事件对象
 */
function onMarkerTap(e) {
  const markerId = e.markerId;
  // 排除对班车标记的点击
  if (typeof(markerId) !== 'string' || markerId.indexOf(STATION_ID_LABEL) === -1) return;
  this.mapCtx.clearRoute();
  const { selectedStation, onSelectStation } = this.props;
  // 提取标记 id 中的数字部分
  const markerIdNum = markerId.replace(STATION_ID_LABEL, "");
  // 选择站点
  if (markerIdNum !== selectedStation.id) {
    onSelectStation(markerIdNum);
  }
}

/**
 * @event 切换站点显示模式
 */
function onSwitchMode() {
  flip(this, "displayMode");
}

/**
 * @event 地图缩放时修改站点图标显示最小距离
 * @param {*} e 带缩放比例、经纬度的事件对象
 */
function onRegionChange(e) {
  const { scale, longitude, latitude } = e;
  const length = UNION_LENGTH(scale);
  // 更新最近校区索引
  const campusIndex = setNearestCampusIndex(DEFAULT_CAMPUS, { longitude, latitude });
  if (campusIndex !== this.data.campusIndex) this.setData({ campusIndex });
  if (this.data.length == length) return;
  this.setData({ length });
}

/**
 * @event 点击校区切换地图中心
 * @param {number} campusIndex 校区索引
 */
function onSelectLocation(campusIndex) {
  this.mapCtx.moveToLocation(this.data.campus[campusIndex]);
  this.setData({ campusIndex });
}

/**
 * 初始化地图上下文
 */
function onInit() {
  this.mapCtx = my.createMapContext("map");
}
