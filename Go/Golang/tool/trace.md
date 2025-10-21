# go tool trace

用途：运行时事件追踪，可视化调度、GC、网络等事件。

示例：
- 采集：`go test -trace trace.out ./pkg/...`
- 查看：`go tool trace trace.out`