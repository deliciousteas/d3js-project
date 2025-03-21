// 数据集
const dataList = [
  {
    acqTime: "2024-05-18 10:00:00",
    zone1: 25,
    zone2: 30,
    zone3: 35,
    zone4: 40,
    zone5: 45,
    zone6: 50,
    zone7: 55,
    zone8: 60,
  },
  {
    acqTime: "2024-05-18 10:01:00",
    zone1: 26,
    zone2: 31,
    zone3: 36,
    zone4: 41,
    zone5: 46,
    zone6: 51,
    zone7: 56,
    zone8: 61,
  },
  {
    acqTime: "2024-05-18 10:02:00",
    zone1: 27,
    zone2: 32,
    zone3: 37,
    zone4: 42,
    zone5: 47,
    zone6: 52,
    zone7: 57,
    zone8: 62,
  }
];

// 当前加载的数据索引
let currentIndex = 0;

// 设置图表的 margin 和尺寸
const margin = { top: 200, right: 30, bottom: 120, left: 60 };
const width = 1600 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;
const legendHeight = 80;

// 选择容器并添加 SVG 元素
const svg = d3.select(".container") // 确保你的 HTML 中有一个 class 为 container 的元素
  .append("svg")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "auto")
  .style("background-color", "white")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + legendHeight}`);

// 创建图表组
const chartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// 初始化 X 轴和 Y 轴
let x, y, colorScale, line, keys, linePath, dots;

// 初始化图表
function initChart() {
  // 提取所有 zone 字段名
  keys = Object.keys(dataList[0]).filter(key => key.startsWith('zone'));

  // 定义 X 轴比例尺
  x = d3.scaleBand()
    .domain(keys)
    .range([0, width])
    .padding(0.1);

  // 定义 Y 轴比例尺
  y = d3.scaleLinear()
    .domain([
      d3.min(dataList, d => d3.min(keys, key => d[key])),
      d3.max(dataList, d => d3.max(keys, key => d[key]))
    ])
    .range([height, 0]);

  // 定义颜色比例尺
  colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // 定义线生成器
  line = d3.line()
    .x((d, i) => x(d.key) + x.bandwidth() / 2)
    .y(d => y(d.value));

  // 添加 Y 轴
  chartGroup.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .call(g => g.select(".domain").remove()) // 移除主轴线
    .call(g => g.selectAll(".tick line")
      .clone()
      .attr("x2", width)
      .attr("stroke-opacity", 0.5)
      .attr("stroke", "#e0e0e0"))
    .call(g => g.selectAll(".tick text")
      .style("font-size", "14px")
      .style("fill", "#6e7079"));

  // 添加 Y 轴标题
  chartGroup.append("text")
    .attr("x", -margin.left + 45)
    .attr("y", -15)
    .attr("fill", "#686868")
    .attr("text-anchor", "start")
    .text("Value");

  // 添加 X 轴
  chartGroup.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .call(g => g.selectAll("text")
      .style("text-anchor", "end")
      .style("fill", "#6e7079")
      .style("font-size", "16px")
      .attr("transform", "rotate(-25)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em"));

  // 初始化 line 和 dots
  const initialData = keys.map(key => ({
    key,
    value: dataList[0][key]
  }));

  linePath = chartGroup.append("path")
    .datum(initialData)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", "steelblue")
    .style("stroke-width", 2)
    .style("fill", "none");

  dots = chartGroup.selectAll(".dot")
    .data(initialData, d => d.key)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => x(d.key) + x.bandwidth() / 2)
    .attr("cy", d => y(d.value))
    .attr("r", 15)
    .style("fill", "green");
}

// 更新图表
function updateChart(currentData) {
  // 更新 Y 轴的域
  y.domain([0, d3.max(currentData, d => d3.max(keys, key => d[key]))]);

  // 更新 Y 轴
  chartGroup.select("g").call(d3.axisLeft(y).ticks(5));

  // 更新线和圆点的数据
  const data = keys.map(key => ({
    key,
    value: currentData[0][key]
  }));

  // 更新线
  linePath.datum(data)
    .attr("d", line);

  // 更新圆点
  dots.data(data, d => d.key)
    .attr("cy", d => y(d.value));

  // 记录数据的变化过程
  console.log("Data updated:", currentData);
  console.log("Data points:", data);
}

// 初始化图表
initChart();

// 每隔10秒加载下一个数据
let intervalId = setInterval(() => {
  // 加载下一个数据
  const currentData = [dataList[currentIndex]];

  // 更新图表
  updateChart(currentData);

  // 更新索引，循环加载
  currentIndex += 1;

  // 如果索引达到数据集的长度，停止更新
  if (currentIndex >= dataList.length) {
    clearInterval(intervalId);
    console.log("数据加载完成，停止更新");
  }
}, 2000);