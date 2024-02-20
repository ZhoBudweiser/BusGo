import { authGuideLocation, getNearestStop } from "/util/maphelper"
const longitude = 120.090178;
const latitude = 30.303975;

Page({
  data: {
    activeIndex: 0,
    currentState: 1,
    busLines: [],
    selectedStop: "1007",
    selectedStopName: "",
    stops: [],
    timeCost: -1,
    stationsBuffers: {},
    noticeShow: true
  },
  options: {
    observers: true,
  },
  observers: {
    'selectedStop': function() {
      this.setData({
        selectedStopName: this.data.stops.filter(item => item.station_alias_no === this.data.selectedStop)[0].station_alias
      });
      my.showLoading({
        content: '查询中...'
      });
      if (this.timer)
        clearInterval(this.timer);
      this.onQueryBusLinesByStop({
        bid: '',
        stopId: this.data.selectedStop,
        obj: this
      });
      this.timer = setInterval(this.onQueryBusLinesByStop, 10000, {
        bid: '',
        stopId: this.data.selectedStop,
        obj: this
      });
    }
  },
  onActive(id) {
    this.setData({
      activeIndex: id
    });
  },
  onSetTimeCost(time) {
    this.setData({
      timeCost: (time/60).toFixed(1)
    });
  },
  onSelectedStop(id) {
    this.setData({
      selectedStop: id
    });
    this.onQueryBusLinesByStop({
      bid: '',
      stopId: id,
      obj: this
    });
  },
  onStateChange(s) {
    this.setData({
      currentState: s
    });
  },
  linkActionClick() {
    my.navigateTo({
      url: '/pages/news/news',
    });
  },
  actionClick() {
    this.setData({
      noticeShow: false
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
            let stations;
            if (client.data.stationsBuffers.hasOwnProperty(item.bid)) {
              stations = client.data.stationsBuffers[item.bid];
            } else {
              stations = await client.onQueryBusStopsByBid(item.bid);
              stations = stations.data.data;
              client.data.stationsBuffers[item.bid] = stations;
            }
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
        client.setData({
          busLines: results
        });
        my.hideLoading();
      },
      fail: function (error) {
        console.error('fail: ', JSON.stringify(error));
      },
      complete: function (res) {
        
      },
    });
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onShow() {

    const client = this;

    authGuideLocation().then(res => {
      if (res === true) {
        my.getLocation({
          type: 1, 
          success: (res) => {
            const lat = res.latitude,
              lon = res.longitude;
            client.setData({
              longitude: lon,
              latitude: lat
            });
            getNearestStop(client, lat, lon);
          },
          fail: (res) => {
            my.alert({
              title: '定位失败',
              content: JSON.stringify(res)
            });
          }
        });
      } else {
        getNearestStop(client, latitude, longitude);
      }
    });
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'ZJU-BusGo',
      desc: '智慧校园出行助手',
      path: 'pages/index/index',
    };
  },
});