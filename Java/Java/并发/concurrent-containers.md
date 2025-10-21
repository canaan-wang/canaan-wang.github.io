# 并发容器

- `Concurrent*`：通过降低锁粒度、分段等策略提升并发性能（如 `ConcurrentHashMap`）。
- `CopyOnWrite*`：写时复制，读多写少场景表现好（如 `CopyOnWriteArrayList`）。
- 阻塞队列（基于锁实现）：`ArrayBlockingQueue`、`LinkedBlockingQueue`、`PriorityBlockingQueue`、`DelayQueue` 等。

示例：生产者/消费者用阻塞队列
```java
import java.util.concurrent.*;

BlockingQueue<Integer> q = new ArrayBlockingQueue<>(100);

// 生产者
Executors.newSingleThreadExecutor().submit(() -> {
    for (int i = 0; i < 1000; i++) {
        q.put(i); // 满则阻塞
    }
});

// 消费者
Executors.newSingleThreadExecutor().submit(() -> {
    while (true) {
        Integer x = q.take(); // 空则阻塞
        // 处理 x
    }
});
```