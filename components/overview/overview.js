import { endAddresses } from "/util/data";
import { toCampus } from "/util/fmtUnit";
import { getAvailableBusLineByStart } from "/util/queryhelper";

const calTimeToPercentage = (t) => {
  const tt = Number(t);
  console.log(tt);
  if (tt > 15) {
    return '5%';
  } else {
    const percentage = (40 - tt / 40 * 100).toFixed(1) + '%';
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
    // 概览数据
    dist_car: '10%',
    dist_flag: '50%',
    dist_human: '5%',
    human_dir_right: false,
    time_left_car: 3,
    time_left_human_run: 2,
    human_run: false,
    coming_lines: [],
    endAddresses: [],
    filterAddress: '',
    activeTimeIndex: 0,
    showTime: true,
    selectedEnd: '',
    preSelectedCampus: '',
    destinations: [],
  },
  props: {
    activeTab: 1,
    state: 1,
    onActive: () => {},
    busLines: [],
    nearest_stop_id: "1007",
    nearest_stop_name: "风雨操场",
    time_left_human_walk: -1,
    onSetBusLines: () => {},
  },
  observers: {
    'busLines': function () {
      this.setData({
        // coming_lines: this.props.busLines.filter(item => item.runBusInfo),
        coming_lines: this.props.busLines,
        endAddresses: Array.from(new Set(this.props.busLines.map(item => item.end_address)))
      })
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
        destinations: endAddresses.filter(item => toCampus(item) !== curSelectedCampus),
        preSelectedCampus: curSelectedCampus,
        selectedEnd: '',
      });
    },
    'selectedEnd': function (end) {
      if (!end) return;
      getAvailableBusLineByStart(this);
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
  },
});