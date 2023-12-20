Component({
  data: {
    // 地点
    stationOptions: [
      "紫金港校区",
      "玉泉校区教二",
      "玉泉校区（4舍南侧）",
      "玉泉校区教十二北面",
      "西溪校区",
      "华家池校区",
      "之江校区",
      "湖滨",
      "紫金文苑西",
      "紫金文苑北",
      "雅仕苑",
      "丰谭路高教二期",
      "南都德加东",
      "城市心境",
      "高教一期",
      "恩济花园",
      "高教二期",
      "丰谭中学"
    ],
    startIndex: null,
    endIndex: null,
  },
  props: {
    onSubmitQuery: ()=>{console.log('defalut')}
  },
  methods: {
    bindPickerChange(e) {
      this.setData({
        startIndex: e.detail.value,
      });
    },
    bindObjPickerChange(e) {
      this.setData({
        endIndex: e.detail.value,
      });
    },
    onSwitchAddress() {
      this.setData({
        startIndex: this.data.endIndex,
        endIndex: this.data.startIndex
      });
    },
    onSubmit() {
      // if (this.data.startIndex === null || this.data.endIndex === null) {
      //   my.showToast({
      //     content: '请填写地点信息',
      //     duration: 1000,
      //   });
      //   return;
      // }
      this.props.onSubmitQuery({
        startId: this.data.startIndex,
        endId: this.data.endIndex,
      });
    }
  }
});