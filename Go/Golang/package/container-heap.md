# container/heap

## 概览
- 通用堆（优先队列）接口，需要实现 `heap.Interface`。

## 常用用法
```go
type PQ []Item
func (h PQ) Len() int           { return len(h) }
func (h PQ) Less(i, j int) bool { return h[i].Less(h[j]) }
func (h PQ) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *PQ) Push(x any)        { *h = append(*h, x.(Item)) }
func (h *PQ) Pop() any          { old := *h; x := old[len(old)-1]; *h = old[:len(old)-1]; return x }

h := &PQ{}
heap.Init(h)
heap.Push(h, item)
min := heap.Pop(h)
```

## 技术原理
- 二叉堆实现；`Push`/`Pop` 复杂度 O(log n)。

## 最佳实践
- 确保 `Less` 一致性；使用指针接收者以便原地修改。