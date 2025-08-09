import { fmtTimeTableQueryResults, stripCloudData } from "/util/formatter";
import { hideLoading, showQuerying } from "/util/notification";

/**
 * 根据查询信息查询班车时刻表
 * @param {object} info 查询班车时刻表的信息
 * @returns {Promise} 查询结果
 */
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
