# ConcurrentLinkedQueue

## 一、基本概述

### 1.1 定义

ConcurrentLinkedQueue 是 Java 并发包（java.util.concurrent）中的一个**无界非阻塞并发队列**，实现了 Queue 接口。它是基于链表结构的线程安全队列，采用了非阻塞算法（无锁算法）实现，适用于高并发环境下的队列操作。

### 1.2 核心特性

- **无界队列**：队列大小理论上为 Integer.MAX_VALUE，不会阻塞入队操作（除非内存溢出）。
- **非阻塞实现**：基于 CAS（Compare-And-Swap）操作实现线程安全，无需显式加锁。
- **FIFO 顺序**：按照先进先出的顺序处理元素，队首是最早进入队列的元素，队尾是最新进入的元素。
- **高并发性能**：相比阻塞队列，在高并发场景下通常有更优的性能表现，避免了线程阻塞和上下文切换的开销。
- **链表结构**：内部采用单向链表实现，每个节点包含一个元素和指向下一个节点的引用。
- **弱一致性**：size()、contains() 等操作返回的结果可能不是实时精确的，这是为了保证高并发性能而做出的权衡。

## 二、底层实现原理

### 2.1 核心数据结构

ConcurrentLinkedQueue 的核心结构是一个单向链表，由 head 和 tail 两个指针管理：

```java
private transient volatile Node<E> head;
private transient volatile Node<E> tail;
```

其中 Node 类定义如下：

```java
private static class Node<E> {
    volatile E item;
    volatile Node<E> next;
    
    // 构造函数
    Node(E item) {
        UNSAFE.putObject(this, itemOffset, item);
    }
    
    // CAS 更新元素值
    boolean casItem(E cmp, E val) {
        return UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
    }
    
    // 设置下一个节点的引用
    void lazySetNext(Node<E> val) {
        UNSAFE.putOrderedObject(this, nextOffset, val);
    }
    
    // CAS 更新下一个节点
    boolean casNext(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }
    
    // 静态初始化，获取字段偏移量，用于后续的 CAS 操作
    static {
        try {
            itemOffset = UNSAFE.objectFieldOffset(Node.class.getDeclaredField("item"));
            nextOffset = UNSAFE.objectFieldOffset(Node.class.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
    
    private static final sun.misc.Unsafe UNSAFE;
    private static final long itemOffset;
    private static final long nextOffset;
    
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            itemOffset = UNSAFE.objectFieldOffset(Node.class.getDeclaredField("item"));
            nextOffset = UNSAFE.objectFieldOffset(Node.class.getDeclaredField("next"));
        } catch (Exception e) {
            throw new Error(e);
        }
    }
}
```

### 2.2 初始化

ConcurrentLinkedQueue 在初始化时会创建一个哨兵节点（dummy node）作为 head 和 tail 的初始值：

```java
public ConcurrentLinkedQueue() {
    head = tail = new Node<E>(null);
}
```

这个哨兵节点的 item 为 null，它是队列的第一个节点，但不包含实际元素。

### 2.3 入队操作原理（offer 方法）

ConcurrentLinkedQueue 的入队操作（offer）是一个无阻塞的操作，核心逻辑如下：

1. 创建新节点，包含要入队的元素。
2. 从当前 tail 节点开始，尝试将新节点添加到链表尾部。
3. 使用 CAS 操作尝试更新尾节点的 next 引用，如果成功：
   - 如果新节点距离 tail 超过一个节点，则尝试更新 tail 指针指向新节点（懒惰更新）。
   - 返回 true 表示入队成功。
4. 如果 CAS 失败（说明有其他线程修改了尾节点），则重新获取最新的尾节点并重试。

```java
public boolean offer(E e) {
    checkNotNull(e); // 元素不能为 null
    final Node<E> newNode = new Node<E>(e);

    // 从 tail 开始，不断尝试将新节点添加到链表尾部
    for (Node<E> t = tail, p = t;;) {
        Node<E> q = p.next;
        if (q == null) {
            // p 是尾节点，尝试添加新节点
            if (p.casNext(null, newNode)) {
                // CAS 成功，新节点已添加到队列尾部
                // 如果 p 不是 tail，则尝试更新 tail 指针（懒惰更新）
                if (p != t) // hop two nodes at a time
                    casTail(t, newNode);  // Failure is OK.
                return true;
            }
            // CAS 失败，继续重试
        }
        else if (p == q) // 处理节点已删除的情况（帮助 GC）
            // We have fallen off list.  If tail is unchanged, it will also have fallen off,
            // in which case we need to jump to head, from which all live nodes are reachable.
            // Else the new tail is a better bet.
            p = (t != (t = tail)) ? t : head;
        else
            // 尝试推进 p 指针，如果 q 不是尾节点，则尝试将 p 指向 q
            // 否则，将 p 重置为 tail（因为可能 tail 已更新）
            p = (p != t && t != (t = tail)) ? t : q;
    }
}
```

