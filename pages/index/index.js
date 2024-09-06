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
  onRunInfo() {
    my.navigateTo({
      url: "/pages/run-info/run-info",
    });
  },
  onTimeTable() {
    my.navigateTo({
      url: "/pages/time-table/time-table",
    });
  },
  onCloseTour() {
    const welcomeShowed = true;
    this.setData({ welcomeShowed });
    store("welcomeShowed", welcomeShowed);
  },
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
