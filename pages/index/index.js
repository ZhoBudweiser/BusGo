import { authGuideLocation } from "/options/apis/locationApis";
import { setDate } from "/util/setters";

Page({
  data: {
    imgs: ["car1.jpg", "car2.jpg", "car3.jpg"],
    week: "星期一",
    date: "08 月 30 日",
    greeting: "早上好！",
    locationAuthed: false,
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
  async onLoad() {
    const app = getApp();
    my.getServerTime({
      success: (res) => this.setData(setDate(res.time)),
    });
    const locationAuthed = await authGuideLocation();
    this.setData({ locationAuthed });
    app.locationAuthed = locationAuthed;
  },
});