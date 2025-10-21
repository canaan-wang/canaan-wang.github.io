# PriorityBlockingQueue

## 定义与作用

PriorityBlockingQueue 是 Java 并发包中基于二叉堆实现的无界阻塞优先级队列。它能够按照元素的优先级进行排序，优先级高的元素会优先被取出，是任务调度和优先级处理场景中的重要工具。

**主要特性：**
- 无界队列：容量可以动态增长，没有固定上限
- 优先级排序：基于元素的自然顺序或自定义比较器
- 阻塞操作：支持阻塞式的插入和取出操作
- 线程安全：内部使用锁机制保证线程安全
- 非稳定排序：相同优先级的元素顺序不保证

## 核心原理

### 数据结构
PriorityBlockingQueue 使用二叉堆（最小堆或最大堆）数据结构：

```java
// 内部使用数组存储堆结构
private transient Object[] queue;

// 元素数量
private transient int size;

// 比较器，决定优先级顺序
private transient Comparator<? super E> comparator;

// 锁机制
private final ReentrantLock lock = new ReentrantLock();
private final Condition notEmpty = lock.newCondition();

// 扩容机制
private static final int DEFAULT_INITIAL_CAPACITY = 11;
```

### 堆排序原理
PriorityBlockingQueue 使用二叉堆实现优先级排序：
- **最小堆**：根节点是最小元素（默认，自然顺序）
- **最大堆**：通过自定义比较器实现最大堆
- **堆化操作**：插入时上浮，取出时下沉，维护堆性质

### 线程安全机制
- **单锁设计**：使用单个 ReentrantLock 保护所有操作
- **条件变量**：notEmpty 条件用于消费者等待
- **无界特性**：不需要 notFull 条件，因为队列可以无限增长

## 构造方法

### 基本构造方法
```java
// 默认构造方法（使用自然顺序，最小堆）
PriorityBlockingQueue<String> queue1 = new PriorityBlockingQueue<>();

// 指定初始容量
PriorityBlockingQueue<String> queue2 = new PriorityBlockingQueue<>(100);

// 使用自定义比较器
PriorityBlockingQueue<String> queue3 = new PriorityBlockingQueue<>(50, 
    (a, b) -> b.compareTo(a)); // 最大堆

// 从现有集合创建
List<String> list = Arrays.asList("C", "A", "B");
PriorityBlockingQueue<String> queue4 = new PriorityBlockingQueue<>(list);
```

### 比较器使用示例
```java
public class ComparatorExample {
    public static void main(String[] args) {
        // 自然顺序（最小堆）
        PriorityBlockingQueue<String> naturalQueue = new PriorityBlockingQueue<>();
        naturalQueue.add("C");
        naturalQueue.add("A");
        naturalQueue.add("B");
        System.out.println("自然顺序: " + naturalQueue.poll()); // A
        
        // 自定义比较器（最大堆）
        PriorityBlockingQueue<String> customQueue = new PriorityBlockingQueue<>(11, 
            (a, b) -> b.compareTo(a));
        customQueue.add("C");
        customQueue.add("A");
        customQueue.add("B");
        System.out.println("自定义顺序: " + customQueue.poll()); // C
        
        // 复杂对象比较
        PriorityBlockingQueue<Person> personQueue = new PriorityBlockingQueue<>(11,
            Comparator.comparing(Person::getAge).reversed()
                .thenComparing(Person::getName));
        personQueue.add(new Person("Alice", 25));
        personQueue.add(new Person("Bob", 30));
        personQueue.add(new Person("Charlie", 25));
        
        System.out.println("年龄降序，姓名升序:");
        while (!personQueue.isEmpty()) {
            System.out.println(personQueue.poll());
        }
    }
    
    static class Person {
        String name;
        int age;
        
        Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        public String getName() { return name; }
        public int getAge() { return age; }
        
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
    }
}
```

## 核心方法详解

### 插入操作

