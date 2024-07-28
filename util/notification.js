
export function showQuerying() {
  my.showLoading({
    content: "加载中...",
  });
}

export function popQueryError (error, name) {
  console.log("fail: ", error);
  my.showToast({
    content: `当前${name}异常，先试试其他功能吧`,
    duration: 2000,
  });
}