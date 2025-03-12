

var svg=d3.select("body").append("svg")
    .attr("width", 500)
    .attr("height", 500);


var rectData =[
    {x:10, y:10, width:100, height:100, color:"red"},
    {x:10, y:120, width:100, height:100, color:"blue"},
    {x:10, y:230, width:100, height:100, color:"green"},
    {x:10, y:340, width:100, height:100, color:"yellow"}
]

//创建矩形:需要绑定数据和rect类型
var rects = svg.selectAll("rect")
    .data(rectData)//绑定之后为每个data point 创建datum
    .enter()
    .append("rect")
    .attr("x", function(d){return d.x;})
    .attr("y", function(d){return d.y;})
    .attr("width", function(d){return d.width;})
    .attr("height", function(d){return d.height;})
    .attr("fill", function(d){return d.color;});

//创建mouseover事件
d3.selectAll("rect")
    .on("mouseover",function(d,i){
    //修改width属性
    currentWidth = d3.select(this).attr("width");
    d3.select(this)
        .transition()
        .duration(1000)
        .attr("width", 200)
        .transition()
        .duration(1000)
        .attr("width", currentWidth);
    })