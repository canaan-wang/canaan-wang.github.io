# wait/notify/notifyAll（监视器方法）

- 所属：`Object` 基类；需在持有监视器锁（`synchronized`）的情况下调用。
- `wait()`：释放监视器并进入 `WAITING`；`wait(timeout)` 进入 `TIMED_WAITING`，超时或被唤醒返回。
- `notify()`：唤醒一个等待中的线程；`notifyAll()`：唤醒所有等待中的线程。
- 常与条件循环搭配使用，避免虚假唤醒：`while (!condition) wait();`

示例：
```java
synchronized (lock) {
    while (!condition) {
        lock.wait();
    }
    // 条件满足后的处理
}

synchronized (lock) {
    // 改变条件
    lock.notifyAll();
}
```