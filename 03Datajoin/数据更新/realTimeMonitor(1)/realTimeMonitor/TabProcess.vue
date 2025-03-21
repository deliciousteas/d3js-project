<template>
  <div>
    <div :id="`d3-${id}`" style="width: 100%; height: 600px;"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import language from "@/locale/lang"

export default {
 
  props:{
    tabId:{
      type:Number
    },
    id:{
      type:Number
    },
    furnace:{
      type:String
    },
    selTime:{
      type:String
    },
    dataList:{
      type:Array
    },
    emptyKey:{
      type:Boolean
    },
    // keys:{
    //   type:Array
    // },
    displayedLines1:{
      type:Array
    },
    virableNo:{
      type:Number
    }
  },
  data() {
    return {
      keys: [], // 用于保存所有的 zone 字段
      keys2:[],
      isConvert:false,
      legendSelected:{},
      legendSelected1:{},
      isDestroyed:false,
      combineArray1:[],
      dataList1:{},
      displayedLines:[
        
      ],
      displayedLines2:[],
 
      width:window.innerWidth,
      height:window.innerHeight,
      lll:[],
      svg:null,
      zoom:null
    };
  },
  unmounted(){
    this.cleanupChart()
  },
  mounted() {
   if (this.dataList && this.dataList.length > 0) {
      this.handleData();
    }
    window.addEventListener("resize", this.resizeChart);

    // 绑定缩放行为
    this.zoom = d3.zoom()
      .scaleExtent([1, 15])
      .translateExtent([[0, 0], [this.width, this.height]])
      .on("zoom", this.zoomed);

    this.svg = d3.select(`#d3-${this.id} svg`);
    this.svg.call(this.zoom);
    
  },
  computed: {   
    language() {
      return language[this.$store.state.language]
    }, 

  },
  watch: { 
    "virableNo":function(){
      this.cleanupChart()
      this.handleData()

       // 手动清理旧的 values 数组
    this.keys.forEach((key) => {
      const values = this.dataList.map((d) => ({ acqTime: d.acqTime, value: d[key], key }));
      values.length = 0; // 手动释放 values 数组
    });
    },
    "emptyKey":function(){
        d3.selectAll('svg').remove();
    },
    // dataList(){
    //   this.handleData()
    // },
    "id":function(){
      this.handleData() 
    },
    "$store.state.language": function () { 
      this.resizeChart()
      this.renderChart()
    },
    keys(newKeys, oldKeys) {
      let previousSelections = new Set(this.displayedLines);
      
      // 保留用户隐藏的 keys，不让它们重新出现
      let hiddenKeys = new Set(oldKeys.filter(key => !previousSelections.has(key)));
  
      // 只添加新增的 keys，保留用户选中的，避免覆盖手动隐藏的项
      this.displayedLines = newKeys.filter(key => !hiddenKeys.has(key));
    }
  }, 
  
  methods: {
    cleanupChart() {
      d3.select(`#d3-${this.id}`).selectAll("*").remove();
      window.removeEventListener("resize", this.resizeChart);
      if (this.svg) {
        this.svg.on(".zoom", null);
      }
      if (this.zoom && this.svg) {
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
      }
    },
    renderChart() { 
      let that = this
      const margin = { top: 200, right: 30, bottom: 120, left: 60 };
      const width = 1600 - margin.left - margin.right;
      // const width = this.width - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;
      // const height = this.height - margin.top - margin.bottom;
      const legendHeight = 80;
      
      // 清空之前的图表内容 
      d3.select(`#d3-${this.id}`).html("");
    
      const svg = d3
        .select(`#d3-${this.id}`)
        .append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom + legendHeight)
        .attr("preserveAspectRatio", "xMidYMid meet") // 保持宽高比
        .style("width", "100%") // 宽度自适应
        .style("height", "auto") // 高度自动调整
        .style("background-color", "white")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + legendHeight}`)

        const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");
        const x = d3
          .scaleTime()
          // .scaleUtc()
          .domain(d3.extent(this.dataList, (d) => new Date(d.acqTime)))
          .range([0, width]);
      
        // var xAxis4 = d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d)))
        
        const chartGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`)
          
        
        const y = d3
          .scaleLinear()
          .domain([
            d3.min(this.dataList, (d) => d3.min(this.keys, (key) => d[key])),
            d3.max(this.dataList, (d) => d3.max(this.keys, (key) => d[key])),
          ])
          .range([height, 0]);
      
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        chartGroup.append("g")
        .call(d3.axisLeft(y)
          .ticks(5) // 调整 Y 轴刻度数量
        )
        .call((g) => g.select(".domain").remove()) // 移除主轴线
        .call((g) =>
          g.selectAll(".tick line")
            .clone() // 克隆刻度线
            .attr("x2", width) // 延伸到图表宽度
            .attr("stroke-opacity", 0.5) // 设置透明度
            .attr("stroke", "#e0e0e0") // 设置网格线颜色
        )
        // 自定义 Y 轴刻度文字样式
        .call((g) =>
          g.selectAll(".tick text") // 选择所有刻度文字
            .style("font-size", "14px") // 设置文字大小
            .style("fill", "#6e7079") // 设置文字颜色
        );
      
        chartGroup.append("text")
        .attr("x", -margin.left + 45)
        .attr("y", -15)
        .attr("fill", "#686868") // 可替换为具体颜色值
        .attr("text-anchor", "start")
        .text("℃"); // 替换为你的 Y 轴标题
      
      
        // 绘制线条
        const line = d3
          .line()
          .x((d) => x(new Date(d.acqTime)))
          .y((d) => y(d.value));
        const maxLength = 380
        const lines = chartGroup.selectAll(".line")
        .data(this.keys.map((key) => ({
          key,
          values: this.dataList.slice(-maxLength).map((d) => ({ acqTime: d.acqTime, value: d[key],key })),
          
        })))
        // .enter()
   
        // .append("path") 
        // .attr("class", "line")
        // .attr("d", (d) => line(d.values))
        // .style("stroke", (d) => colorScale(d.key))
        // .style("fill", "none")
        // .style("stroke-width", 1.5) 
        // .style("display", (d) => (this.displayedLines.includes(d.key) ? null : "none")); // 初始控制显示
        
        lines.exit().remove()

        lines.enter()
          .append("path") 
          .attr("class", "line")
          .attr("d", (d) => line(d.values))
          .style("stroke", (d) => colorScale(d.key))
          .style("fill", "none")
          .style("stroke-width", 1.5) 
          .style("display", (d) => (this.displayedLines.includes(d.key) ? null : "none")); // 初始控制显示


       // 图例 
        const legendGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${height + margin.top - 540})`);
        const maxLegendWidth = width
        const legendItemWidth = 135
        const itemsPerRow = Math.floor(maxLegendWidth / legendItemWidth)
      
      
        const legend = legendGroup.selectAll(".legend-item")
        .data(that.keys)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${(i % itemsPerRow) * legendItemWidth}, ${Math.floor(i / itemsPerRow) * 20})`)
      
        .style("cursor", "pointer")
        .on("click", function (event, key) {
          const isDisplayed = that.displayedLines.includes(key);
      
          // 更新 displayedLines
          if (isDisplayed) {
            that.displayedLines = that.displayedLines.filter((line) => line !== key);
          } else {
            that.displayedLines.push(key);
          }
          
          // 更新曲线和 legend 样式
          chartGroup.selectAll(".line")
            .style("display", (d) => (that.displayedLines.includes(d.key) ? null : "none"));
      
          updateLegendStyles();
        });
      
        legend.append("rect")
        .attr("class", "legend-clickable-area")
        .attr("x", -10)  // 向左扩展点击区域
        .attr("y", -10)  // 向上扩展点击区域
        .attr("width",  50) // 宽度略大于 legendItem
        .attr("height", 50) // 高度略大于文字和圆圈的区域
        .style("fill", "transparent") // 透明
        .style("cursor", "pointer")
        .style("pointer-events", "all")
  

        legend.append("circle")
          .attr("class", "legend-color")
          .attr("r", 7) // 半径
          .attr("cx", 3) // 圆心 X 坐标
          .attr("cy", 0) // 圆心 Y 坐标
          .attr("fill", "none") // 中空
          .attr("stroke-width", 2)// 圆环线宽
          .style("stroke", (d) => (this.displayedLines.includes(d) ? colorScale(d) : "#ccc"))
          .style("pointer-events", "all")
        
        legend.append("text")
          .attr("class", "legend-text")
          .attr("x", 15)
          .attr("y", 0)
          .text((d) => d)
          .style("font-size", "14px")
          .style("alignment-baseline", "middle")
          .style("fill", (d) => (this.displayedLines.includes(d) ? "#686868" : "#ccc"));
        
        // 更新 Legend 样式
        function updateLegendStyles() {
          legend.selectAll(".legend-color")
            .style("stroke", (d) => (that.displayedLines.includes(d) ? colorScale(d) : "#ccc"));
          legend.selectAll(".legend-text")
            .style("fill", (d) => (that.displayedLines.includes(d) ? "#686868" : "#ccc"));
        }
        
        
        
        
        
        
        
        // 添加反选图标组
        const toggleGroup = svg.append("g")
          .attr("class", "legend-toggle-group")
          .attr("transform", `translate(${width - margin.right - 0}, ${margin.top - 50})`)
          .style("cursor", "pointer")
          .on("mouseover", function () {
            // 图标和文字变成蓝色，显示反选文字
            d3.select(this).select("path").attr("fill", "#409EFF");
            d3.select(this).select("text").attr("fill", "#409EFF").style("display", "block");
          })
          .on("mouseout", function () {
            // 图标和文字恢复原始颜色，隐藏反选文字
            d3.select(this).select("path").attr("fill", "#686868");
            d3.select(this).select("text").attr("fill", "#686868").style("display", "none");
          })
          .on("click", () => {
            // 反选逻辑
            const selectedKeys = that.displayedLines;
            const allKeys = that.keys;
        
            that.displayedLines = allKeys.filter((key) => !selectedKeys.includes(key));
        
            chartGroup.selectAll(".line")
              .style("display", (d) => (that.displayedLines.includes(d.key) ? null : "none"));
        
            updateLegendStyles();
          });
        
        // 自定义图标 (例如箭头)
        toggleGroup.append("path")
          .attr("d", "M949.333333 424.533333h-874.666666c-12.8 0-23.466667-8.533333-29.866667-19.2-4.266667-12.8-2.133333-25.6 6.4-36.266666l149.333333-166.4c12.8-12.8 32-14.933333 44.8-2.133334 12.8 12.8 12.8 34.133333 2.133334 46.933334L149.333333 356.266667h802.133334c17.066667 0 32 14.933333 32 34.133333-2.133333 19.2-17.066667 34.133333-34.133334 34.133333zM74.666667 599.466667h874.666666c12.8 0 23.466667 8.533333 29.866667 19.2 4.266667 12.8 2.133333 25.6-6.4 36.266666l-149.333333 166.4c-12.8 12.8-32 14.933333-44.8 2.133334-12.8-12.8-12.8-34.133333-2.133334-46.933334l98.133334-108.8H74.666667c-17.066667 0-32-14.933333-32-34.133333 0-19.2 14.933333-34.133333 32-34.133333z") // 简单三角形图标
          .attr("fill", "#686868")
          .attr("transform", "scale(0.022)");
        
        // 悬停显示文字
        toggleGroup.append("text")
          .attr("x", 10)
          .attr("y", 40)
          .attr("text-anchor", "middle")
          .attr("fill", "#686868")
          .style("font-size", "12px")
          .style("display", "none") // 初始隐藏
          .text(that.language.ui.toggleSelection);
        
          toggleGroup.append("rect")
          .attr("x", -30)  // 在按钮的左边稍微扩展一点
          .attr("y", -20)  // 在按钮的上边稍微扩展一点
          .attr("width", 80) // 调整为适当的宽度
          .attr("height", 70) // 调整为适当的高度
          .attr("fill", "transparent"); // 透明背景
        
        
        
        
          // 鼠标交互功能
        const focusGroup = chartGroup
          .append("g")
          .style("display", "none");
        
        // 添加一个中空圆环
        focusGroup
          .append("circle")
          .attr("r", 3)
          .style("fill", "#000")
          // .style("stroke", "#000")
          .style("stroke-width", 1.5);
        
        // 添加背景框
        focusGroup
          .append("rect")
          .attr("class", "tooltip-box")
          .attr("width", 340) // 设置宽度
          .attr("height", 40) // 设置高度
          .attr("x", 10) // 设置背景框偏移
          .attr("y", -20) // 设置背景框偏移
          .attr("rx", 4) // 圆角
          .attr("ry", 4) // 圆角
          .attr("fill", "white") // 背景为白色
          .attr("stroke", "#ccc") // 边框颜色
          .attr("stroke-width", 1)
          .style("opacity", 1);
        
        // 添加文字
        focusGroup
          .append("text")
          .attr("class", "tooltip-text")
          .attr("x", 15) // 文本位置相对框内左上角偏移
          .attr("y", 20)
          .style("font-size", "14px")
          .style("fill", "#686868")
          .attr("dy","0.7em")
        
        const xAxisGroup = chartGroup
          .append("g")
          .style("font-size", "14px")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
          .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
           // 选择刻度文本并进行旋转
          xAxisGroup
            .selectAll("text")
            .style("text-anchor", "end") 
            .style("fill", "#6e7079") // 设置文字颜色
            .attr("transform", "rotate(-25)") 
            .attr("dx", "-0.8em") 
            .attr("dy", "0.15em"); 

          //   // 添加百分比条
          //   const progressBarGroup = svg.append("g").attr("class", "progress-bar-group");
          
          //   progressBarGroup
          //     .append("rect")
          //     .attr("x", margin.left)
          //     .attr("y", margin.top + 430) // 进度条在图表顶部
          //     // .attr("transform", `translate(${width - margin.right - 0}, ${margin.top - 50})`)
          //     .attr("width", width)
          //     .attr("height", 10)
          //     .attr("fill", "#e0e0e0"); // 背景颜色
          
          //   const progressBar = progressBarGroup
          //     .append("rect")
          //     .attr("x", margin.left)
          //     .attr("y", margin.top + 430)
          //     .attr("width", width) // 初始为 100%
          //     .attr("height", 10)
          //     .attr("fill", "#409EFF"); // 前景颜色
          
          //   const progressText = progressBarGroup
          //     .append("text")
          //     .attr("x", width + margin.left - 10)
          //     .attr("y", margin.top + 425)
          //     .attr("text-anchor", "end")
          //     .style("font-size", "14px")
          //     .style("fill", "#409EFF")
          //     .text("100%"); // 初始显示 100
          
          //   // 添加拖动行为到百分比条
          // const dragBehavior = d3
          //   .drag()
          //   .on("start", () => {
          //     d3.select(".progress-bar").style("cursor", "grabbing"); // 改变鼠标样式
          //   })
          //   .on("drag", (event) => {
          //     const dx = event.dx; // 拖动的水平位移
          //     const progressBarWidth = parseFloat(progressBar.attr("width"));
          //     const progressBarX = parseFloat(progressBar.attr("x"));
          
          //     // 限制拖动范围
          //     const newX = Math.min(
          //       Math.max(progressBarX + dx, margin.left),
          //       margin.left + width - progressBarWidth
          //     );
          
          //     progressBar.attr("x", newX); // 更新百分比条的位置
          
          //     // 根据拖动条的位置计算新的比例尺范围
          //     const barStartRatio = (newX - margin.left) / width; // 当前进度条起点的比例
          //     const barEndRatio = (newX + progressBarWidth - margin.left) / width; // 当前进度条终点的比例
          
          //     const newDomain = [
          //       new Date(
          //         xOriginal.domain()[0].getTime() +
          //           barStartRatio * (xOriginal.domain()[1] - xOriginal.domain()[0])
          //       ),
          //       new Date(
          //         xOriginal.domain()[0].getTime() +
          //           barEndRatio * (xOriginal.domain()[1] - xOriginal.domain()[0])
          //       ),
          //     ];
          
          //     x.domain(newDomain); // 更新比例尺范围
          
          //     // 更新 X 轴
          //     xAxisGroup.call(
          //       d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)
          //     );
          //     // 定义时间格式化规则
          //   const timeFormat = d3.timeFormat("%Y/%m/%d %H:%M:%S");
          
          //   // xAxisGroup.call(
          //   //   d3.axisBottom(x)
          //   //     .ticks(width / 80)
          //   //     .tickFormat(timeFormat)
          //   //     .tickSizeOuter(0)
                
          //   // );
          //   xAxisGroup.call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
          //     // 更新线条路径
          //     chartGroup.selectAll(".line").attr("d", (d) =>
          //       d3
          //         .line()
          //         .x((p) => x(new Date(p.acqTime)))
          //         .y((p) => y(p.value))(d.values)
          //     );
          //   // 更新 X 轴
          //   xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
          //   .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
          //   // 选择刻度文本并进行旋转
          //   xAxisGroup
          //     .selectAll("text") 
          //     .style("text-anchor", "end") 
          //     .style("fill", "#6e7079") // 设置文字颜色
          //     .attr("transform", "rotate(-25)") 
          //     .attr("dx", "-0.8em") 
          //     .attr("dy", "0.15em");
          //     // 更新百分比文本
          //     const percent = ((progressBarWidth / width) * 100).toFixed(0);
          //     progressText.text(`${percent}%`);
          //   })
          //   .on("end", () => {
          //     d3.select(".progress-bar").style("cursor", "pointer"); // 恢复鼠标样式
          //   });
          
          // // 应用拖动行为到百分比条
          // progressBar.call(dragBehavior);  

          const xOriginal = x.copy()
           // 更新曲线的缩放效果
              // svg.selectAll('.line')
              //   .attr('d', d => line.x(d => newX(new Date(d.acqTime)))(d.values));
                
                // x.domain(newX.domain());
              const zoom = d3.zoom()
              .scaleExtent([1, 15]) // 设置缩放比例 [最小, 最大]
              .translateExtent([[0, 0], [width, height]]) // 设置平移范围
              .on("zoom", zoomed);
          
            // 绑定缩放行为到整个图表
            svg.call(zoom);
          
          let isResetting = false
          function zoomed(event) {
            if(isResetting) return
            const transform = event.transform;
          
            // 使用初始比例尺生成新的比例尺
            const newX = transform.rescaleX(xOriginal);
          
            // 检查是否需要复位
            if (Math.abs(transform.k - 1) < 0.01) {
              isResetting = true; // 设置标志位，防止递归
              resetZoom(); // 执行复位逻辑
              isResetting = false; // 恢复标志位
              return;
            }
            // 限制 domain 避免时间偏移
            const clampedDomain = [
              Math.max(xOriginal.domain()[0].getTime(), newX.domain()[0].getTime()),
              Math.min(xOriginal.domain()[1].getTime(), newX.domain()[1].getTime())
            ].map((d) => new Date(d));
          
            x.domain(clampedDomain);
          
            // 定义时间格式化规则
            const timeFormat = d3.timeFormat("%Y/%m/%d %H:%M:%S");
          
            // xAxisGroup.call(
            //   d3.axisBottom(x)
            //     .ticks(width / 80)
            //     .tickFormat(timeFormat)
            //     .tickSizeOuter(0)
                
            // );
            xAxisGroup.call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
          
            // 更新线条路径
            chartGroup.selectAll(".line")
              .attr("d", (d) =>
                d3.line()
                  .x((p) => x(new Date(p.acqTime)))
                  .y((p) => y(p.value))(d.values)
              );
          
            // 更新 X 轴
            xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
            // 选择刻度文本并进行旋转
            xAxisGroup
              .selectAll("text")
              .style("text-anchor", "end") 
              .style("fill", "#6e7079") // 设置文字颜色
              .attr("transform", "rotate(-25)") 
              .attr("dx", "-0.8em") 
              .attr("dy", "0.15em"); 
          
            // // 更新百分比条
            //     const [start, end] = newX.domain(); // 当前缩放后的时间范围
            //     const totalRange = xOriginal.domain(); // 原始数据范围
            //     const percent =
            //       ((end - start) / (totalRange[1] - totalRange[0])) * 100; // 百分比计算
          
            //     const barStart = (start - totalRange[0]) / (totalRange[1] - totalRange[0]); // 开始位置比例
            //     const barWidth = percent / 100; // 宽度比例
          
            //     progressBar
            //       .attr("x", margin.left + barStart * width) // 动态设置位置
            //       .attr("width", barWidth * width); // 动态设置宽度
                  
            //     progressText.text(`${Math.round(percent)}%`); // 更新百分比文字  
            // 更新鼠标悬停功能
            updateMouseHover(newX);
          }
          
          function updateMouseHover(newX) {
            chartGroup.selectAll("rect")
              .on("mousemove", function (event) {
                if (that.displayedLines.length === 0) {
                  focusGroup.style("display", "none");
                  return;
                }
          
                const mouse = d3.pointer(event); // 获取鼠标位置
                const xValue = newX.invert(mouse[0]); // 使用动态比例尺计算时间
          
                let nearestLine = null;
                let nearestDist = Infinity;
                let closestPoint = null;
          
                // 遍历所有显示的曲线，找到最近的点
                lines.filter((d) => that.displayedLines.includes(d.key)).each(function (d) {
                  const index = d3.bisector((d) => new Date(d.acqTime)).center(d.values, xValue);
                  const point = d.values[index];
                  const dist = Math.hypot(newX(new Date(point.acqTime)) - mouse[0], y(point.value) - mouse[1]);
          
                  if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestLine = this;
                    closestPoint = point;
                  }
                });
          
                if (closestPoint) {
                  focusGroup.style("display", null);
          
                  // 高亮最近的曲线
                  lines.style("opacity", 0.2);
                  d3.select(nearestLine).style("opacity", 1);
          
                  // Tooltip 位置
                  const tooltipWidth = 280;
                  const tooltipHeight = 50;
                  const tooltipXOffset = 10;
          
                  let tooltipX = newX(new Date(closestPoint.acqTime)) + tooltipXOffset;
                  let tooltipY = y(closestPoint.value) - tooltipHeight / 2;
          
                  // 检测是否超出边界
                  if (tooltipX + tooltipWidth > width) {
                    tooltipX = newX(new Date(closestPoint.acqTime)) - tooltipXOffset - tooltipWidth - 60;
                  }
                  if (tooltipX < 0) {
                    tooltipX = tooltipXOffset;
                  }
                  if (tooltipY < 0) {
                    tooltipY = 0;
                  } else if (tooltipY + tooltipHeight > height) {
                    tooltipY = height - tooltipHeight;
                  }
          
                  focusGroup
                    .attr("transform", `translate(${newX(new Date(closestPoint.acqTime))}, ${y(closestPoint.value)})`);
          
                  focusGroup.select(".tooltip-box")
                    .attr("x", tooltipX - newX(new Date(closestPoint.acqTime)))
                    .attr("y", tooltipY - y(closestPoint.value));
          
                  focusGroup.select(".tooltip-text")
                    .attr("x", tooltipX - newX(new Date(closestPoint.acqTime)) + 5)
                    .attr("y", tooltipY - y(closestPoint.value) + 15)
                    .text(
                      `${closestPoint.key} : ${d3.timeFormat("%Y-%m-%d %H:%M:%S")(new Date(closestPoint.acqTime))}\n` +
                      `, ${closestPoint.value}`
                    );
                } else {
                  focusGroup.style("display", "none");
                }
              })
              .on("mouseout", function () {
                focusGroup.style("display", "none");
                lines.style("opacity", 1);
              });
          }
          
          
          function resetZoom() {
            // 手动复位比例尺
            x.domain(xOriginal.domain());
          
            // 更新 X 轴
            xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
            // 选择刻度文本并进行旋转
            xAxisGroup
              .selectAll("text")
              .style("text-anchor", "end") 
              .style("fill", "#6e7079") // 设置文字颜色
              .attr("transform", "rotate(-25)") 
              .attr("dx", "-0.8em") 
              .attr("dy", "0.15em"); 
          
            // 更新曲线
            chartGroup.selectAll(".line")
              .attr("d", (d) =>
                d3.line()
                  .x((p) => x(new Date(p.acqTime)))
                  .y((p) => y(p.value))(d.values)
              );
          
            // 使用 `zoom.transform` 重置缩放行为，不触发事件
            svg.call(
              zoom.transform,
              d3.zoomIdentity.translate(0, 0).scale(1) // 重置到初始状态
            );
            
            //   // 重置百分比条
            // progressBar
            //   .attr("x", margin.left) // 起点重置为 0
            //   .attr("width", width); // 宽度重置为 100%
          
            // progressText.text("100%"); // 重置文字
            // 更新鼠标悬停功能
          updateMouseHover(xOriginal);
        }

        d3.select("body")
          .append("button")
          .text("复位缩放")
          .on("click", resetZoom);
        
        
        // 添加复位功能
        svg.on("dblclick", () => {
          svg.transition().duration(500).call(
            zoom.transform,
            d3.zoomIdentity // 重置为初始状态
          );
        });
        
        chartGroup
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", () => focusGroup.style("display", null))
          .on("mousemove", function (event) {
          if (that.displayedLines.length === 0) {
            focusGroup.style("display", "none");
            return;
          }
        
          const mouse = d3.pointer(event);
          const xValue = x.invert(mouse[0]);
        
          let nearestLine = null;
          let nearestDist = Infinity;
          let closestPoint = null;
          // 仅检查显示的曲线
          lines.filter((d) => that.displayedLines.includes(d.key)).each(function (d) {
            const index = d3.bisector((d) => new Date(d.acqTime)).center(d.values, xValue);
            const point = d.values[index];
            const dist = Math.hypot(x(new Date(point.acqTime)) - mouse[0], y(point.value) - mouse[1]);
        
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestLine = this;
              closestPoint = point;
            }
          });
        
          if (closestPoint) {
            focusGroup.style("display", null);
        
            // 高亮最近的曲线
            lines.style("opacity", 0.2);
            d3.select(nearestLine).style("opacity", 1);
        
            const tooltipWidth = 280; // 背景框的宽度
            const tooltipHeight = 50; // 背景框的高度
            const tooltipXOffset = 10; // X 方向上的偏移量
        
            let tooltipX = x(new Date(closestPoint.acqTime)) + tooltipXOffset;
            let tooltipY = y(closestPoint.value) - tooltipHeight / 2;
        
            // 检测是否超出右边界
            if (tooltipX + tooltipWidth > width) {
              tooltipX = x(new Date(closestPoint.acqTime)) - tooltipXOffset - tooltipWidth - 60;
            }
        
            // 检测是否超出左边界
            if (tooltipX < 0) {
              tooltipX = tooltipXOffset;
            }
        
            // 检测是否超出顶部或底部
            if (tooltipY < 0) {
              tooltipY = 0;
            } else if (tooltipY + tooltipHeight > height) {
              tooltipY = height - tooltipHeight;
            }
        
            focusGroup
              .attr("transform", `translate(${x(new Date(closestPoint.acqTime))}, ${y(closestPoint.value)})`);
        
            focusGroup.select(".tooltip-box")
              .attr("x", tooltipX - x(new Date(closestPoint.acqTime)))
              .attr("y", tooltipY - y(closestPoint.value));
        
            focusGroup.select(".tooltip-text")
              .attr("x", tooltipX - x(new Date(closestPoint.acqTime)) + 5)
              .attr("y", tooltipY - y(closestPoint.value) + 15)
              .text(
                `${closestPoint.key} : ${d3.timeFormat("%Y-%m-%d %H:%M:%S")(new Date(closestPoint.acqTime))}\n` +
                `, ${closestPoint.value}\n `
              );
          } else {
            focusGroup.style("display", "none");
          }
        })
        .on("mouseout", function () {
          focusGroup.style("display", "none");
          lines.style("opacity", 1);
        });   
    },
    resizeChart() {
    const container = d3.select(`#d3-${this.id}`);
    if (!container.node()) {
      console.error(`Container #d3-${this.id} not found`);
      return;
    }

    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;
    // const containerWidth = this.innerWidth
    // const containerHeight = this.inner
    
    d3.select(`#d3-${this.id} svg`)
      .attr("width", containerWidth)
      .attr("height", containerHeight);
  },
    handleData() { 
      this.$nextTick(() => {
        if (this.id == 1) {
          // 记录用户手动隐藏的项
          let hiddenKeys = new Set(this.keys.filter(key => !this.displayedLines.includes(key)));
    
          // 计算新的 keys
          this.keys = Object.keys(this.dataList[0])
            .filter((key) => key.startsWith('z') && this.dataList[0][key] !== null);
    
          // 更新 displayedLines，保留已选中的，并添加新 key，但不影响手动隐藏的
          this.displayedLines = this.keys.filter(key => !hiddenKeys.has(key));
    
          this.renderChart();
        } else if (this.id == 2) {
          this.keys2 = Object.keys(this.dataList[0])
            .filter((key) => key.startsWith('frontOxa') || key.startsWith('rearOxa'));
          this.renderChart2();
        }
      });
    },
 

   renderChart2() { 
   
  if(!this.displayedLines2 || this.displayedLines2.length === 0){
    this.displayedLines2 = [...this.keys2]
  }
  let that = this
  const margin = { top: 200, right: 30, bottom: 120, left: 60 };
  const width = 1600 - margin.left - margin.right;
  // const width = this.width - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  // const height = this.height - margin.top - margin.bottom;
  const legendHeight = 80;
  
  // 清空之前的图表内容
  d3.select(`#d3-${this.id}`).html("");

  const svg = d3
    .select(`#d3-${this.id}`)
    .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom + legendHeight)
    .attr("preserveAspectRatio", "xMidYMid meet") // 保持宽高比
    .style("width", "100%") // 宽度自适应
    .style("height", "auto") // 高度自动调整
    .style("background-color", "white")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + legendHeight}`)
  


const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");



  const x = d3
    .scaleTime()
    // .scaleUtc()
    .domain(d3.extent(this.dataList, (d) => new Date(d.acqTime)))
    .range([0, width]);

  // var xAxis4 = d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d)))
  
  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    
  
  const y = d3
    .scaleLinear()
    .domain([
      d3.min(this.dataList, (d) => d3.min(this.keys2, (key) => d[key])),
      d3.max(this.dataList, (d) => d3.max(this.keys2, (key) => d[key])),
    ])
    .range([height, 0]);
  
   

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  chartGroup.append("g")
  .call(d3.axisLeft(y)
    .ticks(5) // 调整 Y 轴刻度数量
  )
  .call((g) => g.select(".domain").remove()) // 移除主轴线
  .call((g) =>
    g.selectAll(".tick line")
      .clone() // 克隆刻度线
      .attr("x2", width) // 延伸到图表宽度
      .attr("stroke-opacity", 0.5) // 设置透明度
      .attr("stroke", "#e0e0e0") // 设置网格线颜色
  )
   // 自定义 Y 轴刻度文字样式
  .call((g) =>
    g.selectAll(".tick text") // 选择所有刻度文字
      .style("font-size", "14px") // 设置文字大小
      .style("fill", "#6e7079") // 设置文字颜色
  );

  chartGroup.append("text")
  .attr("x", -margin.left + 45)
  .attr("y", -15)
  .attr("fill", "#686868") // 可替换为具体颜色值
  .attr("text-anchor", "start")
  .style("font-size", "14px")
  .text("ppm"); // 替换为你的 Y 轴标题


  // 绘制线条
  const line = d3
    .line()
    .x((d) => x(new Date(d.acqTime)))
    .y((d) => y(d.value));

  const lines = chartGroup.selectAll(".line")
  .data(this.keys2.map((key) => ({
    key,
    values: this.dataList.map((d) => ({ acqTime: d.acqTime, value: d[key],key })),
    
  })))
  .enter()
  .append("path")
  .attr("class", "line")
  .attr("d", (d) => line(d.values))
  .style("stroke", (d) => colorScale(d.key))
  .style("fill", "none")
  .style("stroke-width", 1.5)
  .style("display", (d) => (this.displayedLines2.includes(d.key) ? null : "none")); // 初始控制显示

  //图例
  const maxLegendWidth = width; // 最大宽度
  const legendItemWidth = 110; // 单个图例宽度
  const itemsPerRow = Math.floor(maxLegendWidth / legendItemWidth); // 每行图例数量

  const legendGroup = svg
  .append("g")
  .attr("transform", () => {
    // 计算总图例宽度和居中偏移
    const totalLegendWidth = Math.min(that.keys2.length, itemsPerRow) * legendItemWidth;
    const xOffset = (width - totalLegendWidth) / 2; // 居中偏移量
    const yOffset = height + margin.top - 550; // 图例的初始 y 偏移量
    return `translate(${xOffset}, ${yOffset})`;
  });



  const legend = legendGroup.selectAll(".legend-item")
    .data(that.keys2)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => 
      `translate(${(i % itemsPerRow) * legendItemWidth}, ${Math.floor(i / itemsPerRow) * 20})`
    )
    .style("cursor", "pointer")
    .on("click", function (event, key) {
      const isDisplayed = that.displayedLines2.includes(key);
  
      // 更新 displayedLines
      if (isDisplayed) {
        that.displayedLines2 = that.displayedLines2.filter((line) => line !== key);
      } else {
        that.displayedLines2.push(key);
      }
  
      // 更新曲线和图例样式
      chartGroup.selectAll(".line")
        .style("display", (d) => (that.displayedLines2.includes(d.key) ? null : "none"));
  
      updateLegendStyles();
    });
  
  legend.append("circle")
    .attr("class", "legend-color")
    .attr("r", 7) // 半径
    .attr("cx", 3) // 圆心 X 坐标
    .attr("cy", 0) // 圆心 Y 坐标
    .attr("fill", "none") // 中空
    .attr("stroke-width", 2) // 圆环线宽度
    .style("stroke", (d) => (this.displayedLines2.includes(d) ? colorScale(d) : "#ccc"))
    .style("pointer-events", "all")

    legend.append("rect")
  .attr("class", "legend-clickable-area")
  .attr("x", -10)  // 向左扩展点击区域
  .attr("y", -10)  // 向上扩展点击区域
  .attr("width", 50) // 宽度略大于 legendItem
  .attr("height", 50) // 高度略大于文字和圆圈的区域
  .style("fill", "transparent") // 透明
  .style("cursor", "pointer")
  .style("pointer-events", "all")
  
  legend.append("text")
    .attr("class", "legend-text")
    .attr("x", 15)
    .attr("y", 0)
    .text((d) => d)
    .style("font-size", "14px")
    .style("alignment-baseline", "middle")
    .style("fill", (d) => (this.displayedLines2.includes(d) ? "#686868" : "#ccc"));
  
  // 更新 Legend 样式
  function updateLegendStyles() {
    legend.selectAll(".legend-color")
      .style("stroke", (d) => (that.displayedLines2.includes(d) ? colorScale(d) : "#ccc"));
    legend.selectAll(".legend-text")
      .style("fill", (d) => (that.displayedLines2.includes(d) ? "#686868" : "#ccc"));
  }

  // 鼠标交互功能
const focusGroup = chartGroup
  .append("g")
  .style("display", "none");

// 添加一个中空圆环
focusGroup
  .append("circle")
  .attr("r", 3)
  .style("fill", "#000")
  // .style("stroke", "#000")
  .style("stroke-width", 1.5);

// 添加背景框
focusGroup
  .append("rect")
  .attr("class", "tooltip-box")
  .attr("width", 340) // 设置宽度
  .attr("height", 40) // 设置高度
  .attr("x", 10) // 设置背景框偏移
  .attr("y", -20) // 设置背景框偏移
  .attr("rx", 4) // 圆角
  .attr("ry", 4) // 圆角
  .attr("fill", "white") // 背景为白色
  .attr("stroke", "#ccc") // 边框颜色
  .attr("stroke-width", 1)
  .style("opacity", 1);

// 添加文字
focusGroup
  .append("text")
  .attr("class", "tooltip-text")
  .attr("x", 15) // 文本位置相对框内左上角偏移
  .attr("y", 20)
  .style("font-size", "14px")
  .style("fill", "#686868")
  .attr("dy","0.7em")

const xAxisGroup = chartGroup
  .append("g")
  .style("font-size", "14px")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
  .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
// 选择刻度文本并进行旋转
  xAxisGroup
    .selectAll("text")
    .style("text-anchor", "end") 
    .style("fill", "#6e7079") // 设置文字颜色
    .attr("transform", "rotate(-25)") 
    .attr("dx", "-0.8em") 
    .attr("dy", "0.15em"); 
//   // 添加百分比条
//   const progressBarGroup = svg.append("g").attr("class", "progress-bar-group");

//   progressBarGroup
//     .append("rect")
//     .attr("x", margin.left)
//     .attr("y", margin.top + 430) // 进度条在图表顶部
//     // .attr("transform", `translate(${width - margin.right - 0}, ${margin.top - 50})`)
//     .attr("width", width)
//     .attr("height", 10)
//     .attr("fill", "#e0e0e0"); // 背景颜色

//   const progressBar = progressBarGroup
//     .append("rect")
//     .attr("x", margin.left)
//     .attr("y", margin.top + 430)
//     .attr("width", width) // 初始为 100%
//     .attr("height", 10)
//     .attr("fill", "#409EFF"); // 前景颜色

//   const progressText = progressBarGroup
//     .append("text")
//     .attr("x", width + margin.left - 10)
//     .attr("y", margin.top + 425)
//     .attr("text-anchor", "end")
//     .style("font-size", "14px")
//     .style("fill", "#409EFF")
//     .text("100%"); // 初始显示 100

//   // 添加拖动行为到百分比条
// const dragBehavior = d3
//   .drag()
//   .on("start", () => {
//     d3.select(".progress-bar").style("cursor", "grabbing"); // 改变鼠标样式
//   })
//   .on("drag", (event) => {
//     const dx = event.dx; // 拖动的水平位移
//     const progressBarWidth = parseFloat(progressBar.attr("width"));
//     const progressBarX = parseFloat(progressBar.attr("x"));

//     // 限制拖动范围
//     const newX = Math.min(
//       Math.max(progressBarX + dx, margin.left),
//       margin.left + width - progressBarWidth
//     );

//     progressBar.attr("x", newX); // 更新百分比条的位置

//     // 根据拖动条的位置计算新的比例尺范围
//     const barStartRatio = (newX - margin.left) / width; // 当前进度条起点的比例
//     const barEndRatio = (newX + progressBarWidth - margin.left) / width; // 当前进度条终点的比例

//     const newDomain = [
//       new Date(
//         xOriginal.domain()[0].getTime() +
//           barStartRatio * (xOriginal.domain()[1] - xOriginal.domain()[0])
//       ),
//       new Date(
//         xOriginal.domain()[0].getTime() +
//           barEndRatio * (xOriginal.domain()[1] - xOriginal.domain()[0])
//       ),
//     ];

//     x.domain(newDomain); // 更新比例尺范围

//     // 更新 X 轴
//     xAxisGroup.call(
//       d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)
//     );
//     // 定义时间格式化规则
//   const timeFormat = d3.timeFormat("%Y/%m/%d %H:%M:%S");

//   // xAxisGroup.call(
//   //   d3.axisBottom(x)
//   //     .ticks(width / 80)
//   //     .tickFormat(timeFormat)
//   //     .tickSizeOuter(0)
      
//   // );
//   xAxisGroup.call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
//     // 更新线条路径
//     chartGroup.selectAll(".line").attr("d", (d) =>
//       d3
//         .line()
//         .x((p) => x(new Date(p.acqTime)))
//         .y((p) => y(p.value))(d.values)
//     );
//   // 更新 X 轴
//   xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
//   .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
//   // 选择刻度文本并进行旋转
//   xAxisGroup
//     .selectAll("text") 
//     .style("text-anchor", "end") 
//     .style("fill", "#6e7079") // 设置文字颜色
//     .attr("transform", "rotate(-25)") 
//     .attr("dx", "-0.8em") 
//     .attr("dy", "0.15em");
//     // 更新百分比文本
//     const percent = ((progressBarWidth / width) * 100).toFixed(0);
//     progressText.text(`${percent}%`);
//   })
//   .on("end", () => {
//     d3.select(".progress-bar").style("cursor", "pointer"); // 恢复鼠标样式
//   });

// // 应用拖动行为到百分比条
// progressBar.call(dragBehavior);  

const xOriginal = x.copy()

    const zoom = d3.zoom()
    .scaleExtent([1, 15]) // 设置缩放比例 [最小, 最大]
    .translateExtent([[0, 0], [width, height]]) // 设置平移范围
    .on("zoom", zoomed);

  // 绑定缩放行为到整个图表
  svg.call(zoom);


let isResetting = false
function zoomed(event) {
  if(isResetting) return
  const transform = event.transform;

  // 使用初始比例尺生成新的比例尺
  const newX = transform.rescaleX(xOriginal);

  // 检查是否需要复位
  if (Math.abs(transform.k - 1) < 0.01) {
    isResetting = true; // 设置标志位，防止递归
    resetZoom(); // 执行复位逻辑
    isResetting = false; // 恢复标志位
    return;
  }
  // 限制 domain 避免时间偏移
  const clampedDomain = [
    Math.max(xOriginal.domain()[0].getTime(), newX.domain()[0].getTime()),
    Math.min(xOriginal.domain()[1].getTime(), newX.domain()[1].getTime())
  ].map((d) => new Date(d));

  x.domain(clampedDomain);

  // 定义时间格式化规则
  const timeFormat = d3.timeFormat("%Y/%m/%d %H:%M:%S");

  // xAxisGroup.call(
  //   d3.axisBottom(x)
  //     .ticks(width / 80)
  //     .tickFormat(timeFormat)
  //     .tickSizeOuter(0)
      
  // );
  xAxisGroup.call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))

  // 更新线条路径
  chartGroup.selectAll(".line")
    .attr("d", (d) =>
      d3.line()
        .x((p) => x(new Date(p.acqTime)))
        .y((p) => y(p.value))(d.values)
    );

  // 更新 X 轴
  xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
  .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
  // 选择刻度文本并进行旋转
  xAxisGroup
    .selectAll("text")
    .style("text-anchor", "end") 
    .style("fill", "#6e7079") // 设置文字颜色
    .attr("transform", "rotate(-25)") 
    .attr("dx", "-0.8em") 
    .attr("dy", "0.15em"); 

// // 更新百分比条
//       const [start, end] = newX.domain(); // 当前缩放后的时间范围
//       const totalRange = xOriginal.domain(); // 原始数据范围
//       const percent =
//         ((end - start) / (totalRange[1] - totalRange[0])) * 100; // 百分比计算

//       const barStart = (start - totalRange[0]) / (totalRange[1] - totalRange[0]); // 开始位置比例
//       const barWidth = percent / 100; // 宽度比例

//       progressBar
//         .attr("x", margin.left + barStart * width) // 动态设置位置
//         .attr("width", barWidth * width); // 动态设置宽度
        
//       progressText.text(`${Math.round(percent)}%`); // 更新百分比文字

  // 更新鼠标悬停功能
  updateMouseHover(newX);
}

function updateMouseHover(newX) {
  chartGroup.selectAll("rect")
    .on("mousemove", function (event) {
      if (that.displayedLines2.length === 0) {
        focusGroup.style("display", "none");
        return;
      }

      const mouse = d3.pointer(event); // 获取鼠标位置
      const xValue = newX.invert(mouse[0]); // 使用动态比例尺计算时间

      let nearestLine = null;
      let nearestDist = Infinity;
      let closestPoint = null;

      // 遍历所有显示的曲线，找到最近的点
      lines.filter((d) => that.displayedLines2.includes(d.key)).each(function (d) {
        const index = d3.bisector((d) => new Date(d.acqTime)).center(d.values, xValue);
        const point = d.values[index];
        const dist = Math.hypot(newX(new Date(point.acqTime)) - mouse[0], y(point.value) - mouse[1]);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestLine = this;
          closestPoint = point;
        }
      });

      if (closestPoint) {
        focusGroup.style("display", null);

        // 高亮最近的曲线
        lines.style("opacity", 0.2);
        d3.select(nearestLine).style("opacity", 1);

        // Tooltip 位置
        const tooltipWidth = 280;
        const tooltipHeight = 50;
        const tooltipXOffset = 10;

        let tooltipX = newX(new Date(closestPoint.acqTime)) + tooltipXOffset;
        let tooltipY = y(closestPoint.value) - tooltipHeight / 2;

        // 检测是否超出边界
        if (tooltipX + tooltipWidth > width) {
          tooltipX = newX(new Date(closestPoint.acqTime)) - tooltipXOffset - tooltipWidth - 60;
        }
        if (tooltipX < 0) {
          tooltipX = tooltipXOffset;
        }
        if (tooltipY < 0) {
          tooltipY = 0;
        } else if (tooltipY + tooltipHeight > height) {
          tooltipY = height - tooltipHeight;
        }

        focusGroup
          .attr("transform", `translate(${newX(new Date(closestPoint.acqTime))}, ${y(closestPoint.value)})`);

        focusGroup.select(".tooltip-box")
          .attr("x", tooltipX - newX(new Date(closestPoint.acqTime)))
          .attr("y", tooltipY - y(closestPoint.value));

        focusGroup.select(".tooltip-text")
          .attr("x", tooltipX - newX(new Date(closestPoint.acqTime)) + 5)
          .attr("y", tooltipY - y(closestPoint.value) + 15)
          .text(
            `${closestPoint.key} : ${d3.timeFormat("%Y-%m-%d %H:%M:%S")(new Date(closestPoint.acqTime))}\n` +
            `, ${closestPoint.value}`
          );
      } else {
        focusGroup.style("display", "none");
      }
    })
    .on("mouseout", function () {
      focusGroup.style("display", "none");
      lines.style("opacity", 1);
    });
}


function resetZoom() {
  // 手动复位比例尺
  x.domain(xOriginal.domain());

  // 更新 X 轴
  xAxisGroup.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
  .call(d3.axisBottom(x).tickFormat((d) => timeFormat(new Date(d))))
  // 选择刻度文本并进行旋转
  xAxisGroup
    .selectAll("text")
    .style("text-anchor", "end") 
    .style("fill", "#6e7079") // 设置文字颜色
    .attr("transform", "rotate(-25)") 
    .attr("dx", "-0.8em") 
    .attr("dy", "0.15em"); 

  // 更新曲线
  chartGroup.selectAll(".line")
    .attr("d", (d) =>
      d3.line()
        .x((p) => x(new Date(p.acqTime)))
        .y((p) => y(p.value))(d.values)
    );

  // 使用 `zoom.transform` 重置缩放行为，不触发事件
  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(0, 0).scale(1) // 重置到初始状态
  );

  //   // 重置百分比条
  // progressBar
  //   .attr("x", margin.left) // 起点重置为 0
  //   .attr("width", width); // 宽度重置为 100%

  // progressText.text("100%"); // 重置文字
  // 更新鼠标悬停功能
  updateMouseHover(xOriginal);
}

d3.select("body")
  .append("button")
  .text("复位缩放")
  .on("click", resetZoom);


// 添加复位功能
svg.on("dblclick", () => {
  svg.transition().duration(500).call(
    zoom.transform,
    d3.zoomIdentity // 重置为初始状态
  );
});

chartGroup
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .on("mouseover", () => focusGroup.style("display", null))
  .on("mousemove", function (event) {
  if (that.displayedLines2.length === 0) {
    focusGroup.style("display", "none");
    return;
  }

  const mouse = d3.pointer(event);
  const xValue = x.invert(mouse[0]);

  let nearestLine = null;
  let nearestDist = Infinity;
  let closestPoint = null;

  // 仅检查显示的曲线
  lines.filter((d) => that.displayedLines2.includes(d.key)).each(function (d) {
    const index = d3.bisector((d) => new Date(d.acqTime)).center(d.values, xValue);
    const point = d.values[index];
    const dist = Math.hypot(x(new Date(point.acqTime)) - mouse[0], y(point.value) - mouse[1]);

    if (dist < nearestDist) {
      nearestDist = dist;
      nearestLine = this;
      closestPoint = point;
    }
  });

  if (closestPoint) {
    focusGroup.style("display", null);

    // 高亮最近的曲线
    lines.style("opacity", 0.2);
    d3.select(nearestLine).style("opacity", 1);

    const tooltipWidth = 280; // 背景框的宽度
    const tooltipHeight = 50; // 背景框的高度
    const tooltipXOffset = 10; // X 方向上的偏移量

    let tooltipX = x(new Date(closestPoint.acqTime)) + tooltipXOffset;
    let tooltipY = y(closestPoint.value) - tooltipHeight / 2;

    // 检测是否超出右边界
    if (tooltipX + tooltipWidth > width) {
      tooltipX = x(new Date(closestPoint.acqTime)) - tooltipXOffset - tooltipWidth - 60;
    }

    // 检测是否超出左边界
    if (tooltipX < 0) {
      tooltipX = tooltipXOffset;
    }

    // 检测是否超出顶部或底部
    if (tooltipY < 0) {
      tooltipY = 0;
    } else if (tooltipY + tooltipHeight > height) {
      tooltipY = height - tooltipHeight;
    }

    focusGroup
      .attr("transform", `translate(${x(new Date(closestPoint.acqTime))}, ${y(closestPoint.value)})`);

    focusGroup.select(".tooltip-box")
      .attr("x", tooltipX - x(new Date(closestPoint.acqTime)))
      .attr("y", tooltipY - y(closestPoint.value));

    focusGroup.select(".tooltip-text")
      .attr("x", tooltipX - x(new Date(closestPoint.acqTime)) + 5)
      .attr("y", tooltipY - y(closestPoint.value) + 15)
      .text(
        `${closestPoint.key} : ${d3.timeFormat("%Y-%m-%d %H:%M:%S")(new Date(closestPoint.acqTime))}\n` +
        `, ${closestPoint.value}\n `
      );
  } else {
    focusGroup.style("display", "none");
  }
})
.on("mouseout", function () {
  focusGroup.style("display", "none");
  lines.style("opacity", 1);
});

  }, 


  }
};
</script>

<style scoped>
#chart {
  font: 14px sans-serif;
}
#legend div {
  cursor: pointer;
  user-select: none;
} 
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  pointer-events: none;
}
</style>