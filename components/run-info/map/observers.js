import { DEFAULT_ROUTE } from "/options/props/defaults";
import { second2minute } from "/util/formatter";
import {
  drawCarPositions,
  drawRoute,
  setCarMarkers,
  setStationMarkers,
  updateStationMarkers,
} from "/util/setters";

const observers = {
  stations,
  "selectedStation.id": selectedStationId,
  selectedBusLineId,
  lines,
  selectedStationPosition,
  displayMode,
  showNavigationPath,
  moveToUserPosition,
};

export default observers;

function stations() {
  const mapCtx = this.mapCtx;
  const { stations, selectedStation } = this.props;
  const { stationMarkers: oldStationMarkers } = this.data;
  mapCtx.clearRoute();
  if (oldStationMarkers.length !== 0) {
    mapCtx.changeMarkers({
      remove: oldStationMarkers,
    });
    console.log("清空了站点：", oldStationMarkers);
  }
  const stationMarkers = setStationMarkers(stations, selectedStation.id);
  mapCtx.changeMarkers({
    add: stationMarkers,
  });
  console.log("添加了站点：", stationMarkers);
  this.setData({
    stationMarkers,
    displayMode: true,
  });
}

function selectedStationId(sid) {
  const mapCtx = this.mapCtx;
  const { carMarkers: oldCarMarkers } = this.data;
  mapCtx.clearRoute();
  const carMarkers = [];
  const { selectedStationPosition, stationMarkers } = updateStationMarkers(
    this.data.stationMarkers,
    sid,
  );
  mapCtx.changeMarkers({
    remove: oldCarMarkers,
    update: stationMarkers,
  });
  this.setData({
    carMarkers,
    stationMarkers,
    selectedStationPosition,
  });
  console.log("清空了汽车：", oldCarMarkers);
}

function selectedBusLineId(bid) {
  this.mapCtx.clearRoute();
  const line = this.props.lines.find((item) => item.bid === bid);
  if (line !== undefined) drawRoute(line.stations);
}

function lines(ls) {
  const carMarkers = setCarMarkers(ls);
  if (carMarkers.length !== 0)
    drawCarPositions(
      this.mapCtx,
      carMarkers,
      this.data.carMarkers.length === 0,
    );
  this.setData({
    carMarkers,
  });
}

function selectedStationPosition(sp) {
  if (!sp) return;
  const { position, onMainData } = this.props;
  my.calculateRoute({
    startLat: position.latitude,
    startLng: position.longitude,
    endLat: sp.latitude,
    endLng: sp.longitude,
    success: (res) => onMainData("userTimeCost", second2minute(res.duration)),
    fail: (err) => console.log("路程计算错误：", err),
  });
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
