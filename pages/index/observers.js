import { locate } from "/util/maphelper";
import { getNearestStop } from "/util/queryhelper";
import { dynamicData } from "/options/props/realTimeQuery";
import { showQuerying } from "/util/notification";
import { queryBackend } from "/options/apis/carApis";
import { resetCarTimer, selectStation } from "/util/client";

const observers = {
  activeIndex,
  queriedStations,
  busLines,
  sysQueryFrequency,
};

export default observers;

async function activeIndex(index) {
  showQuerying();
  this.setData({
    ...dynamicData,
    queriedStations: await queryBackend(
      "allStations",
      this.data.activeIndex,
      [],
    ),
  });
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
  selectStation(this, stopid);
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
