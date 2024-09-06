import { NOP } from "/options/props/defaults";

Component({
  props: {
    locationIndex: 0,
    locations: [],
    onSelectLocation: NOP,
  },
  methods: {
    onTapLeft() {
      const { locationIndex: index, locations } = this.props;
      const length = locations.length;
      if (length == 0) return;
      const locationIndex = (index - 1 + length) % length;
      this.props.onSelectLocation(locationIndex);
    },
    onTapRight() {
      const { locationIndex: index, locations } = this.props;
      const length = locations.length;
      if (length == 0) return;
      const locationIndex = (index + 1) % length;
      this.props.onSelectLocation(locationIndex);
    }
  },
});
