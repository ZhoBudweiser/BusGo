export const methods = {
  onChange
};

export const lifeHanders = {
  didMount,
};

function onChange(e) {
  const { current } = e.detail;
  this.props.onMainData("activeIndex", current);
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
