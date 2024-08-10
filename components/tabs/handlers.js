const eventHandlers = {
  onTabBarTap
};

const methods = {
  ...eventHandlers,
};

export default methods;

function onTabBarTap(e) {
  const { index } = e.target.dataset;
  this.props.onMainData("activeIndex", index);
}
