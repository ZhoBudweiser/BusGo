import { setState } from "/util/setters";

Component({
  data: {
    currentY: 0,
    state: 0,
    stateHeights: [],
    stateBoders: [],
  },
  didMount() {
    let contentHeight;
    my.createSelectorQuery()
      .select("#body")
      .boundingClientRect()
      .exec((ret) => {
        contentHeight = ret[0].height;
        console.log("班车列表高度：", contentHeight);
        this.setData({
          contentHeight,
        });
      });
    my.createSelectorQuery()
      .selectViewport()
      .boundingClientRect()
      .exec((ret) => {
        const height = ret[0].height;
        console.log("当前手机高度：", height);
        this.setData({
          state: 1,
          currentY: contentHeight,
          stateHeights: [0, contentHeight, height],
          stateBoders: [
            (contentHeight) / 2,
            (height + contentHeight / 2) / 2,
          ],
        });
      });
  },
  methods: {
    onMove(e) {
      const { y } = e.detail;
      const { stateBoders, stateHeights } = this.data;
      const state = setState(y, stateBoders);
      this.setData({
        state,
        currentY: stateHeights[state] + Math.random(),
      });
    }
  },
});
