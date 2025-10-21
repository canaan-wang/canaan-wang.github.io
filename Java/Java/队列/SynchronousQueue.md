# SynchronousQueue

- 类型：零容量阻塞队列，元素必须生产者与消费者一对一交接（handoff）。
- 实现：非公平模式使用栈结构（`TransferStack`），公平模式使用队列（`TransferQueue`）。
- 适用场景：任务直接移交，低延迟 handoff；`Executors.newCachedThreadPool` 使用它。

示例：

```java
import java.util.concurrent.SynchronousQueue;

public class Demo {
    private static final SynchronousQueue<String> q = new SynchronousQueue<>();

    public static void main(String[] args) {
        // 消费者
        new Thread(() -> {
            try {
                System.out.println("take: " + q.take());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        // 生产者
        new Thread(() -> {
            try {
                q.put("hello"); // 直到有消费者执行 take 才会返回
                System.out.println("put done");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
}
```

注意事项：
- 没有缓冲能力；适合作为工作线程直接交付机制。
- 公平模式可避免长时间等待，但在高并发下吞吐略低。
- 与 `BlockingQueue` 其它实现不同，不适用于排队缓冲。