# fmt

## 概览
- 文本格式化与打印输出，支持格式动词如 `%v`、`%+v`、`%#v`、`%T`、`%q`。

## 常用用法
```go
fmt.Printf("user=%+v\n", u)
fmt.Sprintf("id=%d", id)
fmt.Fprintf(w, "hello %s", name)
```
- `Scan*`：从输入读取。
- `%w` 不适用于 `fmt.Errorf`，应使用 `errors` 包包装。

## 技术原理
- 反射驱动的格式化；`Stringer`/`GoStringer` 接口可自定义输出。

## 最佳实践
- 性能敏感路径避免大量 `Sprintf`；可复用 `bytes.Buffer`。
- 日志建议使用专用库（如 `log`/`zap`）。