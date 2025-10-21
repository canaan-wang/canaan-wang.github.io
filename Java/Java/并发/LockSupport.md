# LockSupport 与 park/unpark

## 定义与作用

LockSupport 是 Java 并发包中的基础工具类，提供线程阻塞和唤醒的底层原语操作。相比传统的 `wait()`/`notify()` 机制，LockSupport 更加灵活和安全，是现代并发工具（如 AQS）的基础。

## 核心 API

### park() 方法

`park()` 方法用于挂起当前线程：

```java
// 基本用法
LockSupport.park();

// 带 blocker 对象的 park，便于调试
Object blocker = new Object();
LockSupport.park(blocker);

// 带超时的 park
LockSupport.parkNanos(1000000); // 1毫秒
LockSupport.parkUntil(System.currentTimeMillis() + 1000); // 1秒后
```

### unpark() 方法

`unpark()` 方法用于唤醒指定线程：

```java
Thread targetThread = ...;
LockSupport.unpark(targetThread);
```

## 许可机制（Permit）

LockSupport 采用许可机制，每个线程都有一个许可（permit）：

- 初始时，线程的许可为 0
- `unpark(thread)`：将线程的许可设置为 1（如果许可已经是 1，则保持不变）
- `park()`：如果许可为 1，则立即返回并将许可重置为 0；如果许可为 0，则阻塞线程

### 许可机制的优势

```java
public class PermitExample {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            System.out.println("Worker started");
            
            // 即使先调用 unpark 再调用 park，也能正常工作
            LockSupport.park();
            System.out.println("Worker resumed");
        });
        
        worker.start();
        Thread.sleep(100);
        
        // 先唤醒再挂起 - 仍然有效
        LockSupport.unpark(worker);
        
        worker.join();
    }
}
```

## 与 wait/notify 的对比

### 功能对比

| 特性 | LockSupport | wait/notify |
|------|-------------|-------------|
| 调用要求 | 无需持有锁 | 必须在同步块中 |
| 信号丢失 | 不会丢失 | 可能丢失 |
| 精确唤醒 | 支持指定线程 | 随机唤醒一个 |
| 许可机制 | 支持 | 不支持 |
| 超时控制 | 支持 | 支持 |

### 信号丢失问题

**wait/notify 的信号丢失：**

```java
// 可能丢失信号的例子
public class SignalLossExample {
    private boolean signal = false;
    
    public void waitForSignal() throws InterruptedException {
        synchronized (this) {
            if (!signal) {
                wait(); // 如果 notify 在 wait 之前调用，信号丢失
            }
        }
    }
    
    public void sendSignal() {
        synchronized (this) {
            signal = true;
            notify();
        }
    }
}
```

**LockSupport 无信号丢失：**

```java
public class NoSignalLossExample {
    public void waitForSignal(Thread thread) {
        LockSupport.unpark(thread); // 先调用 unpark
        // ... 其他操作
        LockSupport.park(); // 后调用 park - 仍然有效
    }
}
```

## 实现原理

### 底层实现

LockSupport 的 park/unpark 最终调用的是 Unsafe 类的本地方法：

```java
public class LockSupport {
    private static final Unsafe U = Unsafe.getUnsafe();
    
    public static void park() {
        U.park(false, 0L);
    }
    
    public static void unpark(Thread thread) {
        if (thread != null) {
            U.unpark(thread);
        }
    }
}
```

### 线程状态

当线程调用 `park()` 时，线程状态变为 `WAITING` 或 `TIMED_WAITING`：

```java
public class ThreadStateExample {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            System.out.println("Before park: " + Thread.currentThread().getState());
            LockSupport.park();
            System.out.println("After unpark: " + Thread.currentThread().getState());
        });
        
        t.start();
        Thread.sleep(100);
        
        System.out.println("While parked: " + t.getState()); // WAITING
        
        LockSupport.unpark(t);
        t.join();
    }
}
```

## 应用场景

### 1. 自定义同步器

LockSupport 是 AQS（AbstractQueuedSynchronizer）的基础：

```java
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

public class SimpleMutex {
    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire(int acquires) {
            return compareAndSetState(0, 1);
        }
        
        @Override
        protected boolean tryRelease(int releases) {
            setState(0);
            return true;
        }
        
        @Override
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }
    }
    
    private final Sync sync = new Sync();
    
    public void lock() {
        sync.acquire(1);
    }
    
    public void unlock() {
        sync.release(1);
    }
}
```

