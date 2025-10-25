# LinkedBlockingDeque

## 一、基本概述

`LinkedBlockingDeque` 是 Java 1.6 引入的并发双端队列，位于 `java.util.concurrent` 包下，核心定位如下：

- **双端队列特性**：实现 `Deque` 接口，支持在队列的两端（头部和尾部）进行元素的添加、删除和获取操作，兼具队列（FIFO）和栈（LIFO）的使用场景。

- **阻塞特性**：实现 `BlockingDeque` 接口，支持在队列满（添加操作）或空（获取操作）时阻塞线程，直到队列状态满足操作条件，无需手动处理线程同步。

- **链表实现**：底层基于**双向链表**存储元素，链表节点包含前驱（prev）和后继（next）指针，元素插入/删除时通过调整指针完成，避免了数组扩容的性能开销。

- **可选有界性**：默认情况下为**无界队列**（容量为 `Integer.MAX_VALUE`），也可在构造时指定容量成为有界队列，适用于需要控制内存占用的场景。


      核心接口继承关系：`LinkedBlockingDeque <E> extends AbstractQueue<E> implements BlockingDeque<E>, Serializable`

## 二、核心特性深度解析

### 2.1 线程安全机制

LinkedBlockingDeque 的线程安全通过**独占锁 + 双条件变量**实现，核心锁机制如下：

- **独占锁（ReentrantLock）**：内部维护一个可重入锁 `lock`，所有对队列的操作（添加、删除、查询）都需要先获取该锁，保证同一时间只有一个线程能修改队列，避免并发安全问题。

- **双条件变量（Condition）**：
        `notEmpty`：当队列空时，阻塞等待获取元素的线程；当队列有元素被添加时，唤醒等待的线程。

- `notFull`：当队列满（仅有界时）时，阻塞等待添加元素的线程；当队列有元素被删除时，唤醒等待的线程。

与 `LinkedBlockingQueue`（双锁机制：takeLock 和 putLock）不同，LinkedBlockingDeque 因双端操作特性采用单锁设计，虽在高并发场景下可能存在一定锁竞争，但简化了双端操作的同步逻辑。

### 2.2 双向链表结构

底层链表节点 `Node` 类的核心结构如下（简化源码）：

```java

private static class Node<E> {
    E item;          // 节点存储的元素
    Node<E> prev;    // 前驱节点指针
    Node<E> next;    // 后继节点指针
    Node(E x) { item = x; }
}
```

队列同时维护**头指针（head）**和**尾指针（last）**，方便在两端快速操作：

- 头部操作（如 `addFirst`、`pollFirst`）：直接通过 head 指针定位，调整前驱/后继指针完成操作。

- 尾部操作（如 `addLast`、`pollLast`）：直接通过 last 指针定位，无需遍历链表，时间复杂度为 O(1)。

### 2.3 有界与无界特性

- **无界队列**：默认构造（`new LinkedBlockingDeque()`）时，容量为 `Integer.MAX_VALUE`，理论上可无限添加元素，直到内存溢出。适用于元素生产速度可控、不会出现海量堆积的场景。

- **有界队列**：通过构造方法 `new LinkedBlockingDeque(int capacity)` 指定容量，当队列元素个数达到 capacity 时，后续添加操作（如 `putFirst`、`putLast`）会阻塞线程，直到有元素被删除。适用于需要限制队列大小、避免内存溢出的并发场景。

## 三、构造方法详解

LinkedBlockingDeque 提供 3 个核心构造方法，覆盖不同使用场景：

|构造方法|说明|适用场景|
|---|---|---|
|`LinkedBlockingDeque()`|默认构造，容量为 `Integer.MAX_VALUE`（无界）|元素数量较少、无需限制队列大小的场景|
|`LinkedBlockingDeque(int capacity)`|指定容量的有界队列|高并发场景，需控制内存占用，避免元素堆积溢出|
|`LinkedBlockingDeque(Collection<? extends E> c)`|将集合 c 中的元素初始化到队列中，容量为 `Integer.MAX_VALUE`|需要从已有集合快速初始化队列的场景|
## 四、常用 API 分类汇总

LinkedBlockingDeque 的 API 围绕“双端操作”和“阻塞特性”设计，按功能可分为添加、删除、获取、查询四大类，需重点区分“阻塞”“非阻塞”“抛出异常”“返回特殊值”的不同行为。

### 4.1 元素添加操作（两端）

