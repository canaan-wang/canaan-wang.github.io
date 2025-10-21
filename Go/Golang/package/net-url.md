# net/url

## 概览
- URL 解析与构造。

## 常用用法
```go
u, _ := url.Parse("https://example.com/a?b=c")
u.Query().Get("b")
u.Path = "/new"
```

## 技术原理
- RFC 3986 兼容解析；编码与解码工具：`QueryEscape`、`PathEscape`。

## 最佳实践
- 避免手工拼接；使用解析器与编码函数确保安全。