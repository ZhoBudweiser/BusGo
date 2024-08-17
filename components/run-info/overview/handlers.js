export const methods = {
  onChange,
  onMainData,
  onFlip,
  onRollback
};

export const lifeHanders = {};

function onChange(e) {
  const { current } = e.detail;
  this.props.onMainData("activeIndex", current);
}

function onMainData(key, data) {
  this.props.onMainData(key, data);
}

function onFlip(field) {
  this.props.onFlip(field);
}

function onRollback() {
  this.props.onRollback();
}