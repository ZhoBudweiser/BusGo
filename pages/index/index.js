Page({
  data: {
    activeIndex: 0,
    currentState: 0,
    STATE: {
      init: 0,
      map: 1,

    },
    busLines: [],
    timer: null
  },
  method: {},
  onActive(id) {
    this.setData({
      activeIndex: id
    });
  },
  onStateChange(s) {
    this.setData({
      currentState: s
    });
  },
  async onQueryBusStopsByBid(bid) {
    try {
      let result = await my.request({
        url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getBcStationList?bid=' + bid,
        method: 'POST',
        headers: {
          'content-type': 'application/json', //默认值  
        },
        dataType: 'json',
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  onQueryBusLinesByStop(parm) {
    const client = parm.obj;
    my.request({
      url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getBcByStationName?bid=' + parm.bid + '&stationName=' + parm.stopId,
      method: 'POST',
      headers: {
        'content-type': 'application/json', //默认值
      },
      dataType: 'json',
      success: async function (res) {
        // console.log(client);
        const queryRes = await res.data.data.map(async item => {
          try {
            let stations = await client.onQueryBusStopsByBid(item.bid);
            stations = stations.data.data;
            // console.log(stations);
            return {
              ...item,
              line_alias: item.line_alias,
              station_map: stations ? stations.map(item => item.station_alias_no).reduce((acc, currentValue, index) => {
                acc[currentValue] = index;
                return acc;
              }, {}) : null,
              duration: item.start_time.replace(/:\d{2}$/, '') + '-' + (item.arrive_time ? item.arrive_time.replace(/:\d{2}$/, '') : "22:40"),
              start_address: item.start_address.replace(/校区(.*)/g, ''),
              end_address: item.end_address.replace(/校区(.*)/g, ''),
              remark: item.memo,
              stations: stations ? stations.map(item => {
                const res = item.station_alias.match(/校区(.+)/);
                return {
                  ...item,
                  "station_alias": res ? res[1] : item.station_alias
                }
              }) : null,
            };
          } catch (err) {
            console.log(err);
          }
        });
        const results = await Promise.all(queryRes);
        console.log(results);
        client.setData({
          busLines: results
        });
      },
      fail: function (error) {
        console.error('fail: ', JSON.stringify(error));
      },
      complete: function (res) {
        my.hideLoading();
      },
    });
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    console.log(this);
    // this.onQueryBusLinesByStop({
    //   bid: 'B072',
    //   stationName: 1005
    // });
    // this.onQueryBusLinesByStop.bind(this)
    this.timer = setInterval(this.onQueryBusLinesByStop, 5000, {
      bid: '',
      stopId: 1005,
      obj: this
    });
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});