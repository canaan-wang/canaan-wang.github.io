# Go语言核心文档

## 主题概述
本目录包含Go语言的核心知识点文档，涵盖语言基础、高级特性、工具链和标准库等内容。旨在提供全面、系统的Go语言学习参考资料，从入门到深入理解Go的设计哲学和实践应用。

## 内容分类

### 语言概览与基础
- [Go语言概览](Go语言概览.md) - 了解Go语言的历史、特性、优缺点及适用场景
- [变量&常量](变量&常量.md) - 变量声明、初始化和常量定义
- [类型](类型.md) - 基本数据类型、自定义类型和类型转换
- [判断](判断.md) - if条件语句和switch语句
- [for](for.md) - 循环语句和range迭代
- [slice](slice.md) - 切片的创建、操作和内部实现
- [map](map.md) - 映射的使用和实现原理
- [pointer](pointer.md) - 指针的概念和使用
- [package](package.md) - 包管理和导入机制
- [范型](范型.md) - Go 1.18后的泛型支持

### 并发与进阶特性
- [chanel](chanel.md) - 通道的使用和通信机制
- [defer](defer.md) - 延迟函数调用及其执行规则
- [panic](panic.md) - 错误处理和恢复机制
- [GMP](GMP.md) - Go的并发调度模型
- [GC](GC.md) - 垃圾回收机制和内存管理

### 工具与测试
- [test](test.md) - 单元测试和基准测试
- [config](config.md) - 配置管理方法
- [工具链](tool/) - 详细的Go工具链文档集合

### 标准库详解
- 查看[package](package.md)下的详细标准库文档，包括：
  - [context](package/context.md) - 上下文管理
  - [sync](package/sync.md) - 同步原语
  - [net/http](package/net-http.md) - HTTP客户端和服务器
  - [io](package/io.md) - 输入输出接口
  - [encoding/json](package/encoding-json.md) - JSON编解码
  - 以及更多核心标准库...