#### put() 方法 - 阻塞插入
```java
public class PutExample {
    public static void main(String[] args) throws InterruptedException {
        PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();
        
        // 插入元素，按优先级排序
        queue.put(30);
        queue.put(10);
        queue.put(20);
        
        System.out.println("队列大小: " + queue.size());  // 3
        
        // 取出时会按优先级顺序
        System.out.println("取出1: " + queue.take());  // 10
        System.out.println("取出2: " + queue.take());  // 20
        System.out.println("取出3: " + queue.take());  // 30
    }
}
```

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        PriorityBlockingQueue<String> queue = new PriorityBlockingQueue<>();
        
        // 非阻塞插入
        boolean result1 = queue.offer("C");  // true
        boolean result2 = queue.offer("A");  // true
        boolean result3 = queue.offer("B");  // true
        
        System.out.println("插入结果: " + result1 + ", " + result2 + ", " + result3);
        
        // 取出验证优先级顺序
        System.out.println("取出1: " + queue.poll());  // A
        System.out.println("取出2: " + queue.poll());  // B
        System.out.println("取出3: " + queue.poll());  // C
        
        // 带超时的offer（虽然无界，但超时参数仍有效）
        try {
            boolean result4 = queue.offer("D", 1, TimeUnit.SECONDS);  // true
            System.out.println("带超时插入结果: " + result4);
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
        PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();
        
        // 异步插入元素
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                queue.put(5);  // 低优先级
                queue.put(1);  // 高优先级
                System.out.println("元素已插入");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        System.out.println("开始等待取出元素...");
        long startTime = System.currentTimeMillis();
        
        // 阻塞等待，按优先级取出
        int firstElement = queue.take();  // 1（最高优先级）
        long endTime = System.currentTimeMillis();
        
        System.out.println("取出元素: " + firstElement);
        System.out.println("实际等待时间: " + (endTime - startTime) + "ms");
        
        // 取出下一个元素
        int secondElement = queue.take();  // 5
        System.out.println("第二个元素: " + secondElement);
    }
}
```

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        PriorityBlockingQueue<String> queue = new PriorityBlockingQueue<>();
        
        // 队列为空时返回 null
        String element1 = queue.poll();  // null
        
        // 插入元素
        queue.offer("C");
        queue.offer("A");
        queue.offer("B");
        
        // 按优先级取出
        String element2 = queue.poll();  // A
        String element3 = queue.poll();  // B
        String element4 = queue.poll();  // C
        
        System.out.println("取出结果: " + element2 + ", " + element3 + ", " + element4);
        
        // 再次取出，队列为空
        String element5 = queue.poll();  // null
        System.out.println("空队列取出: " + element5);
        
        // 带超时的poll
        try {
            String element6 = queue.poll(2, TimeUnit.SECONDS);  // 等待2秒
            System.out.println("带超时取出结果: " + element6);  // null（2秒内无新元素）
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
        PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();
        
        // 插入多个元素
        queue.offer(30);
        queue.offer(10);
        queue.offer(20);
        
        // 查看最高优先级元素
        Integer firstElement = queue.peek();  // 10
        System.out.println("最高优先级元素: " + firstElement);
        
        // 再次查看，仍然是同一个元素
        Integer sameElement = queue.peek();  // 10
        System.out.println("再次查看: " + sameElement);
        
        // 实际取出
        Integer actualElement = queue.poll();  // 10
        System.out.println("实际取出: " + actualElement);
        
        // 查看新的最高优先级
        Integer newFirst = queue.peek();  // 20
        System.out.println("新的最高优先级: " + newFirst);
    }
}
```

### 批量操作