|API 方法|操作位置|核心行为|备注|
|---|---|---|---|
|`addFirst(E e)`|头部|添加成功返回 true，队列满时抛出 `IllegalStateException`|非阻塞，无界队列不会满|
|`addLast(E e)`|尾部|同 addFirst，添加到尾部|等同于 `add(E e)`|
|`offerFirst(E e)`|头部|添加成功返回 true，队列满时返回 false|非阻塞，推荐优先使用|
|`offerLast(E e)`|尾部|同 offerFirst，添加到尾部|等同于 `offer(E e)`|
|`putFirst(E e) throws InterruptedException`|头部|队列满时阻塞线程，直到有空间或被中断|阻塞操作，可响应中断|
|`putLast(E e) throws InterruptedException`|尾部|同 putFirst，添加到尾部|等同于 `put(E e)`|
|`offerFirst(E e, long timeout, TimeUnit unit) throws InterruptedException`|头部|指定超时时间，超时未添加成功返回 false|限时阻塞，兼顾阻塞和非阻塞特性|
|`offerLast(E e, long timeout, TimeUnit unit) throws InterruptedException`|尾部|同 offerFirst 限时版本，添加到尾部|灵活控制阻塞时间|
### 4.2 元素删除操作（两端）

|API 方法|操作位置|核心行为|备注|
|---|---|---|---|
|`removeFirst()`|头部|删除并返回头部元素，队列为空时抛出 `NoSuchElementException`|非阻塞，等同于 `remove()`|
|`removeLast()`|尾部|同 removeFirst，删除尾部元素|非阻塞，队空抛异常|
|`pollFirst()`|头部|删除并返回头部元素，队列为空时返回 null|非阻塞，推荐优先使用|
|`pollLast()`|尾部|同 pollFirst，删除尾部元素|非阻塞，队空返回 null|
|`takeFirst() throws InterruptedException`|头部|队列为空时阻塞线程，直到有元素或被中断|阻塞操作，可响应中断|
|`takeLast() throws InterruptedException`|尾部|同 takeFirst，获取尾部元素|阻塞操作，等同于 `take()`|
|`pollFirst(long timeout, TimeUnit unit) throws InterruptedException`|头部|指定超时时间，超时未获取返回 null|限时阻塞|
|`pollLast(long timeout, TimeUnit unit) throws InterruptedException`|尾部|同 pollFirst 限时版本，获取尾部元素|限时阻塞|
|`removeFirstOccurrence(Object o)`|全队列|删除第一个匹配 o 的元素，成功返回 true|需遍历队列，时间复杂度 O(n)|
|`removeLastOccurrence(Object o)`|全队列|删除最后一个匹配 o 的元素，成功返回 true|需遍历队列，时间复杂度 O(n)|
### 4.3 元素获取操作（不删除）

|API 方法|操作位置|核心行为|备注|
|---|---|---|---|
|`getFirst()`|头部|返回头部元素，队空抛出 `NoSuchElementException`|非阻塞，不删除元素|
|`getLast()`|尾部|返回尾部元素，队空抛出 `NoSuchElementException`|非阻塞，不删除元素|
|`peekFirst()`|头部|返回头部元素，队空返回 null|非阻塞，不删除元素，推荐使用|
|`peekLast()`|尾部|返回尾部元素，队空返回 null|非阻塞，不删除元素，推荐使用|
### 4.4 队列查询与辅助操作

- `int size()`：返回队列中元素的个数，因锁机制保证了实时准确性（区别于 ConcurrentLinkedQueue 的估算值）。

- `boolean isEmpty()`：判断队列是否为空，同样是精确判断。

- `boolean contains(Object o)`：判断队列是否包含指定元素，需遍历队列，时间复杂度 O(n)。

- `Object[] toArray()`：将队列元素转为数组返回。

- `<T> T[] toArray(T[] a)`：将队列元素填入指定类型数组，不足则补 null。

- `Iterator<E> iterator()`：返回队列的迭代器，支持遍历，但迭代过程中队列可能被修改（弱一致性）。

## 五、核心源码解析（关键机制）

### 5.1 锁与条件变量初始化

```java

// 独占锁，控制所有操作的同步
private final ReentrantLock lock = new ReentrantLock();
// 非空条件：队列空时，等待获取元素的线程在此阻塞
private final Condition notEmpty = lock.newCondition();
// 非满条件：队列满时，等待添加元素的线程在此阻塞
private final Condition notFull = lock.newCondition();
// 头节点（head.item 为 null，作为哨兵节点）
transient Node<E> head;
// 尾节点（last.next 为 null）
transient Node<E> last;
// 队列元素个数
private transient int count;
// 队列容量（无界时为 Integer.MAX_VALUE）
private final int capacity;
```

