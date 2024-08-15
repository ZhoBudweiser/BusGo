var jsUnitRpx = "false";
function fmtUnit(oldUnit) {
  var getUnit = oldUnit;

  if (jsUnitRpx === "true") {
    if (typeof getUnit === "string" && getUnit === "px") {
      getUnit = "rpx";
    } else if (typeof getUnit === "number") {
      getUnit *= 2;
    } else if (typeof getUnit === "string") {
      getUnit = oldUnit.match(/(\d+|\d+\.\d+)(px)/)[1] * 2 + "rpx";
    }
  }

  return getUnit;
}
Component({
  props: {
    className: "",
    // normal: 基础样式；
    // guide：文案加引导；
    // copyright：声明；
    // brand：带品牌；
    // link：带链接
    // end: 没有更多
    type: "end",
    content: "",
    extend: [],
    onBrandTap: function onBrandTap() {},
    showEndIcon: false,
    iconName: "selected",
  },
  data: {
    defaultSize: fmtUnit(18),
    maxSize: fmtUnit(22),
    valueUnit: fmtUnit("px"),
  },
  methods: {
    onBrandClick: function onBrandClick(e) {
      var brandLink = e.currentTarget.dataset.url;
      var _this$props = this.props,
        onBrandTap = _this$props.onBrandTap,
        extend = _this$props.extend;

      if (onBrandTap !== "" && brandLink) {
        my.navigateTo({
          url: brandLink,
        });
      }

      if (onBrandTap !== "" && !brandLink && typeof onBrandTap === "function") {
        onBrandTap(extend[e.currentTarget.dataset.index]);
      }
    },
  },
});
