# DelayQueue

## 定义与作用

DelayQueue 是 Java 并发包中实现延迟队列功能的阻塞队列，它存储的元素必须实现 `Delayed` 接口。队列中的元素只有在延迟时间到期后才能被取出，内部使用优先级队列（PriorityQueue）来维护元素的延迟顺序。

**主要特性：**
- 延迟队列：元素在指定延迟时间后才能被消费
- 无界队列：容量不受限制
- 阻塞操作：支持阻塞式的取出操作
- 优先级排序：按延迟时间排序，最短延迟的元素优先
- 线程安全：内部使用 ReentrantLock 保证线程安全

## 核心原理

### 数据结构
DelayQueue 使用 PriorityQueue 作为底层存储结构：

```java
// 核心数据结构
private final PriorityQueue<E> q = new PriorityQueue<E>();
private final transient ReentrantLock lock = new ReentrantLock();
private final Condition available = lock.newCondition();
private Thread leader = null;
```

### 延迟机制
DelayQueue 通过 `Delayed` 接口实现延迟功能：

```java
public interface Delayed extends Comparable<Delayed> {
    /**
     * 返回剩余的延迟时间
     * @param unit 时间单位
     * @return 剩余延迟时间
     */
    long getDelay(TimeUnit unit);
}
```

### 内部排序机制
DelayQueue 使用 PriorityQueue 进行元素排序，排序规则基于 `Delayed` 接口的 `compareTo` 方法：

```java
// 元素按延迟时间排序
@Override
public int compareTo(Delayed o) {
    return Long.compare(this.getDelay(TimeUnit.NANOSECONDS), 
                       o.getDelay(TimeUnit.NANOSECONDS));
}
```

## Delayed 接口实现

### 基本实现示例
```java
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class DelayedTask implements Delayed {
    private final long executeTime;  // 执行时间（纳秒）
    private final String taskName;    // 任务名称
    
    public DelayedTask(long delay, TimeUnit unit, String taskName) {
        this.executeTime = System.nanoTime() + unit.toNanos(delay);
        this.taskName = taskName;
    }
    
    @Override
    public long getDelay(TimeUnit unit) {
        long remaining = executeTime - System.nanoTime();
        return unit.convert(remaining, TimeUnit.NANOSECONDS);
    }
    
    @Override
    public int compareTo(Delayed other) {
        if (this == other) return 0;
        if (other instanceof DelayedTask) {
            DelayedTask otherTask = (DelayedTask) other;
            return Long.compare(this.executeTime, otherTask.executeTime);
        }
        long diff = this.getDelay(TimeUnit.NANOSECONDS) - 
                   other.getDelay(TimeUnit.NANOSECONDS);
        return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
    }
    
    @Override
    public String toString() {
        return "DelayedTask{" + taskName + ", delay=" + 
               getDelay(TimeUnit.MILLISECONDS) + "ms}";
    }
}
```

### 复杂实现示例
```java
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class RetryTask implements Delayed {
    private final long executeTime;
    private final String taskId;
    private final int retryCount;
    private final int maxRetries;
    
    public RetryTask(String taskId, long initialDelay, TimeUnit unit, int maxRetries) {
        this.taskId = taskId;
        this.executeTime = System.nanoTime() + unit.toNanos(initialDelay);
        this.retryCount = 0;
        this.maxRetries = maxRetries;
    }
    
    public RetryTask(RetryTask original, long nextDelay, TimeUnit unit) {
        this.taskId = original.taskId;
        this.executeTime = System.nanoTime() + unit.toNanos(nextDelay);
        this.retryCount = original.retryCount + 1;
        this.maxRetries = original.maxRetries;
    }
    
    @Override
    public long getDelay(TimeUnit unit) {
        long remaining = executeTime - System.nanoTime();
        return unit.convert(remaining, TimeUnit.NANOSECONDS);
    }
    
    @Override
    public int compareTo(Delayed other) {
        long diff = this.getDelay(TimeUnit.NANOSECONDS) - 
                   other.getDelay(TimeUnit.NANOSECONDS);
        return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
    }
    
    public boolean canRetry() {
        return retryCount < maxRetries;
    }
    
    public int getRetryCount() {
        return retryCount;
    }
    
    @Override
    public String toString() {
        return "RetryTask{" + taskId + ", retry=" + retryCount + 
               "/" + maxRetries + ", delay=" + getDelay(TimeUnit.MILLISECONDS) + "ms}";
    }
}
```

