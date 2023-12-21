Page({
  data: {
    query_info: null,
    lines: [],
  },
  onLoad() {},
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
                  "time": t
                }
              })
            };
          }),
        })
      },
      fail: function (err) {}
    });
  },
  onSubmitQuery(info) {
    this.setData({
      query_info: info,
    });
    this.onSubmitQueryCloud(info);
    console.log("receive: ", info);
    // my.request({
    //   url: 'http://www.life.zju.edu.cn/_web/_apps/lightapp/shuttlebus/busflight/api/lists.rst',
    //   method: 'GET',
    //   data: {
    //     id: -1,
    //     startStationId: info.startId,
    //     endStationId: info.endId,
    //     zj: '6,7',
    //     startTime: '0000',
    //     endTime: '2359',
    //     page: 0,
    //     rows: 99999
    //   },
    //   headers: {
    //     'content-type': 'application/json', //默认值
    //   },
    //   dataType: 'json',
    //   success: function (res) {
    //     my.alert({ content: 'success' });
    //   },
    //   fail: function (error) {
    //     console.error('fail: ', JSON.stringify(error));
    //   },
    //   complete: function (res) {
    //     my.hideLoading();
    //     my.alert({ content: 'complete' });
    //   },
    // });
    // my.request({
    //   url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getNearStation',
    //   method: 'POST',
    //   data: {
    //     lat: 30.297108,
    //     lon: 120.089626
    //   },
    //   headers: {
    //     'content-type': 'application/json', //默认值
    //   },
    //   dataType: 'json',
    //   success: function (res) {
    //     my.alert({
    //       content: 'success'
    //     });
    //     console.log(res);
    //   },
    //   fail: function (error) {
    //     console.error('fail: ', JSON.stringify(error));
    //   },
    //   complete: function (res) {
    //     my.hideLoading();
    //     my.alert({
    //       content: 'complete'
    //     });
    //   },
    // });
  }
});