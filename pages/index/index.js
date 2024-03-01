import {
  locate,
} from "/util/maphelper";
import {
  queryBusLinesByStop,
  getNearestStop,
  setTimer,
} from "/util/queryhelper";
import {
  distinctStops,
  getFormatedBusLines,
} from "/util/fmtUnit";

Page({
  data: {
    activeIndex: 0,
    currentState: 1,
    busLines: [],
    queriedLines: [],
    queryFrequency: 20000,
    longitude: 120.090178,
    latitude: 30.303975,
    selectedStop: "1007",
    selectedStopName: "",
    stops: [],
    allstops: [],
    destinations: [],
    timeCost: -1,
    stationsBuffers: {},
    noticeShow: true
  },
  options: {
    observers: true,
  },
  observers: {
    'activeIndex': function () {
      locate(this, this.data.activeIndex);
    },
    'stops': function (curval) {
      const stopid = getNearestStop(curval, this.data.latitude, this.data.longitude);
      this.setData({
        selectedStop: stopid
      });
    },
    'selectedStop': function () {
      const newStopName = this.data.allstops.filter(item => item.station_alias_no === this.data.selectedStop)[0].station_alias;
      this.setData({
        selectedStopName: newStopName
      });
      my.showLoading({
        content: '查询中...'
      });
      setTimer(this);
    },
    'queryFrequency': function () {
      setTimer(this);
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
  onSetBusLines(newBusLines) {
    let freq = 20000;
    if (!newBusLines.length) {
      my.showToast({
        content: '暂无班车信息',
        duration: 2000,
      });
      freq = 600000;
    }
    getFormatedBusLines(this, newBusLines).then(fmtLines => {
      this.onSetStopsByBusLines(fmtLines.map(item => item.stations));
      this.setData({
        queriedLines: fmtLines.length ? fmtLines.map(item => item.bid) : [""],
      });
      fmtLines.forEach(item => item.runBusInfo !== null && (freq = 5000));
      this.setData({ queryFrequency: freq });
      my.hideLoading();
    });
  },
  onSetStopsByBusLines(formatBusLines) {
    const newStops = distinctStops(formatBusLines);
    this.setData({
      stops: newStops,
    });
  },
  onRollback() {
    this.setData({
      stops: this.data.allstops,
      queriedLines: [],
    });
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