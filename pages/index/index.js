import {
  locate
} from "/util/maphelper";
import {
  queryBusLinesByStop,
} from "/util/queryhelper";

Page({
  data: {
    activeIndex: 0,
    currentState: 1,
    busLines: [],
    selectedStop: "1007",
    selectedStopName: "",
    stops: [],
    destinations: [],
    timeCost: -1,
    stationsBuffers: {},
    noticeShow: true
  },
  options: {
    observers: true,
  },
  observers: {
    'selectedStop': function () {
      this.setData({
        selectedStopName: this.data.stops.filter(item => item.station_alias_no === this.data.selectedStop)[0].station_alias
      });
      my.showLoading({
        content: '查询中...'
      });
      if (this.timer)
        clearInterval(this.timer);
      queryBusLinesByStop({
        bid: '',
        stopId: this.data.selectedStop,
        obj: this
      });
      this.timer = setInterval(queryBusLinesByStop, 10000, {
        bid: '',
        stopId: this.data.selectedStop,
        obj: this
      });
    },
    'activeIndex': function () {
      locate(this, this.data.activeIndex);
    },
    'selectedStopName': function () {
      
    },
  },
  onActive(id) {
    this.setData({
      activeIndex: id
    });
  },
  onSetTimeCost(time) {
    this.setData({
      timeCost: (time / 60).toFixed(1)
    });
  },
  onSelectedStop(id) {
    this.setData({
      selectedStop: id
    });
    queryBusLinesByStop({
      bid: '',
      stopId: id,
      obj: this
    });
  },
  onStateChange(s) {
    this.setData({
      currentState: s
    });
  },
  noticeClick() {
    this.setData({
      noticeShow: false
    });
  },
  onShow() {
    locate(this, this.data.activeIndex);
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'ZJU-BusGo',
      desc: '智慧校园出行助手',
      path: 'pages/index/index',
    };
  },
});