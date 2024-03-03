const data_longitude = 120.090178;
const data_latitude = 30.303975;

Component({
  data: {
    scale: 14,
    stops_labels: [],
    buses: [],
    display_mode: true,
    stop_lon: data_longitude,
    stop_lat: data_latitude,
  },
  options: {
    observers: true,
  },
  props: {
    longitude: data_longitude,
    latitude: data_latitude,
    stops: [],
    selectedStop: "0",
    selectedBusLine: "-1",
    showPath: false,
    lines: [],
    onSelectedStop: () => {},
    onSetTimeCost: () => {}
  },
  observers: {
    'stops': function () {
      this.mapCtx.showsCompass({
        isShowsCompass: true
      });
      this.mapCtx.updateComponents({
        scale: 16,
      });
      const stops = this.props.stops.map(item => {
        return {
          ...item,
          id: item.station_alias_no,
          latitude: item.station_lat,
          longitude: item.station_long,
          width: 19,
          height: 31,
          iconPath: this.props.selectedStop === item.station_alias_no ? '/images/mark_stop.png' : '/images/mark_bs.png',
          label: {
            content: item.station_alias.replace(/.*校区(?=\S)/g, ''),
            color: "#a2a2a2",
            fontSize: 14,
            borderRadius: 3,
            bgColor: "#ffffff",
            padding: 5,
          },
          markerLevel: 2
        }
      });
      this.data.stops_labels && this.mapCtx.changeMarkers({
        remove: this.data.stops_labels,
      });
      this.mapCtx.changeMarkers({
        add: stops,
      });
      this.setData({
        stops_labels: stops
      });
    },
    'selectedStop': function () {
      let lat, lon;
      const stops_labels = this.data.stops_labels.map(item => {
        if (item.id === this.props.selectedStop) {
          lat = item.latitude;
          lon = item.longitude;
          return {
            ...item,
            iconPath: '/images/mark_stop.png'
          }
        } else {
          return {
            ...item,
            iconPath: '/images/mark_bs.png'
          };
        }
      });
      this.setData({
        stops_labels: stops_labels,
        stop_lat: lat,
        stop_lon: lon,
      });
      this.mapCtx.changeMarkers({
        update: stops_labels
      });
      this.mapCtx.updateComponents({
        longitude: lon,
        latitude: lat,
      });
    },
    'selectedBusLine': function (bid) {
      this.mapCtx.clearRoute();
      const line = this.props.lines.filter(item => item.bid === bid);
      if (line.length)
        this.drawRoute(line[0].stations)
    },
    'lines': function () {
      const buses = [];
      this.props.lines.forEach(item => {
        if (item.runBusInfo) {
          buses.push({
            iconPath: item.runBusInfo[0].vehicleType ? (item.runBusInfo[0].vehicleType === "2" ? '/images/map_shuttle.png' : '/images/map_babybus.png') : '/images/map_bus.png',
            id: Number(item.runBusInfo[0].vehi_num.replace(/\D/g, '')),
            // id: item.runBusInfo[0].vehi_num.replace('浙', 'BUS'),
            latitude: Number(item.runBusInfo[0].py),
            longitude: Number(item.runBusInfo[0].px),
            width: 30,
            height: 40,
            markerLevel: 3
          });
        }
      });
      this.drawBusPos(buses);
    },
    'stop_lat, stop_lon, longitude, latitude': function () {
      my.calculateRoute({
        startLat: this.props.latitude,
        startLng: this.props.longitude,
        endLat: this.data.stop_lat,
        endLng: this.data.stop_lon,
        success: (res) => {
          this.props.onSetTimeCost(res.duration);
        },
        fail: (error) => {
          console.log(error);
        },
      });
    },
    'display_mode': function () {
      if (this.data.display_mode) {
        this.mapCtx.changeMarkers({
          add: this.data.stops_labels,
        });
      } else {
        this.mapCtx.changeMarkers({
          remove: this.data.stops_labels,
        });
      }
    },
    'showPath': function (val) {
      if (val) {
        this.mapCtx.showRoute({
          startLat: this.props.latitude,
          startLng: this.props.longitude,
          endLat: this.data.stop_lat,
          endLng: this.data.stop_lon,
          zIndex: 4,
          routeColor: '#FFB90F',
          iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
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
  },
  onInit() {
    this.mapCtx = my.createMapContext('map');
  },
  methods: {
    markertap(e) {
      if (/[\u4E00-\u9FFF]/.test(e.markerId) || (("" + e.markerId).length < 4 &&
          e.markerId !== "233" && e.markerId !== "32")) return;
      if (e.markerId !== this.props.selectedStop) {
        this.mapCtx.clearRoute();
        this.props.onSelectedStop(e.markerId);
      }
    },
    onSwitchMode() {
      this.setData({
        display_mode: !this.data.display_mode
      });
    },
    onJumpNotice() {
      my.navigateTo({
        url: '/pages/news/news',
      });
    },
    onJumpSearch() {
      my.navigateTo({
        url: '/pages/search/search',
      });
    },
    drawRoute(stops) {
      const points = stops.map(item => {
        return {
          lng: item.station_long,
          lat: item.station_lat
        };
      });
      this.mapCtx.showRoute({
        startLat: stops[0].station_lat,
        startLng: stops[0].station_long,
        endLat: stops[stops.length - 1].station_lat,
        endLng: stops[stops.length - 1].station_long,
        zIndex: 4,
        searchType: 'drive',
        throughPoints: points,
        routeColor: '#FFB90F',
        iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
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
    },
    drawBusPos(buses) {
      if (this.data.buses &&
        (this.data.buses.length !== buses.length ||
          (buses.length && this.data.buses[0].id !== buses[0].id))) {
        this.mapCtx.changeMarkers({
          remove: this.data.buses,
        });
        this.mapCtx.changeMarkers({
          add: buses,
        });
      }
      buses.forEach(item => {
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
            console.log(error);
          },
          complete: () => {
            // console.log('complete end');
          }
        });
      });
      this.setData({
        buses: buses
      });
    },
  },
});