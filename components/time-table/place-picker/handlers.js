import { DEFAULT_QUERY_ALL_ENDS } from "/options/props/defaults";
import { store } from "/util/cache";
import { loadAndSet, setData } from "/util/client";
import { fmtTime } from "/util/formatter";
import { popNoAddress } from "/util/notification";
import { flip } from "/util/client";

export const methods = {
  onPickStart,
  onPickEnd,
  onSwitchAddress,
  onTimePick,
  onDayPick,
  onTransPick,
  onSubmit,
};

export const lifeHanders = {
  didMount,
  didUnmount,
};

function onPickStart(e) {
  const startName = this.data.startOptions[e.detail.value];
  this.setData({
    startName,
    endOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== startName),
    edited: true,
  });
}

function onPickEnd(e) {
  const endName = this.data.endOptions[e.detail.value];
  this.setData({
    endName,
    startOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== endName),
    edited: true,
  });
}

function onSwitchAddress() {
  const { startName, endName, startOptions, endOptions } = this.data;
  if (startName === "" && endName === "") {
    popNoAddress();
    return;
  }
  this.setData({
    startName: endName,
    endName: startName,
    startOptions: endOptions,
    endOptions: startOptions,
    edited: true,
  });
}

function onTimePick() {
  my.datePicker({
    format: "HH:mm",
    currentDate: this.data.startTime,
    startDate: "05:30",
    endDate: "23:00",
    success: (res) => setData(this, "startTime", res.date),
  });
  this.setData({ edited: true });
}

function onDayPick() {
  flip(this, "isWeekend");
  this.setData({ edited: true });
}

function onTransPick() {
  flip(this, "canTrans");
  this.setData({ edited: true });
}

function onSubmit() {
  const { startName, endName, startTime, isWeekend, canTrans } = this.data;
  if (startName === "" || endName === "") {
    popNoAddress();
    return;
  }
  this.props.onSubmitQuery({
    startAddress: startName,
    endAddress: endName,
    startTime: Number(startTime.replace(":", "")),
    startDay: isWeekend ? "6,7" : "1,2,3,4,5",
    canTrans: canTrans,
  });
  this.setData({ edited: false });
}

function didMount() {
  my.getServerTime({
    success: (res) => setData(this, "startTime", fmtTime(res.time, "hh:mm")),
  });
  loadAndSet(this, "isWeekend");
  loadAndSet(this, "canTrans");
}

function didUnmount() {
  const { isWeekend, canTrans } = this.data;
  store("isWeekend", isWeekend);
  store("canTrans", canTrans);
}
