import { second2minute } from "/util/formatter";

/**
 * 计算两点之间花费的时间
 * @param {object} startPosition 起点经纬度
 * @param {object} endPosition 终点经纬度
 * @param {string} searchType 行经类型
 * @returns 花费的时间
 */
export async function calculateDistance(
  startPosition,
  endPosition,
  searchType = "walk",
) {
  return new Promise((resolve, reject) =>
    my.calculateRoute({
      startLat: startPosition.latitude,
      startLng: startPosition.longitude,
      endLat: endPosition.latitude,
      endLng: endPosition.longitude,
      searchType,
      success: (res) => resolve(second2minute(res.duration)),
      fail: reject,
    }),
  );
}

// 由于跳转到系统设置页无法监听用户最终是否打开系统定位及对支付宝授权位置信息，因此请在生命周期 onShow 中调用定位授权准备方法。
export async function authGuideLocation() {
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
      my.showAuthGuide({
        authType: "LBS",
      });
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
    await myAlert("定位未开启");
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
}
