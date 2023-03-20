## 模型：
- channel 由一个循环数组、两个 goroutine 队列以及一个 mutex 构成
- 循环数组为 channel 的数据 buffer，如果 make 时设定 buffer 为 0，则不创建循环数组
- 两个 goroutine 列表为 channel 的 senders、receivers，用于 goroutine 阻塞时的收录
- 锁（mutex）用于实现 sender、receiver 的原子性操作

## 创建
```go
chan1 := make(chan type) // 阻塞的 channel，不创建循环队列
chan2 := make(chan type, bufferCap) // 非阻塞的 channel，创建循环队列
```

## 获取容量
```go
cap1 := cap(chan1)
```

## 获取长度
```go
len1 := len(chan1)
```

## 关闭 channel
```go
close(chan1)
```

## 资源泄漏
- channel buffer 一直处于空 or 满的状态会导致资源泄漏，GC 不会回收该 channel，因为有 goroutine 引用
### close
- close 后的 channel 不可以 send data to channel，否则会导致 panic
- close 后的 channel 可以 receive data，当第二个返回值 ok 为 false 时，表示 channel 数据已 receive 完毕，channel 已关闭
- channel 被 close 多次会导致 panic
### channel 优雅关闭
- N个 sender、一个 receiver：添加一个信号传递的 channel，由 receiver 侧关闭该 channel，sender 侧停止输入数据（会发生数据未消费的情况）
- N 个 sender、N 个 receiver：添加一个收集停止信号的 channel1、一个用于传递停止信号的 channel2，channel1 接受到 数据后关闭 channel2，senders 接受到 channel2 的无效数据后停止 send
### channel 应用
- 定时任务：使用 selcet，time.After(100 * time.Millisecond) 返回一个定时 put 数据的 channel，在其分支后执行代码
- producer、consumer 解耦
- 并发数控制：make 一个指定 buffer 的 channel， goroutine 执行函数开始放入一个值，执行结束读取一个值

## select 选择 channel
- 能够让 Goroutine 同时等待多个 Channel 可读或者可写，在 Channel 状态改变之前，select 会一直阻塞 Goroutine。
### 编译期间 select 语句优化
- 空的 select 语句会被转换成调用 runtime.block 直接挂起当前 Goroutine；
- 如果 select 语句中只包含一个 case，编译器会将其转换成 if ch == nil { block }; n; 表达式；
    首先判断操作的 Channel 是不是空的；
    然后执行 case 结构中的内容；
- 如果 select 语句中包含一个 case，一个 default，那么会使用 runtime.selectnbrecv 和 runtime.selectnbsend 非阻塞地执行收发操作；（也是转化为 if else）
- 在多个 case 场景下通过 runtime.selectgo 获取执行 case 的索引（随机），并通过多个 if 语句执行对应 case 中的代码；
### selectgo 函数（随机获取 case）
- 随机生成一个遍历的轮询顺序 pollOrder 并根据 Channel 地址生成锁定顺序 lockOrder；
- 根据 pollOrder 遍历所有的 case 查看是否有可以立刻处理的 Channel；
- 如果存在，直接获取 case 对应的索引并返回；
- 如果不存在，创建 runtime.sudog 结构体，将当前 Goroutine 加入到所有相关 Channel 的收发队列，并调用 runtime.gopark 挂起当前 Goroutine 等待调度器的唤醒；
- 当调度器唤醒当前 Goroutine 时，会再次按照 lockOrder 遍历所有的 case，从中查找需要被处理的 runtime.sudog 对应的索引；