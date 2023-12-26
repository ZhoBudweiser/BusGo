const longitude = 120.10675;
const latitude = 30.266786;
const includePoints = [{
  latitude: 30.266786,
  longitude: 120.10675,
}];

Component({
  data: {
    scale: 14,
    includePoints,
    stops_labels: [],
    display_mode: true
  },
  options: {
    observers: true,
  },
  props: {
    longitude,
    latitude,
    onSelectedStop: () => {},
    stops: [],
    selectedStop: "1007",
    lines: [],
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
      this.setData({
        stops_labels: stops
      });
      this.mapCtx.updateComponents({
        // longitude: this.props.longitude,
        // latitude: this.props.latitude,
        'markers': stops,
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
        stops_labels: stops_labels
      });
      this.mapCtx.changeMarkers({
        update: stops_labels
      });
      this.mapCtx.updateComponents({
        longitude: lon,
        latitude: lat,
      });
    },
    'lines': function () {
      this.mapCtx.clearRoute();
      const buses = [];
      this.props.lines.forEach(item => {
        if (item.runBusInfo) {
          this.drawStops(item.stations);
          buses.push({
            // 图片路径
            iconPath: '/images/map_bus.png',
            // 标记点 id
            id: item.runBusInfo[0].vehi_num,
            // 纬度
            latitude:  item.runBusInfo[0].py,
            // 经度
            longitude:  item.runBusInfo[0].px,
            // 标记宽度
            width: 50,
            // 标记高度
            height: 30,
            markerLevel: 3
          });
        }
      });
      this.drawBusPos(buses);
      // this.mapCtx.moveToLocation();
    },
    'display_mode': function () {
      if (this.data.display_mode) {
        this.mapCtx.updateComponents({
          'markers': this.data.stops_labels,
        });
      } else {
        this.mapCtx.updateComponents({
          'markers': [],
        });
      }
    }
  },
  onInit() {
    this.mapCtx = my.createMapContext('map');
  },
  methods: {
    regionchange(e) {
      console.log('regionchange', e);
    },
    markertap(e) {
      console.log('marker tap', e);
      if (e.markerId === this.props.selectedStop) {
        const stops = this.props.stops.filter(item => item.station_alias_no === e.markerId);
        this.mapCtx.showRoute({
          startLat: this.props.latitude,
          startLng: this.props.longitude,
          endLat: stops[0].station_lat,
          endLng: stops[0].station_long,
          zIndex: 4,
          routeColor: '#FFB90F',
          iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
          iconWidth: 10,
          routeWidth: 10,
          success: (res) => {
            // console.log(res, `总路程 ${res.distance} 米, 预计耗时 ${res.duration} 秒`);
            this.props.onSetTimeCost(res.duration);
          },
          fail: (error) => {
            console.log(error);
          },
        });
      } else {
        this.mapCtx.clearRoute();
        this.props.onSelectedStop(e.markerId);
        this.props.onSetTimeCost(-61);
      }
    },
    drawStops(stops) {
      const points = stops.map(item => {
        return {
          longitude: item.station_long,
          latitude: item.station_lat
        };
      });
      // this.mapCtx.showRoute({
      //   startLat: stops[0].station_lat,
      //   startLng: stops[0].station_long,
      //   endLat: stops[stops.length - 1].station_lat,
      //   endLng: stops[stops.length - 1].station_long,
      //   zIndex: 4,
      //   searchType: 'drive',
      //   throughPoints: points,
      //   routeColor: '#FFB90F',
      //   iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
      //   iconWidth: 5,
      //   routeWidth: 5,
      // });
      // console.log(points);
      // this.mapCtx.smoothDrawPolyline({
      //   // 折线 id
      //   polylineId: 10,
      //   // 经纬度数组，指定绘制路径
      //   points: points,
      //   // 线路颜色
      //   color: '#00FF00',
      //   // 是否虚线
      //   dottedLine: false,
      //   // 动画执行时间
      //   duration: 40000,
      //   success: res => {
      //     console.log('success' + JSON.stringify(res))
      //   },
      //   fail: err => {
      //     console.log('err' + JSON.stringify(err))
      //   }
      // });
    },
    drawBusPos(bus) {
      console.log(bus);
      this.mapCtx.changeMarkers({
        add: bus,
        success: res => {
          console.log(res);
        },
        fail: error => {
          console.log(error);
        },
        complete: res => {
          console.log(res);
        }
      });
      // this.mapCtx.updateComponents({
      //   'markers': bus,
      // });
    },
    drawBuses(buses) {
      const points = buses.map(item => {
        return {
          lng: item.station_long,
          lat: item.station_lat
        };
      });
      this.mapCtx.showRoute({
        startLat: buses[0].station_lat,
        startLng: buses[0].station_long,
        endLat: buses[buses.length - 1].station_lat,
        endLng: buses[buses.length - 1].station_long,
        zIndex: 4,
        searchType: 'drive',
        throughPoints: points,
        routeColor: '#FFB90F',
        iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
        iconWidth: 5,
        routeWidth: 5
      });
    },
    controltap(e) {
      // console.log('control tap', e);
    },
    tap() {
      // console.log('tap');
    },
    callouttap(e) {
      // console.log('callout tap', e);
    },
    onSwitchMode() {
      this.setData({
        display_mode: !this.data.display_mode
      });
    }
  },
});