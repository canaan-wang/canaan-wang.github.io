# LinkedBlockingQueue

## 定义与作用

LinkedBlockingQueue 是 Java 并发包中基于链表实现的可选有界阻塞队列，采用 FIFO（先进先出）策略。它通过分离的读写锁机制提供高并发性能，是生产-消费者模式中最常用的队列实现之一。

**主要特性：**
- 可选有界：默认容量为 Integer.MAX_VALUE（近似无界），也可显式设置容量
- 链表结构：基于链表实现，动态扩容
- 分离锁机制：读写操作使用不同的锁，减少竞争
- 高并发性能：适合生产者和消费者并发较高的场景
- 阻塞操作：支持阻塞式的插入和取出操作

## 核心原理

### 数据结构
LinkedBlockingQueue 使用单向链表结构：

```java
// 链表节点定义
static class Node<E> {
    E item;
    Node<E> next;
    Node(E x) { item = x; }
}

// 队列头尾指针
private transient Node<E> head;
private transient Node<E> last;

// 分离的读写锁
private final ReentrantLock takeLock = new ReentrantLock();
private final Condition notEmpty = takeLock.newCondition();
private final ReentrantLock putLock = new ReentrantLock();
private final Condition notFull = putLock.newCondition();

// 原子计数器
private final AtomicInteger count = new AtomicInteger();
```

### 分离锁机制
LinkedBlockingQueue 采用分离锁设计：
- **takeLock**：控制取出操作和 notEmpty 条件
- **putLock**：控制插入操作和 notFull 条件
- **count**：原子计数器，用于快速判断队列状态

这种设计使得生产者和消费者可以并发操作，大大提高了吞吐量。

## 构造方法

### 基本构造方法
```java
// 默认构造方法（近似无界）
LinkedBlockingQueue<String> queue1 = new LinkedBlockingQueue<>();

// 指定容量构造方法
LinkedBlockingQueue<String> queue2 = new LinkedBlockingQueue<>(100);

// 从现有集合创建
List<String> list = Arrays.asList("A", "B", "C");
LinkedBlockingQueue<String> queue3 = new LinkedBlockingQueue<>(list);
```

### 容量选择建议
```java
public class CapacityExample {
    public static void main(String[] args) {
        // 场景1：内存敏感，需要控制队列大小
        LinkedBlockingQueue<String> boundedQueue = new LinkedBlockingQueue<>(1000);
        
        // 场景2：高吞吐，不关心内存占用
        LinkedBlockingQueue<String> unboundedQueue = new LinkedBlockingQueue<>();
        
        // 场景3：根据系统资源动态设置容量
        int availableMemory = Runtime.getRuntime().availableProcessors() * 1000;
        LinkedBlockingQueue<String> dynamicQueue = new LinkedBlockingQueue<>(availableMemory);
        
        System.out.println("动态队列容量: " + availableMemory);
    }
}
```

## 核心方法详解

### 插入操作