注意：head 为哨兵节点，其 item 始终为 null，实际第一个元素为 head.next；last 节点的 next 始终为 null，简化了边界操作逻辑。

### 5.2 核心添加操作：putLast 源码

```java

public void putLast(E e) throws InterruptedException {
    // 元素非空校验
    if (e == null) throw new NullPointerException();
    // 构建新节点
    Node<E> node = new Node<E>(e);
    // 获取锁，支持中断
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        // 队列满时，阻塞当前线程，释放锁并等待 notFull 信号
        while (count == capacity) {
            notFull.await();
        }
        // 将新节点添加到尾部
        linkLast(node);
        // 元素个数+1
        ++count;
        // 唤醒 notEmpty 上等待的线程（有新元素了）
        notEmpty.signal();
    } finally {
        // 释放锁，无论是否异常
        lock.unlock();
    }
}

// 链表尾部添加节点的具体逻辑
private void linkLast(Node<E> node) {
    // 保存原尾节点
    Node<E> l = last;
    // 新节点的前驱指向原尾节点
    node.prev = l;
    // 更新尾节点为新节点
    last = node;
    // 若原队列为空（头节点为哨兵），则头节点的后继指向新节点
    if (l == null)
        head.next = node;
    else
        // 原尾节点的后继指向新节点
        l.next = node;
}
```

### 5.3 核心获取操作：takeFirst 源码

```java

public E takeFirst() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    // 获取锁，支持中断
    lock.lockInterruptibly();
    try {
        // 队列为空时，阻塞当前线程，等待 notEmpty 信号
        while (count == 0) {
            notEmpty.await();
        }
        // 移除并返回头部元素（实际元素在 head.next）
        E x = unlinkFirst();
        // 唤醒 notFull 上等待的线程（有空间了）
        notFull.signal();
        return x;
    } finally {
        lock.unlock();
    }
}

// 移除头部实际元素节点（head.next）的具体逻辑
private E unlinkFirst() {
    // 头节点（哨兵）的后继为实际第一个元素节点
    Node<E> f = head.next;
    // 原头节点的后继置空，便于 GC
    head.next = head; 
    // 更新头节点为原实际第一个节点（新哨兵）
    head = f;
    // 获取元素值
    E item = f.item;
    // 新哨兵节点的 item 置空
    f.item = null;
    // 新哨兵节点的前驱置空
    f.prev = null;
    // 元素个数-1
    --count;
    return item;
}
```


      源码关键总结：所有操作都先获取锁，通过 while 循环判断队列状态（避免虚假唤醒），操作完成后唤醒对应条件变量上的线程，最终在 finally 中释放锁，保证锁的正确释放。
    

## 六、使用场景与示例

### 6.1 典型使用场景

- **双端任务处理**：需要从队列两端添加或处理任务的场景，如“最近任务优先处理”（尾部添加新任务，头部处理常规任务，尾部获取紧急任务）。

- **并发生产者-消费者模型**：尤其是需要“生产者向两端添加，消费者从两端获取”的复杂模型，阻塞特性无需手动实现线程等待。

- **实现阻塞栈或阻塞队列**：因双端特性，可直接作为阻塞栈（使用 `addFirst/removeFirst` 模拟栈操作）或阻塞队列（使用 `addLast/removeFirst` 模拟队列操作）。

### 6.2 实战示例：生产者-消费者模型

