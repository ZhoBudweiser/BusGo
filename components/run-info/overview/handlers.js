export const methods = {
  onChange,
  onMainData,
  onFlip,
  onRollback
};

export const lifeHanders = {};

/**
 * @event 切换班车类型
 * @param {object} e 带班车索引的对象
 */
function onChange(e) {
  const { current } = e.detail;
  this.props.onMainData("activeIndex", current);
}

/**
 * @event 更新父组件的数据
 * @param {string} key 对象的键
 * @param {object} data 对象的值
 */
function onMainData(key, data) {
  this.props.onMainData(key, data);
}

/**
 * @event 切换数据的状态
 * @param {string} field 对象的键
 */
function onFlip(field) {
  this.props.onFlip(field);
}

/**
 * @event 回滚查询条件
 */
function onRollback() {
  this.props.onRollback();
}