# sort

## 概览
- 提供排序与自定义比较接口。

## 常用用法
```go
sort.Ints(a)
sort.Slice(users, func(i, j int) bool { return users[i].Age < users[j].Age })
```
- 自定义：实现 `sort.Interface`。

## 技术原理
- 混合排序算法（快速排序等），在不同规模下优化比较次数与移动成本。

## 最佳实践
- 比较函数需保证严格弱序关系；避免不稳定比较导致不可预测结果。