# context

## context
### 定义
- context 是 goroutine 运行时的上下文，主要用于在 goroutine 间传递上下文信息，包括取消信号、超时时间、截止时间、KV 信息等,是 GOlang 中并发场景下 goroutine 超时控制的标准做法
### 功能
- WithCancel 基于父 context，生成一个可以取消的 context
- WithDeadline 建一个有 deadline 的 context
- WithTimeout 创建一个有 timeout 的 context
- WithValue 创建一个存储 k-v 对的 context
### 使用原则
- 不要将 Context 塞到结构体里。直接将 Context 类型作为函数的第一参数，而且一般都命名为 ctx。
- 不要向函数传入一个 nil 的 context，如果你实在不知道传什么，标准库给你准备好了一个 context：todo。
- 不要把本应该作为函数参数的类型塞到 context 中，context 存储的应该是一些共同的数据。例如：登陆的 session、cookie 等。
- 同一个 context 可能会被传递到多个 goroutine，context 是并发安全的。
### ValueCtx
- 使用 withValue 时创建的实际上是 ValueCtx，其中包含参数中的 ctx 以及一个 KV， K 需要保证可以比较，查找时通过当前 ctx，向上递归查询，直到找到最近的一个符合的 KV 对
### Backgroud TODO Ctx
- Backgroud 用于在 main 函数中作为根 ctx
- TODO 用于在不清楚使用什么 ctx 时，暂时使用 TODO，后续需修改为具体的 ctx
- Backgroud 与 TODO 均为 emptyCtx 的实例

## 概览
- 用于在 API 边界传递取消信号、截止时间与键值数据。
- 典型用法：`context.Background()` 作为根；`context.WithCancel/WithTimeout/WithDeadline` 派生子上下文；`ctx.Value` 携带少量元数据。

## 常用用法
- 取消与超时：
```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()
if err := Do(ctx); err != nil { /* handle */ }
```
- 在服务端：每次请求派生 `ctx`，传递到下游。
- 在客户端：为外部调用（HTTP/DB/RPC）设置超时，避免资源泄漏。
- 携带值（谨慎）：仅存放跨 API 的请求范围元数据（如 request-id）。

## 技术原理
- 树状结构：父子上下文构成树；取消会向下游传播。
- 取消信号：`Done() <-chan struct{}`；一旦关闭表示取消/超时。
- 截止时间：`Deadline()` 提供绝对时间；配合计时器在运行时触发取消。
- 不可变语义：派生的上下文在创建后属性固定；通过组合形成语义。

## 示例：取消传播
```go
func worker(ctx context.Context, out chan<- int) {
    for i := 0; i < 100; i++ {
        select {
        case <-ctx.Done():
            return
        case out <- i:
        }
    }
}
```

## 最佳实践
- 永远调用返回的 `cancel()`，避免计时器与资源泄漏。
- 不在 `context` 中存放业务对象或可变数据；仅放跨界元数据。
- API 设计将 `ctx` 作为首参；不要保留 `ctx` 到异步长期任务中。