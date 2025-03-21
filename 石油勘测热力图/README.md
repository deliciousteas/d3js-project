# prompt

```mermaid
graph LR;
数据预处理-->映射Domian和range关系-->可视化
```

## 数据预处理

数据参考格式如下：

```json
const arr = [
            { "depth": 1999, "angle": 1, "value": 70 },
            { "depth": 2000, "angle": 1, "value": 82.05 },
            { "depth": 2001, "angle": 1, "value": 75.19 },
            { "depth": 2002, "angle": 1, "value": 77.07 },
            { "depth": 2003, "angle": 1, "value": 77.39 },
]
```

数据需要预处理，每个数据项为depth、angle、value，需要将depth作为id，angle可以作为key，value为value值。

最后整理后的数据格式如下

depth：[angle1,value1],[angle2,value2].........[anglen,valuen]

## XY轴映射关系

svg容器创建：

设置width、height属性分别为200，1200

颜色映射关系：

d3.scaleLinear的domain为该数据中所有value的极值， range为orange到blue的颜色映射范围。

Y轴：

使用d3.extent获取depth的极值，存储为d3.scaleLinear的domain，range为[50,200]

X轴：

对每个depth，用d3.scaleLinear设置X轴的映射关系

\- 位置：Domain为该depth的所有value值的极值范围，range为[50,1200]

- 可视化：
  - 在depth所在的height高度，生成总长度为width的N个均等分rect（其中rect的数目N为该depth的values数目），rect的位置为width的N等分区间，将X轴的value映射到对应的rect的位置属性中（d3.scaleLinear），其fill属性引用颜色映射关系，stroke-width属性为0.
  - 