## 构造方法

### 基本构造方法
```java
// 创建空延迟队列
DelayQueue<DelayedTask> queue1 = new DelayQueue<>();

// 从现有集合创建延迟队列
List<DelayedTask> tasks = Arrays.asList(
    new DelayedTask(1000, TimeUnit.MILLISECONDS, "Task1"),
    new DelayedTask(500, TimeUnit.MILLISECONDS, "Task2")
);
DelayQueue<DelayedTask> queue2 = new DelayQueue<>(tasks);
```

## 核心方法详解

### 插入操作

#### put() 方法 - 阻塞插入
```java
public class PutExample {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayedTask> queue = new DelayQueue<>();
        
        // 插入不同延迟时间的任务
        queue.put(new DelayedTask(3000, TimeUnit.MILLISECONDS, "LongTask"));
        queue.put(new DelayedTask(1000, TimeUnit.MILLISECONDS, "ShortTask"));
        queue.put(new DelayedTask(2000, TimeUnit.MILLISECONDS, "MediumTask"));
        
        System.out.println("队列大小: " + queue.size());  // 3
        
        // 按延迟时间顺序取出
        while (!queue.isEmpty()) {
            DelayedTask task = queue.take();
            System.out.println("执行任务: " + task);
        }
    }
}
```

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        DelayQueue<DelayedTask> queue = new DelayQueue<>();
        
        // 非阻塞插入
        boolean result1 = queue.offer(new DelayedTask(1000, TimeUnit.MILLISECONDS, "Task1"));
        boolean result2 = queue.offer(new DelayedTask(2000, TimeUnit.MILLISECONDS, "Task2"));
        
        System.out.println("插入结果: " + result1 + ", " + result2);  // true, true
        System.out.println("队列大小: " + queue.size());  // 2
        
        // 带超时的offer
        try {
            boolean result3 = queue.offer(
                new DelayedTask(3000, TimeUnit.MILLISECONDS, "Task3"),
                1, TimeUnit.SECONDS
            );
            System.out.println("带超时插入结果: " + result3);  // true
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
        DelayQueue<DelayedTask> queue = new DelayQueue<>();
        
        // 插入延迟任务
        queue.put(new DelayedTask(2000, TimeUnit.MILLISECONDS, "DelayedTask"));
        
        long startTime = System.currentTimeMillis();
        System.out.println("开始等待任务...");
        
        // 阻塞等待直到任务到期
        DelayedTask task = queue.take();
        long endTime = System.currentTimeMillis();
        
        System.out.println("执行任务: " + task);
        System.out.println("实际等待时间: " + (endTime - startTime) + "ms");  // ≈2000ms
    }
}
```

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        DelayQueue<DelayedTask> queue = new DelayQueue<>();
        
        // 队列为空时返回 null
        DelayedTask task1 = queue.poll();  // null
        
        // 插入立即到期的任务
        queue.put(new DelayedTask(0, TimeUnit.MILLISECONDS, "ImmediateTask"));
        
        // 立即取出已到期的任务
        DelayedTask task2 = queue.poll();  // ImmediateTask
        
        // 插入未到期的任务
        queue.put(new DelayedTask(5000, TimeUnit.MILLISECONDS, "FutureTask"));
        
        // 任务未到期，返回 null
        DelayedTask task3 = queue.poll();  // null
        
        // 带超时的poll
        try {
            DelayedTask task4 = queue.poll(1, TimeUnit.SECONDS);  // 等待1秒
            System.out.println("带超时取出结果: " + task4);  // null（任务5秒后才到期）
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
        DelayQueue<DelayedTask> queue = new DelayQueue<>();
        
        // 插入多个任务
        queue.put(new DelayedTask(1000, TimeUnit.MILLISECONDS, "Task1"));
        queue.put(new DelayedTask(500, TimeUnit.MILLISECONDS, "Task2"));
        queue.put(new DelayedTask(2000, TimeUnit.MILLISECONDS, "Task3"));
        
        // 查看队首元素（延迟最短的）
        DelayedTask firstTask = queue.peek();  // Task2（500ms延迟）
        System.out.println("队首任务: " + firstTask);
        
        // 再次查看，仍然是同一个任务
        DelayedTask sameTask = queue.peek();  // Task2
        System.out.println("再次查看: " + sameTask);
        
        // 实际取出
        DelayedTask actualTask = queue.poll();  // Task2
        System.out.println("实际取出: " + actualTask);
        
        // 查看新的队首
        DelayedTask newFirst = queue.peek();  // Task1（1000ms延迟）
        System.out.println("新的队首: " + newFirst);
    }
}
```

