import { calculateDistance } from "/options/apis/locationApis";
import { DEFAULT_ROUTE } from "/options/props/defaults";
import { second2minute } from "/util/formatter";
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

function length(s) {
  const mapCtx = this.mapCtx;
  const { stations, selectedStation } = this.props;
  const { stationMarkers: oldStationMarkers } = this.data;
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

function selectedStationId(sid) {
  const mapCtx = this.mapCtx;
  const { carMarkers: oldCarMarkers, stationMarkers: oldStationMarkers } = this.data;
  mapCtx.clearRoute();
  const carMarkers = [];
  const { selectedStationPosition, stationMarkers } = updateStationMarkers(
    oldStationMarkers,
    sid,
  );
  mapCtx.changeMarkers({
    update: stationMarkers,
  });
  drawCarPositions(mapCtx, carMarkers, oldCarMarkers);
  this.setData({
    carMarkers,
    stationMarkers,
    selectedStationPosition,
  });
  console.log("清空了汽车：", oldCarMarkers);
}

function selectedBusLineId(bid) {
  const mapCtx = this.mapCtx;
  mapCtx.clearRoute();
  const line = this.props.lines.find((item) => item.bid === bid);
  if (line !== undefined) drawRoute(mapCtx, line.stations);
}

function lines(ls) {
  const carMarkers = setCarMarkers(ls);
  const oldCarMarkers = this.data.carMarkers;
  drawCarPositions(this.mapCtx, carMarkers, oldCarMarkers);
  this.setData({
    carMarkers,
  });
}

function position(pos) {
  if (!pos) return;
  const { position, onMainData } = this.props;
  const { selectedStationPosition } = this.data;
  if (!selectedStationPosition) return;
  calculateDistance(position, selectedStationPosition).then((userTimeCost) =>
    onMainData("userTimeCost", userTimeCost),
  );
}

function selectedStationPosition(sp) {
  if (!sp) return;
  const { position, onMainData } = this.props;
  calculateDistance(position, sp).then((userTimeCost) =>
    onMainData("userTimeCost", userTimeCost),
  );
}

function displayMode(mode) {
  const stationMarkers = this.data.stationMarkers.filter(
    (item) => item.station_alias_no != this.props.selectedStation.id,
  );
  const option = mode ? "add" : "remove";
  this.mapCtx.changeMarkers({
    [option]: stationMarkers,
  });
}

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

function moveToUserPosition() {
  this.mapCtx.moveToLocation(this.props.position);
}
