## goroutine
### goroutine 和 thread 的区别
- oroutine 比 thread 内存占用少：goroutine 占用 2KB，thread 为 1MB
- goroutine 比 thread 创建、销毁成本低：thread 为内核态，创建、销毁消耗较高，goroutine 为用户态，由 go runtime 直接管理，消耗较小
- goroutine 比 thread 切换消耗低：thread 切换需要 1000 - 1500 ns，goroutine 仅需 200 ns
### goroutine 和 thread 关系
- goroutine 和 thread 直接相互独立
- goroutine 需要依赖 thread 进行执行
- scheduler 调度 goroutine 时将其关联至 thread 进行执行

## scheduler
- 职责：将所有处于 runnable 的 goroutines 均匀分布到在 P 上运行的 M
### 核心思想
- 线程重用
- 限制同时运行的线程数为 N，N 等于 CPU 的逻辑核心数，（不包含阻塞线程）
- 线程私有的 runqueues，并且可以从其他线程 stealing goroutine 来运行，线程阻塞后，可以将 runqueues 传递给其他线程。
### GPM 模型
- 概念：GPM 是指 go scheduler 中的三个核心组件
- G：代表一个 goroutine，包含：当前 goroutine 的状态，运行到的指令地址(PC 值)。
- P：代表一个虚拟的 Processor，它维护一个 g 队列，g 均为 Runnable 状态
（P 早期不存在，后续因为全局 g 队列有性能瓶颈而开发）
- M：表示内核线程，包含正在运行的 goroutine
### GRQ （global runqueues）
- 协程全局队列，优先级比 P 内的协程队列低
### LRQ （local runqueues）
- P 内的协程队列
### 运行期会发生的变化
- 线程阻塞（如系统调用，内核态）时会将其队列中的 goroutine 转移到其他 P 移交其他线程执行
- goroutine 阻塞（如 channel 读取阻塞）时，会将其调度走，让其它 goroutine 执行
- scheduler 启动的 sysmon 线程会检查运行时间超过 10ms 的协程，并将其调度到 global runqueues
- P 的 LRQ 没有 goroutine 时会从其它 P 拿走一半
- 全局队列中的携程，会定期被调度到 P 中