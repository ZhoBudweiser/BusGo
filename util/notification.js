import { DEFAULT_SHOW_DURATION } from "/options/props/defaults";

/**
 * 显示加载提示
 * @param {number} loonger 加载类型，0为长时间加载，1为短时间加载
 */
export function showQuerying(loonger=1) {
  my.showLoading({
    content: loonger === 0 ? "此次查询预计需要 10 秒左右" : "加载中...",
  });
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  my.hideLoading();
}

/**
 * 提醒用户定位未授权
 */
export function alertLocationNotAuthed() {
  my.alert({
    title: "提醒",
    content:
      "当前定位未开启，如需定位，请在右上角「···」中打开并重新启动小程序",
    buttonText: "确认",
  });
}

/**
 * 显示查询错误信息
 * @param {string} error 查询错误信息
 * @param {string} name 错误类型
 */
export function popQueryError(error, name) {
  console.log("fail: ", error);
  my.showToast({
    content: `当前${name}异常，先试试其他功能吧`,
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示班车暂无信息
 */
export function popNoCar() {
  my.showToast({
    content: "暂无班车信息",
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示目的地在站点附近
 */
export function popStationNearBy() {
  my.showToast({
    content: "目的地在站点附近",
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示匹配了最近站点
 */
export function popMatchStationNearBy() {
  my.showToast({
    content: "已匹配最近的站点",
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示班车查询过于频繁
 */
export function popTooFrequent() {
  my.showToast({
    content: "查询过于频繁，\n请稍后再试",
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示班车查询结果相同
 */
export function popIsSame() {
  my.showToast({
    content: "结果已给出，\n请更新查询",
    duration: DEFAULT_SHOW_DURATION,
  });
}

/**
 * 显示未输入地点信息
 */
export function popNoAddress() {
  my.showToast({
    content: "请填写地点信息",
    duration: DEFAULT_SHOW_DURATION,
  });
}