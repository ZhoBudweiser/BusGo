import { calculateDistance } from "/options/apis/locationApis";
import { DEFAULT_ROUTE } from "/options/props/defaults";
import {
  changeStationMarkers,
  drawCarPositions,
  drawRoute,
  setCarMarkers,
  updateStationMarkers,
} from "/util/setters";

const observers = {
  stations,
  length,
  "selectedStation.id": selectedStationId,
  selectedBusLineId,
  lines,
  position,
  selectedStationPosition,
  displayMode,
  showNavigationPath,
  moveToUserPosition,
};

export default observers;

/**
 * 重置站点图标
 * @param {object[]} stas 新的站点列表
 */
function stations(stas) {
  const mapCtx = this.mapCtx;
  const { selectedStation } = this.props;
  const { stationMarkers: oldStationMarkers, length } = this.data;
  mapCtx.clearRoute();
  const stationMarkers = changeStationMarkers(
    mapCtx,
    stas,
    selectedStation,
    length,
    oldStationMarkers,
  );
  this.setData({
    stationMarkers,
    displayMode: true,
  });
}

/**
 * 合并或分裂站点
 * @param {number} s 合并站点的最短距离
 */
function length(s) {
  const mapCtx = this.mapCtx;
  const { stations, selectedStation } = this.props;
  const { stationMarkers: oldStationMarkers } = this.data;
  // 设置新的站点图标数组
  const stationMarkers = changeStationMarkers(
    mapCtx,
    stations,
    selectedStation,
    s,
    oldStationMarkers,
  );
  this.setData({
    stationMarkers,
  });
}

/**
 * 根据所选站点 id 更新地图上的图标
 * @param {number} sid 被选择的站点 id
 */
function selectedStationId(sid) {
  const mapCtx = this.mapCtx;
  const { carMarkers: oldCarMarkers, stationMarkers: oldStationMarkers } = this.data;
  mapCtx.clearRoute();
  const carMarkers = [];
  // 更新所选站点的位置、所有站点图标
  const { selectedStationPosition, stationMarkers } = updateStationMarkers(
    oldStationMarkers,
    sid,
  );
  mapCtx.changeMarkers({
    update: stationMarkers,
  });
  // 清空汽车图标
  drawCarPositions(mapCtx, carMarkers, oldCarMarkers);
  this.setData({
    carMarkers,
    stationMarkers,
    selectedStationPosition,
  });
  console.log("清空了汽车：", oldCarMarkers);
}

/**
 * 显示班车线路
 * @param {number} bid 班车线路 id
 */
function selectedBusLineId(bid) {
  const mapCtx = this.mapCtx;
  mapCtx.clearRoute();
  const line = this.props.lines.find((item) => item.bid === bid);
  if (line !== undefined) drawRoute(mapCtx, line.stations);
}

/**
 * 移动班车图标
 * @param {object[]} ls 班车线路列表
 */
function lines(ls) {
  const carMarkers = setCarMarkers(ls);
  const oldCarMarkers = this.data.carMarkers;
  drawCarPositions(this.mapCtx, carMarkers, oldCarMarkers);
  this.setData({
    carMarkers,
  });
}

/**
 * 根据用户位置计算到站点的时间
 * @param {object} pos 用户所在位置
 */
function position(pos) {
  if (!pos) return;
  const { position, onMainData } = this.props;
  const { selectedStationPosition } = this.data;
  if (!selectedStationPosition) return;
  calculateDistance(position, selectedStationPosition).then((userTimeCost) =>
    onMainData("userTimeCost", userTimeCost),
  );
}

/**
 * 根据用户选择的站点位置计算到站点的时间
 * @param {object} sp 用户选择的站点位置
 */
function selectedStationPosition(sp) {
  if (!sp) return;
  const { position, onMainData } = this.props;
  calculateDistance(position, sp).then((userTimeCost) =>
    onMainData("userTimeCost", userTimeCost),
  );
}

/**
 * 切换站点显示模式
 * @param {boolean} mode 是否显示站点图标
 */
function displayMode(mode) {
  // 排除所选站点
  const stationMarkers = this.data.stationMarkers.filter(
    (item) => item.station_alias_no != this.props.selectedStation.id,
  );
  const option = mode ? "add" : "remove";
  // 显示或隐藏其他站点图标
  this.mapCtx.changeMarkers({
    [option]: stationMarkers,
  });
}

/**
 * 切换导航路径显示
 * @param {boolean} show 是否展示导航路径
 */
function showNavigationPath(show) {
  const position = this.props.position;
  const selectedStationPosition = this.data.selectedStationPosition;
  if (show) {
    this.mapCtx.showRoute({
      ...DEFAULT_ROUTE,
      startLat: position.latitude,
      startLng: position.longitude,
      endLat: selectedStationPosition.latitude,
      endLng: selectedStationPosition.longitude,
    });
  } else {
    this.mapCtx.clearRoute();
  }
}

/**
 * 地图中心移动到用户位置
 */
function moveToUserPosition() {
  this.mapCtx.moveToLocation(this.props.position);
}
