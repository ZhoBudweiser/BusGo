
export function showQuerying(loonger=1) {
  my.showLoading({
    content: loonger === 0 ? "此次查询预计需要 10 秒左右" : "加载中...",
  });
}

export function hideLoading() {
  my.hideLoading();
}

export function popQueryError(error, name) {
  console.log("fail: ", error);
  my.showToast({
    content: `当前${name}异常，先试试其他功能吧`,
    duration: 2000,
  });
}

export function popNoCar() {
  my.showToast({
    content: "暂无班车信息",
    duration: 2000,
  });
}

export function popStationNearBy() {
  my.showToast({
    content: "目的地在站点附近",
    duration: 2000,
  });
}