#### drainTo() 方法 - 批量转移元素
```java
public class DrainToExample {
    public static void main(String[] args) {
        PriorityBlockingQueue<Integer> sourceQueue = new PriorityBlockingQueue<>();
        List<Integer> targetList = new ArrayList<>();
        
        // 插入多个元素（乱序）
        sourceQueue.offer(50);
        sourceQueue.offer(10);
        sourceQueue.offer(30);
        sourceQueue.offer(20);
        sourceQueue.offer(40);
        
        // 批量转移所有元素（按优先级顺序）
        int transferred = sourceQueue.drainTo(targetList);
        System.out.println("转移了 " + transferred + " 个元素");  // 5
        
        System.out.println("目标列表（按优先级顺序）:");
        for (Integer element : targetList) {
            System.out.println("  " + element);  // 10, 20, 30, 40, 50
        }
        
        System.out.println("源队列剩余大小: " + sourceQueue.size());  // 0
        
        // 限制转移数量
        sourceQueue.offer(15);
        sourceQueue.offer(5);
        sourceQueue.offer(25);
        
        List<Integer> limitedList = new ArrayList<>();
        int limitedTransfer = sourceQueue.drainTo(limitedList, 2);  // 最多转移2个最高优先级
        System.out.println("限制转移了 " + limitedTransfer + " 个元素");  // 2
        System.out.println("限制转移结果: " + limitedList);  // [5, 15]
        System.out.println("源队列剩余: " + sourceQueue.size());  // 1（25）
    }
}
```

## 实际应用场景

### 任务调度系统
```java
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.TimeUnit;

public class TaskScheduler {
    // 任务优先级定义
    enum Priority {
        HIGH(3), MEDIUM(2), LOW(1);
        
        final int value;
        Priority(int value) { this.value = value; }
    }
    
    static class ScheduledTask implements Comparable<ScheduledTask> {
        final Runnable task;
        final Priority priority;
        final long scheduledTime;
        
        ScheduledTask(Runnable task, Priority priority, long delayMs) {
            this.task = task;
            this.priority = priority;
            this.scheduledTime = System.currentTimeMillis() + delayMs;
        }
        
        @Override
        public int compareTo(ScheduledTask other) {
            // 先按优先级，再按调度时间
            int priorityCompare = Integer.compare(other.priority.value, this.priority.value);
            if (priorityCompare != 0) return priorityCompare;
            return Long.compare(this.scheduledTime, other.scheduledTime);
        }
        
        public boolean shouldExecute() {
            return System.currentTimeMillis() >= scheduledTime;
        }
    }
    
    private final PriorityBlockingQueue<ScheduledTask> taskQueue = new PriorityBlockingQueue<>();
    private volatile boolean running = true;
    
    public void schedule(Runnable task, Priority priority, long delayMs) {
        taskQueue.put(new ScheduledTask(task, priority, delayMs));
        System.out.println("任务已调度，优先级: " + priority + ", 延迟: " + delayMs + "ms");
    }
    
    public void start() {
        Thread scheduler = new Thread(() -> {
            while (running || !taskQueue.isEmpty()) {
                try {
                    ScheduledTask task = taskQueue.poll(100, TimeUnit.MILLISECONDS);
                    if (task != null) {
                        if (task.shouldExecute()) {
                            System.out.println("执行任务，优先级: " + task.priority);
                            task.task.run();
                        } else {
                            // 还未到执行时间，重新放入队列
                            taskQueue.put(task);
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println("调度器已停止");
        });
        scheduler.start();
    }
    
    public void stop() {
        running = false;
    }
    
    public static void main(String[] args) throws InterruptedException {
        TaskScheduler scheduler = new TaskScheduler();
        scheduler.start();
        
        // 调度不同优先级的任务
        scheduler.schedule(() -> System.out.println("高优先级任务"), Priority.HIGH, 1000);
        scheduler.schedule(() -> System.out.println("中优先级任务"), Priority.MEDIUM, 500);
        scheduler.schedule(() -> System.out.println("低优先级任务"), Priority.LOW, 2000);
        scheduler.schedule(() -> System.out.println("紧急高优先级任务"), Priority.HIGH, 100);
        
        // 运行一段时间后停止
        Thread.sleep(5000);
        scheduler.stop();
    }
}
```

