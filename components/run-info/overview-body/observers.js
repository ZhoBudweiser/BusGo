import { setActiveCards } from "/util/setters";

const observers = {
  carLines
};

export default observers;

/**
 * 根据班车线路数组设置激活的班车卡片
 * @param {object[]} lines 班车线路数组
 */
function carLines(lines) {
  if (lines.length === this.data.activeCards.length) return;
  const activeCards = setActiveCards(lines);
  this.setData({ activeCards });
}
