# the data join in d3.selection

一个了解d3.js中`data join`的demo

1. **enter**：当新的数据项被添加到数据中时，这些项不存在于之前的 selection 中，因此它们处于 enter 状态。
2. **update**：当数据项更新时，这些项同时存在于新的数据和旧的 selection 中，因此它们处于 update 状态。
3. **exit**：当数据项从数据中移除时，这些项存在于旧的 selection 中但不在新的数据中，因此它们处于 exit 状态。

![image-20250306165626242](C:\Users\22779\AppData\Roaming\Typora\typora-user-images\image-20250306165626242.png)

merge：将两个selection合并成为一个，并返回成为新的selection



# the Animations using D3.js

todo

# the event at d3.js

d3.transition->trransition.transtion()：对选中元素的transition从开始到结束的全过程变化设计。

- 在event行为下可以发生anything

交互事件主要又鼠标和键盘两种方式，其中鼠标主要包括单机、悬浮、滚轴...

# d3 function

- function

return 函数结束执行，该函数将会返回一个值。

function没有return statement，就只是一个function

function和function()有区别，function()表示调用起来，如果有return值可以存储为变量。

- anonymous function

没有函数名，通常在定义函数后立即使用。

- passing function as variables

匿名函数可以作为变量传递给另外一个函数，而不必定义变量。

- callback function

暂时没有用到

##  update、exit、enter in d3.js

```javascript
var text = svg.selectAll("text").data(cupcake).enter().append("text").attr("class","cupcake_enter").attr("dy",".80em").attr("x",function(d,i){return i*30}).text(function(d){return d});
```

d是匿名函数的参数，表示当前正在处理的数据项。当你使用 `.data(cupcake)` 将数据绑定到选择集时，D3.js 会为每个数据项调用这个匿名函数，并将当前数据项作为第一个参数传入，这就是 `d` 的来源。

d3.js会自动绑定data，然后为每个element用匿名函数创建一个dataum，将数据绑定到element。

# 其他

.text：传递input

svg和g是什么

<g>是用来组织svg中的元素

dy、dx是相对于xy偏移的坐标，

data join的key

px：pixel unit

um：相对长度单位

# reference

[what is enter](https://www.youtube.com/watch?v=ZOeWdkq-L90)

[what is exit](https://www.youtube.com/watch?v=IyIAR65G-GQ&t=573s)

[what is data join](https://bost.ocks.org/mike/join/)

[SVG Transition Animations using D3.js](https://www.youtube.com/watch?v=K1zHa1sAno0)

[svg event action](https://www.youtube.com/watch?v=vCkDORyTnhQ)

[enter、exit、update example](https://www.youtube.com/watch?v=X0-lXyF1_Ns&list=PLXyk0YAcdNEGEswE3u4DdkfDoo3MZgs_9&index=65)