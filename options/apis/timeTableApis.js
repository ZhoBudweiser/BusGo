import { fmtTimeTableQueryResults, stripCloudData } from "/util/formatter";
import { hideLoading, showQuerying } from "/util/notification";

export async function getBusTimeTable(info) {
  showQuerying();
  const context = await my.getCloudContext();
  return new Promise((resolve, reject) =>
    context.callFunction({
      name: "queryBusLines",
      data: info,
      success: (res) => resolve(fmtTimeTableQueryResults(info, stripCloudData(res))),
      fail: (err) => reject(console.log("查询时刻表错误：", err)),
      complete: hideLoading,
    }),
  );
}