### 消息优先级处理
```java
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class MessageProcessor {
    static class Message implements Comparable<Message> {
        enum Type { CRITICAL, IMPORTANT, NORMAL, LOW }
        
        final String content;
        final Type type;
        final long timestamp;
        final int sequence;
        
        Message(String content, Type type, int sequence) {
            this.content = content;
            this.type = type;
            this.timestamp = System.currentTimeMillis();
            this.sequence = sequence;
        }
        
        @Override
        public int compareTo(Message other) {
            // 按类型优先级，再按时间戳，最后按序列号
            int typeCompare = Integer.compare(other.type.ordinal(), this.type.ordinal());
            if (typeCompare != 0) return typeCompare;
            
            int timeCompare = Long.compare(this.timestamp, other.timestamp);
            if (timeCompare != 0) return timeCompare;
            
            return Integer.compare(this.sequence, other.sequence);
        }
        
        @Override
        public String toString() {
            return type + ": " + content + " (seq: " + sequence + ")";
        }
    }
    
    private final PriorityBlockingQueue<Message> messageQueue = new PriorityBlockingQueue<>();
    private final AtomicInteger sequenceGenerator = new AtomicInteger(0);
    private volatile boolean processing = true;
    
    public void addMessage(String content, Message.Type type) {
        int sequence = sequenceGenerator.incrementAndGet();
        Message message = new Message(content, type, sequence);
        messageQueue.put(message);
        System.out.println("添加消息: " + message);
    }
    
    public void startProcessing() {
        Thread processor = new Thread(() -> {
            while (processing || !messageQueue.isEmpty()) {
                try {
                    Message message = messageQueue.take();
                    System.out.println("处理消息: " + message);
                    
                    // 模拟处理时间（根据优先级调整）
                    int processTime = 100 + (message.type.ordinal() * 50);
                    Thread.sleep(processTime);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            System.out.println("消息处理器已停止");
        });
        processor.start();
    }
    
    public void stopProcessing() {
        processing = false;
    }
    
    public static void main(String[] args) throws InterruptedException {
        MessageProcessor processor = new MessageProcessor();
        processor.startProcessing();
        
        // 添加不同优先级的消息
        processor.addMessage("系统错误", Message.Type.CRITICAL);
        processor.addMessage("用户登录", Message.Type.NORMAL);
        processor.addMessage("支付成功", Message.Type.IMPORTANT);
        processor.addMessage("数据备份", Message.Type.LOW);
        processor.addMessage("内存不足", Message.Type.CRITICAL);
        processor.addMessage("新用户注册", Message.Type.NORMAL);
        
        // 运行一段时间后停止
        Thread.sleep(3000);
        processor.stopProcessing();
    }
}
```

