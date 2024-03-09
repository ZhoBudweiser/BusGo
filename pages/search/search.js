import {
  fmtQueryResult,
  fmtQueryArrayResult
} from "/util/fmtUnit";

Page({
  data: {
    lines: [],
    initStart: "",
    queried: false,
    historyAddress: {},
    appendedItem: {},
  },
  async onSubmitQueryCloud(info) {
    const self = this;
    const context = await my.getCloudContext();
    context.callFunction({
      name: "queryBusLines",
      data: info,
      success: function (res) {
        const queryResult = res.result.data;
        self.setData({
          lines: queryResult
            .map(item => item.length ? fmtQueryArrayResult(info, item) : fmtQueryResult(info, item))
            .sort((l1, l2) => {
              const n1 = l1.sortNum ? l1.sortNum : l1[0].sortNum;
              const n2 = l2.sortNum ? l2.sortNum : l2[0].sortNum;
              return n1 < n2 ? -1 : (n1 == n2 ? 0 : 1);
            }),
        });
        my.hideLoading();
        if (queryResult.length === 0) {
          my.showToast({
            content: '未查询到班车信息',
            duration: 2000,
          });
        }
      },
      fail: function (err) {
        console.log(err);
        my.hideLoading();
      }
    });
  },
  onSubmitQuery(info) {
    this.setData({
      queried: true,
    });
    my.showLoading({
      content: '查询中...'
    });
    this.onSubmitQueryCloud(info);
    this.setData({
      appendedItem: info,
    });
    console.log("receive: ", info);
  },
  onSetHistoryAddress(history) {
    this.setData({
      historyAddress: history
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
  },
});