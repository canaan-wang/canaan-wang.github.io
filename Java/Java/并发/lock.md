# 锁与 AQS（AbstractQueuedSynchronizer）

- `Lock` 为显式锁，手动加解锁，提供更灵活的获取方式：
  - 可中断获取：`lockInterruptibly()`
  - 非阻塞尝试：`tryLock()`
  - 超时获取：`tryLock(timeout, unit)`
- 典型实现：`ReentrantLock`（可重入、可设置公平性）。
- AQS：队列同步器，定义了基于 FIFO 的同步队列与状态管理，支撑 `ReentrantLock`/`Semaphore`/`CountDownLatch` 等。
- 与 `synchronized` 的区别：语义、用法与功能扩展不同；`Lock` 支持条件队列 `Condition`。

基本用法：
```java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

Lock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}
```