### 2.4 出队操作原理（poll 方法）

ConcurrentLinkedQueue 的出队操作（poll）也是一个无阻塞的操作，核心逻辑如下：

1. 从 head 节点开始，检查其下一个节点是否包含元素。
2. 如果下一个节点包含元素，尝试通过 CAS 操作将该节点的 item 设置为 null（逻辑删除）。
3. 如果 CAS 成功：
   - 如果该节点距离 head 超过一个节点，则尝试更新 head 指针指向该节点（懒惰更新）。
   - 返回被删除的元素。
4. 如果 CAS 失败或队列为空，则返回 null。

```java
public E poll() {
    restartFromHead: // 标签，用于在某些情况下重新从头开始
    for (;;) {
        for (Node<E> h = head, p = h, q;;) {
            E item = p.item;

            if (item != null && p.casItem(item, null)) {
                // CAS 成功，成功删除元素
                // 如果 p 不是 head，则尝试更新 head 指针（懒惰更新）
                if (p != h) // hop two nodes at a time
                    updateHead(h, ((q = p.next) != null) ? q : p);
                return item;
            }
            else if ((q = p.next) == null) {
                // 队列为空
                updateHead(h, p);
                return null;
            }
            else if (p == q) // 处理节点已删除的情况
                continue restartFromHead;
            else
                p = q;
        }
    }
}
```

### 2.5 懒惰更新策略

ConcurrentLinkedQueue 使用了懒惰更新策略来减少 CAS 操作的竞争：

- **tail 指针更新**：不是每次入队都更新 tail，而是只有当新节点距离 tail 超过一个节点时才尝试更新
- **head 指针更新**：不是每次出队都更新 head，而是只有当删除的节点距离 head 超过一个节点时才尝试更新

这种策略大大减少了高并发场景下的 CAS 竞争，提高了性能。

### 2.6 CAS 操作详解

ConcurrentLinkedQueue 使用了 Java 中的 Unsafe 类进行底层 CAS 操作，主要有两种 CAS 操作：

1. **casItem**：尝试更新节点的元素值
2. **casNext**：尝试更新节点的 next 引用

这些 CAS 操作是原子的，保证了在多线程环境下的线程安全。

## 三、常用构造方法

|构造方法|说明|注意事项|
|---|---|---|
|ConcurrentLinkedQueue()|创建一个空的并发队列|无|  
|ConcurrentLinkedQueue(Collection<? extends E> c)|创建一个包含指定集合元素的并发队列|如果集合为 null，抛出 NullPointerException；元素按照集合的迭代顺序入队 |

## 四、核心 API 解析

### 4.1 入队操作

|方法|类型|功能描述|异常情况|
|---|---|---|---|
|boolean add(E e)|非阻塞型|将元素 e 入队，队列无界，始终返回 true|e 为 null 抛 NullPointerException|
|boolean offer(E e)|非阻塞型|将元素 e 入队，队列无界，始终返回 true|e 为 null 抛 NullPointerException|

### 4.2 出队操作

|方法|类型|功能描述|异常情况|
|---|---|---|---|
|E poll()|非阻塞型|获取并移除队首元素，若队列为空则返回 null|无|
|E remove()|非阻塞型|获取并移除队首元素，若队列为空则抛 NoSuchElementException|队列为空抛 NoSuchElementException|

### 4.3 检查操作

|方法|功能描述|说明|
|---|---|---|
|E peek()|获取但不移除队首元素，若队列为空则返回 null|不修改队列结构|
|E element()|获取但不移除队首元素，若队列为空则抛 NoSuchElementException|不修改队列结构|
|boolean isEmpty()|判断队列是否为空|在并发环境下，返回结果可能不是实时精确的|
|int size()|返回队列中的元素数量|在并发环境下，计算可能需要遍历整个队列，且结果可能不是实时精确的|
|boolean contains(Object o)|判断队列是否包含指定元素|在并发环境下，需要遍历队列，且结果可能不是实时精确的|
|boolean remove(Object o)|移除队列中的一个指定元素|在并发环境下，需要遍历队列查找元素|
|void clear()|清空队列|遍历队列并将所有元素设为 null|
|Object[] toArray()|将队列元素转换为数组|按 FIFO 顺序返回元素|
|<T> T[] toArray(T[] a)|将队列元素转换为指定类型的数组|按 FIFO 顺序返回元素|
|Iterator<E> iterator()|返回队列的迭代器|弱一致性迭代器，不会抛出 ConcurrentModificationException|

