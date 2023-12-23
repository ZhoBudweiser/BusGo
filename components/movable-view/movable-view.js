Component({
  data: {
    currentState: 0,
    currentY: 0,
    stateHeights: [],
    stateBoders: []
  },
  props: {
    onStateChange: () => {}
  },
  didMount() {
    let contentHeight;
    my.createSelectorQuery()
      .select('#content').boundingClientRect().exec((ret) => {
        contentHeight = ret[0].height;
        // console.log(contentHeight);
        this.setData({
          contentHeight
        });
      })
    my.createSelectorQuery()
      .selectViewport().boundingClientRect().exec((ret) => {
        const height = ret[0].height;
        this.setData({
          height,
          currentY: height - contentHeight,
          // currentY: 0,
          stateHeights: [0, height - contentHeight, height],
          stateBoders: [(height - contentHeight) / 2, (height + (height - contentHeight) / 2) / 2],
        });
      });
  },
  methods: {
    onMove(e) {
      const {
        y
      } = e.detail;
      const newState = this.changeState(y);
      // console.log(this.data.currentY);
      this.props.onStateChange(newState);
      this.setData({
        currentY: this.data.stateHeights[newState] + Math.random(),
        currentState: newState,
      });
    },
    changeState(targetY) {
      // console.log(this.data.stateBoders);
      for (let i = this.data.stateBoders.length - 1; i >= 0; --i) {
        if (targetY > this.data.stateBoders[i]) {
          return i + 1;
        }
      }
      return 0;
    }
  }
});