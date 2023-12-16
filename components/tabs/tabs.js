Component({
  mixins: [],
  data: {
    top: 0,
    shadow: false,
  },
  props: {
    tabs: ['校区间', '校内'],
    activeTab: 1,
    onActive: () => {console.log('dd')},
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onTabBarTap(e) {
      const {
        index
      } = e.target.dataset
      this.props.onActive(index);
    },
  },
});