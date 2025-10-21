# regexp

## 概览
- 正则表达式引擎，支持 RE2 语法（不含回溯的高阶特性）。

## 常用用法
```go
re := regexp.MustCompile(`^a.*b$`)
if re.MatchString("axxxb") { /* ... */ }
parts := re.FindStringSubmatch("name:go")
```

## 技术原理
- RE2 模型：线性时间匹配，避免指数级回溯；安全与性能兼顾。

## 最佳实践
- 预编译正则避免重复开销；复杂文本处理优先状态机或解析器。