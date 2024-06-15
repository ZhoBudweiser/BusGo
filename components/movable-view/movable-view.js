Component({
  data: {
    currentY: 0,
    stateHeights: [],
    stateBoders: [],
  },
  props: {},
  didMount() {
    let contentHeight;
    my.createSelectorQuery()
      .select("#content")
      .boundingClientRect()
      .exec((ret) => {
        contentHeight = ret[0].height;
        this.setData({
          contentHeight,
        });
      });
    my.createSelectorQuery()
      .selectViewport()
      .boundingClientRect()
      .exec((ret) => {
        const height = ret[0].height;
        this.setData({
          // currentY: 0,
          currentY: height - contentHeight,
          stateHeights: [0, height - contentHeight, height],
          stateBoders: [
            (height - contentHeight) / 2,
            (height + (height - contentHeight) / 2) / 2,
          ],
        });
      });
  },
  methods: {
    onMove(e) {
      const { y } = e.detail;
      const newState = this.changeState(y);
      this.setData({
        currentY: this.data.stateHeights[newState] + Math.random(),
      });
    },
    changeState(targetY) {
      for (let i = this.data.stateBoders.length - 1; i >= 0; --i) {
        if (targetY > this.data.stateBoders[i]) {
          return i + 1;
        }
      }
      return 0;
    },
  },
});
