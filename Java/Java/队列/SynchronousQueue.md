# SynchronousQueue

## 定义与作用

SynchronousQueue 是 Java 并发包中一种特殊的零容量阻塞队列，它实现了生产者与消费者之间的一对一直接交付（handoff）机制。与传统的缓冲队列不同，SynchronousQueue 不存储任何元素，每个插入操作必须等待对应的取出操作，反之亦然。

**主要特性：**
- 零容量：队列本身不存储任何元素
- 直接交付：生产者与消费者必须同时存在才能完成操作
- 阻塞机制：插入和取出操作在没有配对线程时会阻塞
- 公平性选项：支持公平和非公平两种模式
- 高吞吐：在合适的场景下提供极高的并发性能

## 核心原理

### 数据结构
SynchronousQueue 使用两种内部数据结构，根据公平性模式选择：

```java
// 非公平模式使用栈结构（LIFO）
private transient volatile TransferStack<E> transferStack;

// 公平模式使用队列结构（FIFO）
private transient volatile TransferQueue<E> transferQueue;

// 公平性标志
private final boolean fair;

// 内部传输接口
abstract static class Transferer<E> {
    abstract E transfer(E e, boolean timed, long nanos);
}
```

### 传输机制
SynchronousQueue 的核心是传输机制，通过 Transferer 实现：

```java
// 传输状态定义
static final int REQUEST  = 0;  // 消费者请求
static final int DATA     = 1;  // 生产者数据
static final int FULFILLING = 2;  // 正在完成传输

// 传输节点
static final class SNode {
    volatile SNode next;        // 栈中的下一个节点
    volatile SNode match;       // 匹配的节点
    volatile Thread waiter;     // 等待的线程
    Object item;               // 传输的数据或请求
    int mode;                  // 模式（REQUEST/DATA/FULFILLING）
}
```

### 线程安全机制
- **无锁算法**：使用 CAS（Compare-And-Swap）操作实现线程安全
- **等待队列**：通过栈或队列管理等待的线程
- **匹配机制**：生产者和消费者通过模式匹配完成数据传输

## 构造方法

### 基本构造方法
```java
// 默认构造方法（非公平模式）
SynchronousQueue<String> queue1 = new SynchronousQueue<>();

// 指定公平性模式
SynchronousQueue<String> queue2 = new SynchronousQueue<>(true);  // 公平模式
SynchronousQueue<String> queue3 = new SynchronousQueue<>(false); // 非公平模式

// 验证队列特性
System.out.println("容量: " + queue1.remainingCapacity());  // 0
System.out.println("大小: " + queue1.size());              // 0
System.out.println("是否为空: " + queue1.isEmpty());        // true
```

### 公平模式 vs 非公平模式
```java
public class FairnessComparison {
    public static void main(String[] args) throws InterruptedException {
        // 非公平模式（默认）
        SynchronousQueue<String> unfairQueue = new SynchronousQueue<>(false);
        
        // 公平模式
        SynchronousQueue<String> fairQueue = new SynchronousQueue<>(true);
        
        // 测试公平性差异
        testFairness(unfairQueue, "非公平模式");
        testFairness(fairQueue, "公平模式");
    }
    
    private static void testFairness(SynchronousQueue<String> queue, String mode) 
            throws InterruptedException {
        System.out.println("=== " + mode + "测试 ===");
        
        // 创建多个消费者
        for (int i = 0; i < 3; i++) {
            final int consumerId = i;
            new Thread(() -> {
                try {
                    String item = queue.take();
                    System.out.println(mode + " - 消费者" + consumerId + " 收到: " + item);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }
        
        Thread.sleep(100);  // 确保消费者先启动
        
        // 创建多个生产者
        for (int i = 0; i < 3; i++) {
            final int producerId = i;
            new Thread(() -> {
                try {
                    queue.put("消息来自生产者" + producerId);
                    System.out.println(mode + " - 生产者" + producerId + " 完成发送");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }
        
        Thread.sleep(2000);
        System.out.println();
    }
}
```

## 核心方法详解

### 插入操作

