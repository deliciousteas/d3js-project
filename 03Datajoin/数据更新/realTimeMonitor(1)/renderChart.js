dataList=[
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
    ]


    
    const margin = { top: 200, right: 30, bottom: 120, left: 60 };
    const width = 1600 - margin.left - margin.right;
   
    const height = 700 - margin.top - margin.bottom;
   
    const legendHeight = 80;
    
    
  
    const svg = d3
      .select(`#d3-${this.id}`)
      .append("svg")
     
      .attr("preserveAspectRatio", "xMidYMid meet") // 保持宽高比
      .style("width", "100%") // 宽度自适应
      .style("height", "auto") // 高度自动调整
      .style("background-color", "white")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + legendHeight}`)

      const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");
      const x = d3
        .scaleTime()
        .domain(d3.extent(this.dataList, (d) => new Date(d.acqTime)))
        .range([0, width]);
    
      
      
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
        .ticks(5)
      )
      .call((g) => g.select(".domain").remove()) 
      .call((g) =>
        g.selectAll(".tick line")
          .clone() 
          .attr("x2", width) 
          .attr("stroke-opacity", 0.5) 
          .attr("stroke", "#e0e0e0") 
      )
    
      .call((g) =>
        g.selectAll(".tick text")
          .style("font-size", "14px") 
          .style("fill", "#6e7079") 
      );
    
      chartGroup.append("text")
      .attr("x", -margin.left + 45)
      .attr("y", -15)
      .attr("fill", "#686868") // 可替换为具体颜色值
      .attr("text-anchor", "start")
      .text("℃"); // 替换为你的 Y 轴标题
    
    
   
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
      
      // 有bug
      lines.exit().remove()

      lines.enter()
        .append("path") 
        .attr("class", "line")
        .attr("d", (d) => line(d.values))
        .style("stroke", (d) => colorScale(d.key))
        .style("fill", "none")
        .style("stroke-width", 1.5) 
        .style("display", (d) => (this.displayedLines.includes(d.key) ? null : "none")); // 初始控制显示

