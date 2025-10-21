# DelayQueue

- 类型：无界阻塞队列，元素必须实现 `Delayed` 接口；按剩余延迟时间排序（内部使用 `PriorityQueue`）。
- 取出策略：`take` 会在队首元素到期前阻塞；到期元素才可被消费。
- 适用场景：定时任务、重试延迟、过期清理。

示例：

```java
import java.util.concurrent.*;

class Task implements Delayed {
    private final long runAt;
    private final String name;
    Task(long delayMs, String name) { this.runAt = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(delayMs); this.name = name; }
    @Override public long getDelay(TimeUnit unit) { return unit.convert(runAt - System.nanoTime(), TimeUnit.NANOSECONDS); }
    @Override public int compareTo(Delayed o) { return Long.compare(this.getDelay(TimeUnit.NANOSECONDS), o.getDelay(TimeUnit.NANOSECONDS)); }
    @Override public String toString() { return name; }
}

public class Demo {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<Task> q = new DelayQueue<>();
        q.put(new Task(1000, "t1"));
        q.put(new Task(100, "t2"));
        System.out.println(q.take()); // ~100ms 后输出 t2
        System.out.println(q.take()); // ~1000ms 后输出 t1
    }
}
```

注意事项：
- 无界结构需注意生产速度与内存占用；合理设置最大待执行量。
- 比较器默认按剩余延迟排序；延迟时间更新会影响取出顺序。
- 与 `ScheduledThreadPoolExecutor` 配合可实现更复杂的定时调度。