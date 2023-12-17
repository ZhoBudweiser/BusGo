Component({
  mixins: [],
  data: {},
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    onSearchBarTap() {
      // console.log("searchbar");
      my.navigateTo({
        url: '/pages/search/search',
      });
    },
  },
});
