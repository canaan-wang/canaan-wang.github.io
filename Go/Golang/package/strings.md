# strings

## 概览
- 操作字符串的工具，提供查找、替换、分割、构造等。

## 常用用法
```go
strings.Contains(s, "go")
strings.ReplaceAll(s, "a", "b")
strings.Split("a,b,c", ",")
var b strings.Builder
b.WriteString("hello")
```

## 技术原理
- 字符串为不可变类型；`Builder` 可避免多次分配。

## 最佳实践
- 处理大量字符串拼接时使用 `Builder` 或 `bytes.Buffer`。