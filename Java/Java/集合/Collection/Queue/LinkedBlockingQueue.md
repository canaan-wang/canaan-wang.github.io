# LinkedBlockingQueue

## 一、基本概述

### 1.1 定义

LinkedBlockingQueue 是 Java 并发包（java.util.concurrent）下的一个**基于链表实现的阻塞队列**，实现了 BlockingQueue 接口，属于线程安全的容器。其核心特点是通过“链表节点”存储元素，支持阻塞式的入队和出队操作，可用于实现生产者-消费者等并发场景。

### 1.2 核心特性

- **有界/无界可选**：默认构造为无界队列（容量为 Integer.MAX_VALUE），也可指定容量成为有界队列，避免内存溢出风险。

- **阻塞机制**：当队列满时，生产者线程会被阻塞；当队列为空时，消费者线程会被阻塞。

- **FIFO 顺序**：遵循“先进先出”原则，链表的头部为队列首元素，尾部为队列尾元素。

- **线程安全**：通过分离的锁（takeLock 和 putLock）分别控制出队和入队操作，支持生产者和消费者并发执行，提升吞吐量。

- **不支持 null 元素**：添加 null 会抛出 NullPointerException。



## 二、底层实现原理

### 2.1 核心数据结构

基于**单向链表**实现，每个节点（Node）包含三个核心字段：

```java

// 链表节点内部类
static class Node<E> {
    E item; // 存储的元素
    Node<E> next; // 下一个节点的引用
    Node(E x) { item = x; }
}

```

队列的核心维护字段：

- `head`：队列头部节点（首元素），初始为“哨兵节点”（item 为 null）。

- `last`：队列尾部节点，初始也指向哨兵节点。

- `capacity`：队列容量，指定后不可修改；默认 Integer.MAX_VALUE。

- `count`：当前队列中的元素个数，使用 AtomicInteger 保证原子性。

- `takeLock`：出队操作锁（ReentrantLock），控制 take、poll 等操作的并发。

- `notEmpty`：出队条件变量（Condition），队空时阻塞消费者。

- `putLock`：入队操作锁（ReentrantLock），控制 put、offer 等操作的并发。

- `notFull`：入队条件变量（Condition），队满时阻塞生产者。

### 2.2 锁分离机制（核心亮点）

与 ArrayBlockingQueue 使用单锁控制所有操作不同，LinkedBlockingQueue 采用“双锁分离”设计：

- 入队操作（put、offer 等）仅获取 putLock，不影响出队操作。

- 出队操作（take、poll 等）仅获取 takeLock，不影响入队操作。

优势：生产者和消费者可同时执行操作，大幅提升并发场景下的吞吐量。
注意：当需要获取队列大小（count）时，因 count 是 AtomicInteger，无需加锁即可原子性读取。

### 2.3 阻塞与唤醒机制（Condition 应用）

基于 ReentrantLock 的 Condition 实现阻塞与唤醒，核心逻辑：

1. **入队阻塞**：当队列满时，put 方法会调用 notFull.await()，使生产者线程释放 putLock 并进入阻塞状态；当有元素出队后，会调用 notFull.signal() 唤醒阻塞的生产者。

2. **出队阻塞**：当队列为空时，take 方法会调用 notEmpty.await()，使消费者线程释放 takeLock 并进入阻塞状态；当有元素入队后，会调用 notEmpty.signal() 唤醒阻塞的消费者。

## 三、常用构造方法

|构造方法|说明|注意事项|
|---|---|---|
|LinkedBlockingQueue()|默认构造，容量为 Integer.MAX_VALUE（无界队列）|可能因元素过多导致 OOM，建议实际开发中指定容量|
|LinkedBlockingQueue(int capacity)|指定容量的有界队列|capacity 需 ≥0，否则抛 IllegalArgumentException|
|LinkedBlockingQueue(Collection<? extends E> c)|用指定集合初始化，容量为 Integer.MAX_VALUE，元素顺序与集合迭代顺序一致|集合中不可包含 null 元素，否则抛 NullPointerException|
## 四、核心 API 解析（按功能分类）

BlockingQueue 接口定义的核心方法分为“阻塞型”“非阻塞型”“超时型”三类，LinkedBlockingQueue 均实现了这些方法，以下为关键方法说明：

### 4.1 入队操作

|方法|类型|功能描述|异常情况|
|---|---|---|---|
|void put(E e)|阻塞型|将元素 e 入队，若队列满则阻塞，直到队列有空间或线程被中断|e 为 null 抛 NPE；线程中断抛 InterruptedException|
|boolean offer(E e)|非阻塞型|将元素 e 入队，若队列满则直接返回 false；成功入队返回 true|e 为 null 抛 NPE|
|boolean offer(E e, long timeout, TimeUnit unit)|超时型|在指定超时时间内尝试入队，成功返回 true；超时仍满则返回 false|e 为 null 抛 NPE；线程中断抛 InterruptedException|
### 4.2 出队操作

