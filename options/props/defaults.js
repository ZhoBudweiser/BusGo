export const DEFAULT_TIME = "22:40";
export const DEFAULT_POSITION = {
  longitude: 120.090178,
  latitude: 30.303975,
};
export const DEFAULT_LOCATION_QUERY_FREQUENCY = 5000;
export const DEFAULT_STATION = {
  id: "",
  name: "",
};
export const DEFAULT_TABS = ["校区间", "校区内"];
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
export const DEFAULT_SHUTTLE_ALL_ENDS = [
  "青溪东侧",
  "东区生活区",
  "东教学区",
  "农生环组团",
  "医药组团",
  "成均苑",
  "成章楼",
  "海纳苑",
  "和同苑",
  "段永平教学楼",
  "西教学区",
  "化学楼北往南",
  "化学楼南往北",
  "云峰北侧",
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