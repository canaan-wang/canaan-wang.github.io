# PriorityQueue

- 类型：非线程安全优先级队列（基于二叉堆），按比较器或元素自然顺序排序，非稳定。
- 适用场景：单线程或外部同步场景下的优先级处理；`DelayQueue` 内部使用它实现排序。

示例：

```java
import java.util.PriorityQueue;

public class Demo {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>(); // 默认小顶堆（最小值优先）
        pq.offer(10);
        pq.offer(1);
        pq.offer(5);
        System.out.println(pq.poll()); // 1
        System.out.println(pq.poll()); // 5
        System.out.println(pq.poll()); // 10
    }
}
```

注意事项：
- 非线程安全；并发使用需外部同步（如 `Collections.synchronizedCollection` 或锁）。
- 与 `PriorityBlockingQueue` 区别：不阻塞、非并发；适用单线程或受控并发。
- 相等优先级下顺序不稳定；如需稳定顺序需在比较逻辑中加入时间戳。