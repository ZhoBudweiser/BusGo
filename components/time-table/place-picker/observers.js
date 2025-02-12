import { DEFAULT_QUERY_ALL_ENDS } from "/options/props/defaults";

const observers = {
  historyAddress,
  initStart,
};

export default observers;

/**
 * 选择历史记录的地址
 * @param {object} history 历史记录
 */
function historyAddress(history) {
  if (!history.startAddress || !history.endAddress) return;
  const { startAddress: startName, endAddress: endName } = history;
  this.setData({
    startName,
    endName,
    startOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== endName),
    endOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== startName),
    edited: true,
  });
}

/**
 * 初始化起点
 */
function initStart() {
  const startName = DEFAULT_QUERY_ALL_ENDS.find(
    (address) => this.props.initStart.indexOf(address) !== -1,
  );
  this.setData({
    startName: startName ? startName : "",
    startOptions: DEFAULT_QUERY_ALL_ENDS,
    endOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== startName),
  });
}
