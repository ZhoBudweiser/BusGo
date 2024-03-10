import { busEndAddresses } from "/util/data";
import { timeFormat } from "/util/fmtUnit";

Component({
  options: {
    observers: true,
  },
  data: {
    // 地点
    stationOptions: [],
    startOptions: [],
    endOptions: [],
    startName: "",
    endName: "",
    startTime: '00:00',
    isWeekend: false,
    canTrans: true,
  },
  observers: {
    'historyAddress': function(history) {
      if (!history.startAddress || !history.endAddress) return;
      let options = busEndAddresses.filter(address => history.startAddress.indexOf(address) !== -1);
      const startName = options.length ? options[0] : "";
      options = busEndAddresses.filter(address => history.endAddress.indexOf(address) !== -1);
      const endName = options.length ? options[0] : "";
      this.setData({
        startName: startName,
        endName: endName,
        startOptions: busEndAddresses.filter(item => item !== endName),
        endOptions: busEndAddresses.filter(item => item !== startName),
      });
    }
  },
  didMount() {
    const options = busEndAddresses.filter(address => this.props.initStart.indexOf(address) !== -1);
    const name = options.length ? options[0] : "";
    this.setData({
      startName: name,
      stationOptions: busEndAddresses,
      startOptions: busEndAddresses,
      endOptions: busEndAddresses.filter(item => item !== name),
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
    initStart: "",
    historyAddress: {},
    onSubmitQuery: () => {
      console.log('defalut')
    }
  },
  methods: {
    bindPickerChange(e) {
      const start = this.data.startOptions[e.detail.value];
      this.setData({
        startName: start,
        endOptions: this.data.stationOptions.filter(item => item !== start),
      });
    },
    bindObjPickerChange(e) {
      const end = this.data.endOptions[e.detail.value];
      this.setData({
        endName: end,
        startOptions: this.data.stationOptions.filter(item => item !== end),
      });
    },
    onSwitchAddress() {
      if (this.data.startName === "" || this.data.endName === "") {
        my.showToast({
          content: '请填写地点信息',
          duration: 1000,
        });
        return;
      }
      this.setData({
        startName: this.data.endName,
        endName: this.data.startName,
        startOptions: this.data.endOptions,
        endOptions: this.data.startOptions,
      });
    },
    onTimePick() {
      my.datePicker({
        format: 'HH:mm',
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
    onTransPick() {
      this.setData({
        canTrans: !this.data.canTrans
      });
    },
    onSubmit() {
      if (this.data.startName === "" || this.data.endName === "") {
        my.showToast({
          content: '请填写地点信息',
          duration: 1000,
        });
        return;
      }
      this.props.onSubmitQuery({
        startAddress: this.data.startName,
        endAddress: this.data.endName,
        "startTime": Number(this.data.startTime.replace(':', '')),
        "startDay": this.data.isWeekend ? "6,7" : "1,2,3,4,5",
        "canTrans": this.data.canTrans,
      });
    },
  }
});