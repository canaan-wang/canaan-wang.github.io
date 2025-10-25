# ArrayBlockingQueue

## 一、基础定义

ArrayBlockingQueue 是 Java 并发包（java.util.concurrent）下的一个**有界阻塞队列**，基于**数组**实现，遵循“先进先出”（FIFO）的队列规则。


      核心关键词：有界、阻塞、数组、FIFO、并发安全
    

其类继承关系：实现 BlockingQueue 接口，间接继承 Queue 接口，具备队列的基本特性，同时提供阻塞式的入队和出队方法。

## 二、核心特性

1. **有界性**：初始化时必须指定队列容量，且容量一旦确定无法修改。这是与 LinkedBlockingQueue（默认无界）的核心区别之一。

2. **阻塞性**：
        当队列已满时，调用入队方法（如 put()）的线程会被阻塞，直到队列有空闲空间。

3. 当队列为空时，调用出队方法（如 take()）的线程会被阻塞，直到队列中有元素。

4. **并发安全**：通过**独占锁 ReentrantLock**保证线程安全，入队和出队操作共享同一把锁，因此同一时间只能有一个线程进行入队或出队操作。

5. **FIFO 顺序**：底层数组按顺序存储元素，入队从队尾添加，出队从队头移除，符合先进先出规则。

6. **可选公平性**：初始化时可指定是否为公平队列。公平队列会按线程等待顺序分配锁，减少线程饥饿，但会牺牲部分性能；非公平队列则不保证等待顺序，性能更优（默认非公平）。

## 三、底层实现原理

### 3.1 核心成员变量

- `final Object[] items`：存储队列元素的核心数组，容量固定。

- `int takeIndex`：出队操作的索引，指向当前要取出的元素位置。

- `int putIndex`：入队操作的索引，指向当前要插入元素的位置。

- `int count`：队列中当前元素的个数。

- `final ReentrantLock lock`：控制并发访问的独占锁，入队和出队共享。

- `private final Condition notEmpty`：等待队列非空的条件变量，出队线程阻塞时会等待此条件。

- `private final Condition notFull`：等待队列非满的条件变量，入队线程阻塞时会等待此条件。

### 3.2 核心逻辑（入队与出队）

#### 3.2.1 入队逻辑（以 put() 为例）

1. 获取独占锁 lock（若锁被占用则阻塞）。

2. 判断队列是否已满（count == items.length）：若已满，调用 notFull.await() 使当前线程阻塞，释放锁并等待，直到有线程出队后唤醒。

3. 若队列未满，将元素插入到 putIndex 指向的位置。

4. 更新 putIndex：若 putIndex 达到数组末尾（putIndex == items.length），则重置为 0（循环数组特性）。

5. count 加 1。

6. 唤醒 notEmpty 条件变量上等待的线程（告知出队线程队列非空）。

7. 释放锁。

#### 3.2.2 出队逻辑（以 take() 为例）

1. 获取独占锁 lock（若锁被占用则阻塞）。

2. 判断队列是否为空（count == 0）：若为空，调用 notEmpty.await() 使当前线程阻塞，释放锁并等待，直到有线程入队后唤醒。

3. 若队列非空，取出 takeIndex 指向的元素。

4. 更新 takeIndex：若 takeIndex 达到数组末尾（takeIndex == items.length），则重置为 0（循环数组特性）。

5. count 减 1。

6. 唤醒 notFull 条件变量上等待的线程（告知入队线程队列非满）。

7. 释放锁。


      底层数组是“循环数组”，通过 takeIndex 和 putIndex 的循环重置实现，避免数组元素移动导致的性能损耗。
    

## 四、常用构造方法

|构造方法|说明|
|---|---|
|ArrayBlockingQueue(int capacity)|创建指定容量的非公平队列（默认）|
|ArrayBlockingQueue(int capacity, boolean fair)|创建指定容量的队列，fair 为 true 时是公平队列|
|ArrayBlockingQueue(int capacity, boolean fair, Collection<? extends E> c)|创建指定容量和公平性的队列，并将集合 c 中的元素初始化到队列中|
## 五、核心 API 详解

按功能分为入队、出队、查询三类，重点区分**阻塞方法**、**非阻塞方法**、**超时方法**。

### 5.1 入队方法

|方法名|类型|功能说明|异常情况|
|---|---|---|---|
|void put(E e)|阻塞|队列满时阻塞，直到有空间插入|NullPointerException（e 为 null 时）|
|boolean offer(E e)|非阻塞|队列满时直接返回 false，插入成功返回 true|NullPointerException（e 为 null 时）|
|boolean offer(E e, long timeout, TimeUnit unit)|超时阻塞|队列满时阻塞指定时间，超时仍无空间返回 false|NullPointerException、InterruptedException|
|boolean add(E e)|非阻塞（继承自 Queue）|队列满时抛出异常，插入成功返回 true|NullPointerException、IllegalStateException（队列满）|
### 5.2 出队方法