### 资源分配系统
```java
import java.util.concurrent.PriorityBlockingQueue;

public class ResourceAllocator {
    static class AllocationRequest implements Comparable<AllocationRequest> {
        enum Priority { URGENT, HIGH, MEDIUM, LOW }
        
        final String resourceType;
        final Priority priority;
        final int requestedAmount;
        final String requester;
        
        AllocationRequest(String resourceType, Priority priority, int amount, String requester) {
            this.resourceType = resourceType;
            this.priority = priority;
            this.requestedAmount = amount;
            this.requester = requester;
        }
        
        @Override
        public int compareTo(AllocationRequest other) {
            // 按优先级，再按请求时间（这里简化，实际应该有时间戳）
            return Integer.compare(other.priority.ordinal(), this.priority.ordinal());
        }
        
        @Override
        public String toString() {
            return priority + " - " + requester + " 请求 " + requestedAmount + " 个 " + resourceType;
        }
    }
    
    private final PriorityBlockingQueue<AllocationRequest> requestQueue = new PriorityBlockingQueue<>();
    private final java.util.Map<String, Integer> availableResources = new java.util.HashMap<>();
    
    public ResourceAllocator() {
        // 初始化资源池
        availableResources.put("CPU", 100);
        availableResources.put("内存", 2048);  // MB
        availableResources.put("磁盘", 500);   // GB
    }
    
    public void requestResource(String resourceType, AllocationRequest.Priority priority, 
                               int amount, String requester) {
        AllocationRequest request = new AllocationRequest(resourceType, priority, amount, requester);
        requestQueue.put(request);
        System.out.println("资源请求已提交: " + request);
    }
    
    public void startAllocation() {
        Thread allocator = new Thread(() -> {
            while (true) {
                try {
                    AllocationRequest request = requestQueue.take();
                    
                    Integer available = availableResources.get(request.resourceType);
                    if (available != null && available >= request.requestedAmount) {
                        // 分配资源
                        availableResources.put(request.resourceType, available - request.requestedAmount);
                        System.out.println("资源分配成功: " + request);
                        System.out.println("剩余 " + request.resourceType + ": " + 
                            (available - request.requestedAmount));
                    } else {
                        // 资源不足，重新排队（降低优先级）
                        System.out.println("资源不足，重新排队: " + request);
                        requestQueue.put(request);
                        Thread.sleep(1000);  // 等待资源释放
                    }
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        allocator.setDaemon(true);
        allocator.start();
    }
    
    public static void main(String[] args) throws InterruptedException {
        ResourceAllocator allocator = new ResourceAllocator();
        allocator.startAllocation();
        
        // 模拟资源请求
        allocator.requestResource("CPU", AllocationRequest.Priority.URGENT, 20, "紧急任务");
        allocator.requestResource("内存", AllocationRequest.Priority.HIGH, 512, "数据库服务");
        allocator.requestResource("磁盘", AllocationRequest.Priority.MEDIUM, 100, "文件存储");
        allocator.requestResource("CPU", AllocationRequest.Priority.LOW, 30, "批处理任务");
        allocator.requestResource("内存", AllocationRequest.Priority.URGENT, 1024, "缓存服务");
        
        Thread.sleep(5000);
    }
}
```

## 性能特点与优化

### 性能特点
- **无界特性**：不会因为队列满而阻塞生产者
- **堆排序开销**：插入和取出操作的时间复杂度为 O(log n)
- **内存使用**：动态扩容，可能产生较多内存碎片
- **线程安全**：单锁设计，高并发下可能存在锁竞争

### 与普通队列对比
| 特性 | PriorityBlockingQueue | LinkedBlockingQueue |
|------|----------------------|---------------------|
| 排序方式 | 优先级排序 | FIFO 顺序 |
| 容量限制 | 无界 | 可选有界 |
| 时间复杂度 | O(log n) | O(1) |
| 内存使用 | 动态数组，可能碎片 | 链表节点，稳定增长 |
| 适用场景 | 优先级任务调度 | 顺序任务处理 |

### 性能优化建议

#### 比较器优化
```java
public class ComparatorOptimization {
    // 简单的比较器（推荐）
    public static Comparator<Task> createSimpleComparator() {
        return Comparator.comparing(Task::getPriority)
                        .thenComparing(Task::getTimestamp);
    }
    
    // 复杂的比较器（避免）
    public static Comparator<Task> createComplexComparator() {
        return (t1, t2) -> {
            // 避免在比较器中执行复杂操作
            int result = Integer.compare(t2.getPriority(), t1.getPriority());
            if (result != 0) return result;
            
            // 简单的字段比较
            return Long.compare(t1.getTimestamp(), t2.getTimestamp());
        };
    }
    
    static class Task {
        private int priority;
        private long timestamp;
        
        public int getPriority() { return priority; }
        public long getTimestamp() { return timestamp; }
    }
}
```

#### 批量操作优化
```java
public class BatchOptimization {
    private final PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();
    
    // 批量插入优化
    public void batchInsert(List<Integer> elements) {
        // 先排序再插入（减少堆化次数）
        List<Integer> sorted = new ArrayList<>(elements);
        Collections.sort(sorted);
        
        for (Integer element : sorted) {
            queue.offer(element);
        }
    }
    
    // 批量取出优化
    public List<Integer> batchPoll(int batchSize) {
        List<Integer> batch = new ArrayList<>(batchSize);
        
        for (int i = 0; i < batchSize; i++) {
            Integer element = queue.poll();
            if (element == null) break;
            batch.add(element);
        }
        
        return batch;
    }
}
```

