

## 原生包（精选）
- [`context`](context.md)：上下文传递取消、截止时间、元数据。
- [`sync`](sync.md)：互斥锁、等待组、`Map`、`Cond` 等同步原语。
- [`net/http`](net-http.md)：HTTP 客户端与服务端，易于扩展中间件。
- [`io`](io.md)/[`bufio`](bufio.md)：统一 I/O 抽象、缓冲读写。
- [`fmt`](fmt.md)：格式化与打印输出。
- [`errors`](errors.md)：错误处理与 `%w` 包装。
- [`time`](time.md)：时间、定时器与时区处理。
- [`os`](os.md)/[`path/filepath`](path-filepath.md)：文件系统与路径操作。
- [`log`](log.md)：基础日志接口。
- [`encoding/json`](encoding-json.md)/[`encoding/xml`](encoding-xml.md)：序列化与反序列化。
- [`bytes`](bytes.md)/[`strings`](strings.md)/[`regexp`](regexp.md)：文本与字节处理。
- [`crypto/*`](crypto.md)：哈希、签名、TLS 等密码学与安全。
- [`database/sql`](database-sql.md)：数据库抽象接口（需驱动）。
- [`net`](net.md)/[`net/url`](net-url.md)：TCP/UDP、DNS 与 URL 解析。
- [`sort`](sort.md)：排序与自定义比较。
- [`container/list`](container-list.md)/[`container/heap`](container-heap.md)：常用数据结构实现。
- [`hash/*`](hash.md)：常见非加密哈希算法。
- [`flag`](flag.md)：命令行参数解析。
- [`embed`](embed.md)：编译时内嵌静态资源。
- [`runtime`](runtime.md)/[`reflect`](reflect.md)：运行时信息与反射能力。
- [`testing`](testing.md)：单元/基准/模糊测试（配合 `go test`）。