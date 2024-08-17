import { getBusTimeTable } from "/options/apis/timeTableApis";
import { load } from "/util/cache";
import { isThrottle } from "/util/client";
import { isSameQuery } from "/util/formatter";
import { alertData, popNoCar } from "/util/notification";

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

async function onSubmitQuery(queried) {
  console.log("查询班车信息：", queried);
  if (isThrottle(this)) return;
  if (isSameQuery(queried, this.data.queried)) return;
  const lines = await getBusTimeTable(queried);
  if (lines && lines.length === 0) popNoCar();
  this.setData({ lines, queried });
}

function onSetHistoryAddress(historyAddress) {
  this.setData({ historyAddress });
}

function onLoad(query) {
  console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  if (query.start) {
    this.setData({
      initStart: query.start,
    });
  }
  !load("dataAlert").data && alertData();
}
