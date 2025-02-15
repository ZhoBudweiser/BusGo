import {
  setState
} from "/util/setters";

Component({
  data: {
    currentY: 0,
    state: 0,
    stateHeights: [],
    stateBoders: [],
  },
  /**
   * 获取组件高度
   */
  didMount() {
    my.createSelectorQuery()
      .select("#overview-header")
      .boundingClientRect()
      .exec((ret) => {
        const contentHeight = ret[0].height;
        console.log("班车列表高度：", contentHeight);
        my.createSelectorQuery()
          .select("#moveable")
          .boundingClientRect()
          .exec((ret) => {
            const moveableHeight = ret[0].height;
            console.log("Tabs高度：", moveableHeight);
            my.createSelectorQuery()
              .selectViewport()
              .boundingClientRect()
              .exec((ret) => {
                const height = ret[0].height;
                console.log("当前手机高度：", height);
                const overviewPosition = height - contentHeight - moveableHeight;
                console.log("概览窗口位置：", overviewPosition);
                this.setData({
                  state: 1,
                  contentHeight,
                  currentY: overviewPosition,
                  stateHeights: [0, overviewPosition, height],
                  stateBoders: [
                    (overviewPosition) / 2,
                    (height + overviewPosition / 2) / 2,
                  ],
                });
              });
          });
      });
  },
  methods: {
    /**
     * @event 拖动框拖动事件
     * @param {object} e 带y属性的事件对象
     */
    onMove(e) {
      const {
        y
      } = e.detail;
      const {
        stateBoders,
        stateHeights
      } = this.data;
      // 更新状态
      const state = setState(y, stateBoders);
      this.setData({
        state,
        // 添加扰动，强制更新高度
        currentY: stateHeights[state] + Math.random(),
      });
    }
  },
});