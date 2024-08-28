export const DEFAULT_TIME = "22:40";
export const DEFAULT_POSITION = {
  longitude: 120.090178,
  latitude: 30.303975,
};
export const DEFAULT_LOCATION_QUERY_FREQUENCY = 5000;
export const DEFAULT_THROTTLE_FREQUENCY = 6000;
export const DEFAULT_SHOW_DURATION = 2000;
export const DEFAULT_CAR_QUERY_FREQUENCY_NOCAR = 600000;
export const DEFAULT_CAR_QUERY_FREQUENCY_RUNING = 5000;
export const DEFAULT_CAR_QUERY_FREQUENCY_WAIT = 60000;
export const DEFAULT_STATION = {
  id: "",
  name: "",
};
export const DEFAULT_TABS = ["校区间", "校区内"];
export const DEFAULT_CAMPUS = [
  { name: "紫金港", longitude: 120.084315, latitude: 30.300897 },
  { name: "玉泉", longitude: 120.12357, latitude: 30.261126 },
  { name: "西溪", longitude: 120.140227, latitude: 30.271847 },
  { name: "之江", longitude: 120.125997, latitude: 30.191475 },
  { name: "华家池", longitude: 120.192041, latitude: 30.270708 },
];


export const DEFAULT_BUS_BUFFER_ENDS = [
  "紫金港校区",
  "玉泉校区",
  "西溪校区",
  "华家池校区",
  "之江校区"
];
export const DEFAULT_BUS_ALL_ENDS = [
  "紫金港校区",
  "玉泉校区",
  "西溪校区",
  "华家池校区",
  "之江校区",
  "湖滨",
  "紫金文苑",
  "雅仕苑",
  "丰谭路高教二期",
  "南都德加东",
  "城市心境",
  "高教一期",
  "恩济花园",
  "高教二期",
  "丰谭中学",
];
export const DEFAULT_SHUTTLE_BUFFER_ENDS = [
  "东教学区",
  "主图书馆",
  "段永平教学楼",
  "西教学区",
  "云峰东侧",
];
export const DEFAULT_SHUTTLE_ALL_ENDS = [
  "青溪东侧",
  "东区生活区",
  "东教学区",
  "农生环组团",
  "医药组团",
  "成均苑",
  "成章楼",
  "主图书馆",
  "海纳苑",
  "和同苑",
  "段永平教学楼",
  "西教学区",
  "化学楼北往南",
  "化学楼南往北",
  "云峰北侧",
];
export const DEFAULT_QUERY_ALL_ENDS = [
  "紫金港校区",
  "玉泉校区",
  "西溪校区",
  "华家池校区",
  "之江校区",
  "工程师学院",
  "信息港园区",
  "水博园区",
  "湖滨",
  "紫金文苑",
  "雅仕苑",
  "丰谭路高教二期",
  "南都德加东",
  "城市心境",
  "高教一期",
  "恩济花园",
  "高教二期",
  "丰谭中学",
];

export const NOP = () => {};


export const DEFAULT_ROUTE = {
  zIndex: 4,
  routeColor: "#FFB90F",
  iconPath:
    "https://gw.alipayobjects.com/mdn/rms_dfc0fe/afts/img/A*EGCiTYQhBDkAAAAAAAAAAAAAARQnAQ",
  iconWidth: 10,
  routeWidth: 10,
  success: NOP,
  fail: (err) => console.log("路径输出错误：", err),
};
export const CAR_START_LABEL = 1000;
export const STATION_ID_LABEL = "STATION";
export const SELECTED_STATION_IMG_PATH = "/images/mark_stop.png";
export const UNSELECTED_STATION_IMG_PATH = "/images/mark_bs.png";
export const BUS_IMG_PATH = "/images/map_bus.png";
export const WHITE_SHUTTLE_IMG_PATH = "/images/map_shuttle.png";
export const RED_SHUTTLE_IMG_PATH = "/images/map_babybus.png";
export const OUTDATE_STATION_IDS = [
  new Set(["1101", "32", "9219", "4003", "4004", "4005"]),
  new Set([]),
]

export const UNION_LENGTH = (scale) => {
  let length = 4;
  if (scale >= 16) {
    length = 40;
  } else if (scale >= 14) {
    length = 10;
  }
  return length;
}
