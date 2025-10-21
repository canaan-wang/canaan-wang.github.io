# LinkedBlockingQueue

- 类型：可选有界（默认近似无界，容量为 `Integer.MAX_VALUE`），基于链表，FIFO。
- 锁与计数：`putLock` 与 `takeLock` 两把锁减少争用，`AtomicInteger` 维护元素数量。
- 适用场景：生产/消费并发较高，需更好吞吐；容量可控或近似无界。

示例：

```java
import java.util.concurrent.LinkedBlockingQueue;

public class Demo {
    private static final LinkedBlockingQueue<String> q = new LinkedBlockingQueue<>(100); // 建议显式容量

    public static void main(String[] args) {
        new Thread(() -> {
            try {
                for (int i = 0; i < 1000; i++) {
                    q.put("msg-" + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        new Thread(() -> {
            try {
                while (true) {
                    String s = q.take();
                    // 处理 s
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}
```

注意事项：
- 默认容量非常大，容易造成内存增长；建议显式设置容量。
- 分离锁在高并发下可提升吞吐，但存在更多锁切换成本。
- 与 `ArrayBlockingQueue` 相比：更适合生产/消费高并发、批量流式处理；内存占用随节点增多而增加。