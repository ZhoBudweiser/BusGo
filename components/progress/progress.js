Component({
  props: {
    progress: 10,
    percent: 1.0,
    index: 0,
    lauch: false
  },
  methods: {
    onCanvasReady() {
      my.createSelectorQuery().select('#canvas'+this.props.index).node().exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 画一个辅助圆形并填充颜色
        ctx.arc(40, 40, 30, 0, 2 * Math.PI)
        ctx.fillStyle = '#f7f7f7'
        ctx.fill()

        // 画一段圆弧
        ctx.beginPath()
        ctx.lineWidth = 5
        ctx.arc(40, 40, 30, -0.5 * Math.PI, this.props.percent * 2 * Math.PI-0.5 * Math.PI)
        ctx.strokeStyle = this.props.lauch ? 'red' : 'green';
        ctx.stroke()
      })
    }
  }
});