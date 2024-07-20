import { locate } from "/util/maphelper";
import { getNearestStop, setTimer } from "/util/queryhelper";
import {
  distinctStops,
  getFormatedBusLines,
  getFormatedShuttleLines,
} from "/util/fmtUnit";
import { getStart } from "/util/data";
import { flip } from "/util/setters";

Page({
  data: {
    activeIndex: 0,
    busLines: [],
    shuttleLines: [],
    queriedLines: [],
    sysQueryFrequency: 20000,
    position: {
      longitude: 120.090178,
      latitude: 30.303975,
    },
    selectedStopId: "0",
    selectedStopName: "",
    selectedBusLineId: "-1",
    showNavigationPath: false,
    moveToUserPosition: false,
    stops: [],
    allstops: [],
    userTimeCost: -1,
    stationsBuffer: {},
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
        sysQueryFrequency: 20000,
        selectedStopId: "",
        selectedStopName: "",
        selectedBusLineId: "-1",
        showNavigationPath: false,
        moveToUserPosition: false,
        stops: [],
        allstops: [],
        userTimeCost: -1,
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
        this.data.position.latitude,
        this.data.position.longitude,
      );
      this.setData({
        selectedStopId: stopid,
      });
    },
    selectedStopId: function () {
      if (!this.data.allstops.length) return;
      const newStopName = this.data.allstops.filter(
        (item) => item.station_alias_no === this.data.selectedStopId,
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
      if (freq !== this.data.sysQueryFrequency)
        this.setData({
          sysQueryFrequency: freq,
        });
    },
    sysQueryFrequency: function () {
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
      userTimeCost: (time / 60).toFixed(1),
    });
  },
  onSelectedStop(id) {
    this.setData({
      selectedStopId: id,
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
      selectedBusLineId: bid,
    });
  },
  onFlip(field) {
    flip(this, field);
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
      key: "stationsBuffer",
    });
    if (stations_res.success) {
      this.setData({
        stationsBuffer: stations_res.data,
      });
    }
    const news_res = my.getStorageSync({
      key: "noticeShow",
    });
    if (!news_res.data) {
      getStart();
    }
  },
  onUnload() {
    my.setStorageSync({
      key: "stationsBuffer",
      data: this.data.stationsBuffer,
    });
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: "ZJU-BusGo",
      desc: "智慧校园出行助手",
      path: "pages/index/index",
    };
  },
});
