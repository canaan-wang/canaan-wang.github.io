# net

## 概览
- 网络基础库：TCP/UDP、域名解析、监听与拨号。

## 常用用法
```go
ln, _ := net.Listen("tcp", ":9000")
conn, _ := net.Dial("tcp", "example.com:80")
addr, _ := net.ResolveIPAddr("ip", "example.com")
```

## 技术原理
- 跨平台套接字抽象；`Dialer`/`Resolver` 配置连接与解析策略。

## 最佳实践
- 设置读写超时；合理重试策略；释放连接资源。