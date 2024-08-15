import { DEFAULT_ROUTE } from "/options/props/defaults";
import { second2minute } from "/util/formatter";
import {
  setCarPositions,
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
  const { stations, selectedStation } = this.props;
  const mapCtx = this.mapCtx;
  mapCtx.clearRoute();
  mapCtx.updateComponents({
    scale: 16,
  });
  const stationMarkers = setStationMarkers(stations, selectedStation.id);
  this.data.stationMarkers &&
    mapCtx.changeMarkers({
      remove: this.data.stationMarkers,
    });
  mapCtx.changeMarkers({
    add: stationMarkers,
  });
  this.setData({
    stationMarkers,
    displayMode: true,
  });
}

function selectedStationId(sid) {
  const mapCtx = this.mapCtx;
  mapCtx.clearRoute();
  const { selectedStationPosition, stationMarkers } = updateStationMarkers(
    this.data.stationMarkers,
    sid,
  );
  this.setData({
    stationMarkers,
    selectedStationPosition,
  });
  mapCtx.changeMarkers({
    update: stationMarkers,
  });
  mapCtx.updateComponents(selectedStationPosition);
}

function selectedBusLineId(bid) {
  this.mapCtx.clearRoute();
  const line = this.props.lines.find((item) => item.bid === bid);
  if (line !== undefined) this.drawRoute(line.stations);
}

function lines(ls) {
  const carPositions = setCarPositions(ls);
  this.drawBusPos(carPositions);
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
