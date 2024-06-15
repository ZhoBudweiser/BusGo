import { locate } from "/util/maphelper";
import { getNearestStop, setTimer } from "/util/queryhelper";
import {
  distinctStops,
  getFormatedBusLines,
  getFormatedShuttleLines,
} from "/util/fmtUnit";
import { getStart } from "/util/data";

Page({
  data: {
    activeIndex: 0,
    currentState: 1,
    busLines: [],
    shuttleLines: [],
    queriedLines: [],
    queryFrequency: 20000,
    longitude: 120.090178,
    latitude: 30.303975,
    selectedStop: "0",
    selectedStopName: "",
    selectedBusLine: "-1",
    showPath: false,
    showPosition: false,
    stops: [],
    allstops: [],
    destinations: [],
    timeCost: -1,
    stationsBuffers: {},
  },
  options: {
    observers: true,
  },
  observers: {
    activeIndex: function (index) {
      my.showLoading({
        content: "加载中...",
      });
      this.onClearTimer();
      this.setData({
        busLines: [],
        queriedLines: [],
        queryFrequency: 20000,
        selectedStop: "",
        selectedStopName: "",
        selectedBusLine: "-1",
        showPath: false,
        showPosition: false,
        stops: [],
        allstops: [],
        destinations: [],
        timeCost: -1,
      });
      locate(this, index);
      my.setStorageSync({
        key: "activeIndex",
        data: index,
      });
    },
    stops: function (curval) {
      if (!curval || !curval.length) return;
      const stopid = getNearestStop(
        curval,
        this.data.latitude,
        this.data.longitude,
      );
      this.setData({
        selectedStop: stopid,
      });
    },
    selectedStop: function () {
      if (!this.data.allstops.length) return;
      const newStopName = this.data.allstops.filter(
        (item) => item.station_alias_no === this.data.selectedStop,
      )[0].station_alias;
      this.setData({
        selectedStopName: newStopName,
      });
      my.showLoading({
        content: "查询中...",
      });
      setTimer(this);
    },
    busLines: function (fmtLines) {
      if (!fmtLines) return;
      let freq = fmtLines.length ? 60000 : 600000;
      fmtLines.forEach((item) => item.runBusInfo !== null && (freq = 10000));
      if (freq !== this.data.queryFrequency)
        this.setData({
          queryFrequency: freq,
        });
    },
    queryFrequency: function () {
      setTimer(this);
    },
  },
  onActive(id) {
    this.setData({
      activeIndex: id,
    });
  },
  onSetTimeCost(time) {
    this.setData({
      timeCost: (time / 60).toFixed(1),
    });
  },
  onSelectedStop(id) {
    this.setData({
      selectedStop: id,
    });
  },
  onStateChange(s) {
    this.setData({
      currentState: s,
    });
  },
  onShow() {
    locate(this, this.data.activeIndex);
  },
  onSetBusLines(newBusLines) {
    this.onClearTimer();
    const setting = (fmtLines) => {
      console.log(fmtLines);
      this.onSetStopsByBusLines(fmtLines.map((item) => item.stations));
      this.setData({
        queriedLines: fmtLines.length ? fmtLines.map((item) => item.bid) : [""],
      });
      if (!newBusLines.length) {
        my.showToast({
          content: "暂无班车信息",
          duration: 2000,
        });
      }
    };
    this.data.activeIndex === 0
      ? getFormatedBusLines(this, newBusLines).then((fmtLines) =>
          setting(fmtLines),
        )
      : getFormatedShuttleLines(this, newBusLines).then((fmtLines) =>
          setting(fmtLines),
        );
  },
  onSetStopsByBusLines(formatBusLines) {
    const newStops = distinctStops(formatBusLines);
    this.setData({
      stops: newStops,
    });
  },
  onClearTimer() {
    if (this.timer) clearInterval(this.timer);
  },
  onSetSelectedBusLine(bid) {
    this.setData({
      selectedBusLine: bid,
    });
  },
  onSetShowPath() {
    this.setData({
      showPath: !this.data.showPath,
    });
  },
  onSetShowPosition() {
    this.setData({
      showPosition: !this.data.showPosition,
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
    const index_res = my.getStorageSync({
      key: "activeIndex",
    });
    if (index_res.success) {
      this.setData({
        activeIndex: index_res.data,
      });
    }
    const stations_res = my.getStorageSync({
      key: "stationsBuffers",
    });
    if (stations_res.success) {
      this.setData({
        stationsBuffers: stations_res.data,
      });
    }
    const news_res = my.getStorageSync({
      key: "noticeShow",
    });
    if (!news_res.data) {
      getStart();
    }
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: "ZJU-BusGo",
      desc: "智慧校园出行助手",
      path: "pages/index/index",
    };
  },
  onUnload() {
    my.setStorageSync({
      key: "stationsBuffers",
      data: this.data.stationsBuffers,
    });
  },
});