#### put() 方法 - 阻塞插入
```java
public class PutExample {
    public static void main(String[] args) throws InterruptedException {
        SynchronousQueue<String> queue = new SynchronousQueue<>();
        
        // 先启动消费者
        Thread consumer = new Thread(() -> {
            try {
                System.out.println("消费者启动，等待数据...");
                String data = queue.take();
                System.out.println("消费者收到: " + data);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        consumer.start();
        
        Thread.sleep(100);  // 确保消费者先启动
        
        // 生产者插入数据
        System.out.println("生产者开始插入数据...");
        long startTime = System.currentTimeMillis();
        queue.put("Hello SynchronousQueue");
        long endTime = System.currentTimeMillis();
        
        System.out.println("插入完成，耗时: " + (endTime - startTime) + "ms");
        
        consumer.join();
    }
}
```

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        SynchronousQueue<String> queue = new SynchronousQueue<>();
        
        // 没有消费者时立即返回 false
        boolean result1 = queue.offer("立即尝试");
        System.out.println("立即插入结果: " + result1);  // false
        
        // 带超时的offer
        try {
            boolean result2 = queue.offer("带超时尝试", 1, TimeUnit.SECONDS);
            System.out.println("带超时插入结果: " + result2);  // false（1秒内无消费者）
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 有消费者时的插入
        Thread consumer = new Thread(() -> {
            try {
                String data = queue.take();
                System.out.println("消费者收到: " + data);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        consumer.start();
        
        try {
            Thread.sleep(100);  // 确保消费者启动
            boolean result3 = queue.offer("有消费者时插入");
            System.out.println("有消费者时插入结果: " + result3);  // true
            
            consumer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 取出操作

#### take() 方法 - 阻塞取出
```java
public class TakeExample {
    public static void main(String[] args) throws InterruptedException {
        SynchronousQueue<String> queue = new SynchronousQueue<>();
        
        // 消费者线程
        Thread consumer = new Thread(() -> {
            try {
                System.out.println("消费者等待数据...");
                long startTime = System.currentTimeMillis();
                String data = queue.take();
                long endTime = System.currentTimeMillis();
                System.out.println("收到数据: " + data);
                System.out.println("等待时间: " + (endTime - startTime) + "ms");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        consumer.start();
        
        // 延迟2秒后生产者插入数据
        Thread.sleep(2000);
        
        Thread producer = new Thread(() -> {
            try {
                System.out.println("生产者开始插入数据...");
                queue.put("延迟数据");
                System.out.println("生产者插入完成");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        producer.start();
        
        consumer.join();
        producer.join();
    }
}
```

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        SynchronousQueue<String> queue = new SynchronousQueue<>();
        
        // 没有生产者时立即返回 null
        String result1 = queue.poll();
        System.out.println("立即取出结果: " + result1);  // null
        
        // 带超时的poll
        try {
            String result2 = queue.poll(2, TimeUnit.SECONDS);
            System.out.println("带超时取出结果: " + result2);  // null（2秒内无生产者）
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 有生产者时的取出
        Thread producer = new Thread(() -> {
            try {
                queue.put("生产者数据");
                System.out.println("生产者插入完成");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        producer.start();
        
        try {
            Thread.sleep(100);  // 确保生产者启动
            String result3 = queue.poll();
            System.out.println("有生产者时取出结果: " + result3);  // "生产者数据"
            
            producer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

#### peek() 方法 - 查看但不移除
```java
public class PeekExample {
    public static void main(String[] args) {
        SynchronousQueue<String> queue = new SynchronousQueue<>();
        
        // SynchronousQueue 的 peek() 总是返回 null
        // 因为队列不存储任何元素
        String result = queue.peek();
        System.out.println("peek 结果: " + result);  // null
        
        // 即使有生产者和消费者正在进行传输
        Thread producer = new Thread(() -> {
            try {
                queue.put("测试数据");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        Thread consumer = new Thread(() -> {
            try {
                queue.take();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        producer.start();
        consumer.start();
        
        // 在传输过程中 peek 仍然返回 null
        String result2 = queue.peek();
        System.out.println("传输中 peek 结果: " + result2);  // null
        
        try {
            producer.join();
            consumer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

## 实际应用场景

### 线程池工作队列
```java
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;

public class ThreadPoolWithSynchronousQueue {
    public static void main(String[] args) throws InterruptedException {
        // 使用 SynchronousQueue 创建缓存线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            0,                      // 核心线程数
            Integer.MAX_VALUE,       // 最大线程数
            60L,                    // 空闲线程存活时间
            TimeUnit.SECONDS,       // 时间单位
            new SynchronousQueue<>() // 工作队列
        );
        
        System.out.println("使用 SynchronousQueue 的线程池特性:");
        System.out.println("- 无核心线程，任务到来时创建新线程");
        System.out.println("- 线程空闲60秒后会被回收");
        System.out.println("- 适合短生命周期的异步任务");
        
        // 提交多个任务
        for (int i = 0; i < 5; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("任务" + taskId + " 在线程 " + 
                    Thread.currentThread().getName() + " 执行");
                try {
                    Thread.sleep(1000);  // 模拟任务执行
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        // 监控线程池状态
        System.out.println("活动线程数: " + executor.getActiveCount());
        System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
        
        // 关闭线程池
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }
}
```

### 直接任务交付系统
```java
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class DirectTaskDelivery {
    static class Task {
        final String name;
        final int priority;
        
        Task(String name, int priority) {
            this.name = name;
            this.priority = priority;
        }
        
        @Override
        public String toString() {
            return name + "(优先级: " + priority + ")";
        }
    }
    
    private final SynchronousQueue<Task> deliveryQueue = new SynchronousQueue<>();
    private final AtomicInteger taskCounter = new AtomicInteger(0);
    private volatile boolean running = true;
    
    public void startWorker(String workerName) {
        Thread worker = new Thread(() -> {
            System.out.println(workerName + " 启动");
            while (running) {
                try {
                    // 直接接收任务（阻塞等待）
                    Task task = deliveryQueue.take();
                    System.out.println(workerName + " 处理: " + task);
                    
                    // 模拟任务处理
                    Thread.sleep(500);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println(workerName + " 停止");
        });
        worker.start();
    }
    
    public void submitTask(String taskName, int priority) {
        Thread producer = new Thread(() -> {
            try {
                Task task = new Task(taskName, priority);
                System.out.println("提交任务: " + task);
                
                // 直接交付任务（阻塞直到有工作者接收）
                deliveryQueue.put(task);
                
                System.out.println("任务交付完成: " + task);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        producer.start();
    }
    
    public void stop() {
        running = false;
    }
    
    public static void main(String[] args) throws InterruptedException {
        DirectTaskDelivery system = new DirectTaskDelivery();
        
        // 启动工作者
        system.startWorker("工作者1");
        system.startWorker("工作者2");
        
        Thread.sleep(100);  // 确保工作者启动
        
        // 提交任务
        system.submitTask("数据处理", 1);
        system.submitTask("文件上传", 2);
        system.submitTask("缓存更新", 3);
        system.submitTask("日志清理", 1);
        
        // 运行一段时间后停止
        Thread.sleep(3000);
        system.stop();
    }
}
```

### 实时消息传递系统
```java
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;

public class RealTimeMessaging {
    static class Message {
        final String content;
        final long timestamp;
        
        Message(String content) {
            this.content = content;
            this.timestamp = System.currentTimeMillis();
        }
        
        @Override
        public String toString() {
            return "[" + timestamp + "] " + content;
        }
    }
    
    private final SynchronousQueue<Message> messageQueue = new SynchronousQueue<>();
    
    public void startReceiver(String receiverName) {
        Thread receiver = new Thread(() -> {
            System.out.println(receiverName + " 开始接收消息");
            while (true) {
                try {
                    Message message = messageQueue.take();
                    long deliveryTime = System.currentTimeMillis() - message.timestamp;
                    System.out.println(receiverName + " 收到: " + message + 
                        " (延迟: " + deliveryTime + "ms)");
                    
                } catch (InterruptedException e) {
                    System.out.println(receiverName + " 被中断");
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        receiver.start();
    }
    
    public void sendMessage(String content) {
        Thread sender = new Thread(() -> {
            try {
                Message message = new Message(content);
                System.out.println("发送消息: " + message.content);
                
                // 尝试发送，超时时间为3秒
                boolean sent = messageQueue.offer(message, 3, TimeUnit.SECONDS);
                
                if (sent) {
                    System.out.println("消息发送成功: " + content);
                } else {
                    System.out.println("消息发送超时: " + content);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        sender.start();
    }
    
    public static void main(String[] args) throws InterruptedException {
        RealTimeMessaging system = new RealTimeMessaging();
        
        // 启动接收者
        system.startReceiver("接收者A");
        
        Thread.sleep(100);  // 确保接收者启动
        
        // 发送消息
        system.sendMessage("紧急通知");
        system.sendMessage("系统警报");
        system.sendMessage("状态更新");
        
        // 在没有接收者时发送消息（会超时）
        Thread.sleep(2000);
        system.sendMessage("无人接收的消息");
        
        Thread.sleep(5000);
    }
}
```

## 性能特点与优化

### 性能特点
- **零延迟交付**：生产者与消费者直接对接，无缓冲延迟
- **高吞吐量**：在配对良好的场景下性能优异
- **内存效率**：不存储元素，内存占用最小
- **线程管理**：需要精确的线程数量控制

### 与其他队列对比
| 特性 | SynchronousQueue | ArrayBlockingQueue | LinkedBlockingQueue |
|------|------------------|-------------------|---------------------|
| 容量 | 0 | 固定有界 | 可选有界 |
| 存储机制 | 直接交付 | 数组存储 | 链表存储 |
| 适用场景 | 实时交付 | 缓冲队列 | 通用队列 |
| 内存使用 | 最低 | 固定 | 动态 |
| 吞吐量 | 高（配对良好） | 中等 | 高 |

### 性能优化建议

#### 线程池配置优化
```java
public class ThreadPoolOptimization {
    public static ThreadPoolExecutor createOptimizedPool() {
        return new ThreadPoolExecutor(
            // 核心配置
            0,                      // 无核心线程（适合突发任务）
            Math.min(Runtime.getRuntime().availableProcessors() * 2, 50), // 限制最大线程
            30L, TimeUnit.SECONDS,  // 较短的空闲时间
            new SynchronousQueue<>(), // 直接交付队列
            
            // 线程工厂（命名线程便于监控）
            r -> {
                Thread t = new Thread(r, "SynchronousWorker-" + System.currentTimeMillis());
                t.setDaemon(false);
                return t;
            },
            
            // 拒绝策略（自定义处理）
            (r, executor) -> {
                System.out.println("任务被拒绝，当前活动线程: " + executor.getActiveCount());
                // 可以记录日志或采取其他措施
            }
        );
    }
    
    public static void main(String[] args) {
        ThreadPoolExecutor executor = createOptimizedPool();
        
        // 监控线程池状态
        executor.setRejectedExecutionHandler((r, e) -> {
            System.err.println("任务拒绝: " + r.toString());
        });
        
        // 使用示例
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.execute(() -> {
                System.out.println("执行任务 " + taskId);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        executor.shutdown();
    }
}
```

#### 超时控制优化
```java
public class TimeoutOptimization {
    private final SynchronousQueue<String> queue = new SynchronousQueue<>();
    
    public boolean sendWithBackpressure(String message, long timeout, TimeUnit unit) {
        try {
            return queue.offer(message, timeout, unit);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    public String receiveWithTimeout(long timeout, TimeUnit unit) {
        try {
            return queue.poll(timeout, unit);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }
    
    public void gracefulShutdown() {
        // 优雅关闭：等待当前传输完成
        while (!queue.isEmpty()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}
```

## 常见问题与解决方案

### 问题1：线程饥饿
**解决方案**：使用公平模式或限制线程数量
```java
public class FairnessSolution {
    // 使用公平模式避免线程饥饿
    private final SynchronousQueue<String> fairQueue = new SynchronousQueue<>(true);
    
    // 限制最大并发线程数
    private final Semaphore semaphore = new Semaphore(10);  // 最大10个并发
    
    public void sendWithConcurrencyControl(String message) throws InterruptedException {
        semaphore.acquire();  // 获取许可
        try {
            fairQueue.put(message);
        } finally {
            semaphore.release();  // 释放许可
        }
    }
}
```

### 问题2：死锁风险
**解决方案**：使用超时机制和死锁检测
```java
public class DeadlockPrevention {
    private final SynchronousQueue<String> queue = new SynchronousQueue<>();
    
    public boolean safeSend(String message, long timeoutMs) {
        try {
            return queue.offer(message, timeoutMs, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    public String safeReceive(long timeoutMs) {
        try {
            String result = queue.poll(timeoutMs, TimeUnit.MILLISECONDS);
            if (result == null) {
                System.out.println("接收超时，可能发生死锁");
            }
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }
}
```

### 问题3：资源泄漏
**解决方案**：实现资源清理机制
```java
public class ResourceCleanup {
    private final SynchronousQueue<Resource> queue = new SynchronousQueue<>();
    private final AtomicBoolean shutdown = new AtomicBoolean(false);
    
    static class Resource implements AutoCloseable {
        private final String name;
        
        Resource(String name) { this.name = name; }
        
        @Override
        public void close() {
            System.out.println("清理资源: " + name);
        }
    }
    
    public void sendResource(Resource resource) throws InterruptedException {
        if (shutdown.get()) {
            resource.close();  // 系统关闭时清理资源
            return;
        }
        queue.put(resource);
    }
    
    public void shutdown() {
        shutdown.set(true);
        // 清理队列中可能存在的资源
        Resource resource;
        while ((resource = queue.poll()) != null) {
            resource.close();
        }
    }
}
```

## 最佳实践

1. **选择合适的模式**：
   - 非公平模式：追求最高吞吐量
   - 公平模式：避免线程饥饿，保证公平性

2. **精确控制线程数量**：
   - 生产者与消费者数量要匹配
   - 使用线程池管理并发线程

3. **实现超时机制**：
   - 所有阻塞操作都应该有超时限制
   - 监控系统健康状况

4. **资源管理**：
   - 实现优雅关闭机制
   - 确保资源正确清理

5. **监控和日志**：
   - 记录传输延迟和成功率
   - 监控线程池状态

## 总结

SynchronousQueue 是 Java 并发编程中一种特殊但强大的工具，它通过零容量设计和直接交付机制，在特定场景下提供了极高的性能。正确使用 SynchronousQueue 需要深入理解其工作原理，并注意线程管理、超时控制和资源清理等关键问题。

在缓存线程池、实时消息传递、直接任务交付等场景中，SynchronousQueue 都能发挥出色的作用。但需要注意，它不适合需要缓冲或排队功能的场景，在这些情况下应该选择其他 BlockingQueue 实现。

最后更新时间：2024-01-15