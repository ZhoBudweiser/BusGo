import { flip } from "/util/setters";

export const methods = {
  markertap,
  onSwitchMode,
  onJumpSearch,
  drawRoute,
  drawBusPos,
};

export const lifeHanders = {
  onInit,
};

function markertap(e) {
  // 手动消除点击班车触发的事件
  if (
    /[\u4E00-\u9FFF]/.test(e.markerId) ||
    (("" + e.markerId).length < 4 &&
      e.markerId !== "233" &&
      e.markerId !== "32")
  )
    return;
  if (e.markerId !== this.props.selectedStation.id) {
    this.mapCtx.clearRoute();
    this.props.onSelectStation(e.markerId);
  }
}

function onSwitchMode() {
  flip(this, "displayMode");
}

function onJumpSearch() {
  my.navigateTo({
    url: "/pages/search/search?start=" + this.props.selectedStation.name,
  });
}

function drawRoute(stops) {
  const points = stops.map((item) => {
    return {
      lng: item.station_long,
      lat: item.station_lat,
    };
  });
  this.mapCtx.showRoute({
    startLat: stops[0].station_lat,
    startLng: stops[0].station_long,
    endLat: stops[stops.length - 1].station_lat,
    endLng: stops[stops.length - 1].station_long,
    zIndex: 4,
    searchType: "drive",
    throughPoints: points,
    routeColor: "#FFB90F",
    iconPath:
      "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
    iconWidth: 5,
    routeWidth: 5,
    success: (res) => {
      // console.log(res, `总路程 ${res.distance} 米, 预计耗时 ${res.duration} 秒`);
      // this.props.onSetTimeCost(res.duration);
    },
    fail: (error) => {
      console.log(error);
    },
  });
}

function drawBusPos(buses) {
  if (shttleChange(this.data.buses, buses)) {
    this.mapCtx.changeMarkers({
      remove: this.data.buses,
    });
    this.mapCtx.changeMarkers({
      add: buses,
    });
    this.setData({
      buses: buses,
    });
    return;
  }
  buses.forEach((item) => {
    this.mapCtx.translateMarker({
      markerId: item.id,
      destination: {
        longitude: Number(item.longitude),
        latitude: Number(item.latitude),
      },
      autoRotate: true,
      duration: 9000,
      animationEnd: () => {
        // console.log('animation end');
      },
      success: (res) => {
        // console.log(res);
      },
      fail: (error) => {
        console.log(item, error);
      },
      complete: () => {
        // console.log('complete end');
      },
    });
  });
  this.setData({
    buses: buses,
  });
}

function onInit() {
  this.mapCtx = my.createMapContext("map");
}

function shttleChange(oldbuses, newBuses) {
  if (oldbuses.length !== newBuses.length) return true;
  if (!newBuses.length || !oldbuses.length) return false;
  const n = oldbuses.length;
  for (let i = 0; i < n; ++i) {
    if (oldbuses[i].id !== newBuses[i].id) {
      return true;
    }
  }
  return false;
}
