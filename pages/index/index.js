import { authGuideLocation } from "/options/apis/locationApis";
import { store } from "/util/cache";
import { loadAndSet } from "/util/client";
import { setDate } from "/util/setters";

Page({
  data: {
    imgs: ["car1.jpg", "car2.jpg", "car3.jpg"],
    week: "星期一",
    date: "08 月 30 日",
    greeting: "早上好！",
    locationAuthed: false,
    welcomeShowed: false,
    welcomeImg: {
      left: 0,
      top: 0,
      imageStyle: "width: 100vw; height: 100vh",
      imageUrl: "/images/welcome.png",
      imageMode: "aspectFill",
    },
  },
  /**
   * @event 跳转到实时班车查询页面
   */
  onRunInfo() {
    my.navigateTo({
      url: "/pages/run-info/run-info",
    });
  },
  /**
   * @event 跳转到校车时刻表页面
   */
  onTimeTable() {
    my.navigateTo({
      url: "/pages/time-table/time-table",
    });
  },
  /**
   * @event 取消显示引导页
   */
  onCloseTour() {
    const welcomeShowed = true;
    this.setData({ welcomeShowed });
    store("welcomeShowed", welcomeShowed);
  },
  /**
   * 获取当前时间并加载数据，获取定位权限
   */
  async onLoad() {
    const app = getApp();
    my.getServerTime({
      success: (res) => this.setData(setDate(res.time)),
    });
    loadAndSet(this, "welcomeShowed");
    const locationAuthed = await authGuideLocation();
    this.setData({ locationAuthed });
    app.locationAuthed = locationAuthed;
  },
});
