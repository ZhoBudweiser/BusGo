import { second2minute } from "/util/formatter";
import { setStationMarkers, updateStationMarkers } from "/util/setters";

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

function selectedStationId() {
  const mapCtx = this.mapCtx;
  mapCtx.clearRoute();
  const { selectedStationPosition, stationMarkers } = updateStationMarkers(
    this.data.stationMarkers,
    this.props.selectedStation.id,
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

function lines() {
  const iconPathSelection = (type) => {
    switch (type) {
      case "2":
        return "/images/map_shuttle.png";
      case "3":
        return "/images/map_babybus.png";
      case "21":
        return "/images/map_shuttle_no.png";
      case "31":
        return "/images/map_babybus_no.png";
      default:
        return "/images/map_bus.png";
    }
  };
  const buses = [];
  this.props.lines.forEach((item) => {
    if (item.runBusInfo) {
      buses.push({
        iconPath: item.runBusInfo[0].vehicleType
          ? iconPathSelection(item.runBusInfo[0].vehicleType)
          : "/images/map_bus.png",
        id: Number(item.runBusInfo[0].vehi_num.replace(/\D/g, "") * 1767),
        latitude: Number(item.runBusInfo[0].py),
        longitude: Number(item.runBusInfo[0].px),
        width: 30,
        height: 40,
        markerLevel: 3,
      });
    }
  });
  this.drawBusPos(buses);
}

function selectedStationPosition(position) {
  if (!position) return;
  my.calculateRoute({
    startLat: this.props.position.latitude,
    startLng: this.props.position.longitude,
    endLat: this.data.selectedStationPosition.latitude,
    endLng: this.data.selectedStationPosition.longitude,
    success: (res) => this.props.onMainData("userTimeCost", second2minute(res.duration)),
    fail: (error) => console.log(error),
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

function showNavigationPath(val) {
  if (val) {
    this.mapCtx.showRoute({
      startLat: this.props.position.latitude,
      startLng: this.props.position.longitude,
      endLat: this.data.selectedStationPosition.latitude,
      endLng: this.data.selectedStationPosition.longitude,
      zIndex: 4,
      routeColor: "#FFB90F",
      iconPath:
        "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
      iconWidth: 10,
      routeWidth: 10,
      success: (res) => {},
      fail: (error) => {
        console.log(error);
      },
    });
  } else {
    this.mapCtx.clearRoute();
  }
}

function moveToUserPosition() {
  this.mapCtx.moveToLocation(this.props.position);
}
