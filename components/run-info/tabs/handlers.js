const eventHandlers = {
  onTabBarTap
};

const methods = {
  ...eventHandlers,
};

export default methods;

/**
 * @event 点击切换班车类型
 * @param {object} e 带有班车类型的对象
 */
function onTabBarTap(e) {
  const { index } = e.target.dataset;
  this.props.onMainData("activeIndex", index);
}