|方法名|类型|功能说明|异常情况|
|---|---|---|---|
|E take()|阻塞|队列空时阻塞，直到有元素取出|InterruptedException|
|E poll()|非阻塞|队列空时直接返回 null，取出成功返回元素|无|
|E poll(long timeout, TimeUnit unit)|超时阻塞|队列空时阻塞指定时间，超时返回 null|InterruptedException|
|E remove()|非阻塞（继承自 Queue）|队列空时抛出异常，取出成功返回元素|NoSuchElementException（队列空）|
### 5.3 查询与辅助方法

|方法名|功能说明|
|---|---|
|E peek()|获取队头元素但不删除，队空返回 null|
|int size()|返回队列中当前元素个数（线程安全，基于锁实现）|
|int remainingCapacity()|返回队列剩余容量（capacity - count）|
|boolean contains(Object o)|判断队列是否包含指定元素（需遍历数组，加锁保证安全）|
|void clear()|清空队列，将数组元素置为 null，重置 takeIndex、putIndex、count|
|int drainTo(Collection<? super E> c)|将队列中所有元素移到集合 c 中，返回移动的元素个数|
|int drainTo(Collection<? super E> c, int maxElements)|最多移动 maxElements 个元素到集合 c 中，返回实际移动个数|
## 六、公平性分析

### 6.1 公平与非公平的实现差异

公平性由 ReentrantLock 的公平性决定：

- **公平队列**：lock 为公平锁（ReentrantLock(true)），线程获取锁时会先检查等待队列，按“先到先得”的顺序获取，避免线程长时间等待。

- **非公平队列**：lock 为非公平锁（ReentrantLock(false)），线程获取锁时会先尝试“插队”，若锁未被占用则直接获取，性能更高，但可能导致部分线程饥饿。

### 6.2 选择建议

- 若对线程公平性要求高（如避免关键线程饥饿），选择公平队列，代价是吞吐量降低。

- 若追求高吞吐量，默认选择非公平队列即可（大多数并发场景的首选）。

## 七、使用场景

核心适用场景：**有界的生产者-消费者模型**，需控制队列容量避免内存溢出。

- **任务分发**：如线程池的任务队列（部分自定义线程池会用其替代无界队列），避免任务过多导致OOM。

- **数据缓冲**：如上下游系统处理速度不匹配时，用其缓冲数据，平衡生产和消费速度（如日志收集系统）。

- **并发场景下的有序数据传递**：需保证数据按顺序处理，且控制队列长度的场景（如消息队列的简化版）。

## 八、注意事项

1. **禁止插入 null 元素**：所有入队方法（put、offer、add）都会检查元素是否为 null，若为 null 直接抛出 NullPointerException。

2. **容量不可动态修改**：初始化时必须指定容量，后续无法扩容或缩容，需提前评估业务场景的最大容量。

3. **锁竞争问题**：入队和出队共享同一把锁，若生产者和消费者并发量极高，可能出现锁竞争瓶颈，此时可考虑用 LinkedBlockingQueue（入队出队两把锁）或 ConcurrentLinkedQueue（无锁）替代，但需结合有界性需求。

4. **InterruptedException 处理**：阻塞方法（take、put、超时 offer/poll）会响应中断，抛出 InterruptedException，需在业务代码中妥善处理（如恢复中断状态、终止任务等）。

5. **遍历与迭代**：迭代器是“弱一致性”的，遍历过程中队列发生修改（如入队、出队），不会抛出 ConcurrentModificationException，但可能无法获取最新元素。

## 九、与类似队列的对比

|对比维度|ArrayBlockingQueue|LinkedBlockingQueue|ConcurrentLinkedQueue|
|---|---|---|---|
|底层实现|数组|链表|链表|
|有界性|强制有界|默认无界，可指定有界|无界|
|锁机制|单锁（入队出队共享）|双锁（入队、出队各一把）|无锁（CAS）|
|阻塞性|支持（实现 BlockingQueue）|支持（实现 BlockingQueue）|不支持（非阻塞队列）|
|适用场景|有界生产者-消费者，低锁竞争|无界/有界生产者-消费者，高并发|高并发非阻塞场景，无界需求|
## 十、简单示例代码

