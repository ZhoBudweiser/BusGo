import { store } from "./cache";

export const busEndAddresses = [
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

export const busStaticEndAddresses = [
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

export const shuttleEndAddresses = [
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

export function getStart() {
  my.alert({
    title: "欢迎使用「校车行」",
    content:
      "本产品旨在为浙大师生提供便捷、智能的校车出行服务，使用过程中不会存储用户敏感信息。",
    buttonText: "启动",
    success: () => store("noticeShow", true),
  });
}

export function dataAlert() {
  my.alert({
    title: "温馨提示",
    content: "班次运行时偶尔会出现变化，请以实际运行和学校通知为准。",
    buttonText: "我已知晓",
    success: () => store("dataAlert", true),
  });
}
