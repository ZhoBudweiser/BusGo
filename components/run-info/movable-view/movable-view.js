import { setState } from "/util/setters";

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
    /**
     * @event 拖动框拖动事件
     * @param {object} e 带y属性的事件对象
     */
    onMove(e) {
      const { y } = e.detail;
      const { stateBoders, stateHeights } = this.data;
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
