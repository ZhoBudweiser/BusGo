Component({
  props: {
    diameter: 25,
    progress: 10,
    color: '#4CAF50',
    textColor: '#000000',
    textSize: 16
  },
  didMount() {
    this.drawProgress(this.data.progress);
  },
  methods: {
    drawProgress(progress) {
      my.createSelectorQuery().select('#canvas').node().exec((res) => {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          console.log(ctx);

          const x = this.data.diameter / 2;
          const y = this.data.diameter / 2;
          const radius = this.data.diameter / 2 - 5; // 环形半径  
          const startAngle = -Math.PI / 2;
          const endAngle = 2 * Math.PI * (progress / 100) - Math.PI / 2;
    
          // 绘制底色  
          ctx.fillStyle = '#f3f3f3';
          ctx.setLineWidth(10);
          ctx.setLineCap('round');
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.stroke();
    
          // 绘制进度  
          ctx.setStrokeStyle(this.data.color);
          ctx.setLineWidth(10);
          ctx.setLineCap('round');
          ctx.beginPath();
          ctx.arc(x, y, radius, startAngle, endAngle);
          ctx.stroke();
    
          // 绘制文字  
          ctx.setFillStyle(this.data.textColor);
          ctx.setFontSize(this.data.textSize);
          ctx.setTextAlign('center');
          ctx.setTextBaseline('middle');
          ctx.fillText(progress + '%', x, y);
    
          ctx.draw();
      })
    }
  }
});