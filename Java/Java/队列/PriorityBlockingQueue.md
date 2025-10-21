# PriorityBlockingQueue

- 类型：无界阻塞队列（容量可增长），基于二叉堆的优先级排序，非稳定（相同优先级元素顺序不保证）。
- 线程安全：内部使用锁保护堆操作，`take` 在队列空时阻塞。
- 适用场景：需要按优先级处理任务，如调度器、任务队列。

示例：

```java
import java.util.concurrent.PriorityBlockingQueue;

class Job implements Comparable<Job> {
    int priority;
    String name;
    Job(int p, String n) { this.priority = p; this.name = n; }
    @Override public int compareTo(Job o) { return Integer.compare(o.priority, this.priority); } // 大值优先
}

public class Demo {
    private static final PriorityBlockingQueue<Job> q = new PriorityBlockingQueue<>();

    public static void main(String[] args) throws Exception {
        q.put(new Job(10, "high"));
        q.put(new Job(1, "low"));
        System.out.println(q.take().name); // high
        System.out.println(q.take().name); // low
    }
}
```

注意事项：
- 无界结构可能导致内存增长；可结合生产控制或分层队列限流。
- 相等优先级下顺序不稳定；如需稳定顺序需自定义比较逻辑携带时间戳。
- 不保证公平性，适合离散优先级任务。