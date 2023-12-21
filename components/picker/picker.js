Component({
  data: {
    // 地点
    stationOptions: [
      "紫金港校区",
      "玉泉校区",
      "西溪校区",
      "华家池校区",
      "之江校区",
      "湖滨",
      "紫金文苑",
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
    startTime: '00:00',
    isWeekend: false
  },
  didMount() {
    my.getServerTime({
      success: (res) => {
        this.setData({
          startTime: this.timeFormat(res.time, 'hh:mm')
        });
      },
    });
  },
  props: {
    onSubmitQuery: () => {
      console.log('defalut')
    }
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
    onTimePick() {
      // let currentTime;
      // AlipayJSBridge.call('getServerTime', function(data) {
      //   currentTime = data.time;
      // });
      my.datePicker({
        format: 'HH:mm',
        // currentDate: '11:11',
        startDate: '00:00',
        endDate: '23:59',
        success: (res) => {
          this.setData({
            startTime: res.date
          });
        },
      });
    },
    onDayPick() {
      this.setData({
        isWeekend: !this.data.isWeekend
      });
    },
    onSubmit() {
      if (this.data.startIndex === null || this.data.endIndex === null) {
        my.showToast({
          content: '请填写地点信息',
          duration: 1000,
        });
        return;
      }
      this.props.onSubmitQuery({
        startAddress: this.data.stationOptions[this.data.startIndex],
        endAddress: this.data.stationOptions[this.data.endIndex],
        "startTime": Number(this.data.startTime.replace(':', '')),
        "startDay": this.data.isWeekend ? "6,7" : "1,2,3,4,5"
      });
    },
    timeFormat(time, fmt = 'YYYY-MM-DD hh:mm:ss') {
      const dte = new Date(time);

      function getYearWeek(date) {
        var date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var date2 = new Date(date.getFullYear(), 0, 1);

        //获取1月1号星期（以周一为第一天，0周一~6周日）
        var dateWeekNum = date2.getDay() - 1;
        if (dateWeekNum < 0) {
          dateWeekNum = 6;
        }
        if (dateWeekNum < 4) {
          // 前移日期
          date2.setDate(date2.getDate() - dateWeekNum);
        } else {
          // 后移日期
          date2.setDate(date2.getDate() + 7 - dateWeekNum);
        }
        var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
        if (d < 0) {
          var date3 = new Date(date1.getFullYear() - 1, 11, 31);
          return getYearWeek(date3);
        } else {
          // 得到年数周数
          var year = date1.getFullYear();
          var week = Math.ceil((d + 1) / 7);
          return week;
        }
      }

      var o = {
        'M+': dte.getMonth() + 1, // 月份
        'D+': dte.getDate(), // 日
        'h+': dte.getHours(), // 小时
        'm+': dte.getMinutes(), // 分
        's+': dte.getSeconds(), // 秒
        'q+': Math.floor((dte.getMonth() + 3) / 3), // 季度
        S: dte.getMilliseconds(), // 毫秒
        'W+': getYearWeek(dte), // 周数
      };
      if (/(Y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (dte.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
          );
        }
      return fmt;
    }
  }
});