### 其他重要方法

#### drainTo() 方法 - 批量转移到期元素
```java
public class DrainToExample {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayedTask> sourceQueue = new DelayQueue<>();
        List<DelayedTask> targetList = new ArrayList<>();
        
        // 插入多个任务，部分立即到期
        sourceQueue.put(new DelayedTask(0, TimeUnit.MILLISECONDS, "Task1"));
        sourceQueue.put(new DelayedTask(1000, TimeUnit.MILLISECONDS, "Task2"));
        sourceQueue.put(new DelayedTask(0, TimeUnit.MILLISECONDS, "Task3"));
        sourceQueue.put(new DelayedTask(5000, TimeUnit.MILLISECONDS, "Task4"));
        
        // 批量转移所有到期元素
        int transferred = sourceQueue.drainTo(targetList);
        System.out.println("转移了 " + transferred + " 个到期元素");  // 2（Task1和Task3）
        
        System.out.println("目标列表:");
        for (DelayedTask task : targetList) {
            System.out.println("  " + task);
        }
        
        System.out.println("源队列剩余大小: " + sourceQueue.size());  // 2
        
        // 等待剩余任务到期
        Thread.sleep(1500);
        
        // 再次转移
        int secondTransfer = sourceQueue.drainTo(targetList);
        System.out.println("第二次转移了 " + secondTransfer + " 个元素");  // 1（Task2）
    }
}
```

## 实际应用场景

### 定时任务调度
```java
import java.util.concurrent.DelayQueue;
import java.util.concurrent.TimeUnit;

public class TaskScheduler {
    private final DelayQueue<DelayedTask> taskQueue = new DelayQueue<>();
    private final Thread workerThread;
    private volatile boolean running = true;
    
    public TaskScheduler() {
        this.workerThread = new Thread(this::processTasks);
        this.workerThread.start();
    }
    
    public void scheduleTask(String taskName, long delay, TimeUnit unit) {
        DelayedTask task = new DelayedTask(delay, unit, taskName);
        taskQueue.put(task);
        System.out.println("已调度任务: " + taskName + ", 延迟: " + delay + " " + unit);
    }
    
    private void processTasks() {
        while (running || !taskQueue.isEmpty()) {
            try {
                DelayedTask task = taskQueue.take();
                System.out.println("执行任务: " + task.getTaskName() + 
                                 " at " + System.currentTimeMillis());
                // 实际任务处理逻辑
                executeTask(task);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
    
    private void executeTask(DelayedTask task) {
        // 模拟任务执行
        System.out.println("正在执行: " + task.getTaskName());
        try {
            Thread.sleep(100);  // 模拟任务执行时间
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void shutdown() {
        running = false;
        workerThread.interrupt();
    }
    
    public static void main(String[] args) throws InterruptedException {
        TaskScheduler scheduler = new TaskScheduler();
        
        // 调度多个任务
        scheduler.scheduleTask("立即任务", 0, TimeUnit.MILLISECONDS);
        scheduler.scheduleTask("5秒后任务", 5, TimeUnit.SECONDS);
        scheduler.scheduleTask("10秒后任务", 10, TimeUnit.SECONDS);
        scheduler.scheduleTask("2秒后任务", 2, TimeUnit.SECONDS);
        
        // 运行一段时间后关闭
        Thread.sleep(15000);
        scheduler.shutdown();
        System.out.println("任务调度器已关闭");
    }
}
```