#### put() 方法 - 阻塞插入
```java
public class PutExample {
    public static void main(String[] args) throws InterruptedException {
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(3);
        
        // 插入元素，队列未满时立即返回
        queue.put("元素1");
        queue.put("元素2");
        queue.put("元素3");
        
        System.out.println("队列已满，当前大小: " + queue.size());  // 3
        
        // 队列已满，put操作会阻塞
        new Thread(() -> {
            try {
                System.out.println("尝试插入元素4...");
                queue.put("元素4");
                System.out.println("元素4插入成功");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        // 等待一段时间后取出元素
        Thread.sleep(2000);
        String element = queue.take();
        System.out.println("取出元素: " + element);  // 元素1
        
        // 此时队列有空位，阻塞的put操作可以继续
        Thread.sleep(1000);
        System.out.println("队列当前大小: " + queue.size());  // 3（包含新插入的元素4）
    }
}
```

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(2);
        
        // 非阻塞插入
        boolean result1 = queue.offer("元素1");  // true
        boolean result2 = queue.offer("元素2");  // true
        boolean result3 = queue.offer("元素3");  // false（队列已满）
        
        System.out.println("插入结果: " + result1 + ", " + result2 + ", " + result3);
        System.out.println("队列大小: " + queue.size());  // 2
        
        // 带超时的offer
        try {
            boolean result4 = queue.offer("元素4", 1, TimeUnit.SECONDS);
            System.out.println("带超时插入结果: " + result4);  // false（1秒内队列仍满）
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
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>();
        
        // 异步插入元素
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                queue.put("延迟元素");
                System.out.println("元素已插入");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        System.out.println("开始等待取出元素...");
        long startTime = System.currentTimeMillis();
        
        // 阻塞等待直到有元素可取
        String element = queue.take();
        long endTime = System.currentTimeMillis();
        
        System.out.println("取出元素: " + element);  // 延迟元素
        System.out.println("实际等待时间: " + (endTime - startTime) + "ms");  // ≈2000ms
    }
}
```

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>();
        
        // 队列为空时返回 null
        String element1 = queue.poll();  // null
        
        // 插入元素
        queue.offer("元素1");
        
        // 立即取出元素
        String element2 = queue.poll();  // 元素1
        
        // 再次取出，队列为空
        String element3 = queue.poll();  // null
        
        System.out.println("取出结果: " + element1 + ", " + element2 + ", " + element3);
        
        // 带超时的poll
        try {
            String element4 = queue.poll(2, TimeUnit.SECONDS);  // 等待2秒
            System.out.println("带超时取出结果: " + element4);  // null（2秒内无新元素）
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
        LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>();
        
        // 插入多个元素
        queue.offer("元素1");
        queue.offer("元素2");
        queue.offer("元素3");
        
        // 查看队首元素
        String firstElement = queue.peek();  // 元素1
        System.out.println("队首元素: " + firstElement);
        
        // 再次查看，仍然是同一个元素
        String sameElement = queue.peek();  // 元素1
        System.out.println("再次查看: " + sameElement);
        
        // 实际取出
        String actualElement = queue.poll();  // 元素1
        System.out.println("实际取出: " + actualElement);
        
        // 查看新的队首
        String newFirst = queue.peek();  // 元素2
        System.out.println("新的队首: " + newFirst);
    }
}
```

### 批量操作

#### drainTo() 方法 - 批量转移元素
```java
public class DrainToExample {
    public static void main(String[] args) {
        LinkedBlockingQueue<String> sourceQueue = new LinkedBlockingQueue<>();
        List<String> targetList = new ArrayList<>();
        
        // 插入多个元素
        sourceQueue.offer("元素1");
        sourceQueue.offer("元素2");
        sourceQueue.offer("元素3");
        sourceQueue.offer("元素4");
        
        // 批量转移所有元素
        int transferred = sourceQueue.drainTo(targetList);
        System.out.println("转移了 " + transferred + " 个元素");  // 4
        
        System.out.println("目标列表:");
        for (String element : targetList) {
            System.out.println("  " + element);
        }
        
        System.out.println("源队列剩余大小: " + sourceQueue.size());  // 0
        
        // 限制转移数量
        sourceQueue.offer("元素5");
        sourceQueue.offer("元素6");
        sourceQueue.offer("元素7");
        
        List<String> limitedList = new ArrayList<>();
        int limitedTransfer = sourceQueue.drainTo(limitedList, 2);  // 最多转移2个
        System.out.println("限制转移了 " + limitedTransfer + " 个元素");  // 2
        System.out.println("源队列剩余: " + sourceQueue.size());  // 1
    }
}
```

## 实际应用场景

### 生产者-消费者模式
```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class ProducerConsumerExample {
    private final LinkedBlockingQueue<String> messageQueue = new LinkedBlockingQueue<>(100);
    private volatile boolean running = true;
    
    // 生产者
    class Producer implements Runnable {
        private final String producerId;
        
        public Producer(String id) {
            this.producerId = id;
        }
        
        @Override
        public void run() {
            int messageCount = 0;
            while (running) {
                try {
                    String message = producerId + "-消息-" + (++messageCount);
                    messageQueue.put(message);
                    System.out.println("生产者 " + producerId + " 生产: " + message);
                    
                    // 模拟生产间隔
                    Thread.sleep(100 + (int)(Math.random() * 100));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println("生产者 " + producerId + " 停止");
        }
    }
    
    // 消费者
    class Consumer implements Runnable {
        private final String consumerId;
        
        public Consumer(String id) {
            this.consumerId = id;
        }
        
        @Override
        public void run() {
            while (running || !messageQueue.isEmpty()) {
                try {
                    // 带超时的取出，避免无限等待
                    String message = messageQueue.poll(1, TimeUnit.SECONDS);
                    if (message != null) {
                        System.out.println("消费者 " + consumerId + " 消费: " + message);
                        // 模拟消费处理时间
                        Thread.sleep(50 + (int)(Math.random() * 50));
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println("消费者 " + consumerId + " 停止");
        }
    }
    
    public void start(int producerCount, int consumerCount) {
        // 启动生产者
        for (int i = 1; i <= producerCount; i++) {
            new Thread(new Producer("P" + i)).start();
        }
        
        // 启动消费者
        for (int i = 1; i <= consumerCount; i++) {
            new Thread(new Consumer("C" + i)).start();
        }
    }
    
    public void stop() {
        running = false;
    }
    
    public static void main(String[] args) throws InterruptedException {
        ProducerConsumerExample example = new ProducerConsumerExample();
        
        // 启动2个生产者，3个消费者
        example.start(2, 3);
        
        // 运行一段时间后停止
        Thread.sleep(10000);
        example.stop();
        System.out.println("生产消费者模式已停止");
    }
}
```

