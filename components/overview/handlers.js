export const methods = {
  onChange,
  onActiveTime,
  onSelectEnd,
  onRollback,
  onTapFlag,
  onTapHuman,
  onToggleCard
};

export const lifeHanders = {
  didMount,
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
  this.setData({
    selectedEnd: this.data.destinations[e.detail.value],
  });
}

function onRollback() {
  this.props.onRollback();
  this.setData({
    selectedEnd: "",
  });
}

function onTapFlag() {
  this.props.onFlip("showNavigationPath");
}

function onTapHuman() {
  this.props.onFlip("moveToUserPosition");
}

function onToggleCard(e) {
  const i = e.currentTarget.dataset.i;
  const cards = this.data.activeCards.concat();
  cards[i] = !cards[i];
  this.setData({
    activeCards: cards,
  });
}

function didMount() {
  my.createSelectorQuery()
    .selectViewport()
    .boundingClientRect()
    .exec((ret) => {
      const height = ret[0].height;
      this.setData({
        containerHeight: height - 110, // TODO: adapt to above height
      });
    });
}