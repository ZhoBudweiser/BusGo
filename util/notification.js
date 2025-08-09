import { DEFAULT_SHOW_DURATION } from "/options/props/defaults";

/**
 * 显示加载提示
 */
export function showQuerying() {
  my.showLoading({
    content: "加载中...",
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
  pop(`当前${name}异常，请保持网络稳定`);
}

/**
 * 显示查询成功
 */
export function popQuerySuccess() {
  pop("查询成功");
}

/**
 * 显示班车暂无信息
 */
export function popNoCar() {
  pop("暂无班车信息");
}

/**
 * 显示目的地在站点附近
 */
export function popStationNearBy() {
  pop("目的地在站点附近");
}

/**
 * 显示匹配了最近站点
 */
export function popMatchStationNearBy() {
  pop("已匹配最近的站点");
}

/**
 * 显示班车查询过于频繁
 */
export function popTooFrequent() {
  pop("查询过于频繁，\n请稍后再试");
}

/**
 * 显示班车查询结果相同
 */
export function popIsSame() {
  pop("结果已给出，\n请更新查询");
}

/**
 * 显示未输入地点信息
 */
export function popNoAddress() {
  pop("请填写地点信息");
}

function pop(content) {
  my.showToast({
    content,
    duration: DEFAULT_SHOW_DURATION,
  });
}