## 五、典型使用场景

### 5.1 高并发生产者-消费者模型

ConcurrentLinkedQueue 非常适合实现高并发的生产者-消费者模型，尤其是在生产者和消费者数量较多的场景下。

**代码示例**：

```java
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ConcurrentLinkedQueueDemo {
    private static final ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
    private static final int PRODUCER_COUNT = 5;
    private static final int CONSUMER_COUNT = 3;
    private static final int PRODUCE_PER_THREAD = 100;
    
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(PRODUCER_COUNT + CONSUMER_COUNT);
        
        // 启动生产者线程
        for (int i = 0; i < PRODUCER_COUNT; i++) {
            final int producerId = i;
            executor.submit(() -> {
                for (int j = 0; j < PRODUCE_PER_THREAD; j++) {
                    String item = "Producer-" + producerId + "-Item-" + j;
                    queue.offer(item);
                    System.out.println(Thread.currentThread().getName() + " produced: " + item);
                    try {
                        Thread.sleep((long) (Math.random() * 100)); // 模拟生产耗时
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
        }
        
        // 启动消费者线程
        for (int i = 0; i < CONSUMER_COUNT; i++) {
            executor.submit(() -> {
                int consumedCount = 0;
                while (consumedCount < PRODUCE_PER_THREAD * PRODUCER_COUNT / CONSUMER_COUNT + 1) {
                    String item = queue.poll();
                    if (item != null) {
                        consumedCount++;
                        System.out.println(Thread.currentThread().getName() + " consumed: " + item);
                    } else {
                        // 如果队列为空，短暂休眠避免CPU资源浪费
                        try {
                            Thread.sleep(10);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            });
        }
        
        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.MINUTES);
        System.out.println("All tasks completed. Remaining items in queue: " + queue.size());
    }
}
```

### 5.2 任务调度与分发

在任务调度系统中，可以使用 ConcurrentLinkedQueue 作为任务队列，多个工作线程从队列中获取任务并执行。

```java
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TaskScheduler {
    private final ConcurrentLinkedQueue<Runnable> taskQueue = new ConcurrentLinkedQueue<>();
    private final ExecutorService workerPool;
    private volatile boolean isRunning = true;
    
    public TaskScheduler(int workerCount) {
        workerPool = Executors.newFixedThreadPool(workerCount);
        
        // 启动工作线程
        for (int i = 0; i < workerCount; i++) {
            workerPool.submit(this::processTasks);
        }
    }
    
    // 添加任务到队列
    public void scheduleTask(Runnable task) {
        taskQueue.offer(task);
    }
    
    // 处理任务的方法
    private void processTasks() {
        while (isRunning || !taskQueue.isEmpty()) {
            Runnable task = taskQueue.poll();
            if (task != null) {
                try {
                    task.run();
                } catch (Exception e) {
                    System.err.println("Error executing task: " + e.getMessage());
                }
            } else {
                // 短暂休眠避免CPU资源浪费
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }
    
    // 关闭调度器
    public void shutdown() {
        isRunning = false;
        workerPool.shutdown();
    }
    
    public static void main(String[] args) throws InterruptedException {
        TaskScheduler scheduler = new TaskScheduler(4); // 4个工作线程
        
        // 添加10个任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            scheduler.scheduleTask(() -> {
                System.out.println("Executing task " + taskId + " by " + Thread.currentThread().getName());
                try {
                    Thread.sleep(500); // 模拟任务执行时间
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        
        Thread.sleep(3000); // 等待任务执行
        scheduler.shutdown();
    }
}
```

### 5.3 日志收集

在分布式系统中，可以使用 ConcurrentLinkedQueue 作为日志缓冲区，多个线程将日志写入队列，再由专门的线程将日志异步持久化。

### 5.4 事件驱动系统

在事件驱动架构中，ConcurrentLinkedQueue 可以作为事件队列，事件生产者将事件发布到队列，事件消费者从队列中获取并处理事件。

## 六、与其他队列的对比

