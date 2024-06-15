import { getCardHeights } from "/util/fmtUnit";

Component({
  mixins: [],
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
      console.log(lines);
      this.setData({
        activeCards: lines.map((_) => 0),
        cardHeights: getCardHeights(lines),
      });
    },
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onToggleCard(e) {
      const i = e.currentTarget.dataset.i;
      const cards = this.data.activeCards.concat();
      cards[i] = cards[i] == 0 ? 1 : 0;
      this.setData({
        activeCards: cards,
      });
    },
  },
});
