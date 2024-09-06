import { store } from "./cache";
import { DEFAULT_SHOW_DURATION } from "/options/props/defaults";

export function showQuerying(loonger=1) {
  my.showLoading({
    content: loonger === 0 ? "此次查询预计需要 10 秒左右" : "加载中...",
  });
}

export function hideLoading() {
  my.hideLoading();
}

export function alertLocationNotAuthed() {
  my.alert({
    title: "提醒",
    content:
      "当前定位未开启，如需定位，请在右上角「···」中打开并重新启动小程序",
    buttonText: "确认",
  });
}

export function popQueryError(error, name) {
  console.log("fail: ", error);
  my.showToast({
    content: `当前${name}异常，先试试其他功能吧`,
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popNoCar() {
  my.showToast({
    content: "暂无班车信息",
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popStationNearBy() {
  my.showToast({
    content: "目的地在站点附近",
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popMatchStationNearBy() {
  my.showToast({
    content: "已匹配最近的站点",
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popTooFrequent() {
  my.showToast({
    content: "查询过于频繁，\n请稍后再试",
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popIsSame() {
  my.showToast({
    content: "结果已给出，\n请更新查询",
    duration: DEFAULT_SHOW_DURATION,
  });
}

export function popNoAddress() {
  my.showToast({
    content: "请填写地点信息",
    duration: DEFAULT_SHOW_DURATION,
  });
}