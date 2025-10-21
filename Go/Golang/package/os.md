# os

## 概览
- 操作系统接口：环境变量、文件与进程管理。

## 常用用法
```go
os.Setenv("ENV", "prod")
wd, _ := os.Getwd()
f, err := os.Open("file.txt")
defer f.Close()
```
- 目录与文件：`os.MkdirAll`、`os.ReadFile`、`os.WriteFile`。
- 进程：`os.Exit`、`os.FindProcess`。

## 技术原理
- 跨平台抽象；底层依赖 `syscall` 与平台特定实现。

## 最佳实践
- 注意文件权限与 `umask`；使用 `defer Close()` 管理资源。