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
    lines: function (lines) {
      console.log("查询到班车", lines);
      this.setData({
        activeCards: lines.map((_) => 0),
        cardHeights: setCardHeights(lines),
      });
    },
  },
  methods: {
    onToggleCard(e) {
      const i = e.currentTarget.dataset.i;
      const activeCards = this.data.activeCards.concat();
      activeCards[i] = 1 - activeCards[i];
      this.setData({ activeCards });
    },
  },
});
