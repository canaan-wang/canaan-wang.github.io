# ConcurrentLinkedQueue

## 定义与作用

ConcurrentLinkedQueue 是 Java 并发包中基于 CAS（Compare-And-Swap）实现的无锁并发队列，遵循 FIFO（先进先出）原则。它提供了高性能的非阻塞队列操作，适用于高并发场景下的数据收集和转发。

**主要特性：**
- 无锁设计：基于 CAS 操作，避免锁竞争
- 非阻塞操作：所有方法都不会阻塞线程
- 线程安全：通过原子操作保证线程安全
- FIFO 顺序：保证元素的先进先出顺序
- 无界队列：容量不受限制

## 核心原理

### 数据结构
ConcurrentLinkedQueue 使用单向链表作为底层存储结构：

```java
// 核心数据结构
private static class Node<E> {
    volatile E item;        // 存储的元素
    volatile Node<E> next;  // 下一个节点
    
    Node(E item) {
        UNSAFE.putObject(this, itemOffset, item);
    }
    
    boolean casItem(E cmp, E val) {
        return UNSAFE.compareAndSwapObject(this, itemOffset, cmp, val);
    }
    
    void lazySetNext(Node<E> val) {
        UNSAFE.putOrderedObject(this, nextOffset, val);
    }
    
    boolean casNext(Node<E> cmp, Node<E> val) {
        return UNSAFE.compareAndSwapObject(this, nextOffset, cmp, val);
    }
}

private transient volatile Node<E> head;  // 队列头节点
private transient volatile Node<E> tail;  // 队列尾节点
```

### 无锁算法
ConcurrentLinkedQueue 采用 Michael-Scott 无锁队列算法：

#### 插入操作算法
```java
public boolean offer(E e) {
    checkNotNull(e);
    final Node<E> newNode = new Node<E>(e);
    
    for (Node<E> t = tail, p = t;;) {
        Node<E> q = p.next;
        if (q == null) {
            // p 是最后一个节点
            if (p.casNext(null, newNode)) {
                // 成功插入，尝试更新 tail
                if (p != t) // 每两次更新一次 tail
                    casTail(t, newNode);
                return true;
            }
        }
        else if (p == q) // 处理并发删除
            p = (t != (t = tail)) ? t : head;
        else
            p = (p != t && t != (t = tail)) ? t : q;
    }
}
```

#### 取出操作算法
```java
public E poll() {
    restartFromHead:
    for (;;) {
        for (Node<E> h = head, p = h, q;;) {
            E item = p.item;
            
            if (item != null && p.casItem(item, null)) {
                // 成功取出元素
                if (p != h) // 每两次更新一次 head
                    updateHead(h, ((q = p.next) != null) ? q : p);
                return item;
            }
            else if ((q = p.next) == null) {
                updateHead(h, p);
                return null;
            }
            else if (p == q)
                continue restartFromHead;
            else
                p = q;
        }
    }
}
```

## 构造方法

### 基本构造方法
```java
// 创建空队列
ConcurrentLinkedQueue<String> queue1 = new ConcurrentLinkedQueue<>();

// 从现有集合创建队列
List<String> list = Arrays.asList("A", "B", "C");
ConcurrentLinkedQueue<String> queue2 = new ConcurrentLinkedQueue<>(list);
```

## 核心方法详解

### 插入操作

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        
        // 正常插入
        boolean result1 = queue.offer(1);  // true
        boolean result2 = queue.offer(2);  // true
        boolean result3 = queue.offer(3);  // true
        
        // 插入 null 会抛出异常
        try {
            queue.offer(null);  // NullPointerException
        } catch (NullPointerException e) {
            System.out.println("不能插入 null 元素");
        }
        
        System.out.println("队列大小: " + queue.size());  // 3
    }
}
```

#### add() 方法 - 异常插入
```java
public class AddExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
        
        // add() 方法内部调用 offer()
        boolean result1 = queue.add("Hello");  // true
        boolean result2 = queue.add("World");   // true
        
        // 与 offer() 行为一致
        System.out.println("队列内容: " + queue);
    }
}
```

### 取出操作

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        
        // 队列为空时返回 null
        Integer value1 = queue.poll();  // null
        
        queue.offer(10);
        queue.offer(20);
        queue.offer(30);
        
        // 正常取出
        Integer value2 = queue.poll();  // 10
        Integer value3 = queue.poll();  // 20
        Integer value4 = queue.poll();  // 30
        Integer value5 = queue.poll();  // null
        
        System.out.println("取出结果: " + value2 + ", " + value3 + ", " + value4);
    }
}
```

