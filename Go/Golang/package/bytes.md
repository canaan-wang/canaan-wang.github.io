# bytes

## 概览
- 操作字节切片的工具，提供 `Buffer`、查找、替换、分割等。

## 常用用法
```go
var b bytes.Buffer
b.WriteString("hello")
fmt.Println(b.String())
```
- 搜索替换：`bytes.Contains/Replace/Index`。
- 分割合并：`bytes.Split/Join`。

## 技术原理
- `Buffer` 动态增长策略；避免频繁分配与复制。

## 最佳实践
- 频繁拼接文本优先使用 `Buffer` 或 `strings.Builder`。