### 6.1 与 LinkedBlockingQueue 的对比

| 特性 | ConcurrentLinkedQueue | LinkedBlockingQueue |
|------|----------------------|---------------------|
| 阻塞特性 | 非阻塞 | 可阻塞 |
| 锁机制 | 无锁（CAS） | 有锁（ReentrantLock） |
| 队列大小 | 无界 | 可选有界 |
| 内存占用 | 较低 | 较高（需要维护锁和条件变量） |
| 并发性能 | 高（特别在高并发场景） | 中（可能存在锁竞争） |
| 操作结果一致性 | 弱一致性 | 强一致性 |
| 适用场景 | 高并发、非阻塞场景 | 需要阻塞控制的场景 |

### 6.2 与 ArrayBlockingQueue 的对比

| 特性 | ConcurrentLinkedQueue | ArrayBlockingQueue |
|------|----------------------|--------------------|
| 底层结构 | 链表 | 数组 |
| 阻塞特性 | 非阻塞 | 阻塞 |
| 锁机制 | 无锁（CAS） | 有锁（ReentrantLock） |
| 队列大小 | 无界 | 必须指定初始容量 |
| 内存占用 | 每个元素需要一个节点对象 | 固定大小的数组，元素直接存储 |
| 并发性能 | 高 | 中（可能存在锁竞争） |
| 适用场景 | 高并发、非阻塞场景 | 固定大小、需要阻塞控制的场景 |

### 6.3 与 LinkedTransferQueue 的对比

| 特性 | ConcurrentLinkedQueue | LinkedTransferQueue |
|------|----------------------|---------------------|
| 阻塞特性 | 非阻塞 | 可阻塞（更丰富的阻塞操作） |
| 数据传递 | 标准入队/出队 | 支持直接传递（transfer） |
| 操作丰富度 | 基本队列操作 | 更丰富的操作（transfer, tryTransfer 等） |
| 内存占用 | 较低 | 较高 |
| 并发性能 | 高（简单操作） | 高（特定操作可能更优） |
| 适用场景 | 基本的 FIFO 队列需求 | 需要更灵活数据传递模式的场景 |

## 七、性能分析

### 7.1 时间复杂度

- **入队操作（offer）**：平均 O(1)，最坏情况 O(n)（当出现大量 CAS 失败需要多次重试时）
- **出队操作（poll）**：平均 O(1)，最坏情况 O(n)（当出现大量 CAS 失败需要多次重试时）
- **peek 操作**：平均 O(1)，最坏情况 O(n)（需要遍历查找有效元素时）
- **size 操作**：O(n)，需要遍历整个队列
- **contains 操作**：O(n)，需要遍历整个队列

### 7.2 并发性能考量

- **无锁设计优势**：避免了线程阻塞和上下文切换的开销，提高了并发性能
- **CAS 竞争**：在极高并发场景下，可能会出现 CAS 竞争，导致重试增加
- **内存开销**：每个元素需要额外的 Node 对象，增加了内存开销
- **吞吐量**：相比阻塞队列，在高并发场景下通常具有更高的吞吐量
- **延迟**：操作延迟通常较低且稳定，不受线程阻塞的影响

## 八、使用注意事项与最佳实践

### 8.1 关键注意事项

1. **不允许 null 元素**：ConcurrentLinkedQueue 不允许添加 null 元素，否则会抛出 NullPointerException

2. **弱一致性操作**：size()、contains() 等操作返回的结果可能不是实时精确的，在并发环境下应谨慎依赖这些方法的结果

3. **空轮询问题**：在使用 poll() 方法时，如果队列为空，会立即返回 null。如果在循环中持续调用 poll()，可能导致 CPU 资源浪费，应考虑适当休眠或使用阻塞队列

4. **迭代器特性**：iterator() 返回的是弱一致性迭代器，不会抛出 ConcurrentModificationException，但也不能保证反映迭代过程中的所有修改

5. **内存泄漏风险**：如果元素被其他对象强引用，即使从队列中移除，也可能导致内存泄漏

### 8.2 最佳实践

1. **避免频繁调用 size()**：size() 方法需要遍历整个队列，效率较低。如果只需要判断队列是否为空，应使用 isEmpty() 方法

2. **处理空队列情况**：在使用 poll() 方法时，应妥善处理返回 null 的情况，避免空指针异常

3. **合理设置工作线程休眠时间**：在消费者循环中，如果队列为空，可以短暂休眠（如 1-10ms）避免 CPU 资源浪费

