# d3-hierarchy

介绍了三种可视化表现形式

- Node-link diagram :通过link揭示次序
- Adjacency diagram：通过位置距离表示次序

- Enclosure diagrams：通过包含关系表示次序
  - treemap

## hierachy

将数据组织成层次化节点，并添加额外属性。

- csv文件使用stratify 模块

## Tree layout

Tree: 紧凑型树状图布局

Cluster：相较于Tree布局，具有相同深度的节点位于同一层

## Partition layout

是tree layout的变体，节点为独立区域，距离反映彼此的层次关系

## Pack

通过包含关系反映节点之间的层次关系，contained-map

todo

[circle-map](https://www.youtube.com/watch?v=-t2ZT9DiXcY)

## Treemap

使用`d3.hierarchy`捕获root节点和leaves节点的属性

使用`d3.treemap`构建Treemap布局

使用`wraptext`函数将超出representation的text换行处理\

- 问题定义：

在 SVG 中，文本元素可能会超出指定的宽度，导致显示不完整或布局混乱。为了解决这个问题，需要将超出指定宽度的文本内容进行换行处理，使其能够适应给定的宽度限制。

- 解决方法：

文本分割：text content 分割为words，在words 超过给定宽度时动态创建text spans 。

动态创建与换行处理：这个函数通过逐步添加words到line变量，并核对line的长度是否超过最大宽度，然后再将word打包放到新的一行。

# 参考

[tree-map]([treemap-demo](https://medium.com/swlh/create-a-treemap-with-wrapping-text-using-d3-and-react-5ba0216c48ce))

