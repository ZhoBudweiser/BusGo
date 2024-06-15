import debounce from "/util/debounce";

const order = ["blue", "red", "green", "yellow"];

Component({
  data: {
    toView: "red",
    scrollTop: 100,
    containerHeight: 300,
  },
  didMount() {
    this.scroll = debounce(this.scroll.bind(this), 100);
    my.createSelectorQuery()
      .selectViewport()
      .boundingClientRect()
      .exec((ret) => {
        const height = ret[0].height;
        console.log(height);
        this.setData({
          containerHeight: height, // TODO: adapt to above height
        });
      });
  },
  upper(e) {
    console.log(e);
  },
  lower(e) {
    console.log(e);
  },
  scroll(e) {
    this.setData({
      scrollTop: e.detail.scrollTop,
    });
  },
  scrollEnd() {},
  scrollToTop(e) {
    console.log(e);
    this.setData({
      scrollTop: 0,
    });
  },
  tap(e) {
    for (let i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        const next = (i + 1) % order.length;
        this.setData({
          toView: order[next],
          scrollTop: next * 200,
        });
        break;
      }
    }
  },
  tapMove() {
    this.setData({
      scrollTop: this.data.scrollTop + 10,
    });
  },
});
