import { locate } from "/util/maphelper";
import { getNearestStop, setTimer } from "/util/queryhelper";
import { dynamicData } from "/options/props/realTimeQuery";
import { showQuerying } from "/util/notification";

const observers = {
  activeIndex,
  selectedStationId,
  queriedStations,
  busLines,
  sysQueryFrequency,
};

export default observers;

function activeIndex(index) {
  showQuerying();
  this.onClearTimer();
  this.setData(dynamicData);
  locate(this, index);
  my.setStorageSync({
    key: "activeIndex",
    data: index,
  });
}

function selectedStationId(val) {
  if (val == "") return;
  const stations =
    this.data.activeIndex == 0
      ? this.data.busStations
      : this.data.shuttleStations;
  const newStopName = stations.filter(
    (item) => item.station_alias_no === this.data.selectedStationId,
  )[0].station_alias;
  this.setData({
    selectedStationName: newStopName,
  });
  showQuerying();
  setTimer(this);
}

function queriedStations(curval) {
  if (!curval || !curval.length) return;
  const stopid = getNearestStop(
    curval,
    this.data.userPosition.latitude,
    this.data.userPosition.longitude,
  );
  this.setData({
    selectedStationId: stopid,
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
