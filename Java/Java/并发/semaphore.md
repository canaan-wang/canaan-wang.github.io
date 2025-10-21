# Semaphore（信号量）

- 控制同时访问某资源的线程数量，常用于限流与连接池。
- 核心方法：`acquire()`/`release()`；支持公平策略。

示例：限流到 N 并发
```java
import java.util.concurrent.Semaphore;

Semaphore limit = new Semaphore(5);

void handle() throws InterruptedException {
    limit.acquire();
    try {
        // 受限的并发处理
    } finally {
        limit.release();
    }
}
```