import { NOP } from "/options/props/defaults";
import { store } from "/util/cache";
import { loadAndSet } from "/util/client";

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
      if (!history || !history.startAddress || !history.endAddress) return;
      this.onAppendHistoryItem(history);
    },
  },
  props: {
    appendedItem: {},
    onSetHistoryAddress: NOP,
  },
  didMount() {
    loadAndSet(this, "queryHistory");
  },
  didUnmount() {
    store("queryHistory", this.data.queryHistory);
  },
  methods: {
    onChoose(e) {
      const i = e.currentTarget.dataset.i;
      this.props.onSetHistoryAddress(this.data.queryHistory[i]);
    },
    onDelete(e) {
      const i = e.currentTarget.dataset.i;
      const queryHistory = this.data.queryHistory.filter((_, j) => j !== i);
      this.setData({ queryHistory });
    },
    onClear() {
      const queryHistory = [];
      this.setData({ queryHistory });
    },
    onAppendHistoryItem(item) {
      const queryHistory = this.data.queryHistory.filter(
        (line) =>
          !(
            line.startAddress === item.startAddress &&
            line.endAddress === item.endAddress
          ),
      );
      queryHistory.unshift(item);
      this.setData({ queryHistory });
    },
  },
});