### 任务调度系统
```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class TaskScheduler {
    private final LinkedBlockingQueue<Runnable> taskQueue;
    private final ThreadPoolExecutor executor;
    
    public TaskScheduler(int corePoolSize, int maxPoolSize, int queueCapacity) {
        this.taskQueue = new LinkedBlockingQueue<>(queueCapacity);
        this.executor = new ThreadPoolExecutor(
            corePoolSize, maxPoolSize, 
            60L, TimeUnit.SECONDS, 
            taskQueue
        );
    }
    
    public void submitTask(Runnable task) {
        try {
            executor.execute(task);
            System.out.println("任务已提交，队列大小: " + taskQueue.size());
        } catch (Exception e) {
            System.err.println("任务提交失败: " + e.getMessage());
        }
    }
    
    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        TaskScheduler scheduler = new TaskScheduler(2, 4, 10);
        
        // 提交多个任务
        for (int i = 1; i <= 15; i++) {
            final int taskId = i;
            scheduler.submitTask(() -> {
                System.out.println("执行任务 " + taskId + " on " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);  // 模拟任务执行
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            
            // 控制提交速度
            Thread.sleep(200);
        }
        
        // 等待任务完成
        Thread.sleep(5000);
        scheduler.shutdown();
        System.out.println("任务调度器已关闭");
    }
}
```

### 消息缓冲系统
```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicLong;

public class MessageBuffer {
    private final LinkedBlockingQueue<String> buffer;
    private final AtomicLong totalMessages;
    private final int batchSize;
    
    public MessageBuffer(int capacity, int batchSize) {
        this.buffer = new LinkedBlockingQueue<>(capacity);
        this.totalMessages = new AtomicLong(0);
        this.batchSize = batchSize;
    }
    
    public void addMessage(String message) throws InterruptedException {
        buffer.put(message);
        totalMessages.incrementAndGet();
        
        // 批量处理检查
        if (buffer.size() >= batchSize) {
            processBatch();
        }
    }
    
    private void processBatch() {
        // 批量处理逻辑
        System.out.println("处理批次，队列大小: " + buffer.size());
        
        // 这里可以实现批量写入数据库、发送到消息队列等操作
        // 处理完成后清空批次
        buffer.clear();
    }
    
    public void startBackgroundProcessor() {
        Thread processor = new Thread(() -> {
            while (true) {
                try {
                    // 定期检查并处理
                    Thread.sleep(5000);  // 5秒检查一次
                    if (!buffer.isEmpty()) {
                        processBatch();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        processor.setDaemon(true);
        processor.start();
    }
    
    public static void main(String[] args) throws InterruptedException {
        MessageBuffer buffer = new MessageBuffer(100, 10);
        buffer.startBackgroundProcessor();
        
        // 模拟消息流入
        for (int i = 1; i <= 50; i++) {
            buffer.addMessage("消息" + i);
            Thread.sleep(100);
        }
        
        Thread.sleep(10000);
        System.out.println("总处理消息数: " + buffer.totalMessages.get());
    }
}
```

## 性能特点与优化

### 性能特点
- **高并发性能**：分离锁设计，生产者和消费者可以并发操作
- **动态扩容**：链表结构支持动态增长
- **内存效率**：每个元素需要额外的节点对象开销
- **阻塞控制**：支持精确的容量控制和阻塞策略

### 与 ArrayBlockingQueue 对比
| 特性 | LinkedBlockingQueue | ArrayBlockingQueue |
|------|---------------------|-------------------|
| 数据结构 | 链表 | 数组 |
| 锁机制 | 分离锁（读写分离） | 单锁 |
| 内存使用 | 动态增长，每个元素有节点开销 | 固定大小，连续内存 |
| 并发性能 | 高（生产消费可并发） | 中等（锁竞争较多） |
| 适用场景 | 高并发生产消费、批量处理 | 固定容量、内存敏感场景 |

### 性能优化建议

