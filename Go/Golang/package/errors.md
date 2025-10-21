# errors

## 概览
- 错误类型与处理工具；Go 1.13 引入包装与链式检查。

## 常用用法
```go
var ErrNotFound = errors.New("not found")
err := fmt.Errorf("failed: %w", ErrNotFound)
if errors.Is(err, ErrNotFound) { /* handle */ }
var e *MyErr
if errors.As(err, &e) { /* typed match */ }
```

## 技术原理
- 错误链：`fmt.Errorf("...: %w", err)` 创建可解包链；`Is/As` 通过链遍历匹配。
- 哨兵错误：固定实例与 `Is` 检查；自定义类型配合 `As`。

## 最佳实践
- 明确错误分类与边界；尽量返回具体类型而非字符串。
- 业务错误与系统错误分层；日志与控制流分离。