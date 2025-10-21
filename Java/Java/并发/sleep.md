# Thread.sleep（休眠）

- 静态方法：`Thread.sleep(millis)`；使当前线程进入 `TIMED_WAITING`，到时自动唤醒。
- 不依赖锁，也不会释放已持有的监视器锁（与 `wait()` 不同）。
- 常用于重试退避、节流或简单的时间等待。

示例：
```java
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
```