### 10.1 生产者-消费者模型示例
```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class ArrayBlockingQueueExample {
    // 定义队列容量为5
    private static final int QUEUE_CAPACITY = 5;
    // 创建非公平队列
    private static BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(QUEUE_CAPACITY);

    public static void main(String[] args) {
        // 启动生产者线程
        Thread producer = new Thread(new Producer());
        // 启动消费者线程
        Thread consumer = new Thread(new Consumer());

        producer.start();
        consumer.start();
    }

    // 生产者线程
    static class Producer implements Runnable {
        private int i = 0;

        @Override
        public void run() {
            while (true) {
                try {
                    i++;
                    System.out.println("生产者生产：" + i);
                    // 阻塞式入队，队列满时会阻塞
                    queue.put(i);
                    // 模拟生产耗时
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    // 消费者线程
    static class Consumer implements Runnable {
        @Override
        public void run() {
            while (true) {
                try {
                    // 阻塞式出队，队列空时会阻塞
                    int value = queue.take();
                    System.out.println("消费者消费：" + value);
                    // 模拟消费耗时
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
```

### 10.2 公平队列与非公平队列对比示例
```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CountDownLatch;

public class FairnessComparison {
    private static final int CAPACITY = 1;
    private static final int THREAD_COUNT = 5;

    public static void main(String[] args) throws InterruptedException {
        // 测试公平队列
        BlockingQueue<Integer> fairQueue = new ArrayBlockingQueue<>(CAPACITY, true);
        System.out.println("公平队列测试：");
        testQueue(fairQueue);

        // 测试非公平队列
        BlockingQueue<Integer> unfairQueue = new ArrayBlockingQueue<>(CAPACITY, false);
        System.out.println("\n非公平队列测试：");
        testQueue(unfairQueue);
    }

    private static void testQueue(BlockingQueue<Integer> queue) throws InterruptedException {
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(THREAD_COUNT);

        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            new Thread(() -> {
                try {
                    startLatch.await(); // 等待开始信号
                    queue.put(threadId);
                    System.out.println("线程" + threadId + "成功入队");
                    Thread.sleep(100); // 模拟处理时间
                    queue.take();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    endLatch.countDown();
                }
            }).start();
        }

        startLatch.countDown(); // 发出开始信号
        endLatch.await(); // 等待所有线程完成
    }
}
```

## 十一、性能分析

1. **时间复杂度**：
   - 入队和出队操作：均为 O(1)，基于数组的直接访问和索引更新。
   - 包含（contains）操作：O(n)，需遍历整个数组。
   - 清空（clear）操作：O(n)，需遍历数组并置空元素。

2. **并发性能特点**：
   - 由于使用单把独占锁，在高并发场景下，生产者和消费者之间会存在锁竞争，可能导致性能瓶颈。
   - 非公平模式下，因线程可“插队”获取锁，吞吐量通常高于公平模式，但公平性无法保证。
   - 相比 `LinkedBlockingQueue`（双锁机制），在生产者和消费者并发量均衡时，`ArrayBlockingQueue` 的锁竞争更激烈，高并发下性能可能稍差；但在数据局部性较好（数组元素在内存中连续存储）的场景，缓存利用率更高，简单操作下性能可能更优。

## 十二、扩展思考

1. **与线程池的结合**：在自定义线程池时，若使用 `ArrayBlockingQueue` 作为任务队列，由于其有界性，当队列满且线程数达到核心线程数时，会触发线程池的拒绝策略（如抛异常、丢弃任务等），可有效防止任务无限制堆积导致的内存溢出。而使用无界队列（如 `LinkedBlockingQueue` 默认情况）则可能因任务过多导致 OOM。

2. **循环数组的设计优势**：通过 `takeIndex` 和 `putIndex` 的循环移动，避免了每次出队后数组元素整体前移的操作（如普通数组队列的 `remove` 方法），极大减少了元素复制的开销，提升了操作效率。

3. **条件变量的协作机制**：`notEmpty` 和 `notFull` 两个条件变量分别对应出队和入队的等待/唤醒场景，实现了线程间的精准通信，避免了无意义的线程唤醒，减少了系统开销。

## 十三、总结

`ArrayBlockingQueue` 是一个功能明确、实现高效的有界阻塞队列，其核心优势在于**有界性可控**和**并发安全保证**，非常适合需要控制队列长度的生产者-消费者场景。在使用时需注意：
- 根据业务需求合理设置初始容量，避免容量过大导致内存浪费或过小导致频繁阻塞。
- 权衡公平性与性能，大多数场景下优先选择非公平模式。
- 高并发且生产者/消费者压力不均衡时，可考虑 `LinkedBlockingQueue` 等双锁机制的队列以减少锁竞争。
- 妥善处理阻塞方法可能抛出的 `InterruptedException`，保证线程中断机制的正确性。