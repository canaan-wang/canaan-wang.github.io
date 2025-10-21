# testing

## 概览
- 单元测试（`testing.T`）、基准测试（`testing.B`）、示例与模糊测试。

## 常用用法
```go
// _test.go 文件
func TestAdd(t *testing.T) {
    t.Parallel()
    got := Add(2, 3)
    if got != 5 { t.Fatalf("want 5, got %d", got) }
}

func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ { _ = Add(i, i+1) }
}

func ExampleAdd() {
    fmt.Println(Add(2, 3))
    // Output: 5
}

// Go 1.18+ 模糊测试
func FuzzParseInt(f *testing.F) {
    f.Add("123")
    f.Fuzz(func(t *testing.T, s string) {
        _, _ = strconv.Atoi(s)
    })
}
```
- 运行：`go test ./...`；并行：`t.Parallel()`；子测试：`t.Run()`。

## 技术原理
- 测试驱动通过 `go test` 编译并运行包含 `_test.go` 的包。
- 基准测试控制迭代次数 `b.N` 保持统计稳定；模糊测试维护语料库。

## 最佳实践
- 使用表格驱动与 `t.Helper()`；保持测试可重复、隔离副作用。
- 为基准测试禁用日志与 I/O；在 CI 中收集覆盖率与报告。