## 常见问题与解决方案

### 问题1：内存溢出风险
**解决方案**：实现容量监控和背压机制
```java
public class MemorySafePriorityQueue<E> {
    private final PriorityBlockingQueue<E> queue = new PriorityBlockingQueue<>();
    private static final int WARNING_THRESHOLD = 10000;
    
    public boolean safeOffer(E element) {
        if (queue.size() < WARNING_THRESHOLD) {
            return queue.offer(element);
        } else {
            System.out.println("警告：队列大小接近阈值，当前: " + queue.size());
            // 实现背压：等待或拒绝
            return false;
        }
    }
    
    public void monitorQueueSize() {
        int size = queue.size();
        if (size > WARNING_THRESHOLD * 0.8) {
            System.out.println("队列使用率超过80%，当前大小: " + size);
        }
    }
}
```

### 问题2：优先级反转
**解决方案**：合理设计优先级策略
```java
public class PriorityInversionSolution {
    static class SmartTask implements Comparable<SmartTask> {
        final Runnable task;
        final int basePriority;
        final long waitTime;  // 等待时间
        final long timestamp;
        
        SmartTask(Runnable task, int priority) {
            this.task = task;
            this.basePriority = priority;
            this.waitTime = 0;
            this.timestamp = System.currentTimeMillis();
        }
        
        @Override
        public int compareTo(SmartTask other) {
            // 动态优先级：考虑等待时间
            int dynamicPriority = basePriority + (int)(waitTime / 1000);
            int otherDynamicPriority = other.basePriority + (int)(other.waitTime / 1000);
            
            return Integer.compare(otherDynamicPriority, dynamicPriority);
        }
        
        public void updateWaitTime() {
            waitTime = System.currentTimeMillis() - timestamp;
        }
    }
}
```

### 问题3：相同优先级顺序不稳定
**解决方案**：添加次级排序条件
```java
public class StablePriorityQueue<E> {
    private final PriorityBlockingQueue<StableElement<E>> queue = new PriorityBlockingQueue<>();
    private final AtomicLong sequence = new AtomicLong(0);
    
    static class StableElement<E> implements Comparable<StableElement<E>> {
        final E element;
        final int priority;
        final long sequenceNumber;
        
        StableElement(E element, int priority, long sequence) {
            this.element = element;
            this.priority = priority;
            this.sequenceNumber = sequence;
        }
        
        @Override
        public int compareTo(StableElement<E> other) {
            int priorityCompare = Integer.compare(other.priority, this.priority);
            if (priorityCompare != 0) return priorityCompare;
            return Long.compare(this.sequenceNumber, other.sequenceNumber);
        }
    }
    
    public void put(E element, int priority) {
        queue.put(new StableElement<>(element, priority, sequence.getAndIncrement()));
    }
    
    public E take() throws InterruptedException {
        return queue.take().element;
    }
}
```

## 最佳实践

1. **合理设置优先级等级**：避免过多的优先级级别，通常3-5个级别足够
2. **避免复杂比较器**：比较器应该简单高效，避免IO操作或复杂计算
3. **监控队列大小**：无界队列需要监控内存使用
4. **考虑公平性**：对于相同优先级的任务，考虑添加时间戳保证公平
5. **测试优先级逻辑**：充分测试各种优先级组合下的行为

## 总结

PriorityBlockingQueue 是 Java 并发编程中处理优先级任务的强大工具。通过合理的二叉堆实现和线程安全机制，它能够高效地处理需要按优先级排序的场景。在实际使用中，需要注意其无界特性可能带来的内存风险，以及合理设计优先级策略来避免优先级反转等问题。

最后更新时间：2024-01-15