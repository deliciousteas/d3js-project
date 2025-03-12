//const d3 = require('d3'); // 如果你在 Node.js 环境中运行，保留这一行
// 如果你在浏览器中运行，删除上面一行，因为 d3 已经通过 CDN 加载

const render = ({ index1, index2, width, height, margin, scoreColor, loadingColor, leadColor, loadingOpacity, textSize, circleR }) => {
  return (selection) => {
    selection.each(function ({ loadings, scores }) {
      const svg = d3.select(this)
        .attr('width', width + 2 * margin + 100)
        .attr('height', height + 2 * margin);

      // ... 其余代码保持不变
    });
  };
};

const privates = new WeakMap();

const accessor = (self, key, value = null) => {
  if (value === null) {
    return privates.get(self)[key];
  }
  privates.get(self)[key] = value;
  return self;
};

class Renderer {
  constructor() {
    privates.set(this, {
      index1: 0,
      index2: 1,
      size: [800, 700],
      margin: 50,
      scoreColor: 'skyblue',
      loadingColor: 'orange',
      leadColor: 'lightgray',
      loadingOpacity: 0.8,
      textSize: 9,
      circleR: 5
    });
  }

  render() {
    const [width, height] = this.size();
    return render({
      width: width,
      height: height,
      margin: this.margin(),
      scoreColor: this.scoreColor(),
      loadingColor: this.loadingColor(),
      leadColor: this.leadColor(),
      loadingOpacity: this.loadingOpacity(),
      textSize: this.textSize(),
      circleR: this.circleR()
    });
  }

  size(arg = null) {
    return accessor(this, 'size', arg);
  }

  margin(arg = null) {
    return accessor(this, 'margin', arg);
  }

  scoreColor(arg = null) {
    return accessor(this, 'scoreColor', arg);
  }

  loadingColor(arg = null) {
    return accessor(this, 'loadingColor', arg);
  }

  leadColor(arg = null) {
    return accessor(this, 'leadColor', arg);
  }

  loadingOpacity(arg = null) {
    return accessor(this, 'loadingOpacity', arg);
  }

  textSize(arg = null) {
    return accessor(this, 'textSize', arg);
  }

  circleR(arg = null) {
    return accessor(this, 'circleR', arg);
  }
}

export { Renderer, render, privates, accessor };