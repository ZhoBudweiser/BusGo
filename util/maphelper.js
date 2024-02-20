// 由于跳转到系统设置页无法监听用户最终是否打开系统定位及对支付宝授权位置信息，因此请在生命周期 onShow 中调用定位授权准备方法。
export const authGuideLocation = async () => {
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
    await myAlert("打开定位以获取更好的查询服务");
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


export const getNearestStop = (client, lat, lon) => {
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
      client.setData({
        selectedStop: target_id,
        stops: poses
      });
    },
    fail: function (error) {
      console.error('fail: ', JSON.stringify(error));
    },
    complete: function (res) {
      my.hideLoading();
    },
  });
};