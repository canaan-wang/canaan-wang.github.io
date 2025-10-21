# runtime

## 概览
- 访问 Go 运行时特性：调度、GC、栈、调用信息等。

## 常用用法
```go
runtime.GOMAXPROCS(runtime.NumCPU())
runtime.GC() // 主动触发 GC（不常用）

// 调用栈信息
pc, file, line, ok := runtime.Caller(0)
fmt.Println(pc, file, line, ok)

// 资源统计
var m runtime.MemStats
runtime.ReadMemStats(&m)
```

## 技术原理
- G/M/P 调度：Goroutine 与线程分离，P 提供运行时上下文。
- 三色标记增量 GC；按需增长栈；内存分配器类似 tcmalloc。

## 最佳实践
- 谨慎使用运行时调优接口；优先通过算法与并发结构优化。
- 记录/诊断信息可结合 `pprof`/`trace` 工具而非手工干预。