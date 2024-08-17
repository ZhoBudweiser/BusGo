import { DEFAULT_QUERY_ALL_ENDS } from "/options/props/defaults";

const observers = {
  historyAddress
};

export default observers;

function historyAddress(history) {
  if (!history.startAddress || !history.endAddress) return;
  const { startAddress: startName, endAddress: endName } = history;
  this.setData({
    startName,
    endName,
    startOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== endName),
    endOptions: DEFAULT_QUERY_ALL_ENDS.filter((item) => item !== startName),
  });
}