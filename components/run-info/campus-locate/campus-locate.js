import { NOP } from "/options/props/defaults";

Component({
  props: {
    locationIndex: 0,
    locations: [],
    onSelectLocation: NOP,
  },
  methods: {
    /**
     * @event 点击左侧按钮
     */
    onTapLeft() {
      const { locationIndex: index, locations } = this.props;
      const length = locations.length;
      if (length == 0) return;
      const locationIndex = (index - 1 + length) % length;
      this.props.onSelectLocation(locationIndex);
    },
    /**
     * @event 点击右侧按钮
     */
    onTapRight() {
      const { locationIndex: index, locations } = this.props;
      const length = locations.length;
      if (length == 0) return;
      const locationIndex = (index + 1) % length;
      this.props.onSelectLocation(locationIndex);
    }
  },
});