### 2. 实现简单的队列

```java
import java.util.concurrent.atomic.AtomicReference;

public class SimpleLockFreeQueue<T> {
    private static class Node<T> {
        final T item;
        volatile Node<T> next;
        
        Node(T item) {
            this.item = item;
        }
    }
    
    private final AtomicReference<Node<T>> head = new AtomicReference<>();
    private final AtomicReference<Node<T>> tail = new AtomicReference<>();
    
    public SimpleLockFreeQueue() {
        Node<T> dummy = new Node<>(null);
        head.set(dummy);
        tail.set(dummy);
    }
    
    public void enqueue(T item) {
        Node<T> newNode = new Node<>(item);
        Node<T> currentTail;
        
        while (true) {
            currentTail = tail.get();
            Node<T> tailNext = currentTail.next;
            
            if (currentTail == tail.get()) {
                if (tailNext != null) {
                    // 帮助其他线程完成入队
                    tail.compareAndSet(currentTail, tailNext);
                } else {
                    if (currentTail.next == null) {
                        currentTail.next = newNode;
                        tail.compareAndSet(currentTail, newNode);
                        return;
                    }
                }
            }
        }
    }
    
    public T dequeue() {
        Node<T> currentHead, currentTail, firstNode;
        
        while (true) {
            currentHead = head.get();
            currentTail = tail.get();
            firstNode = currentHead.next;
            
            if (currentHead == head.get()) {
                if (currentHead == currentTail) {
                    if (firstNode == null) {
                        return null; // 队列为空
                    }
                    // 帮助其他线程完成入队
                    tail.compareAndSet(currentTail, firstNode);
                } else {
                    if (head.compareAndSet(currentHead, firstNode)) {
                        return firstNode.item;
                    }
                }
            }
        }
    }
}
```

### 3. 线程间精确通信

```java
public class PreciseCommunication {
    private volatile Thread producer, consumer;
    
    public void produce() {
        producer = Thread.currentThread();
        
        // 生产数据
        System.out.println("Producing data...");
        
        // 唤醒消费者
        if (consumer != null) {
            LockSupport.unpark(consumer);
        }
        
        // 等待消费者处理完成
        LockSupport.park();
        System.out.println("Producer resumed");
    }
    
    public void consume() {
        consumer = Thread.currentThread();
        
        // 等待生产者
        LockSupport.park();
        System.out.println("Consumer started");
        
        // 消费数据
        System.out.println("Consuming data...");
        
        // 唤醒生产者
        if (producer != null) {
            LockSupport.unpark(producer);
        }
    }
}
```

### 4. 实现超时控制

```java
public class TimeoutControl {
    public boolean doWithTimeout(Runnable task, long timeoutMs) {
        Thread worker = new Thread(task);
        Thread timer = new Thread(() -> {
            try {
                Thread.sleep(timeoutMs);
                // 超时后中断工作线程
                worker.interrupt();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        worker.start();
        timer.start();
        
        try {
            worker.join();
            timer.interrupt(); // 任务完成，停止计时器
            return true;
        } catch (InterruptedException e) {
            return false;
        }
    }
    
    // 使用 parkNanos 实现精确超时
    public void preciseTimeoutExample() {
        long deadline = System.nanoTime() + 1000000000L; // 1秒后
        
        while (System.nanoTime() < deadline) {
            // 执行任务
            if (taskCompleted()) {
                return;
            }
            
            // 精确等待
            LockSupport.parkNanos(1000000); // 1毫秒
        }
        
        System.out.println("Timeout!");
    }
}
```

## 最佳实践

### 1. 正确处理中断

```java
public class InterruptHandling {
    public void parkWithInterruptCheck() {
        while (!Thread.currentThread().isInterrupted()) {
            // 执行一些工作
            doSomeWork();
            
            // 检查中断状态后park
            LockSupport.park();
            
            // 被唤醒后检查中断状态
            if (Thread.currentThread().isInterrupted()) {
                break;
            }
        }
    }
    
    public void responsivePark() {
        Object blocker = new Object();
        
        while (true) {
            LockSupport.park(blocker);
            
            // 检查是否被中断
            if (Thread.interrupted()) {
                // 清理资源
                cleanup();
                break;
            }
            
            // 正常处理
            processTask();
        }
    }
}
```

### 2. 避免死锁