### 重试机制实现
```java
import java.util.concurrent.DelayQueue;
import java.util.concurrent.TimeUnit;

public class RetryMechanism {
    private final DelayQueue<RetryTask> retryQueue = new DelayQueue<>();
    private final Thread retryThread;
    private volatile boolean running = true;
    
    public RetryMechanism() {
        this.retryThread = new Thread(this::processRetries);
        this.retryThread.start();
    }
    
    public void submitForRetry(String taskId, long initialDelay, TimeUnit unit) {
        RetryTask task = new RetryTask(taskId, initialDelay, unit, 3);
        retryQueue.put(task);
        System.out.println("任务 " + taskId + " 进入重试队列，延迟: " + initialDelay + " " + unit);
    }
    
    private void processRetries() {
        while (running || !retryQueue.isEmpty()) {
            try {
                RetryTask task = retryQueue.take();
                System.out.println("尝试执行重试任务: " + task);
                
                boolean success = attemptExecution(task);
                
                if (success) {
                    System.out.println("任务 " + task.getTaskId() + " 执行成功");
                } else if (task.canRetry()) {
                    // 计算下一次重试延迟（指数退避）
                    long nextDelay = (long) Math.pow(2, task.getRetryCount()) * 1000;
                    RetryTask nextRetry = new RetryTask(task, nextDelay, TimeUnit.MILLISECONDS);
                    retryQueue.put(nextRetry);
                    System.out.println("任务 " + task.getTaskId() + " 将在 " + 
                                     nextDelay + "ms 后重试");
                } else {
                    System.out.println("任务 " + task.getTaskId() + " 重试次数耗尽，放弃执行");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
    
    private boolean attemptExecution(RetryTask task) {
        // 模拟执行，50%成功率
        return Math.random() > 0.5;
    }
    
    public void shutdown() {
        running = false;
        retryThread.interrupt();
    }
    
    public static void main(String[] args) throws InterruptedException {
        RetryMechanism retryMechanism = new RetryMechanism();
        
        // 提交需要重试的任务
        retryMechanism.submitForRetry("Task-001", 1000, TimeUnit.MILLISECONDS);
        retryMechanism.submitForRetry("Task-002", 2000, TimeUnit.MILLISECONDS);
        
        // 运行一段时间后关闭
        Thread.sleep(30000);
        retryMechanism.shutdown();
        System.out.println("重试机制已关闭");
    }
}
```

### 缓存过期清理
```java
import java.util.concurrent.DelayQueue;
import java.util.concurrent.TimeUnit;

public class ExpiringCache<K, V> {
    private static class CacheEntry<K, V> implements Delayed {
        private final K key;
        private final V value;
        private final long expireTime;
        
        public CacheEntry(K key, V value, long ttl, TimeUnit unit) {
            this.key = key;
            this.value = value;
            this.expireTime = System.nanoTime() + unit.toNanos(ttl);
        }
        
        @Override
        public long getDelay(TimeUnit unit) {
            return unit.convert(expireTime - System.nanoTime(), TimeUnit.NANOSECONDS);
        }
        
        @Override
        public int compareTo(Delayed other) {
            long diff = this.getDelay(TimeUnit.NANOSECONDS) - 
                       other.getDelay(TimeUnit.NANOSECONDS);
            return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
        }
        
        public K getKey() { return key; }
        public V getValue() { return value; }
    }
    
    private final ConcurrentHashMap<K, CacheEntry<K, V>> cache = new ConcurrentHashMap<>();
    private final DelayQueue<CacheEntry<K, V>> expiryQueue = new DelayQueue<>();
    private final Thread cleanupThread;
    private volatile boolean running = true;
    
    public ExpiringCache() {
        this.cleanupThread = new Thread(this::cleanupExpired);
        this.cleanupThread.start();
    }
    
    public void put(K key, V value, long ttl, TimeUnit unit) {
        CacheEntry<K, V> entry = new CacheEntry<>(key, value, ttl, unit);
        cache.put(key, entry);
        expiryQueue.put(entry);
        System.out.println("缓存已添加: " + key + " -> " + value + ", TTL: " + ttl + " " + unit);
    }
    
    public V get(K key) {
        CacheEntry<K, V> entry = cache.get(key);
        return (entry != null) ? entry.getValue() : null;
    }
    
    private void cleanupExpired() {
        while (running || !expiryQueue.isEmpty()) {
            try {
                CacheEntry<K, V> expired = expiryQueue.take();
                cache.remove(expired.getKey(), expired);
                System.out.println("缓存已过期: " + expired.getKey());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
    
    public void shutdown() {
        running = false;
        cleanupThread.interrupt();
    }
    
    public static void main(String[] args) throws InterruptedException {
        ExpiringCache<String, String> cache = new ExpiringCache<>();
        
        // 添加缓存项
        cache.put("key1", "value1", 3, TimeUnit.SECONDS);
        cache.put("key2", "value2", 5, TimeUnit.SECONDS);
        cache.put("key3", "value3", 2, TimeUnit.SECONDS);
        
        // 测试获取
        System.out.println("key1: " + cache.get("key1"));  // value1
        System.out.println("key2: " + cache.get("key2"));  // value2
        
        // 等待缓存过期
        Thread.sleep(6000);
        
        System.out.println("key1: " + cache.get("key1"));  // null（已过期）
        System.out.println("key2: " + cache.get("key2"));  // null（已过期）
        
        cache.shutdown();
    }
}
```