|方法|类型|功能描述|异常情况|
|---|---|---|---|
|E take()|阻塞型|获取并移除队首元素，若队列为空则阻塞，直到队列有元素或线程被中断|线程中断抛 InterruptedException|
|E poll()|非阻塞型|获取并移除队首元素，若队列为空则直接返回 null|无异常（返回 null 需判断是“空队列”还是“元素为 null”，但队列不允许存 null，故返回 null 即空队列）|
|E poll(long timeout, TimeUnit unit)|超时型|在指定超时时间内尝试获取并移除队首元素，成功返回元素；超时仍空则返回 null|线程中断抛 InterruptedException|
|E peek()|非阻塞型|获取但不移除队首元素，若队列为空则返回 null|无异常|
### 4.3 其他常用方法

- `int size()`：返回当前队列元素个数，基于 AtomicInteger 实现，无锁且精确。

- `boolean isEmpty()`：判断队列是否为空，等价于 size() == 0。

- `boolean contains(Object o)`：判断队列是否包含指定元素，需遍历链表，效率较低（O(n)）。

- `int drainTo(Collection<? super E> c)`：将队列中所有元素移到目标集合 c 中，返回移动的元素个数。

- `int drainTo(Collection<? super E> c, int maxElements)`：最多移动 maxElements 个元素到目标集合 c 中，返回实际移动个数。

- `void clear()`：清空队列，需同时获取 takeLock 和 putLock，避免并发修改。

- `Iterator<E> iterator()`：返回队列的迭代器，迭代过程中元素可能被修改（弱一致性），不建议并发迭代时修改元素。

## 五、典型使用场景

### 5.1 生产者-消费者模型（核心场景）

LinkedBlockingQueue 是实现生产者-消费者模型的理想选择，通过阻塞机制实现生产者和消费者的协调，无需手动处理线程唤醒逻辑。

**代码示例**：

```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class ProducerConsumerExample {
    // 创建一个容量为10的有界队列
    private static final LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(10);
    
    public static void main(String[] args) {
        // 启动3个生产者线程
        for (int i = 0; i < 3; i++) {
            final int producerId = i;
            new Thread(() -> {
                try {
                    for (int j = 0; j < 5; j++) {
                        String task = "Task-P" + producerId + "-" + j;
                        queue.put(task); // 阻塞式入队
                        System.out.println("生产者" + producerId + " 生产: " + task + ", 当前队列大小: " + queue.size());
                        Thread.sleep(100); // 模拟生产耗时
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Producer-" + i).start();
        }
        
        // 启动2个消费者线程
        for (int i = 0; i < 2; i++) {
            final int consumerId = i;
            new Thread(() -> {
                try {
                    for (int j = 0; j < 7; j++) {
                        String task = queue.take(); // 阻塞式出队
                        System.out.println("消费者" + consumerId + " 消费: " + task + ", 当前队列大小: " + queue.size());
                        Thread.sleep(200); // 模拟消费耗时
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Consumer-" + i).start();
        }
    }
}
```

### 5.2 线程池任务队列

在自定义线程池实现中，LinkedBlockingQueue 常被用作任务队列，结合有界队列可以防止任务积压导致的内存溢出问题。

```java
import java.util.concurrent.*;

public class CustomThreadPoolExample {
    public static void main(String[] args) {
        // 核心线程数
        int corePoolSize = 5;
        // 最大线程数
        int maxPoolSize = 10;
        // 非核心线程空闲超时时间
        long keepAliveTime = 60;
        TimeUnit unit = TimeUnit.SECONDS;
        // 使用LinkedBlockingQueue作为任务队列
        BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>(100);
        
        // 创建线程池
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                corePoolSize, maxPoolSize, keepAliveTime, unit, workQueue);
        
        // 提交任务
        for (int i = 0; i < 20; i++) {
            final int taskId = i;
            executor.submit(() -> {
                try {
                    System.out.println("执行任务: " + taskId + ", 线程: " + Thread.currentThread().getName());
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        executor.shutdown();
    }
}
```

## 六、与其他阻塞队列的对比

### 6.1 与 ArrayBlockingQueue 的对比

| 特性 | LinkedBlockingQueue | ArrayBlockingQueue |
|------|---------------------|-------------------|
| 底层结构 | 单向链表 | 数组 |
| 默认容量 | Integer.MAX_VALUE（无界） | 必须显式指定（有界） |
| 锁机制 | 双锁分离（takeLock 和 putLock） | 单锁控制所有操作 |
| 并发性能 | 生产者和消费者可同时操作，并发性能更高 | 所有操作串行执行，并发性能较低 |
| 内存占用 | 每个元素需额外的链表节点开销 | 预分配数组，内存利用率更高 |
| 迭代器 | 弱一致性 | 弱一致性 |

