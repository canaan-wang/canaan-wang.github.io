# embed

## 概览
- 在编译期将文件/目录嵌入二进制，运行时以只读方式访问。

## 常用用法
```go
import "embed"

//go:embed static/*
var assets embed.FS

//go:embed config.yaml
var cfg string

// 结合 http
http.Handle("/", http.FileServer(http.FS(assets)))
```
- 支持通配（`*`）、单文件与目录；变量类型可为 `string`/`[]byte`/`embed.FS`。

## 技术原理
- 构建器在编译时打包匹配资源到只读段；路径相对于声明文件所在目录。
- 不可写、不可遍历模块外路径；与 Go Modules 协同工作。

## 最佳实践
- 控制资源规模，避免二进制过大；敏感配置慎用内嵌。
- 结合 `fs.FS` 与 `http.FS` 实现静态资源服务。