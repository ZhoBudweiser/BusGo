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
    stops_labels: []
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
    lines: []
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
      this.demoMarkerLabel(stops);
    },
    'selectedStop': function () {
      const stops_labels = this.data.stops_labels.map(item => {
        if (item.id === this.props.selectedStop) {
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
    },
    'lines': function() {
      this.mapCtx.clearRoute();
      this.props.lines.forEach(item=>item.runBusInfo ? this.drawStops(item.stations) : '');
      this.mapCtx.moveToLocation();
    }
  },
  onInit() {
    this.mapCtx = my.createMapContext('map');
  },
  methods: {
    demoMarkerLabel(markers) {
      if (!my.canIUse('createMapContext.return.updateComponents')) {
        my.alert({
          title: '客户端版本过低',
          content: 'this.mapCtx.updateComponents 需要 10.1.35 及以上版本'
        });
        return;
      }
      this.mapCtx.updateComponents({
        // scale: 16,
        longitude: this.props.longitude,
        latitude: this.props.latitude,
        // includePoints,
        'markers': markers,
      });
    },
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
          routeWidth: 10
        });
      } else {
        this.mapCtx.clearRoute();
        this.props.onSelectedStop(e.markerId);
      }
    },
    drawStops(stops) {
      const points = stops.map(item => {
        return {
          lng: item.station_long,
          lat: item.station_lat
        };
      });
      this.mapCtx.showRoute({
        startLat: stops[0].station_lat,
        startLng: stops[0].station_long,
        endLat: stops[stops.length-1].station_lat,
        endLng: stops[stops.length-1].station_long,
        zIndex: 4,
        searchType: 'drive',
        throughPoints: points,
        routeColor: '#FFB90F',
        iconPath: "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
        iconWidth: 5,
        routeWidth: 5
      });  
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
        endLat: buses[buses.length-1].station_lat,
        endLng: buses[buses.length-1].station_long,
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
      console.log('control tap', e);
    },
    tap() {
      console.log('tap');
    },
    callouttap(e) {
      console.log('callout tap', e);
    },
  },
});