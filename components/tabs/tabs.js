Component({
  mixins: [],
  data: {
    top: 0,
    shadow: false,
  },
  props: {
    tabs: ['坐校车', '坐小白', '坐巴士'],
    activeTab: 1,
    handleActive: (d) => {console.log('dd')},
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onTabBarTap(e) {
      const {
        index
      } = e.target.dataset
      this.setData({
        activeTab: index,
      });
      this.props.handleActive(index);
    },
  },
});