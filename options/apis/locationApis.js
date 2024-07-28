import { DEFAULT_LOCATION_QUERY_FREQUENCY } from "/options/props/defaults";

export function setLocationTimer(client) {
  return setInterval(autoLocate, DEFAULT_LOCATION_QUERY_FREQUENCY, client);
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
    return systemInfo.locationEnabled && systemInfo.locationAuthorized;
  };

  // 获取用户是否授权过当前小程序使用定位
  const isLocationMPAuthorized = async () => {
    const settingInfo = await myGetSetting();
    return (
      settingInfo.authSetting.location
    );
  };

  // 若用户未授权当前小程序使用定位，则引导用户跳转至小程序设置页开启定位权限
  const requestLocationPermission = async () => {
    await myAlert("当前定位未开启");
    const openSettingInfo = await myOpenSetting();
    return openSettingInfo.authSetting.location;
  };

  try {
    if (!(await isLocationEnabled())) {
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
}

function autoLocate(client) {
  console.log("已获取定位");
  my.getLocation({
    type: 0,
    success: (userPosition) => client.setData({ userPosition }),
    fail: () => clearInterval(client.data.locationTimer),
  });
}
