import { queryBackend } from "/options/apis/carApis";
import { extractAddressName } from "/util/formatter";
import { popStationNearBy, popNoCar, popQuerySuccess } from "/util/notification";
import { setCarLines, setHumanDistance } from "/util/setters";

const observers = {
  activeIndex,
  userTimeCost,
  "selectedStation.name": selectedStationName,
  selectedEnd,
};

export default observers;

/**
 * 班车切换时，获取班车目的地
 * @param {number} index 选择的班车类型
 */
async function activeIndex(index) {
  const selectedEnd = "";
  const destinations = await queryBackend("allEnds", index, [selectedEnd]);
  this.setData({ selectedEnd, destinations });
}

/**
 * 更新用户在概览卡片中的位置
 * @param {number} cost 时间花费
 * @returns 
 */
function userTimeCost(cost) {
  if (cost < 0) return;
  const humanDistance = setHumanDistance(cost);
  this.setData({ humanDistance });
}

/**
 * 将所选站点作为起点，更新目的地
 * @param {string} rawName 带全称的站点名
 */
async function selectedStationName(rawName) {
  if (!rawName) return;
  // 校区名
  const name = extractAddressName(rawName);
  const { selectedEnd } = this.data;
  const { activeIndex } = this.props;
  // 目的地在所选站点附近
  if (selectedEnd.indexOf(name) !== -1) popStationNearBy();
  this.props.onMainData("selectedLineId", "");
  this.setData({
    // 在目的地中去除所选站点
    destinations: (await queryBackend("allEnds", activeIndex, [""])).filter((end) => end.indexOf(name) === -1),
  });
}

/**
 * 根据所选目的地，获取班车路径
 * @param {string} endName 目的地名
 */
async function selectedEnd(endName) {
  if (!endName) return;
  const { onMainData, activeIndex } = this.props;
  const startName = this.props.selectedStation.name;
  onMainData("selectedLineId", "");
  // 设置班车路径
  const lineIds = await setCarLines(activeIndex, startName, endName);
  if (!lineIds || lineIds.length === 0) popNoCar();
  else popQuerySuccess();
  onMainData("queriedLineIds", lineIds);
  this.setData({
    // 更新目的地
    destinations: (await queryBackend("allEnds", activeIndex, [endName])),
  });
}
