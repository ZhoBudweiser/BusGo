import { getBusTimeTable } from "/options/apis/timeTableApis";
import { load } from "/util/cache";
import { isThrottle } from "/util/client";
import { isSameQuery } from "/util/formatter";
import { popNoCar } from "/util/notification";
import { setTimeTableNearestStation } from "/util/setters";

const eventHandlers = {
  onSubmitQuery,
  onSetHistoryAddress,
};

const lifeHandlers = {
  onLoad,
};

const handlers = {
  ...eventHandlers,
  ...lifeHandlers,
};

export default handlers;

/**
 * 查询班车信息
 * @param {object} queried 查询条件
 */
async function onSubmitQuery(queried) {
  console.log("查询班车信息：", queried);
  if (isThrottle(this)) return;
  if (isSameQuery(queried, this.data.queried)) return;
  const lines = await getBusTimeTable(queried);
  if (lines && lines.length === 0) popNoCar();
  this.setData({ lines, queried });
}

/**
 * 设置历史查询地址
 * @param {object} historyAddress 历史查询地址
 */
function onSetHistoryAddress(historyAddress) {
  this.setData({ historyAddress });
}

/**
 * 获取最近的班车站点，初始化查询条件
 * @param {object} query 查询参数
 */
async function onLoad(query) {
  console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  const app = getApp();
  const locationAuthed = app.locationAuthed;
  if (locationAuthed) {
    const initStart = await setTimeTableNearestStation();
    this.setData({ initStart });
  }
}
