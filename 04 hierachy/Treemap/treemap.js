const data = {
    name: 'Celtics',
    children: [
      {
        name: 'Guards',
        children: [
          {
            category: 'Guards',
            name: 'Kemba Walker',
            value: 20.4,
          },
          {
            category: 'Guards',
            name: 'Marcus Smart',
            value: 12.9,
          },
          {
            category: 'Guards',
            name: 'Brad Wanamaker',
            value: 6.9,
          },
          {
            category: 'Guards',
            name: 'Tremont Waters',
            value: 3.6,
          },
          {
            category: 'Guards',
            name: 'Carsen Edwards',
            value: 3.3,
          },
          {
            category: 'Guards',
            name: 'Romeo Langford',
            value: 2.5,
          },
        ],
      },
      {
        name: 'Forwards',
        children: [
          {
            category: 'Forwards',
            name: 'Jayson Tatum',
            value: 23.4,
          },
          {
            category: 'Forwards',
            name: 'Jaylen Brown',
            value: 20.3,
          },
          {
            category: 'Forwards',
            name: 'Gordon Hayward',
            value: 17.5,
          },
          {
            category: 'Forwards',
            name: 'Grant Williams',
            value: 3.4,
          },
          {
            category: 'Forwards',
            name: 'Javonte Green',
            value: 3.4,
          },
          {
            category: 'Forwards',
            name: 'Semi Ojeleye',
            value: 3.4,
          },
          {
            category: 'Forwards',
            name: 'Vincent Poirier',
            value: 1.9,
          },
        ],
      },
      {
        name: 'Centers',
        children: [
          {
            category: 'Centers',
            name: 'Daniel Theis',
            value: 9.2,
          },
          {
            category: 'Centers',
            name: 'Enes Kanter',
            value: 8.1,
          },
          {
            category: 'Centers',
            name: 'Robert Williams III',
            value: 5.2,
          },
          {
            category: 'Centers',
            name: 'Tacko Fall',
            value: 3.3,
          },
        ],
      },
    ],
  };




margin = {top: 10, right: 10, bottom: 10, left: 10};
var width = 500-margin.left-margin.right; 
var height = 500-margin.top-margin.bottom ;

var svg = d3.select(".container").append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);




const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
console.log(root);



const treemap = d3.treemap().size([width, height]).padding(1)(root);


const fader = (color)=>d3.interpolateRgb(color, "#fff")(0.3);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10.map(fader));


const nodes = svg.selectAll('g')
    .data(treemap.leaves())  //leaves在这里和descendants有什么区别？
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);//定义了位置，没有representation

nodes.append("rect")
.attr("width", d => d.x1 - d.x0)//x1-x0是由tree map算法计算所得
.attr("height", d => d.y1 - d.y0)
.attr("fill", d =>colorScale(d.data.category));


nodes.append("text")
   .text((d)=>`${d.data.name} ${d.data.value}`)
   .attr("font-size","10px")
   .attr('x', 5)
    .attr('y', 15)
    .call(wraptext);//call方法调用wraptext函数





function wraptext(selection){
    selection.each(function(){

        const node = d3.select(this);
        const recWidth = +node.attr("data-width");
        
        let word;
        const words =node.text().split(" ").reverse();
        let line =[];
        let lineNumber = 0;
        const x =node.attr("x");
        const y =node.attr("y");

        let tspan =node.text("").append("tspan").attr("x",x).attr("y",y);

        //while-condtion,node大于1的情况就逐步pop word
        while(words.length>1){
            word = words.pop();
            line.push(word);
            tspan.text(line.join(" "));
            const tspanLength = tspan.node().getComputedTextLength();
           //if - condition:tspanlength >recWidth，then pop word from the line and then add extra tspan
            if(tspanLength > recWidth && line.length !== 1 ){
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = addTspan(word);
            }
        }
        //处理最后一个word
        addTspan(words.pop());

        function addTspan(text){
            lineNumber+=1;
            return  node
                .append("tspan")
                .attr("x",x)
                .attr("y",y)
                .attr('dy', `${lineNumber * 10}px`)
                .text(text);
            
        };
        

    });
}


