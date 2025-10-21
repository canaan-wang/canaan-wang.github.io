# io

## 概览
- 抽象输入输出的核心接口：`Reader`、`Writer`、`Closer`、`Seeker`、`ReaderFrom`、`WriterTo`。
- 通过组合与装饰实现流式处理与复用。

## 常用用法
```go
var r io.Reader = strings.NewReader("hello")
b, _ := io.ReadAll(r)
```
- 拷贝：`io.Copy(dst, src)` 利用 `WriterTo/ReaderFrom` 优化。
- 限流：`io.LimitReader(r, n)`。
- Tee：`io.TeeReader(r, w)` 边读边写副本。

## 技术原理
- 统一协议：以少量接口适配多种数据源与目标。
- 优化协议：`ReaderFrom/WriterTo` 允许绕过额外缓冲与调度开销。

## 最佳实践
- 尽量使用接口编程，提升可测试性与可替换性。
- 合理选择读写批量尺寸，避免过多系统调用。