#### 容量优化
```java
// 根据业务需求合理设置容量
public class CapacityOptimization {
    // 内存敏感场景：设置较小容量
    public static LinkedBlockingQueue<String> createMemorySensitiveQueue() {
        return new LinkedBlockingQueue<>(1000);
    }
    
    // 高吞吐场景：使用默认大容量
    public static LinkedBlockingQueue<String> createHighThroughputQueue() {
        return new LinkedBlockingQueue<>();
    }
    
    // 动态容量：根据系统资源调整
    public static LinkedBlockingQueue<String> createDynamicQueue() {
        int processors = Runtime.getRuntime().availableProcessors();
        int capacity = processors * 500;  // 每个处理器500个元素
        return new LinkedBlockingQueue<>(capacity);
    }
}
```

#### 批量操作优化
```java
public class BatchOptimization {
    private final LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(1000);
    
    // 批量插入优化
    public void batchPut(List<String> messages) throws InterruptedException {
        for (String message : messages) {
            queue.put(message);
        }
    }
    
    // 批量取出优化
    public List<String> batchTake(int batchSize) throws InterruptedException {
        List<String> batch = new ArrayList<>(batchSize);
        queue.drainTo(batch, batchSize);
        
        // 如果批量取出不足，补充单个取出
        while (batch.size() < batchSize && !queue.isEmpty()) {
            String element = queue.poll(100, TimeUnit.MILLISECONDS);
            if (element != null) {
                batch.add(element);
            }
        }
        
        return batch;
    }
}
```

## 常见问题与解决方案

### 问题1：内存溢出
**解决方案**：合理设置队列容量，监控队列大小
```java
public class MemorySafeQueue {
    private static final int MAX_QUEUE_SIZE = 10000;
    private final LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(MAX_QUEUE_SIZE);
    
    public boolean safePut(String message) throws InterruptedException {
        if (queue.size() < MAX_QUEUE_SIZE * 0.9) {
            // 队列有足够空间，直接插入
            queue.put(message);
            return true;
        } else {
            // 队列接近满，尝试带超时插入
            return queue.offer(message, 1, TimeUnit.SECONDS);
        }
    }
    
    public void monitorQueueSize() {
        // 定期监控队列大小
        int size = queue.size();
        if (size > MAX_QUEUE_SIZE * 0.8) {
            System.out.println("警告：队列使用率超过80%，当前大小: " + size);
        }
    }
}
```

### 问题2：生产者过快
**解决方案**：实现背压机制，控制生产速度
```java
public class BackPressureQueue {
    private final LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
    
    public void putWithBackPressure(String message) throws InterruptedException {
        while (queue.size() > 80) {
            // 队列接近满，等待消费者处理
            Thread.sleep(100);
        }
        queue.put(message);
    }
    
    public void adaptivePut(String message) throws InterruptedException {
        int retryCount = 0;
        while (!queue.offer(message, 100, TimeUnit.MILLISECONDS)) {
            retryCount++;
            if (retryCount > 10) {
                // 多次重试失败，丢弃消息或记录日志
                System.out.println("队列满，丢弃消息: " + message);
                return;
            }
        }
    }
}
```

### 问题3：消费者饥饿
**解决方案**：公平调度，确保所有消费者都能获取任务
```java
public class FairScheduling {
    private final LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>();
    private final AtomicInteger consumerCounter = new AtomicInteger(0);
    
    public String fairTake() throws InterruptedException {
        // 记录消费者活跃数
        consumerCounter.incrementAndGet();
        try {
            return queue.take();
        } finally {
            consumerCounter.decrementAndGet();
        }
    }
    
    public void monitorConsumerBalance() {
        // 监控消费者负载均衡
        int activeConsumers = consumerCounter.get();
        int queueSize = queue.size();
        
        if (activeConsumers == 0 && queueSize > 0) {
            System.out.println("警告：有任务但无活跃消费者");
        }
    }
}
```

## 最佳实践

1. **容量规划**：根据业务需求和系统资源合理设置队列容量
2. **监控告警**：实现队列大小监控和告警机制
3. **异常处理**：完善的生产者消费者异常处理逻辑
4. **性能测试**：在生产环境前进行充分的性能测试
5. **资源清理**：及时关闭不再使用的队列和相关资源

## 总结

LinkedBlockingQueue 是 Java 并发编程中功能强大、性能优异的阻塞队列实现。通过合理的分离锁设计和灵活的容量控制，它能够满足各种高并发场景的需求。在实际使用中，需要根据具体业务特点进行适当的配置和优化。

最后更新时间：2024-01-15