## 性能特点与优化

### 性能特点
- **无界队列**：内存使用不受限制，需要注意内存管理
- **优先级排序**：插入和取出操作的时间复杂度为 O(log n)
- **阻塞特性**：take() 方法会阻塞直到有元素到期
- **内存开销**：每个元素需要额外的 Delayed 对象开销

### 与 ScheduledThreadPoolExecutor 对比
| 特性 | DelayQueue | ScheduledThreadPoolExecutor |
|------|------------|-----------------------------|
| 灵活性 | 高（自定义延迟逻辑） | 中等（固定延迟/周期） |
| 内存使用 | 无界，需手动管理 | 有界或可配置 |
| 执行控制 | 手动控制执行线程 | 自动线程池管理 |
| 适用场景 | 复杂延迟逻辑 | 简单定时任务 |

### 使用建议
1. **内存管理**：注意无界队列可能的内存问题
2. **延迟精度**：系统时钟精度影响延迟准确性
3. **并发控制**：合理控制生产者和消费者的数量
4. **异常处理**：妥善处理任务执行异常

## 常见问题与解决方案

### 问题1：内存泄漏
**解决方案**：定期清理过期元素，设置最大队列大小
```java
// 设置最大队列大小
private static final int MAX_QUEUE_SIZE = 10000;

public boolean safePut(DelayedTask task) {
    if (queue.size() < MAX_QUEUE_SIZE) {
        return queue.offer(task);
    } else {
        // 队列过大，拒绝新任务
        System.out.println("队列已满，拒绝任务: " + task);
        return false;
    }
}
```

### 问题2：延迟不准确
**解决方案**：使用高精度时钟，考虑系统负载
```java
// 使用 System.nanoTime() 提高精度
public long getDelay(TimeUnit unit) {
    long remaining = executeTime - System.nanoTime();
    return unit.convert(remaining, TimeUnit.NANOSECONDS);
}
```

### 问题3：任务执行失败
**解决方案**：实现重试机制，记录执行日志
```java
private void executeTaskSafely(DelayedTask task) {
    try {
        // 任务执行逻辑
        executeTask(task);
    } catch (Exception e) {
        System.err.println("任务执行失败: " + task + ", 错误: " + e.getMessage());
        // 记录日志或进行重试
    }
}
```

## 最佳实践

1. **合理设计延迟逻辑**：根据业务需求设计合适的延迟策略
2. **监控队列状态**：定期监控队列大小和内存使用情况
3. **异常处理机制**：实现完善的错误处理和重试逻辑
4. **性能优化**：对于高频操作考虑批量处理
5. **资源清理**：及时关闭不再使用的队列和线程

## 总结

DelayQueue 是 Java 并发编程中强大的延迟队列实现，适用于需要精确时间控制的场景。通过合理使用其特性，可以构建高效、可靠的定时任务系统、重试机制和缓存系统。

最后更新时间：2024-01-15