Page({
  data: {
    activeIndex: 0,
    currentState: 1,
    busLines: [],
    timer: null,
    selectedStop: "1007",
    selectedStopName: "",
    stops: [],
    timeCost: -1,
  },
  options: {
    observers: true,
  },
  method: {},
  observers: {
    'selectedStop': function() {
      this.setData({
        selectedStopName: this.data.stops.filter(item => item.station_alias_no === this.data.selectedStop)[0].station_alias
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
  onSearchNearestStop() {
    my.getBackgroundFetchData({
      fetchType: 'pre',
      success: function (res) {
        console.log(res);
      },
      fail: function (err) {
        console.log(err);
      }
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
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 由于跳转到系统设置页无法监听用户最终是否打开系统定位及对支付宝授权位置信息，因此请在生命周期 onShow 中调用定位授权准备方法。
    const authGuideLocation = async () => {
      const myGetSystemInfo = () => {
        return new Promise((resolve, reject) => {
          my.getSystemInfo({
            success: resolve,
            fail: reject
          });
        });
      };

      const myGetSetting = () => {
        return new Promise((resolve, reject) => {
          my.getSetting({
            success: resolve,
            fail: reject
          });
        });
      };

      const myOpenSetting = () => {
        return new Promise((resolve, reject) => {
          my.openSetting({
            success: resolve,
            fail: reject
          });
        });
      };

      const myAlert = (content) => {
        return new Promise((resolve, reject) => {
          my.alert({
            content,
            success: resolve,
            fail: reject
          });
        });
      };

      // 获取用户是否开启系统定位及授权支付宝使用定位
      const isLocationEnabled = async () => {
        const systemInfo = await myGetSystemInfo();
        return !!(systemInfo.locationEnabled && systemInfo.locationAuthorized);
      };

      // 若用户未开启系统定位或未授权支付宝使用定位，则跳转至系统设置页
      const showAuthGuideIfNeeded = async () => {
        if (!(await isLocationEnabled())) {
          my.showAuthGuide({
            authType: "LBS"
          });
          return false;
        }
        return true;
      };

      // 获取用户是否授权过当前小程序使用定位
      const isLocationMPAuthorized = async () => {
        const settingInfo = await myGetSetting();
        return settingInfo.authSetting.location === undefined || settingInfo.authSetting.location;
      };

      // 若用户未授权当前小程序使用定位，则引导用户跳转至小程序设置页开启定位权限
      const requestLocationPermission = async () => {
        await myAlert("如果用户之前拒绝授权当前小程序获取地理位置权限，将会弹出此弹窗，请根据需要替换文案。");
        const openSettingInfo = await myOpenSetting();
        return openSettingInfo.authSetting.location;
      };

      try {
        if (!(await showAuthGuideIfNeeded())) {
          return false;
        }
        if (await isLocationMPAuthorized()) {
          return true;
        }
        if (await requestLocationPermission()) {
          return true;
        }
        return false;
      } catch (error) {
        console.error(error);
        return false;
      }
    };
    const client = this;
    authGuideLocation().then(res => {
      console.log(res);
      if (res === true) {
        my.getLocation({
          type: 1, // 获取经纬度和省市区县数据
          success: (res) => {
            const lat = res.latitude,
              lon = res.longitude;
            client.setData({
              longitude: lon,
              latitude: lat
            });
            my.request({
              url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getNearStation?lat=' + lat + '&lon=' + lon,
              method: 'POST',
              dataType: 'json',
              success: function (res) {
                const poses = res.data.data;
                let min_dist = 9999,
                  target_id = "1007",
                  name = "";
                poses.forEach(item => {
                  const cur_lat = item.station_lat,
                    cur_lon = item.station_long;
                  const dist = (cur_lat - lat) * (cur_lat - lat) + (cur_lon - lon) * (cur_lon - lon);
                  if (dist < min_dist) {
                    min_dist = dist;
                    target_id = item.station_alias_no;
                    name = item.station_alias;
                  }
                });
                console.log(poses);
                client.setData({
                  selectedStop: target_id,
                  stops: poses
                });
                client.onQueryBusLinesByStop({
                  bid: '',
                  stopId: target_id,
                  obj: client
                });
                // this.onQueryBusLinesByStop.bind(this)
                client.timer = setInterval(client.onQueryBusLinesByStop, 10000, {
                  bid: '',
                  stopId: target_id,
                  obj: client
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
          fail: (res) => {
            my.alert({
              title: '定位失败',
              content: JSON.stringify(res)
            });
          },
          complete: () => {},
        });
      }
    });
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
    clearInterval(this.timer);
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