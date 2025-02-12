export const methods = {
  onToggleCard,
};

/**
 * @event 切换班车卡片的展开状态
 * @param {object} e 带有当前点击元素的信息的事件对象
 */
function onToggleCard(e) {
  const i = e.currentTarget.dataset.i;
  const activeCards = this.data.activeCards.concat();
  activeCards[i] = !activeCards[i];
  this.setData({ activeCards });
}
