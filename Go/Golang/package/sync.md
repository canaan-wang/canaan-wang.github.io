# sync

## 概览
- 并发同步原语：`Mutex`/`RWMutex`、`WaitGroup`、`Cond`、`Once`、`Pool`、`Map`。

## 常用用法
- 互斥锁：
```go
var mu sync.Mutex
mu.Lock(); defer mu.Unlock()
// 临界区
```
- 读写锁：
```go
var rw sync.RWMutex
rw.RLock(); defer rw.RUnlock() // 多读单写
```
- 等待组：
```go
var wg sync.WaitGroup
wg.Add(n)
go func(){ defer wg.Done(); work() }()
wg.Wait()
```
- 条件变量：
```go
var mu sync.Mutex
cond := sync.NewCond(&mu)
// cond.Wait/Signal/Broadcast
```
- 一次性初始化：`sync.Once` 保证只执行一次。
- 对象池：`sync.Pool` 缓解短期对象分配压力（非长期缓存）。

## 技术原理
- 互斥锁：基于自旋+休眠的锁实现；在竞争激烈时进入阻塞队列，避免忙等。
- 读写锁：读共享、写独占，内部维护读计数与写锁状态；降级与升级需谨慎。
- WaitGroup：计数器到零唤醒等待者。
- Cond：在互斥锁保护下通过队列等待与唤醒。
- Once：原子状态位+互斥保证一次性。
- Pool：每 P 本地池+全局池组合，减少 GC 压力；不保证对象重用顺序。

## 最佳实践
- 尽量缩小临界区范围；避免在锁内进行阻塞 I/O。
- `WaitGroup.Add`/`Done` 配对；避免负计数。
- `Pool` 适用于短生命周期对象；不要用于长久缓存。