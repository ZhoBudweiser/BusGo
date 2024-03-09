Component({
  mixins: [],
  data: {
    activeCards: [],
  },
  props: {
    lines: [],
  },
  options: {
    observers: true,
  },
  observers: {
    'lines': function (lines) {
      this.setData({
        activeCards: Array.from({
          length: lines.length
        }),
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
      cards[i] = !cards[i];
      this.setData({
        activeCards: cards,
      });
    },
  },
});