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
    /**
     * 添加历史记录
     * @param {object} history 新增的历史记录
     */
    appendedItem: function (history) {
      if (!history || !history.startAddress || !history.endAddress) return;
      this.onAppendHistoryItem(history);
    },
  },
  props: {
    appendedItem: {},
    onSetHistoryAddress: NOP,
  },
  /**
   * 加载历史记录
   */
  didMount() {
    loadAndSet(this, "queryHistory");
  },
  /**
   * 卸载组件时保存历史记录
   */
  didUnmount() {
    store("queryHistory", this.data.queryHistory);
  },
  methods: {
    /**
     * @event 选择历史记录初始化搜索框
     * @param {object} e 包含选择的历史记录的对象
     */
    onChoose(e) {
      const i = e.currentTarget.dataset.i;
      this.props.onSetHistoryAddress(this.data.queryHistory[i]);
    },
    /**
     * @event 删除历史记录
     * @param {object} e 包含选择的历史记录的对象
     */
    onDelete(e) {
      const i = e.currentTarget.dataset.i;
      const queryHistory = this.data.queryHistory.filter((_, j) => j !== i);
      this.setData({ queryHistory });
    },
    /**
     * @event 清空历史记录
     */
    onClear() {
      const queryHistory = [];
      this.setData({ queryHistory });
    },
    /**
     * @event 添加历史记录
     * @param {object} item 新的历史记录
     */
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
