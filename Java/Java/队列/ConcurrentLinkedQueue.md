# ConcurrentLinkedQueue

- 类型：非阻塞并发队列（FIFO），基于 CAS 的无锁链表。
- 线程安全：通过原子操作维护 head/tail；无阻塞语义（空时 `poll` 返回 `null`）。
- 适用场景：高并发下的收集/转发、轻量级异步缓冲；不需要阻塞等待。

示例：

```java
import java.util.concurrent.ConcurrentLinkedQueue;

public class Demo {
    private static final ConcurrentLinkedQueue<Integer> q = new ConcurrentLinkedQueue<>();
    public static void main(String[] args) {
        q.offer(1);
        q.offer(2);
        System.out.println(q.poll()); // 1
        System.out.println(q.poll()); // 2
        System.out.println(q.poll()); // null（非阻塞）
    }
}
```

注意事项：
- 不提供阻塞操作；与 `BlockingQueue` 区分开来。
- 在极端并发下可能出现短暂的弱一致性（如 `size()` 开销大且非常量时间）。
- 适合“尽力而为”的收集与派发；如需背压请选用阻塞队列。