### 6.2 与 SynchronousQueue 的对比

SynchronousQueue 是一个不存储元素的阻塞队列，每次 put 操作必须等待 take 操作，反之亦然。适用于直接传递的场景，而 LinkedBlockingQueue 适用于需要缓存元素的场景。

### 6.3 与 LinkedTransferQueue 的对比

LinkedTransferQueue 是 Java 7 新增的无界阻塞队列，提供了更丰富的 transfer 方法，支持元素的直接传递。LinkedBlockingQueue 更适合传统的生产者-消费者模式。

## 七、性能分析

### 7.1 时间复杂度

- **入队/出队操作**：O(1)，链表的头尾操作不需要遍历
- **contains 操作**：O(n)，需要遍历整个链表
- **size 操作**：O(1)，基于 AtomicInteger 计数

### 7.2 并发性能优势

- **锁分离**：相比单锁设计，LinkedBlockingQueue 的双锁机制在高并发环境下能显著提升吞吐量
- **高并发场景**：当生产者和消费者线程数接近时，性能优势最明显
- **内存灵活性**：按需分配节点空间，避免预分配大数组的内存浪费

## 八、使用注意事项与最佳实践

### 8.1 关键注意事项

1. **避免无界队列导致的 OOM**：默认构造的 LinkedBlockingQueue 是无界的，在生产环境中应始终指定合理的容量，防止内存溢出

2. **处理 InterruptedException**：put、take 等阻塞方法会抛出 InterruptedException，应妥善处理中断异常，通常需要重置线程的中断状态

3. **避免在高并发下使用 contains 方法**：该方法需要遍历整个链表，时间复杂度为 O(n)，会显著影响性能

4. **注意弱一致性迭代器**：迭代过程中对队列的修改不会抛出 ConcurrentModificationException，但可能导致迭代结果不准确

### 8.2 最佳实践

1. **合理设置队列容量**：根据业务需求和系统资源，设置一个合理的队列容量
   ```java
   // 推荐方式
   BlockingQueue<String> queue = new LinkedBlockingQueue<>(1000);
   ```

2. **优先使用阻塞方法**：在需要等待的场景下，优先使用 put/take 等阻塞方法，而非轮询+sleep 的方式

3. **结合线程池使用**：在使用线程池时，合理配置 LinkedBlockingQueue 的容量，避免任务无限积压

4. **使用 drainTo 批量处理**：当需要批量获取元素时，使用 drainTo 方法可减少锁竞争
   ```java
   List<String> batch = new ArrayList<>();
   queue.drainTo(batch, 100); // 最多获取100个元素
   ```

## 九、输入输出示例

#### 输入输出示例

**示例1：基本操作**

输入：
```java
LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(3);
queue.offer("A");
queue.offer("B");
queue.offer("C");
System.out.println("队列已满，尝试添加D: " + queue.offer("D"));
System.out.println("队列大小: " + queue.size());
System.out.println("获取第一个元素: " + queue.poll());
System.out.println("队列大小: " + queue.size());
```

输出：
```
队列已满，尝试添加D: false
队列大小: 3
获取第一个元素: A
队列大小: 2
```

**示例2：阻塞操作**

输入：
```java
LinkedBlockingQueue<String> queue = new LinkedBlockingQueue<>(2);

// 生产者线程
new Thread(() -> {
    try {
        queue.put("X");
        queue.put("Y");
        System.out.println("添加Z前，当前时间: " + System.currentTimeMillis());
        queue.put("Z"); // 阻塞，等待队列有空间
        System.out.println("添加Z后，当前时间: " + System.currentTimeMillis());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();

// 消费者线程
new Thread(() -> {
    try {
        Thread.sleep(1000); // 等待1秒后消费
        System.out.println("消费元素: " + queue.poll());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}).start();
```

输出（时间戳会有所不同）：
```
添加Z前，当前时间: 1635482100000
消费元素: X
添加Z后，当前时间: 1635482101000
```

## 十、总结

LinkedBlockingQueue 是 Java 并发包中一个功能强大、性能优秀的阻塞队列实现：

- **核心优势**：锁分离设计提供了卓越的并发性能，链表结构使其在处理大量数据时更加灵活
- **适用场景**：适用于需要高性能生产者-消费者模型的场景，特别是当生产者和消费者数量较多时
- **使用建议**：始终指定合理的队列容量，注意处理中断异常，避免使用 contains 等低效方法

与其他阻塞队列相比，LinkedBlockingQueue 在并发性能和灵活性方面具有明显优势，是 Java 并发编程中常用的线程安全队列实现之一。