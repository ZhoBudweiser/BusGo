import {
  fmtQueryResult
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
    var self = this;
    var context = await my.getCloudContext();
    context.callFunction({
      name: "queryBusLinesByAddresses",
      data: info,
      success: function (res) {
        const queryResult = res.result.data;
        self.setData({
          lines: queryResult
            .map(item => fmtQueryResult(info, item))
            .sort((l1, l2) => l1.sortNum < l2.sortNum ?
              -1 : (l1.sortNum == l2.sortNum ? 0 : 1)),
        });
      },
      fail: function (err) {},
      complete: function () {
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