#### peek() 方法 - 查看但不移除
```java
public class PeekExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
        
        // 队列为空时返回 null
        String value1 = queue.peek();  // null
        
        queue.offer("First");
        queue.offer("Second");
        
        // 查看队首元素但不移除
        String value2 = queue.peek();  // "First"
        String value3 = queue.peek();  // "First"（仍然是第一个）
        
        // 实际取出
        String value4 = queue.poll();  // "First"
        String value5 = queue.peek();  // "Second"
        
        System.out.println("查看结果: " + value2 + ", 取出结果: " + value4);
    }
}
```

#### remove() 方法 - 移除指定元素
```java
public class RemoveExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);
        queue.offer(2);  // 重复元素
        
        // 移除第一个出现的指定元素
        boolean removed1 = queue.remove(2);  // true，移除第一个2
        boolean removed2 = queue.remove(5);  // false，元素不存在
        
        System.out.println("移除结果: " + removed1 + ", " + removed2);
        System.out.println("剩余队列: " + queue);  // [1, 3, 2]
    }
}
```

### 批量操作

#### addAll() 方法 - 批量添加
```java
public class AddAllExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        
        // 批量添加元素
        boolean result = queue.addAll(numbers);  // true
        
        System.out.println("批量添加结果: " + result);
        System.out.println("队列大小: " + queue.size());  // 5
        
        // 逐个取出验证
        while (!queue.isEmpty()) {
            System.out.println("取出: " + queue.poll());
        }
    }
}
```

#### contains() 和 isEmpty() 方法
```java
public class ContainsExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
        
        queue.offer("Apple");
        queue.offer("Banana");
        queue.offer("Cherry");
        
        // 检查元素是否存在
        boolean hasApple = queue.contains("Apple");     // true
        boolean hasOrange = queue.contains("Orange");   // false
        
        // 检查队列是否为空
        boolean isEmpty = queue.isEmpty();  // false
        
        System.out.println("包含Apple: " + hasApple);
        System.out.println("包含Orange: " + hasOrange);
        System.out.println("队列是否为空: " + isEmpty);
    }
}
```

### 迭代器操作

#### iterator() 方法 - 弱一致性迭代器
```java
public class IteratorExample {
    public static void main(String[] args) {
        ConcurrentLinkedQueue<Integer> queue = new ConcurrentLinkedQueue<>();
        
        // 添加一些元素
        for (int i = 1; i <= 5; i++) {
            queue.offer(i);
        }
        
        // 获取迭代器（弱一致性）
        Iterator<Integer> iterator = queue.iterator();
        
        // 在迭代过程中并发修改
        Thread modifier = new Thread(() -> {
            queue.offer(6);
            queue.poll();  // 移除第一个元素
        });
        modifier.start();
        
        try {
            modifier.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 迭代器可能不会反映所有并发修改
        System.out.println("迭代器遍历结果:");
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
        
        // 当前队列状态
        System.out.println("当前队列: " + queue);
    }
}
```

## 高并发场景示例

