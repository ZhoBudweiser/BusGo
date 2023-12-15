Component({
  mixins: [],
  data: {
    background: [
      { color: 'blue', text: '支付宝' },
      { color: 'red', text: '小程序' },
      { color: 'yellow', text: 'Swiper' }
    ],
  },
  props: {
    activeTab: 1,
    onActive: () => {},
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onChange(e) {
      const {current} = e.detail;
      this.props.onActive(current);
    }
  },
});