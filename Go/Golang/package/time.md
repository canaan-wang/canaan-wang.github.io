# time

## 概览
- 时间处理、定时器与时区。

## 常用用法
```go
t := time.Now()
fmt.Println(t.Format(time.RFC3339))
<-time.After(2 * time.Second)
timer := time.NewTimer(time.Second)
ticker := time.NewTicker(time.Minute)
```
- 解析与格式：Go 的布局基于参考时间 `Mon Jan 2 15:04:05 MST 2006`。
- 时区：`time.LoadLocation("Asia/Shanghai")`。

## 技术原理
- 定时器与计时器基于最小堆管理；运行时将到期事件注入调度。
- 单调时钟用于测量间隔，避免系统时钟回拨影响。

## 最佳实践
- 关闭 `Ticker`：`defer ticker.Stop()`，避免泄漏。
- 使用 `time.Duration` 明确单位，避免常量误用。