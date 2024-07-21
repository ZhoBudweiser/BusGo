import { locate } from "/util/maphelper";
import { getNearestStop, setTimer } from "/util/queryhelper";
import { dynamicData } from "/options/props/realTimeQuery";

const observers = {
  activeIndex,
  selectedStopId,
  queriedStations,
  busLines,
  sysQueryFrequency,
};

export default observers;

function activeIndex(index) {
  my.showLoading({
    content: "加载中...",
  });
  this.onClearTimer();
  this.setData(dynamicData);
  locate(this, index);
  my.setStorageSync({
    key: "activeIndex",
    data: index,
  });
}

function selectedStopId(val) {
  if (val == "") return;
  const stations =
    this.data.activeIndex == 0
      ? this.data.busStations
      : this.data.shuttleStations;
  const newStopName = stations.filter(
    (item) => item.station_alias_no === this.data.selectedStopId,
  )[0].station_alias;
  this.setData({
    selectedStopName: newStopName,
  });
  my.showLoading({
    content: "查询中...",
  });
  setTimer(this);
}

function queriedStations(curval) {
  if (!curval || !curval.length) return;
  const stopid = getNearestStop(
    curval,
    this.data.position.latitude,
    this.data.position.longitude,
  );
  this.setData({
    selectedStopId: stopid,
  });
}

function busLines(fmtLines) {
  if (!fmtLines) return;
  let freq = fmtLines.length ? 60000 : 600000;
  fmtLines.forEach((item) => item.runBusInfo !== null && (freq = 10000));
  if (freq !== this.data.sysQueryFrequency)
    this.setData({
      sysQueryFrequency: freq,
    });
}

function sysQueryFrequency() {
  setTimer(this);
}
