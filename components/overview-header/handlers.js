export const methods = {
  onChange,
  onActiveTime,
  onSelectEnd,
  onRollback,
  onTapFlag,
  onTapHuman,
  onToggleCard,
};

function onChange(e) {
  const { current } = e.detail;
  this.props.onMainData("activeIndex", current);
}

function onActiveTime(e) {
  const i = e.currentTarget.dataset.i;
  if (this.data.activeTimeIndex === i) {
    if (this.data.showTime) {
      if (this.data.showRoute) {
        this.props.onMainData("selectedLineId", "");
      } else {
        this.props.onMainData("selectedLineId", this.props.carLines[i].bid);
      }
      flip(this, "showRoute");
    }
    flip(this, "showTime");
  } else {
    this.setData({
      activeTimeIndex: i,
    });
  }
}

function onSelectEnd(e) {
  const selectedEnd = this.data.destinations[e.detail.value];
  this.setData({ selectedEnd });
}

function onRollback() {
  this.props.onRollback();
  const selectedEnd = "";
  this.setData({ selectedEnd });
}

function onTapFlag() {
  this.props.onFlip("showNavigationPath");
}

function onTapHuman() {
  this.props.onFlip("moveToUserPosition");
}

function onToggleCard(e) {
  const i = e.currentTarget.dataset.i;
  const activeCards = this.data.activeCards.concat();
  activeCards[i] = !activeCards[i];
  this.setData({ activeCards });
}
