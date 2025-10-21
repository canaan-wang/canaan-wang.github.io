# CyclicBarrier（循环栅栏）

- 一组线程在到达共同屏障后一起继续（可复用）。
- 支持在屏障打开时执行 barrier action。

示例：分阶段任务协作
```java
import java.util.concurrent.*;

int parties = 3;
CyclicBarrier barrier = new CyclicBarrier(parties, () -> {
    // 所有线程到齐后执行一次
    System.out.println("phase done");
});

ExecutorService pool = Executors.newFixedThreadPool(parties);
for (int i = 0; i < parties; i++) {
    pool.submit(() -> {
        try {
            // 阶段 1
            barrier.await();
            // 阶段 2
            barrier.await();
        } catch (Exception e) {
            Thread.currentThread().interrupt();
        }
    });
}
```