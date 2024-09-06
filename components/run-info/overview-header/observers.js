import { queryBackend } from "/options/apis/carApis";
import { extractAddressName } from "/util/formatter";
import { popStationNearBy } from "/util/notification";
import { setCarLines, setHumanDistance } from "/util/setters";

const observers = {
  activeIndex,
  userTimeCost,
  "selectedStation.name": selectedStationName,
  selectedEnd,
};

export default observers;

async function activeIndex(index) {
  const selectedEnd = "";
  const destinations = await queryBackend("allEnds", index, [selectedEnd]);
  this.setData({ selectedEnd, destinations });
}

function userTimeCost(cost) {
  if (cost < 0) return;
  const humanDistance = setHumanDistance(cost);
  this.setData({ humanDistance });
}

async function selectedStationName(rawName) {
  if (!rawName) return;
  const name = extractAddressName(rawName);
  const { selectedEnd } = this.data;
  const { activeIndex } = this.props;
  if (selectedEnd.indexOf(name) !== -1) popStationNearBy();
  this.props.onMainData("selectedLineId", "");
  this.setData({
    destinations: (await queryBackend("allEnds", activeIndex, [""])).filter((end) => end.indexOf(name) === -1),
  });
}

async function selectedEnd(endName) {
  if (!endName) return;
  const { onMainData, activeIndex } = this.props;
  const startName = this.props.selectedStation.name;
  onMainData("selectedLineId", "");
  onMainData("queriedLineIds", await setCarLines(activeIndex, startName, endName));
  this.setData({
    destinations: (await queryBackend("allEnds", activeIndex, [endName])),
  });
}
