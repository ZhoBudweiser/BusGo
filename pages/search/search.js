import { fmtQueryResult, fmtQueryArrayResult } from "/util/fmtUnit";
import { isObjectValueEqual } from "/util/queryhelper";
import { dataAlert } from "/util/data";

Page({
  data: {
    lines: [],
    initStart: "",
    queried: null,
    throttle: false,
    throttleTimer: null,
    historyAddress: {},
    appendedItem: {},
  },
  async onSubmitQueryCloud(info) {
    const clearTimer = () => {
      this.setData({
        throttle: false,
        throttleTimer: null,
      });
    };
    if (this.data.throttleTimer) {
      clearTimeout(this.data.throttleTimer);
    }
    if (this.data.throttle) {
      my.showToast({
        content: "查询过于频繁，\n请稍后再试",
        duration: 2000,
      });
      this.setData({
        throttleTimer: setTimeout(clearTimer, 6000),
      });
      my.hideLoading();
      return;
    } else {
      this.setData({
        throttle: true,
        throttleTimer: setTimeout(clearTimer, 6000),
      });
    }
    if (isObjectValueEqual(info, this.data.queried)) {
      my.showToast({
        content: "结果已给出，\n请更新查询",
        duration: 2000,
      });
      my.hideLoading();
      return;
    }
    const self = this;
    const context = await my.getCloudContext();
    context.callFunction({
      name: "queryBusLines",
      data: info,
      success: function (res) {
        const queryResult = res.result.data;
        self.setData({
          lines: queryResult
            .map((item) =>
              item.length
                ? fmtQueryArrayResult(info, item)
                : fmtQueryResult(info, item),
            )
            .sort((l1, l2) => {
              const n1 = l1.sortNum ? l1.sortNum : l1[0].sortNum;
              const n2 = l2.sortNum ? l2.sortNum : l2[0].sortNum;
              return n1 < n2 ? -1 : n1 == n2 ? 0 : 1;
            }),
        });
        my.hideLoading();
        self.setData({
          queried: info,
        });
        if (queryResult.length === 0) {
          my.showToast({
            content: "未查询到班车信息",
            duration: 2000,
          });
        }
      },
      fail: function (err) {
        console.log(err);
        my.hideLoading();
      },
    });
  },
  onSubmitQuery(info) {
    my.showLoading({
      content: "查询中...",
    });
    this.onSubmitQueryCloud(info);
    this.setData({
      appendedItem: info,
    });
    console.log("receive: ", info);
  },
  onSetHistoryAddress(history) {
    this.setData({
      historyAddress: history,
    });
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
    if (query.start) {
      this.setData({
        initStart: query.start,
      });
    }
    const data_res = my.getStorageSync({
      key: "dataAlert",
    });
    if (!data_res.data) {
      dataAlert();
    }
  },
});
