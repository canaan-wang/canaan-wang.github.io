# path/filepath

## 概览
- 操作系统相关的路径处理：分隔符、绝对/相对路径、遍历等。

## 常用用法
```go
p := filepath.Join("/usr", "local", "bin")
abs, _ := filepath.Abs("./data")
filepath.WalkDir("./", func(path string, d fs.DirEntry, err error) error { return nil })
```
- 扩展名与基名：`Ext`、`Base`。
- 清理与相对：`Clean`、`Rel`。

## 技术原理
- 根据平台切换分隔符与路径规则（Windows vs POSIX）。

## 最佳实践
- 统一使用 `filepath`（非 `path`）处理本地文件路径。