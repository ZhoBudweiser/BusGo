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

function activeIndex() {
  const selectedEnd = "";
  this.setData({ selectedEnd });
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
  if (name == selectedEnd) popStationNearBy();
  this.setData({
    destinations: (await queryBackend("allEnds", activeIndex, [])).filter((end) => end.indexOf(name) === -1),
  });
  this.props.onMainData("selectedLineId", "");
}

async function selectedEnd(end) {
  if (!end) return;
  const { onMainData, activeIndex } = this.props;
  const startName = this.props.selectedStation.name;
  const endName = this.data.selectedEnd;
  onMainData("selectedLineId", "");
  onMainData("queriedLineIds", await setCarLines(activeIndex, startName, endName));
}
