# container/list

## 概览
- 双向链表实现，适合频繁插入/删除。

## 常用用法
```go
l := list.New()
e := l.PushBack(1)
l.InsertBefore(0, e)
```

## 技术原理
- 通过元素节点维护前后指针；操作复杂度 O(1)。

## 最佳实践
- 需注意遍历与节点失效；不适合随机访问。