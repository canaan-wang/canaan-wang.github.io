# Condition（await/signal/signalAll）

- 由 `Lock` 创建的条件队列，用于线程间协调（类似监视器的 `wait/notify`）。
- 常用方法：
  - `await()`：释放锁并等待条件满足；被唤醒后需要重新竞争锁。
  - `signal()`：唤醒一个等待线程。
  - `signalAll()`：唤醒所有等待线程。

示例：生产者-消费者
```java
import java.util.*;
import java.util.concurrent.locks.*;

class Buffer {
    private final Queue<Integer> q = new ArrayDeque<>();
    private final int cap = 10;
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    public void put(int x) throws InterruptedException {
        lock.lock();
        try {
            while (q.size() == cap) {
                notFull.await();
            }
            q.add(x);
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public int take() throws InterruptedException {
        lock.lock();
        try {
            while (q.isEmpty()) {
                notEmpty.await();
            }
            int x = q.remove();
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
        }
    }
}
```