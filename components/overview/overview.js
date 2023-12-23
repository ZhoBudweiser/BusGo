const data_stations = [{
    "station_sort_no": 1,
    "station_alias_no": "1001",
    "station_alias": "紫金港校区云峰西侧",
    "station_long": 120.080932,
    "station_lat": 30.307364
  },
  {
    "station_sort_no": 2,
    "station_alias_no": "1002",
    "station_alias": "紫金港校区西教学区",
    "station_long": 120.084106,
    "station_lat": 30.300878
  },
  {
    "station_sort_no": 3,
    "station_alias_no": "1003",
    "station_alias": "紫金港校区化学楼",
    "station_long": 120.084101,
    "station_lat": 30.298303
  },
  {
    "station_sort_no": 4,
    "station_alias_no": "1004",
    "station_alias": "紫金港校区医药组团",
    "station_long": 120.085138,
    "station_lat": 30.296934
  },
  {
    "station_sort_no": 5,
    "station_alias_no": "1005",
    "station_alias": "紫金港校区农生环组团",
    "station_long": 120.08968,
    "station_lat": 30.296954
  },
  {
    "station_sort_no": 6,
    "station_alias_no": "1006",
    "station_alias": "紫金港校区东教学区",
    "station_long": 120.090441,
    "station_lat": 30.301629
  },
  {
    "station_sort_no": 7,
    "station_alias_no": "1007",
    "station_alias": "紫金港校区风雨操场",
    "station_long": 120.089761,
    "station_lat": 30.304479
  },
  {
    "station_sort_no": 8,
    "station_alias_no": "2002",
    "station_alias": "玉泉校区教二南侧",
    "station_long": 120.12357,
    "station_lat": 30.261126
  },
  {
    "station_sort_no": 9,
    "station_alias_no": "3001",
    "station_alias": "西溪校区",
    "station_long": 120.140653,
    "station_lat": 30.276491
  },
  {
    "station_sort_no": 10,
    "station_alias_no": "6001",
    "station_alias": "湖滨",
    "station_long": 120.161107,
    "station_lat": 30.258986
  },
  {
    "station_sort_no": 11,
    "station_alias_no": "4102",
    "station_alias": "华家池校区新大门",
    "station_long": 120.192041,
    "station_lat": 30.270708
  },
  {
    "station_sort_no": 12,
    "station_alias_no": "4001",
    "station_alias": "华家池校区体育馆",
    "station_long": 120.196614,
    "station_lat": 30.267391
  }
];

const data_normal = {
  "bid": "B080",
  "bc_name": "教师8号班车17:10发车由 紫金港校区站 开往 华家池校区站",
  "forstudent": 1,
  "start_time": "17:10:00",
  "arrive_time": "18:20:00",
  "start_address": "紫金港校区",
  "end_address": "华家池校区",
  "is_favorite": "false",
  "is_now": "true",
  "is_end": "0",
  "memo": "",
  "runBusInfo": [{
    "vehi_num": "浙A9R971",
    "near_distance": "2",
    "about_minute": "15",
    "about_rice": "4143",
    "next_station": "2002",
    "late_state": "1",
    "car_broken": null,
    "px": 120.119283,
    "py": 30.283445,
    "online_state": "1",
    "speed": 36,
    "speed_time": "2023-12-16T09:31:38.000+00:00"
  }],
  "line_alias": "教师8号班车"
};

const data_delay = {
  "bid": "B080",
  "bc_name": "教师8号班车17:10发车由 紫金港校区站 开往 华家池校区站",
  "forstudent": 1,
  "start_time": "17:10:00",
  "arrive_time": "18:20:00",
  "start_address": "紫金港校区",
  "end_address": "华家池校区",
  "is_favorite": "false",
  "is_now": "true",
  "is_end": "0",
  "memo": "",
  "runBusInfo": [{
    "vehi_num": "浙A9R971",
    "near_distance": "0",
    "about_minute": null,
    "about_rice": "100000",
    "next_station": "2002",
    "late_state": "1",
    "car_broken": null,
    "px": 120.119698,
    "py": 30.278214,
    "online_state": "1",
    "speed": 43,
    "speed_time": "2023-12-16T09:34:28.000+00:00"
  }],
  "line_alias": "教师8号班车"
};

Component({
  mixins: [],
  options: {
    observers: true,
  },
  data: {
    containerHeight: 300,
    vehicles: [0, 0],
    // 概览数据
    dist_car: '10%',
    dist_flag: '50%',
    dist_human: '80%',
    human_dir_right: false,
    time_left_car: 3,
    time_left_human_walk: 4,
    time_left_human_run: 2,
    human_run: true,
    coming_lines: [],
    activeTimeIndex: 0,
  },
  props: {
    activeTab: 1,
    state: 1,
    onActive: () => {},
    busLines: [],
    nearest_stop_id: "1007",
    nearest_stop_name: '风雨操场',
  },
  observers: {
    'busLines': function() {
      console.log(this.props.busLines);
      this.setData({
        coming_lines: this.props.busLines.filter(item => item.runBusInfo),
      })
    },
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
  deriveDataFromProps(nextProps) {
    if (nextProps.busLines !== this.props.busLines) {
      this.setData({
        coming_lines: this.props.busLines.filter(item => item.runBusInfo),
      })
    }
  },
  methods: {
    onChange(e) {
      const {
        current
      } = e.detail;
      this.props.onActive(current);
    },
    onTap(e) {
      console.log(this.data.coming_lines)
    },
    onSwitchDirection(e) {
      console.log("switch tapped");
    },
    onChangeHumanRun(e) {
      this.setData({
        human_run: !this.data.human_run
      });
    },
    onActiveTime(e) {
      const i = e.currentTarget.dataset.i;
      console.log(i);
      this.setData({
        activeTimeIndex: i
      });
    }
  },
});