```java
public class DeadlockAvoidance {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    
    // 错误的做法：可能死锁
    public void wrongApproach() {
        synchronized (lock1) {
            synchronized (lock2) {
                LockSupport.park(); // 在持有锁的情况下park
            }
        }
    }
    
    // 正确的做法：避免在持有锁时park
    public void correctApproach() {
        // 获取必要的资源
        acquireResources();
        
        try {
            // 释放锁后再park
            LockSupport.park();
        } finally {
            // 被唤醒后重新获取资源
            reacquireResources();
        }
    }
}
```

### 3. 使用 blocker 对象便于调试

```java
public class DebuggablePark {
    private final Object parkBlocker = new Object();
    
    public void debuggableMethod() {
        // 使用 blocker 对象，便于线程转储时识别
        LockSupport.park(parkBlocker);
        
        // 处理任务
        processTask();
    }
    
    public void dumpThreadInfo() {
        Thread.dumpStack();
        // 线程转储会显示 parkBlocker 信息，便于调试
    }
}
```

## 常见问题与解决方案

### 问题1：park() 后无法被唤醒

**症状：** 线程调用 `park()` 后一直阻塞

**可能原因：**
1. 没有对应的 `unpark()` 调用
2. 线程被中断但未正确处理
3. 许可机制使用不当

**解决方案：**

```java
public class ReliablePark {
    private volatile boolean shouldPark = true;
    private final Thread workerThread;
    
    public ReliablePark() {
        workerThread = new Thread(this::work);
        workerThread.start();
    }
    
    private void work() {
        while (!Thread.currentThread().isInterrupted()) {
            if (shouldPark) {
                // 设置超时，避免永久阻塞
                LockSupport.parkNanos(1000000000L); // 1秒超时
                
                if (Thread.currentThread().isInterrupted()) {
                    break;
                }
            }
            
            // 执行工作
            doWork();
        }
    }
    
    public void stop() {
        workerThread.interrupt();
        LockSupport.unpark(workerThread); // 确保线程能被唤醒
    }
}
```

### 问题2：许可计数错误

**症状：** 多次 `unpark()` 后 `park()` 仍然阻塞

**原因：** 许可机制是二进制（0或1），不是计数器

**解决方案：**

```java
public class PermitAware {
    private volatile boolean permitAvailable = false;
    
    public void acquire() {
        while (true) {
            if (permitAvailable) {
                permitAvailable = false;
                return;
            }
            LockSupport.park();
        }
    }
    
    public void release() {
        permitAvailable = true;
        LockSupport.unpark(Thread.currentThread());
    }
}
```

### 问题3：与 synchronized 混用导致死锁

**症状：** 在同步块内调用 `park()` 导致死锁

**解决方案：**

```java
public class SafeSynchronizedPark {
    private final Object lock = new Object();
    private volatile boolean condition = false;
    
    public void safeMethod() {
        // 不在同步块内park
        while (!condition) {
            synchronized (lock) {
                if (condition) {
                    break;
                }
            }
            
            // 在同步块外park
            LockSupport.park();
        }
        
        // 执行需要同步的操作
        synchronized (lock) {
            doSynchronizedWork();
        }
    }
}
```

## 性能考虑

### 性能特点

| 操作 | 性能特点 | 适用场景 |
|------|----------|----------|
| park()/unpark() | 轻量级，无系统调用 | 高频率线程同步 |
| wait()/notify() | 重量级，涉及系统调用 | 低频同步 |
| Thread.sleep() | 重量级，精确计时 | 定时任务 |

### 性能优化建议

1. **避免频繁 park/unpark**：对于高频操作，考虑使用自旋或队列
2. **合理设置超时**：避免无限期等待
3. **使用合适的同步机制**：根据场景选择最合适的工具

## 总结

LockSupport 是 Java 并发编程的重要基础工具，具有以下优势：

1. **灵活性**：不依赖对象监视器，可在任意位置调用
2. **安全性**：许可机制避免信号丢失问题
3. **精确性**：支持指定线程的精确唤醒
4. **性能**：底层实现高效，适合高并发场景

正确使用 LockSupport 需要注意：
- 合理处理中断
- 避免在持有锁时调用 park()
- 理解许可机制的特性
- 使用 blocker 对象便于调试

LockSupport 是现代并发工具的基础，掌握其原理和使用方法对于开发高性能并发应用至关重要。

最后更新时间：2024-01-15