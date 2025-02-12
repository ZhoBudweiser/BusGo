import { flip } from "/util/client";

export const methods = {
  onActiveTime,
  onSelectEnd,
  onRollback,
  onTapFlag,
  onTapHuman,
};

/**
 * @event 切换概览视图中显示的标签，展示班车路径、车牌号或者剩余时间
 * @param {object} e 带有当前点击元素的数据对象
 */
function onActiveTime(e) {
  const i = e.currentTarget.dataset.i;
  if (this.data.activeTimeIndex === i) {
    if (this.data.showTime) {
      if (this.data.showRoute) {
        // 清空地图上的路径
        this.props.onMainData("selectedLineId", "");
      } else {
        // 在地图上显示班车路径
        this.props.onMainData("selectedLineId", this.props.carLines[i].bid);
      }
      flip(this, "showRoute");
    }
    // 切换显示剩余的时间
    flip(this, "showTime");
  } else {
    this.setData({
      activeTimeIndex: i,
    });
  }
}

/**
 * @event 选择目的地
 * @param {object} e 带有当前选择的目的地的对象
 */
function onSelectEnd(e) {
  const selectedEnd = this.data.destinations[e.detail.value];
  this.setData({ selectedEnd });
}

/**
 * @event 回滚选择的目的地
 */
function onRollback() {
  this.props.onRollback();
  const selectedEnd = "";
  this.setData({ selectedEnd });
}

/**
 * @event 点击旗子，（取消）展示导航路径
 */
function onTapFlag() {
  this.props.onFlip("showNavigationPath");
}

/**
 * @event 点击人物，地图移动到用户的位置
 */
function onTapHuman() {
  this.props.onFlip("moveToUserPosition");
}
