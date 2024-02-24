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

const convertNameStyle = (str) => {
  let temp = str.replace(/[A-Z]/g, function(i) {
      return '_' + i.toLowerCase();
  })
  if (temp.slice(0,1) === '_') {
      temp = temp.slice(1);
  }
  return temp;
}

const replaceKeys = (obj) => {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceKeys(item));
  } else {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = convertNameStyle(key) || key;
      acc[newKey] = replaceKeys(obj[key]);
      return acc;
    }, {});
  }
};

export const getNearestStop = (poses, lat, lon) => {
  let min_dist = 9999,
    target_id = "1007";
  poses.forEach(item => {
    const cur_lat = item.station_lat,
      cur_lon = item.station_long;
    const dist = (cur_lat - lat) * (cur_lat - lat) + (cur_lon - lon) * (cur_lon - lon);
    if (dist < min_dist) {
      min_dist = dist;
      target_id = item.station_alias_no;
    }
  });
  return target_id;
}


export const getBusStops = (client, lat, lon) => {
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/manage/getNearStation?lat=' + lat + '&lon=' + lon,
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const poses = res.data.data;
      const stopid = getNearestStop(poses, lat, lon);
      console.log(stopid);
      client.setData({
        selectedStop: stopid,
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

export const getShuttleStops = (client, lat, lon) => {
  my.request({
    url: 'https://bccx.zju.edu.cn/schoolbus_wx/xbc/getXbcLine',
    method: 'POST',
    dataType: 'json',
    success: function (res) {
      const lines = replaceKeys(res.data.data);
      const visits = new Set();
      const stations = lines.map(item => item.station_list).reduce((pre_stations, cur_list) => {
        return pre_stations.concat(cur_list.reduce((pres, station) => {
          if (visits.has(station.station_alias_no)) {
            return pres;
          } else {
            visits.add(station.station_alias_no);
            return pres.concat([station]);
          }          
        }, []));
      }, []);
      const stopid = getNearestStop(stations, lat, lon);
      console.log(stopid);
      client.setData({
        selectedStop: stopid,
        stops: stations
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

export const locationService = (func) => {
  my.getLocation({
    type: 1, 
    success: (res) => {
      func(res.longitude, res.latitude);
    },
    fail: (res) => {
      my.alert({
        title: '定位失败',
        content: JSON.stringify(res)
      });
    }
  });
}

export const locate = (client, activeIndex) => {
  authGuideLocation().then(res => {
    if (res === true) {
      locationService((lon, lat) => {
        client.setData({
          longitude: lon,
          latitude: lat
        });
        if (activeIndex === 0) {
          getBusStops(client, lat, lon);
        } else if (activeIndex === 1) {
          getShuttleStops(client, lat, lon);
        }
      });
    } else {
      if (activeIndex === 0) {
        getBusStops(client, lat, lon);
      } else if (activeIndex === 1) {
        getShuttleStops(client, lat, lon);
      }
    }
  });
}