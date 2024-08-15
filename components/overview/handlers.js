export const methods = {
  onChange,
};

export const lifeHanders = {};

function onChange(e) {
  const { current } = e.detail;
  this.props.onMainData("activeIndex", current);
}
