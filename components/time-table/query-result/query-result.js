import { setCardHeights } from "/util/setters";

Component({
  data: {
    activeCards: [],
    cardHeights: [],
  },
  props: {
    lines: [],
  },
  options: {
    observers: true,
  },
  observers: {
    /**
     * 设置班车路线卡片高度
     * @param {object[]} lines 班车路线数组
     */
    lines: function (lines) {
      console.log("查询到班车", lines);
      this.setData({
        activeCards: lines.map((_) => 0),
        cardHeights: setCardHeights(lines),
      });
    },
  },
  methods: {
    /**
     * @event 切换卡片展开状态
     * @param {object} e 带有点击的卡片索引的对象
     */
    onToggleCard(e) {
      const i = e.currentTarget.dataset.i;
      const activeCards = this.data.activeCards.concat();
      activeCards[i] = 1 - activeCards[i];
      this.setData({ activeCards });
    },
  },
});
