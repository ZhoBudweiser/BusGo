import { busEndAddresses, shuttleEndAddresses } from "/util/data";
import { toCampus } from "/util/fmtUnit";
import { getAvailableBusLineByStart } from "/util/queryhelper";
import { findShttleLines } from "/util/shuttlehelper";

const calTimeToPercentage = (t) => {
  const tt = Number(t);
  if (tt > 15) {
    return '5%';
  } else {
    const percentage = (35 - tt / 35 * 100).toFixed(1) + '%';
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
    dist_car: '10%',
    dist_human: '5%',
    coming_lines: [],
    activeTimeIndex: 0,
    showTime: true,
    showRoute: false,
    selectedEnd: '',
    preSelectedCampus: '',
    activeCards: [],
    destinations: [],
  },
  props: {
    activeTab: 1,
    nearest_stop_id: "1007",
    nearest_stop_name: "风雨操场",
    time_left_human_walk: -1,
    busLines: [],
    shuttleLines: [],
    onActive: () => {},
    onSetBusLines: () => {},
    onSetSelectedBusLine: () => {},
    onSetShowPath: () => {},
    onRollback: () => {},
  },
  observers: {
    'busLines': function (lines) {
      console.log(lines);
      if (lines.length !== this.data.activeCards.length) {
        this.setData({
          activeCards: lines.map((item, i) => i === 0 || item.runBusInfo !== null),
        });
      }
    },
    'time_left_human_walk': function () {
      if (this.props.time_left_human_walk < 0) return;
      this.setData({
        dist_human: calTimeToPercentage(this.props.time_left_human_walk)
      });
    },
    'nearest_stop_name': function (curval){
      if (!curval || this.data.preSelectedCampus === toCampus(curval)) return;
      const curSelectedCampus = toCampus(curval);
      this.setData({
        destinations: this.props.activeTab == 0 ? 
            busEndAddresses.filter(item => toCampus(item) !== curSelectedCampus) : shuttleEndAddresses.filter(item => item !== curval),
        preSelectedCampus: curSelectedCampus,
        selectedEnd: '',
      });
      this.props.onSetSelectedBusLine("");
    },
    'selectedEnd': function (end) {
      if (!end) return;
      this.props.activeTab === 0 ? getAvailableBusLineByStart(this) : findShttleLines(this);
      this.props.onSetSelectedBusLine("");
    }
  },
  didMount() {
    my.createSelectorQuery()
      .selectViewport().boundingClientRect().exec((ret) => {
        const height = ret[0].height;
        this.setData({
          containerHeight: height - 110 // TODO: adapt to above height
        });
      });
  },
  methods: {
    onChange(e) {
      const {
        current
      } = e.detail;
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
          this.setData({ showRoute: !this.data.showRoute });
        }
        this.setData({
          showTime: !this.data.showTime
        });
      } else {
        this.setData({
          activeTimeIndex: i
        });
      }
    },
    onSelectEnd(e) {
      this.setData({
        selectedEnd: this.data.destinations[e.detail.value]
      });
    },
    onRollback() {
      this.props.onRollback();
      this.setData({
        selectedEnd: ""
      });
    },
    onTapFlag() {
      this.props.onSetShowPath();
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