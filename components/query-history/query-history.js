Component({
  options: {
    observers: true,
    virtualHost: false,
  },
  data: {
    queryHistory: [],
  },
  observers: {
    appendedItem: function (history) {
      if (!history.startAddress || !history.endAddress) return;
      this.onAppendHistoryItem(history);
    },
  },
  props: {
    appendedItem: {},
    onSetHistoryAddress: () => {},
  },
  didMount() {
    const res = my.getStorageSync({
      key: "queryHistory",
    });
    if (res.success) {
      this.setData({
        queryHistory: res.data,
      });
    }
  },
  didUpdate() {},
  didUnmount() {
    my.setStorageSync({
      key: "queryHistory",
      data: this.data.queryHistory,
    });
  },
  methods: {
    onChoose(e) {
      const i = e.currentTarget.dataset.i;
      this.props.onSetHistoryAddress(this.data.queryHistory[i]);
    },
    onDelete(e) {
      const i = e.currentTarget.dataset.i;
      this.setData({
        queryHistory: this.data.queryHistory.filter((_, j) => j !== i),
      });
      console.log(i);
    },
    onClear() {
      this.setData({
        queryHistory: [],
      });
    },
    onAppendHistoryItem(item) {
      const history = this.data.queryHistory.filter(
        (line) =>
          !(
            line.startAddress === item.startAddress &&
            line.endAddress === item.endAddress
          ),
      );
      history.unshift(item);
      this.setData({
        queryHistory: history,
      });
    },
  },
});
