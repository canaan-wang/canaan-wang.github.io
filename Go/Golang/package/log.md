# log

## 概览
- 标准库日志，支持前缀、标志位与输出目标。

## 常用用法
```go
logger := log.New(os.Stdout, "app ", log.LstdFlags|log.Lshortfile)
logger.Println("started")
```
- 默认记录器：`log.Print/Printf/Fatal/Panic`。

## 技术原理
- 轻量同步输出；不带结构化能力与级别控制。

## 最佳实践
- 生产建议使用结构化日志库（如 zap/logrus），标准库适合简单工具。