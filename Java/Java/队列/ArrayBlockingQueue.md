# ArrayBlockingQueue

- 类型：有界阻塞队列，基于数组，FIFO。
- 锁与条件：单个 `ReentrantLock`，两个 `Condition`（`notEmpty`、`notFull`）。
- 公平性：构造时可选 `fair=true`（公平锁），降低吞吐但更均衡。
- 适用场景：生产者-消费者固定容量限流；内存受控场景。

示例：

```java
import java.util.concurrent.ArrayBlockingQueue;

public class Demo {
    private static final ArrayBlockingQueue<Integer> q = new ArrayBlockingQueue<>(10, false);

    public static void main(String[] args) {
        // 生产者
        new Thread(() -> {
            try {
                for (int i = 0; i < 20; i++) {
                    q.put(i); // 满则阻塞
                    System.out.println("produce: " + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        // 消费者
        new Thread(() -> {
            try {
                while (true) {
                    Integer v = q.take(); // 空则阻塞
                    System.out.println("consume: " + v);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}
```

注意事项：
- 容量固定，`offer` 在满时返回 `false`；`put` 会阻塞直至有空间。
- 公平锁减少饥饿，但每次获取/释放锁有成本；在高并发下吞吐略低。
- 相比 `LinkedBlockingQueue`，单锁实现在低并发更轻量，但在高并发下争用更集中。