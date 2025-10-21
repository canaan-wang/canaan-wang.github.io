# net/http

## 概览
- 标准库 HTTP 客户端与服务端。
- Server：`http.Server`、`http.HandleFunc`、`http.ServeMux`、中间件模式。
- Client：`http.Client`、`Transport`、连接池与超时配置。

## 服务端用法
```go
func hello(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("hello"))
}
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/hello", hello)
    srv := &http.Server{Addr: ":8080", Handler: mux}
    log.Fatal(srv.ListenAndServe())
}
```
- 中间件：包装 `http.Handler`，在链路中实现日志、鉴权、恢复等。

## 客户端用法
```go
client := &http.Client{Timeout: 5 * time.Second}
resp, err := client.Get("https://example.com")
```
- 进阶：自定义 `Transport` 控制连接池、TLS、代理等。

## 技术原理
- Server：每请求一个 goroutine；`ServeMux` 基于最长前缀匹配。
- Keep-Alive：连接复用降低握手开销；`Transport` 管理连接池。
- HTTP/2：Go 内置支持，通过 `net/http` 与 `x/net/http2` 集成。
- Context：请求携带 `r.Context()` 传递取消与超时。

## 最佳实践
- 设置读写超时（`ReadTimeout/WriteTimeout`）与 `IdleTimeout`。
- 正确关闭响应体：`defer resp.Body.Close()`。
- 生产环境使用优雅关闭：`Server.Shutdown(ctx)`。