实现“生产者向队列头部添加普通任务、尾部添加紧急任务；消费者优先处理尾部紧急任务，再处理头部普通任务”的场景：
```java
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

public class BlockingDequeExample {
    // 定义有界双端队列，容量为10
    private static final LinkedBlockingDeque<String> deque = new LinkedBlockingDeque<>(10);

    public static void main(String[] args) {
        // 启动2个普通任务生产者
        for (int i = 0; i < 2; i++) {
            new Thread(new NormalTaskProducer(i), "Normal-Producer-" + i).start();
        }

        // 启动1个紧急任务生产者
        new Thread(new EmergencyTaskProducer(), "Emergency-Producer").start();

        // 启动3个消费者
        for (int i = 0; i < 3; i++) {
            new Thread(new TaskConsumer(i), "Consumer-" + i).start();
        }
    }

    // 普通任务生产者：向队列头部添加任务
    static class NormalTaskProducer implements Runnable {
        private int producerId;

        public NormalTaskProducer(int id) {
            this.producerId = id;
        }

        @Override
        public void run() {
            try {
                int taskId = 0;
                while (true) {
                    String task = "Normal-Task-" + producerId + "-" + taskId++;
                    deque.putFirst(task); // 阻塞添加到头部
                    System.out.println(Thread.currentThread().getName() + " 生产: " + task);
                    TimeUnit.MILLISECONDS.sleep(500); // 模拟生产耗时
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    // 紧急任务生产者：向队列尾部添加任务
    static class EmergencyTaskProducer implements Runnable {
        @Override
        public void run() {
            try {
                int taskId = 0;
                while (true) {
                    String task = "Emergency-Task-" + taskId++;
                    deque.putLast(task); // 阻塞添加到尾部
                    System.out.println(Thread.currentThread().getName() + " 生产: " + task);
                    TimeUnit.SECONDS.sleep(2); // 紧急任务生产频率较低
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    // 消费者：优先处理尾部紧急任务，再处理头部普通任务
    static class TaskConsumer implements Runnable {
        private int consumerId;

        public TaskConsumer(int id) {
            this.consumerId = id;
        }

        @Override
        public void run() {
            try {
                while (true) {
                    // 先尝试获取尾部紧急任务（非阻塞，无则返回null）
                    String task = deque.pollLast();
                    if (task == null) {
                        // 无紧急任务时获取头部普通任务（阻塞等待）
                        task = deque.takeFirst();
                    }
                    System.out.println(Thread.currentThread().getName() + " 消费: " + task);
                    TimeUnit.MILLISECONDS.sleep(300); // 模拟消费耗时
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

## 七、与其他并发队列的对比分析

|队列类型|核心差异点|适用场景|
|---|---|---|
|`LinkedBlockingDeque`|双端操作、单锁机制、可作为队列/栈|需要双端操作的并发场景|
|`LinkedBlockingQueue`|单端队列（FIFO）、双锁机制（takeLock/putLock）|单纯的生产者-消费者模型（单端）|
|`ArrayBlockingQueue`|数组实现、有界、单锁机制|需要固定容量且对内存连续性有要求的场景|
|`ConcurrentLinkedDeque`|无锁（CAS）、无界、双端操作|高并发下对吞吐量要求高，可容忍短暂不一致的场景|
|`PriorityBlockingQueue`|优先级排序、无界|需要按优先级处理任务的场景（无界）|

核心区别总结：
- 与 `LinkedBlockingQueue` 相比，`LinkedBlockingDeque` 支持双端操作，但单锁设计在高并发单端操作场景下性能可能略低。
- 与 `ConcurrentLinkedDeque` 相比，`LinkedBlockingDeque` 提供阻塞特性，适合需要线程等待/唤醒的场景，而后者更适合纯非阻塞的高吞吐场景。


## 八、注意事项与最佳实践

1. **内存溢出风险**：
   - 无界队列（默认构造）可能因元素无限堆积导致 OOM，建议在生产环境使用有界构造（指定容量）。
   - 有界队列需合理设置容量，避免过小导致频繁阻塞影响性能，或过大浪费内存。

2. **线程中断处理**：
   - 阻塞方法（如 `putFirst`、`takeLast`）会响应中断，需在业务逻辑中妥善处理 `InterruptedException`，避免中断信号丢失。

3. **迭代器特性**：
   - 迭代器为弱一致性，遍历过程中元素可能被修改，不支持 `remove` 操作（会抛 `UnsupportedOperationException`）。

4. **性能考量**：
   - 双端操作（如 `addFirst`、`pollLast`）均为 O(1) 时间复杂度，优于需要移动元素的数组队列。
   - 单锁机制在高并发场景下可能成为瓶颈，若仅需单端操作，可优先选择 `LinkedBlockingQueue`（双锁减少竞争）。

5. **元素非空性**：
   - 所有添加方法均不允许 null 元素（会抛 `NullPointerException`），需提前校验输入。


## 九、总结

`LinkedBlockingDeque` 作为 Java 并发包中兼具双端操作和阻塞特性的队列实现，通过双向链表 + 独占锁 + 双条件变量的设计，为多线程场景下的双端任务处理提供了便捷支持。其核心优势在于：
- 简化双端操作的线程同步逻辑，无需手动实现锁和等待机制。
- 灵活的有界/无界配置，适配不同内存控制需求。
- 同时支持队列（FIFO）和栈（LIFO）模式，场景适应性强。

在实际开发中，需根据业务是否需要双端操作、是否需要阻塞等待以及并发量大小，综合选择合适的并发队列，以达到最佳性能和可靠性。