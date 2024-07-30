import { locate } from "/util/maphelper";
import { getNearestStop, setTimer } from "/util/queryhelper";
import { dynamicData } from "/options/props/realTimeQuery";
import { showQuerying } from "/util/notification";
import { queryBackend, resetCarTimer } from "/options/apis/carApis";
import { onSelectedStop } from "./handlers";

const observers = {
  activeIndex,
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

function queriedStations(curval) {
  if (!curval || !curval.length) return;
  const stopid = getNearestStop(
    curval,
    this.data.userPosition.latitude,
    this.data.userPosition.longitude,
  );
  onSelectedStop(stopid);
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

function sysQueryFrequency(frequency) {
  const { activeIndex, selectedStation } = this.data;
  if (selectedStation.id == "") return;
  resetCarTimer(this, activeIndex, selectedStation.id, frequency);
}
