Page({
  data: {
    query_info: null,
    lines: [],
  },
  async onSubmitQueryCloud(info) {
    var self = this;
    var context = await my.getCloudContext();
    context.callFunction({
      name: "queryBusLinesByAddresses",
      data: info,
      success: function (res) {
        console.log(res);
        self.setData({
          lines: res.result.data.map(item => {
            const stations = item["stations"];
            const startTime = "" + item.startTime,
              endTime = "" + item.endTime;
            return {
              ...item,
              startTime: startTime.slice(0, -2) + ":" + startTime.slice(-2),
              endTime: endTime.slice(0, -2) + ":" + endTime.slice(-2),
              startStationName: item.startStation.replace(/校区(.*)/g, ''),
              endStationName: item.endStation.replace(/校区(.*)/g, ''),
              isWeekend: item.cycle.indexOf('7') === -1,
              stations: stations.map(jtem => {
                const res = jtem.name.match(/校区(.+)/);
                const str = String(jtem.time);
                const t = str ? str.slice(0, -2) + ":" + str.slice(-2) : "";
                return {
                  ...jtem,
                  "station_alias": res ? (jtem.name.indexOf("玉泉校区") === -1 ? res[1] : "玉泉校区") : jtem.name,
                  "time": t,
                  "active": jtem.name.indexOf(info.startAddress) !== -1 || jtem.name.indexOf(info.endAddress) !== -1
                }
              })
            };
          }),
        });
        my.hideLoading();
      },
      fail: function (err) {}
    });
  },
  onSubmitQuery(info) {
    this.setData({
      query_info: info,
    });
    my.showLoading({
      content: '查询中...'
    });
    this.onSubmitQueryCloud(info);
    console.log("receive: ", info);
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    if (query.start) {
      
    }
  },
});