import { busEndAddresses, shuttleEndAddresses } from "/util/data";
import { toCampus } from "/util/fmtUnit";
import { getAvailableBusLineByStart } from "/util/queryhelper";
import { flip } from "/util/setters";
import { findShttleLines } from "/util/shuttlehelper";

const calTimeToPercentage = (t) => {
  const tt = Number(t);
  if (tt > 15) {
    return "5%";
  } else {
    const percentage = (35 - (tt / 35) * 100).toFixed(1) + "%";
    return percentage;
  }
};

Component({
  options: {
    observers: true,
  },
  data: {
    containerHeight: 300,
    vehicles: [0, 0],
    dist_car: "10%",
    dist_human: "5%",
    activeTimeIndex: 0,
    showTime: true,
    showRoute: false,
    selectedEnd: "",
    preSelectedCampus: "",
    activeCards: Array.from({ length: 100 }),
    destinations: [],
  },
  props: {
    activeTab: 1,
    nearest_stop_id: "1007",
    nearest_stop_name: "风雨操场",
    time_left_human_walk: -1,
    busLines: [],
    shuttleLines: [],
    onClearTimer: () => {},
    onActive: () => {},
    onSetBusLines: () => {},
    onSetSelectedBusLine: () => {},
    onFlip: () => {},
    onRollback: () => {},
  },
  observers: {
    busLines: function (lines) {
      console.log(lines);
      if (lines.length !== this.data.activeCards.length) {
        this.setData({
          activeCards: lines.map(
            (item, i) =>
              i === 0 ||
              (item.runBusInfo !== null &&
                item.runBusInfo[0].vehi_num.indexOf("无信号") === -1),
          ),
        });
      }
      my.hideLoading();
    },
    time_left_human_walk: function () {
      if (this.props.time_left_human_walk < 0) return;
      this.setData({
        dist_human: calTimeToPercentage(this.props.time_left_human_walk),
      });
    },
    nearest_stop_name: function (curval) {
      const curSelectedCampus = toCampus(curval);
      if (this.data.preSelectedCampus === curSelectedCampus) return;
      if (curval === "") {
        this.setData({
          selectedEnd: "",
        });
        return;
      }
      const end = this.data.selectedEnd;
      if (curSelectedCampus == toCampus(end)) {
        my.showToast({
          content: "目的地在站点附近",
          duration: 2000,
        });
      }
      this.setData({
        destinations:
          this.props.activeTab == 0
            ? busEndAddresses.filter(
                (item) => toCampus(item) !== curSelectedCampus,
              )
            : shuttleEndAddresses.filter((item) => item !== curval),
        preSelectedCampus:
          curSelectedCampus == toCampus(end)
            ? this.data.preSelectedCampus
            : curSelectedCampus,
        // selectedEnd: curSelectedCampus == toCampus(end) ? end + '(附近)' : end,
      });
      this.props.onSetSelectedBusLine("");
    },
    selectedEnd: function (end) {
      if (!end) return;
      this.props.onClearTimer();
      my.showLoading({
        content:
          this.props.activeTab === 0
            ? "此次查询预计需要 10 秒左右"
            : "查询中...",
      });
      this.props.activeTab === 0
        ? getAvailableBusLineByStart(this)
        : findShttleLines(this);
      this.props.onSetSelectedBusLine("");
    },
  },
  didMount() {
    my.createSelectorQuery()
      .selectViewport()
      .boundingClientRect()
      .exec((ret) => {
        const height = ret[0].height;
        this.setData({
          containerHeight: height - 110, // TODO: adapt to above height
        });
      });
  },
  methods: {
    onChange(e) {
      const { current } = e.detail;
      this.props.onActive(current);
    },
    onActiveTime(e) {
      const i = e.currentTarget.dataset.i;
      if (this.data.activeTimeIndex === i) {
        if (this.data.showTime) {
          if (this.data.showRoute) {
            this.props.onSetSelectedBusLine("");
          } else {
            this.props.onSetSelectedBusLine(this.props.busLines[i].bid);
          }
          flip(this, "showRoute");
        }
        flip(this, "showTime");
      } else {
        this.setData({
          activeTimeIndex: i,
        });
      }
    },
    onSelectEnd(e) {
      this.setData({
        selectedEnd: this.data.destinations[e.detail.value],
      });
    },
    onRollback() {
      my.showLoading({
        content: "查询中...",
      });
      this.props.onRollback();
      this.setData({
        selectedEnd: "",
      });
    },
    onTapFlag() {
      this.props.onFlip("showPath");
    },
    onTapHuman() {
      this.props.onFlip("showPosition");
    },
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