4. **优先考虑批量操作**：当需要处理多个元素时，考虑批量获取和处理，减少循环中的 CAS 竞争

5. **选择合适的队列类型**：根据实际需求选择队列类型，如果需要阻塞操作，应考虑使用 LinkedBlockingQueue 或 LinkedTransferQueue

6. **使用示例**：
   ```java
   // 正确使用示例
   ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
   
   // 入队
   queue.offer("element");
   
   // 出队并处理 null 情况
   String element;
   while ((element = queue.poll()) != null) {
       // 处理元素
   }
   
   // 消费者循环中的休眠优化
   while (running) {
       element = queue.poll();
       if (element != null) {
           // 处理元素
       } else {
           // 短暂休眠，避免 CPU 资源浪费
           try {
               Thread.sleep(5);
           } catch (InterruptedException e) {
               Thread.currentThread().interrupt();
           }
       }
   }
   ```

## 九、输入输出示例

#### 输入输出示例

**示例1：基本队列操作**

输入：
```java
import java.util.concurrent.ConcurrentLinkedQueue;

public class ConcurrentLinkedQueueBasicExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
        
        // 入队操作
        System.out.println("添加元素 'A': " + queue.offer("A"));
        System.out.println("添加元素 'B': " + queue.offer("B"));
        System.out.println("添加元素 'C': " + queue.offer("C"));
        
        // 队列状态
        System.out.println("队列大小: " + queue.size());
        System.out.println("队列是否为空: " + queue.isEmpty());
        System.out.println("队列是否包含 'B': " + queue.contains("B"));
        
        // 检查队首元素
        System.out.println("队首元素(peek): " + queue.peek());
        
        // 出队操作
        System.out.println("出队元素(poll): " + queue.poll());
        System.out.println("出队元素(poll): " + queue.poll());
        System.out.println("出队元素(poll): " + queue.poll());
        System.out.println("队列为空时出队: " + queue.poll());
        
        // 最终状态
        System.out.println("最终队列大小: " + queue.size());
    }
}
```

输出：
```
添加元素 'A': true
添加元素 'B': true
添加元素 'C': true
队列大小: 3
队列是否为空: false
队列是否包含 'B': true
队首元素(peek): A
出队元素(poll): A
出队元素(poll): B
出队元素(poll): C
队列为空时出队: null
最终队列大小: 0
```

**示例2：并发操作**

输入：
```java
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ConcurrentLinkedQueueConcurrentExample {
    private static final ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
    private static final int THREAD_COUNT = 4;
    private static final int ITEMS_PER_THREAD = 1000;
    
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch latch = new CountDownLatch(2 * THREAD_COUNT);
        
        // 添加元素的线程
        for (int t = 0; t < THREAD_COUNT; t++) {
            final int threadId = t;
            executor.submit(() -> {
                try {
                    for (int i = 0; i < ITEMS_PER_THREAD; i++) {
                        int value = threadId * ITEMS_PER_THREAD + i;
                        queue.offer(value);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        // 移除元素的线程
        for (int t = 0; t < THREAD_COUNT; t++) {
            executor.submit(() -> {
                try {
                    int removedCount = 0;
                    while (removedCount < ITEMS_PER_THREAD) {
                        if (queue.poll() != null) {
                            removedCount++;
                        }
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await(); // 等待所有线程完成
        executor.shutdown();
        
        System.out.println("最终队列大小: " + queue.size());
        System.out.println("预期队列大小: " + (THREAD_COUNT * ITEMS_PER_THREAD - THREAD_COUNT * ITEMS_PER_THREAD));
    }
}
```

输出：
```
最终队列大小: 0
预期队列大小: 0
```

## 十、总结

ConcurrentLinkedQueue 是 Java 并发包中一个高效的非阻塞并发队列：

- **核心优势**：基于 CAS 操作实现的无锁算法，在高并发场景下具有优异的性能表现
- **FIFO 顺序**：保证元素按照先进先出的顺序处理
- **无界队列**：不会因为队列满而阻塞入队操作
- **弱一致性**：size()、contains() 等操作的结果可能不是实时精确的
- **适用场景**：高并发生产者-消费者模型、任务调度与分发、日志收集、事件驱动系统等

与其他队列相比，ConcurrentLinkedQueue 在不需要阻塞操作的高并发场景下通常是最佳选择。在使用时，应注意其弱一致性特性，并合理处理空队列情况，避免 CPU 资源浪费。

最后更新时间：2024-01-01