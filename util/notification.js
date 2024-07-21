
export function showQuerying() {
  my.showLoading({
    content: "加载中...",
  });
}

export function popQueryError (error, name) {
  console.log("fail: ", error);
  my.alert({
    title: name,
    content: "当前实时定位异常，先试试其他功能吧",
    buttonText: "确定",
  });
}