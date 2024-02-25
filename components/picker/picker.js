import { endAddresses } from "/util/data";
import { timeFormat } from "/util/fmtUnit";

Component({
  data: {
    // 地点
    stationOptions: [],
    startIndex: null,
    endIndex: null,
    startTime: '00:00',
    isWeekend: false
  },
  didMount() {
    this.setData({
      stationOptions: endAddresses
    });
    my.getServerTime({
      success: (res) => {
        this.setData({
          startTime: timeFormat(res.time, 'hh:mm')
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
  }
});