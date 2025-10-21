# CountDownLatch（倒计时闭锁）

- 让一个或多个线程等待其他一组操作完成（计数归零后继续）。
- 初始化时设定计数 `N`；任务完成后 `countDown()`；等待方调用 `await()`。

示例：等待 N 个任务完成
```java
import java.util.concurrent.*;

int N = 3;
CountDownLatch latch = new CountDownLatch(N);
ExecutorService pool = Executors.newFixedThreadPool(N);

for (int i = 0; i < N; i++) {
    pool.submit(() -> {
        try {
            // do work
        } finally {
            latch.countDown();
        }
    });
}

latch.await(); // 阻塞直到计数归零
// 合并结果或继续后续流程
```