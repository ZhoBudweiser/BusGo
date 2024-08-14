import { second2minute } from "/util/formatter";

const observers = {
  stops,
  "selectedStation.id": selectedStationId,
  selectedBusLineId,
  lines,
  stationPosition,
  displayMode,
  showNavigationPath,
  moveToUserPosition,
};

export default observers;

function stops() {
  this.mapCtx.clearRoute();
  this.mapCtx.showsCompass({
    isShowsCompass: true,
  });
  this.mapCtx.updateComponents({
    scale: 16,
  });
  const stops = this.props.stops.map((item) => {
    return {
      ...item,
      id: item.station_alias_no,
      latitude: item.station_lat,
      longitude: item.station_long,
      width: 19,
      height: 31,
      iconPath:
        this.props.selectedStation.id === item.station_alias_no
          ? "/images/mark_stop.png"
          : "/images/mark_bs.png",
      label: {
        content: item.station_alias.replace(/.*校区(?=\S)/g, ""),
        color: "#a2a2a2",
        fontSize: 14,
        borderRadius: 3,
        bgColor: "#ffffff",
        padding: 5,
      },
      markerLevel: 2,
    };
  });
  this.data.stationMarkers &&
    this.mapCtx.changeMarkers({
      remove: this.data.stationMarkers,
    });
  this.mapCtx.changeMarkers({
    add: stops,
  });
  this.setData({
    stationMarkers: stops,
    displayMode: true,
  });
}

function selectedStationId() {
  this.mapCtx.clearRoute();
  let latitude, longitude;
  const stationMarkers = this.data.stationMarkers.map((item) => {
    if (item.id === this.props.selectedStation.id) {
      latitude = item.latitude;
      longitude = item.longitude;
      return {
        ...item,
        iconPath: "/images/mark_stop.png",
      };
    } else {
      return {
        ...item,
        iconPath: "/images/mark_bs.png",
      };
    }
  });
  this.setData({
    stationMarkers: stationMarkers,
    stationPosition: {
      latitude,
      longitude,
    },
  });
  this.mapCtx.changeMarkers({
    update: stationMarkers,
  });
  this.mapCtx.updateComponents({
    longitude,
    latitude,
  });
}

function selectedBusLineId(bid) {
  this.mapCtx.clearRoute();
  const line = this.props.lines.filter((item) => item.bid === bid);
  if (line.length) this.drawRoute(line[0].stations);
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

function stationPosition() {
  my.calculateRoute({
    startLat: this.props.position.latitude,
    startLng: this.props.position.longitude,
    endLat: this.data.stationPosition.latitude,
    endLng: this.data.stationPosition.longitude,
    success: (res) => {
      this.props.onMainData("userTimeCost", second2minute(res.duration));
    },
    fail: (error) => {
      console.log(error);
    },
  });
}

function displayMode(mode) {
  if (mode) {
    this.mapCtx.changeMarkers({
      add: this.data.stationMarkers.filter(
        (item) => item.station_alias_no != this.props.selectedStation.id,
      ),
    });
  } else {
    this.mapCtx.changeMarkers({
      remove: this.data.stationMarkers.filter(
        (item) => item.station_alias_no != this.props.selectedStation.id,
      ),
    });
  }
}

function showNavigationPath(val) {
  if (val) {
    this.mapCtx.showRoute({
      startLat: this.props.position.latitude,
      startLng: this.props.position.longitude,
      endLat: this.data.stationPosition.latitude,
      endLng: this.data.stationPosition.longitude,
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
  this.mapCtx.moveToLocation({
    longitude: this.props.position.longitude,
    latitude: this.props.position.latitude,
  });
}
