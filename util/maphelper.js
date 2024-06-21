import { getBusStops, getShuttleStops } from "/util/queryhelper";

// 由于跳转到系统设置页无法监听用户最终是否打开系统定位及对支付宝授权位置信息，因此请在生命周期 onShow 中调用定位授权准备方法。
const authGuideLocation = async () => {
  const myGetSystemInfo = () => {
    return new Promise((resolve, reject) => {
      my.getSystemInfo({
        success: resolve,
        fail: reject,
      });
    });
  };

  const myGetSetting = () => {
    return new Promise((resolve, reject) => {
      my.getSetting({
        success: resolve,
        fail: reject,
      });
    });
  };

  const myOpenSetting = () => {
    return new Promise((resolve, reject) => {
      my.openSetting({
        success: resolve,
        fail: reject,
      });
    });
  };

  const myAlert = (content) => {
    return new Promise((resolve, reject) => {
      my.alert({
        content,
        success: resolve,
        fail: reject,
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
      // my.showAuthGuide({
      //   authType: "LBS"
      // });
      return false;
    }
    return true;
  };

  // 获取用户是否授权过当前小程序使用定位
  const isLocationMPAuthorized = async () => {
    const settingInfo = await myGetSetting();
    return (
      settingInfo.authSetting.location === undefined ||
      settingInfo.authSetting.location
    );
  };

  // 若用户未授权当前小程序使用定位，则引导用户跳转至小程序设置页开启定位权限
  const requestLocationPermission = async () => {
    await myAlert("当前定位未开启");
    return false;
    // const openSettingInfo = await myOpenSetting();
    // return openSettingInfo.authSetting.location;
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
    console.log(error);
    return false;
  }
};

const locationService = (func) => {
  my.getLocation({
    type: 1,
    success: (res) => {
      func(res.longitude, res.latitude);
    },
    fail: (res) => {
      my.alert({
        title: "定位失败",
        content: JSON.stringify(res),
      });
    },
  });
};

const autoLocate = (parm) => {
  const { client } = parm;
  my.getLocation({
    type: 0,
    success: (res) => {
      client.setData({
        position: {
          longitude: res.longitude,
          latitude: res.latitude,
        }
      });
    },
    fail: (res) => {
      console.log({
        title: "定位失败",
        content: JSON.stringify(res),
      });
      if (posTimer) {
        clearInterval(posTimer);
        posTimer = null;
      }
    },
  });
};

const longitude = 120.090178;
const latitude = 30.303975;
let posTimer = null;

export const locate = (client, activeIndex) => {
  authGuideLocation().then((res) => {
    const setting = (lon, lat) => {
      client.setData({
        position: {
          longitude: lon,
          latitude: lat,
        }
      });
      if (activeIndex === 0) {
        getBusStops(client, lat, lon);
      } else if (activeIndex === 1) {
        getShuttleStops(client, lat, lon);
      }
    };
    if (res === true) {
      locationService((lon, lat) => setting(lon, lat));
      posTimer = setInterval(autoLocate, 5000, { client });
    } else {
      setting(longitude, latitude);
    }
  });
};