### 多生产者多消费者模式
```java
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class HighConcurrencyDemo {
    private static final ConcurrentLinkedQueue<Task> queue = new ConcurrentLinkedQueue<>();
    private static final AtomicInteger taskId = new AtomicInteger(0);
    private static volatile boolean running = true;
    
    public static void main(String[] args) throws InterruptedException {
        // 启动多个生产者
        Thread[] producers = new Thread[3];
        for (int i = 0; i < producers.length; i++) {
            producers[i] = new Thread(new Producer(), "Producer-" + (i + 1));
            producers[i].start();
        }
        
        // 启动多个消费者
        Thread[] consumers = new Thread[2];
        for (int i = 0; i < consumers.length; i++) {
            consumers[i] = new Thread(new Consumer(), "Consumer-" + (i + 1));
            consumers[i].start();
        }
        
        // 运行一段时间后停止
        Thread.sleep(5000);
        running = false;
        
        // 等待所有线程结束
        for (Thread producer : producers) {
            producer.interrupt();
            producer.join();
        }
        
        for (Thread consumer : consumers) {
            consumer.interrupt();
            consumer.join();
        }
        
        System.out.println("程序结束，队列剩余任务: " + queue.size());
    }
    
    static class Task {
        private final int id;
        private final String content;
        
        public Task(int id, String content) {
            this.id = id;
            this.content = content;
        }
        
        @Override
        public String toString() {
            return "Task{" + id + ": " + content + "}";
        }
    }
    
    static class Producer implements Runnable {
        @Override
        public void run() {
            while (running && !Thread.currentThread().isInterrupted()) {
                try {
                    int id = taskId.incrementAndGet();
                    Task task = new Task(id, "Task from " + Thread.currentThread().getName());
                    queue.offer(task);
                    System.out.println(Thread.currentThread().getName() + " 生产: " + task);
                    Thread.sleep(50);  // 模拟生产耗时
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    static class Consumer implements Runnable {
        @Override
        public void run() {
            while (running && !Thread.currentThread().isInterrupted()) {
                try {
                    Task task = queue.poll();
                    if (task != null) {
                        System.out.println(Thread.currentThread().getName() + " 消费: " + task);
                        // 模拟任务处理
                        Thread.sleep(80);
                    } else {
                        // 队列为空，短暂等待
                        Thread.sleep(10);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
```

## 性能特点与优化

### 性能特点
- **无锁设计**：避免锁竞争，高并发性能优秀
- **非阻塞操作**：不会导致线程阻塞或上下文切换
- **弱一致性**：size() 和 iterator() 方法具有弱一致性
- **内存开销**：每个元素需要额外的节点对象开销

### 与 ArrayBlockingQueue 对比
| 特性 | ConcurrentLinkedQueue | ArrayBlockingQueue |
|------|----------------------|-------------------|
| 锁机制 | 无锁（CAS） | 有锁（ReentrantLock） |
| 阻塞性 | 非阻塞 | 阻塞 |
| 容量 | 无界 | 有界 |
| 内存效率 | 较低（节点开销） | 较高（数组连续） |
| 适用场景 | 高并发非阻塞 | 容量限制的阻塞场景 |

### 使用建议
1. **高并发场景**：适用于生产者远多于消费者的高并发环境
2. **无阻塞需求**：当不需要阻塞等待队列操作完成时
3. **内存考虑**：注意节点对象的内存开销
4. **弱一致性**：接受 size() 和 iterator() 的弱一致性

## 常见问题与解决方案

### 问题1：内存消耗过大
**解决方案**：合理控制队列大小，定期清理
```java
// 设置最大队列大小限制
private static final int MAX_QUEUE_SIZE = 10000;

public boolean safeOffer(Task task) {
    if (queue.size() < MAX_QUEUE_SIZE) {
        return queue.offer(task);
    } else {
        // 队列过大，拒绝新任务或采取其他策略
        System.out.println("队列已满，拒绝任务: " + task);
        return false;
    }
}
```

### 问题2：弱一致性导致的数据不准确
**解决方案**：避免依赖 size() 进行重要决策
```java
// 错误做法：依赖 size() 进行重要判断
if (queue.size() > threshold) {
    // 可能不准确
}

// 正确做法：使用其他机制
if (needBackpressureControl()) {
    // 使用其他背压机制
}
```

### 问题3：迭代器遍历不完整
**解决方案**：理解弱一致性特性，必要时重新获取迭代器
```java
// 需要准确遍历时
List<Task> snapshot = new ArrayList<>();
Task task;
while ((task = queue.poll()) != null) {
    snapshot.add(task);
}
// 对 snapshot 进行安全操作
```

## 最佳实践

1. **理解弱一致性**：接受 size() 和 iterator() 的不准确性
2. **合理使用场景**：适用于高并发、非阻塞的数据传递
3. **内存管理**：注意无界队列可能的内存问题
4. **性能监控**：监控队列使用情况，避免成为瓶颈
5. **错误处理**：妥善处理可能的并发异常

## 总结

ConcurrentLinkedQueue 是 Java 并发编程中高性能的无锁队列实现，适用于需要高吞吐量、非阻塞操作的生产者-消费者场景。通过合理使用其特性，可以构建高效、可扩展的并发系统。

最后更新时间：2024-01-15