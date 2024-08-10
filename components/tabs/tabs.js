import { nop } from "/options/apis/apiConfig";

Component({
  mixins: [],
  data: {
    top: 0,
    shadow: false,
  },
  props: {
    tabs: ["校区间", "校区内"],
    activeTab: 1,
    onMainData: nop,
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onTabBarTap(e) {
      const { index } = e.target.dataset;
      this.props.onMainData("activeIndex", index);
    },
  },
});
