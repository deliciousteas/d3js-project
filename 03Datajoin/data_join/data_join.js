
const countryData ={
    items:["China","USA","India"],
    addItem(item){
        this.items.push(item);
    },
    removeItem(index){
        this.items.splice(index,1);
    },
    updateItem(index,newItem){
        this.items[index] = newItem;
    }
};

//enter and exit method in selection

//initial rendering
d3.select('ul')
    .selectAll('li')
    .data(countryData.items)
    .enter()
    .append('li')
    .attr('class','enter-item')
    .text(d=>d)
    .attr('transform','translate(200,100');


//add canada in 2seconds
setTimeout(()=>{
    countryData.addItem("Canada");
    d3.select('ul')
        .selectAll('li')
        .data(countryData.items)
        .enter()
        .append('li')//果数据项在上一次选择集中不存在对应的 DOM 元素，那么 .append() 会创建一个新的元素。如果数据项已经对应了某个 DOM 元素（即处于 update 状态），则不会创建新元素
        .attr('class', 'new-item')
        .text(d => d)
        .attr('transform', 'translate(100,100)');
},2000);


setTimeout(() => {
    countryData.removeItem(0);
    console.log(countryData.items);
    d3.select('ul')
    .selectAll('li')
    .data(countryData.items, d => d)
    .exit() // Elements that are no longer in the data
    .attr('class', 'red-undant')
    .attr('fill', 'red')
    .attr('transform', 'translate(100,100)');
    //.remove()
}, 4000);


setTimeout(() => {
    countryData.updateItem(1, 'Japan');
    console.log(countryData.items);
    d3.select('ul')
    .selectAll('li')
    .data(countryData.items, d => d)
    .exit()
    .classed('update-item', true)
    .text(d => d)
    .attr('transform', 'translate(100,100)');
}, 6000);



setTimeout(() => {
    countryData.updateItem(0, "ABC");
    countryData.updateItem(1, "EFG");
    countryData.updateItem(2, "LMN");
    d3.select('ul')
        .selectAll('li')
        .data(countryData.items)
        .join(enter => {
            enter.append('li')
                .attr('class', 'list-group-item')
                .text(d => d)
                .attr('transform', 'translate(100,100)');
        }, update => {
            update.attr('class', 'update-list-group-item')
                .text(d => d);
        })
        
}, 5000);