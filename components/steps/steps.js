Component({
  props: {
    close: false,
    className: '',
    activeIndex: 5,
    failIndex: 0,
    size: 0,
    direction: 'horizontal',
    items: [{
        station_alias: 'a',
      },
      {
        station_alias: 'a',
      },
      {
        station_alias: 'a',
      },
    ]
  },
  methods: {
    onTap(e) {
      console.log(this.props.items);
    }
  }
});