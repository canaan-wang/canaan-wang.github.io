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