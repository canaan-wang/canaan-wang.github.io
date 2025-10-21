# PriorityQueue

## 定义与作用

PriorityQueue 是 Java 集合框架中的一个非线程安全的优先级队列实现，基于二叉堆数据结构构建。它按照元素的自然顺序或指定的比较器进行排序，确保每次出队操作都能获取到优先级最高的元素。

**主要特性：**
- 基于二叉堆的优先级队列实现
- 非线程安全，适用于单线程环境
- 支持自定义比较器进行排序
- 默认最小堆（最小元素优先级最高）
- 动态扩容，无容量限制

## 核心原理

### 数据结构
PriorityQueue 使用数组实现二叉堆：

```java
// 存储元素的数组
private transient Object[] queue;

// 元素数量
private int size = 0;

// 比较器（可为null，使用自然顺序）
private final Comparator<? super E> comparator;

// 修改次数（用于迭代器快速失败）
private transient int modCount = 0;
```

### 堆结构原理
PriorityQueue 使用完全二叉堆实现：

```java
// 堆的性质：对于任意节点i
// 父节点位置：parent(i) = (i-1)/2
// 左子节点：left(i) = 2*i + 1
// 右子节点：right(i) = 2*i + 2

// 堆的两种类型：
// - 最小堆：父节点 <= 子节点
// - 最大堆：父节点 >= 子节点
```

### 堆操作算法
```java
// 上浮操作（插入时）
private void siftUp(int k, E x) {
    if (comparator != null)
        siftUpUsingComparator(k, x);
    else
        siftUpComparable(k, x);
}

// 下沉操作（删除时）
private void siftDown(int k, E x) {
    if (comparator != null)
        siftDownUsingComparator(k, x);
    else
        siftDownComparable(k, x);
}
```

## 构造方法

### 基本构造方法
```java
import java.util.PriorityQueue;
import java.util.Comparator;

public class ConstructorExamples {
    public static void main(String[] args) {
        // 1. 默认构造方法（自然顺序，最小堆）
        PriorityQueue<Integer> pq1 = new PriorityQueue<>();
        
        // 2. 指定初始容量
        PriorityQueue<Integer> pq2 = new PriorityQueue<>(100);
        
        // 3. 指定比较器（最大堆）
        PriorityQueue<Integer> pq3 = new PriorityQueue<>(
            Comparator.reverseOrder()
        );
        
        // 4. 从其他集合构造
        PriorityQueue<Integer> pq4 = new PriorityQueue<>(Arrays.asList(3, 1, 4));
        
        // 5. 指定容量和比较器
        PriorityQueue<Integer> pq5 = new PriorityQueue<>(50, Comparator.reverseOrder());
        
        System.out.println("构造方法示例完成");
    }
}
```

### 自定义比较器示例
```java
import java.util.PriorityQueue;
import java.util.Comparator;

public class CustomComparatorExample {
    
    static class Task {
        String name;
        int priority;  // 优先级，数值越小优先级越高
        long timestamp;  // 时间戳，用于稳定排序
        
        Task(String name, int priority) {
            this.name = name;
            this.priority = priority;
            this.timestamp = System.currentTimeMillis();
        }
        
        @Override
        public String toString() {
            return name + "(优先级:" + priority + ", 时间:" + timestamp + ")";
        }
    }
    
    public static void main(String[] args) {
        // 自定义比较器：先按优先级，再按时间戳
        Comparator<Task> taskComparator = Comparator
            .comparingInt((Task t) -> t.priority)  // 优先级（数值小优先）
            .thenComparingLong(t -> t.timestamp);  // 时间戳（先到先得）
        
        PriorityQueue<Task> taskQueue = new PriorityQueue<>(taskComparator);
        
        // 添加任务
        taskQueue.offer(new Task("紧急任务", 1));
        Thread.sleep(10);  // 确保时间戳不同
        taskQueue.offer(new Task("普通任务", 3));
        Thread.sleep(10);
        taskQueue.offer(new Task("高优先级任务", 1));
        Thread.sleep(10);
        taskQueue.offer(new Task("中等任务", 2));
        
        // 按优先级顺序取出
        while (!taskQueue.isEmpty()) {
            System.out.println("处理任务: " + taskQueue.poll());
        }
    }
}
```

## 核心方法详解

### 插入操作

#### offer() 方法 - 插入元素
```java
public class OfferExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        
        // 插入元素
        System.out.println("插入 10: " + pq.offer(10));  // true
        System.out.println("插入 5: " + pq.offer(5));    // true
        System.out.println("插入 15: " + pq.offer(15));  // true
        System.out.println("插入 3: " + pq.offer(3));    // true
        
        // 查看队列状态
        System.out.println("当前大小: " + pq.size());     // 4
        System.out.println("堆顶元素: " + pq.peek());     // 3（最小堆）
        
        // 继续插入
        pq.offer(8);
        pq.offer(1);
        
        System.out.println("插入后堆顶: " + pq.peek());    // 1
    }
}
```

#### add() 方法 - 插入元素（与offer相同）
```java
public class AddExample {
    public static void main(String[] args) {
        PriorityQueue<String> pq = new PriorityQueue<>();
        
        // add() 和 offer() 功能相同
        pq.add("Apple");
        pq.offer("Banana");
        pq.add("Cherry");
        
        System.out.println("队列内容:");
        while (!pq.isEmpty()) {
            System.out.println(pq.poll());  // 按字典序输出
        }
    }
}
```

### 取出操作

#### poll() 方法 - 取出并移除堆顶元素
```java
public class PollExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        
        // 添加元素
        for (int i = 10; i > 0; i--) {
            pq.offer(i);
        }
        
        System.out.println("初始队列大小: " + pq.size());  // 10
        
        // 按优先级顺序取出
        System.out.println("\n按优先级取出:");
        while (!pq.isEmpty()) {
            Integer min = pq.poll();
            System.out.println("取出: " + min + ", 剩余大小: " + pq.size());
        }
    }
}
```

#### remove() 方法 - 移除指定元素
```java
public class RemoveExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        
        // 添加元素
        pq.addAll(Arrays.asList(5, 3, 8, 1, 9, 2));
        
        System.out.println("初始队列: " + Arrays.toString(pq.toArray()));
        
        // 移除指定元素
        boolean removed = pq.remove(3);
        System.out.println("移除元素3: " + removed);  // true
        System.out.println("移除后队列: " + Arrays.toString(pq.toArray()));
        
        // 移除不存在的元素
        boolean notFound = pq.remove(100);
        System.out.println("移除不存在的元素100: " + notFound);  // false
        
        // 移除堆顶元素（与poll相同）
        Integer top = pq.remove();
        System.out.println("移除堆顶: " + top);  // 1
    }
}
```

### 查看操作

#### peek() 方法 - 查看堆顶元素
```java
public class PeekExample {
    public static void main(String[] args) {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        
        // 添加元素到最大堆
        maxHeap.addAll(Arrays.asList(5, 12, 3, 8, 20, 1));
        
        // 多次peek返回相同结果
        System.out.println("第一次peek: " + maxHeap.peek());  // 20
        System.out.println("第二次peek: " + maxHeap.peek());  // 20（未移除）
        System.out.println("第三次peek: " + maxHeap.peek());  // 20
        
        // 取出堆顶后再次peek
        maxHeap.poll();
        System.out.println("取出后peek: " + maxHeap.peek());  // 12
    }
}
```

#### element() 方法 - 查看堆顶元素（空队列时抛出异常）
```java
public class ElementExample {
    public static void main(String[] args) {
        PriorityQueue<String> pq = new PriorityQueue<>();
        
        // 空队列时element()会抛出异常
        try {
            pq.element();  // 抛出 NoSuchElementException
        } catch (Exception e) {
            System.out.println("空队列element()异常: " + e.getClass().getSimpleName());
        }
        
        // 添加元素后使用
        pq.add("Test");
        System.out.println("非空队列element(): " + pq.element());  // Test
        
        // 与peek()对比（空队列时返回null）
        pq.clear();
        System.out.println("空队列peek(): " + pq.peek());  // null
    }
}
```

### 批量操作

#### 批量添加元素
```java
public class BulkOperations {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        
        // 使用addAll批量添加
        List<Integer> numbers = Arrays.asList(15, 3, 8, 20, 1, 12, 6);
        pq.addAll(numbers);
        
        System.out.println("批量添加后大小: " + pq.size());  // 7
        System.out.println("堆顶元素: " + pq.peek());        // 1
        
        // 验证堆性质
        System.out.println("\n按优先级顺序取出:");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + " ");  // 1 3 6 8 12 15 20
        }
    }
}
```

#### 清空队列
```java
public class ClearExample {
    public static void main(String[] args) {
        PriorityQueue<String> pq = new PriorityQueue<>();
        
        // 添加元素
        pq.addAll(Arrays.asList("Z", "A", "M", "B", "C"));
        
        System.out.println("清空前大小: " + pq.size());  // 5
        System.out.println("清空前堆顶: " + pq.peek());  // A
        
        // 清空队列
        pq.clear();
        
        System.out.println("清空后大小: " + pq.size());  // 0
        System.out.println("清空后是否为空: " + pq.isEmpty());  // true
    }
}
```

## 实际应用场景

### 任务调度系统
```java
import java.util.PriorityQueue;
import java.util.Comparator;

public class TaskScheduler {
    static class ScheduledTask {
        String name;
        long scheduledTime;  // 计划执行时间
        int priority;       // 优先级
        
        ScheduledTask(String name, long scheduledTime, int priority) {
            this.name = name;
            this.scheduledTime = scheduledTime;
            this.priority = priority;
        }
        
        @Override
        public String toString() {
            return name + "(时间:" + scheduledTime + ", 优先级:" + priority + ")";
        }
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 比较器：先按优先级，再按计划时间
        Comparator<ScheduledTask> comparator = Comparator
            .comparingInt((ScheduledTask t) -> t.priority)
            .thenComparingLong(t -> t.scheduledTime);
        
        PriorityQueue<ScheduledTask> taskQueue = new PriorityQueue<>(comparator);
        
        long currentTime = System.currentTimeMillis();
        
        // 添加定时任务
        taskQueue.offer(new ScheduledTask("数据备份", currentTime + 5000, 2));
        taskQueue.offer(new ScheduledTask("系统监控", currentTime + 1000, 1));
        taskQueue.offer(new ScheduledTask("日志清理", currentTime + 3000, 3));
        taskQueue.offer(new ScheduledTask("紧急告警", currentTime + 200, 1));
        
        // 模拟任务执行
        System.out.println("开始执行任务调度:");
        while (!taskQueue.isEmpty()) {
            ScheduledTask task = taskQueue.poll();
            long waitTime = task.scheduledTime - System.currentTimeMillis();
            
            if (waitTime > 0) {
                System.out.println("等待 " + waitTime + "ms 后执行: " + task.name);
                Thread.sleep(waitTime);
            }
            
            System.out.println("执行任务: " + task.name);
        }
    }
}
```

### 数据流的中位数查找
```java
import java.util.PriorityQueue;

public class MedianFinder {
    // 最大堆存储较小的一半元素
    private PriorityQueue<Integer> maxHeap;
    // 最小堆存储较大的一半元素
    private PriorityQueue<Integer> minHeap;
    
    public MedianFinder() {
        maxHeap = new PriorityQueue<>((a, b) -> b - a);  // 最大堆
        minHeap = new PriorityQueue<>();                  // 最小堆
    }
    
    public void addNum(int num) {
        if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
            maxHeap.offer(num);
        } else {
            minHeap.offer(num);
        }
        
        // 平衡两个堆的大小
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.offer(maxHeap.poll());
        } else if (minHeap.size() > maxHeap.size()) {
            maxHeap.offer(minHeap.poll());
        }
    }
    
    public double findMedian() {
        if (maxHeap.size() == minHeap.size()) {
            return (maxHeap.peek() + minHeap.peek()) / 2.0;
        } else {
            return maxHeap.peek();
        }
    }
    
    public static void main(String[] args) {
        MedianFinder finder = new MedianFinder();
        int[] numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        System.out.println("数据流中位数查找:");
        for (int num : numbers) {
            finder.addNum(num);
            System.out.println("添加 " + num + " 后中位数: " + finder.findMedian());
        }
    }
}
```

### 合并K个有序链表
```java
import java.util.PriorityQueue;

public class MergeKSortedLists {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }
    
    public static ListNode mergeKLists(ListNode[] lists) {
        if (lists == null || lists.length == 0) return null;
        
        // 使用最小堆存储每个链表的当前节点
        PriorityQueue<ListNode> minHeap = new PriorityQueue<>(
            (a, b) -> a.val - b.val
        );
        
        // 将每个链表的头节点加入堆中
        for (ListNode node : lists) {
            if (node != null) {
                minHeap.offer(node);
            }
        }
        
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        
        while (!minHeap.isEmpty()) {
            ListNode minNode = minHeap.poll();
            current.next = minNode;
            current = current.next;
            
            // 将当前节点的下一个节点加入堆中
            if (minNode.next != null) {
                minHeap.offer(minNode.next);
            }
        }
        
        return dummy.next;
    }
    
    public static void printList(ListNode head) {
        while (head != null) {
            System.out.print(head.val + " -> ");
            head = head.next;
        }
        System.out.println("null");
    }
    
    public static void main(String[] args) {
        // 创建测试链表
        ListNode list1 = new ListNode(1);
        list1.next = new ListNode(4);
        list1.next.next = new ListNode(5);
        
        ListNode list2 = new ListNode(1);
        list2.next = new ListNode(3);
        list2.next.next = new ListNode(4);
        
        ListNode list3 = new ListNode(2);
        list3.next = new ListNode(6);
        
        ListNode[] lists = {list1, list2, list3};
        
        System.out.println("合并前链表:");
        for (int i = 0; i < lists.length; i++) {
            System.out.print("链表" + (i+1) + ": ");
            printList(lists[i]);
        }
        
        ListNode merged = mergeKLists(lists);
        
        System.out.println("\n合并后链表:");
        printList(merged);
    }
}
```

## 性能特点与优化

### 时间复杂度分析
| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| offer() / add() | O(log n) | 插入元素并调整堆 |
| poll() / remove() | O(log n) | 移除堆顶元素并调整堆 |
| peek() / element() | O(1) | 查看堆顶元素 |
| remove(Object) | O(n) | 需要线性搜索元素 |
| contains(Object) | O(n) | 需要线性搜索元素 |

### 空间复杂度
- 平均空间复杂度：O(n)
- 最坏情况：O(n)（需要扩容时）

### 性能优化建议

#### 预分配容量
```java
public class CapacityOptimization {
    public static void main(String[] args) {
        // 预估元素数量，避免频繁扩容
        int expectedSize = 10000;
        PriorityQueue<Integer> optimizedQueue = new PriorityQueue<>(expectedSize);
        
        // 批量添加时使用正确的容量
        List<Integer> largeDataset = generateLargeDataset(10000);
        PriorityQueue<Integer> batchQueue = new PriorityQueue<>(largeDataset);
        
        System.out.println("优化后的队列大小: " + optimizedQueue.size());
        System.out.println("批量构造的队列大小: " + batchQueue.size());
    }
    
    private static List<Integer> generateLargeDataset(int size) {
        List<Integer> dataset = new ArrayList<>(size);
        Random random = new Random();
        for (int i = 0; i < size; i++) {
            dataset.add(random.nextInt(100000));
        }
        return dataset;
    }
}
```

#### 避免频繁的remove操作
```java
public class RemoveOptimization {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        
        // 添加大量元素
        for (int i = 0; i < 1000; i++) {
            pq.offer(i);
        }
        
        // 不推荐：频繁remove特定元素（O(n)操作）
        long startTime = System.nanoTime();
        for (int i = 0; i < 100; i++) {
            pq.remove(i);  // 每次都是O(n)操作
        }
        long endTime = System.nanoTime();
        System.out.println("频繁remove耗时: " + (endTime - startTime) + "ns");
        
        // 推荐：使用poll按顺序取出
        pq.clear();
        for (int i = 0; i < 1000; i++) {
            pq.offer(i);
        }
        
        startTime = System.nanoTime();
        for (int i = 0; i < 100; i++) {
            pq.poll();  // O(log n)操作
        }
        endTime = System.nanoTime();
        System.out.println("顺序poll耗时: " + (endTime - startTime) + "ns");
    }
}
```

## 常见问题与解决方案

### 问题1：非线程安全
**解决方案**：使用外部同步或线程安全版本
```java
import java.util.PriorityQueue;
import java.util.Collections;
import java.util.concurrent.PriorityBlockingQueue;

public class ThreadSafetySolutions {
    
    // 方案1：使用Collections.synchronizedCollection
    public static PriorityQueue<Integer> createSynchronizedQueue() {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        return (PriorityQueue<Integer>) Collections.synchronizedCollection(pq);
    }
    
    // 方案2：使用显式锁
    public static class LockProtectedQueue {
        private final PriorityQueue<Integer> queue = new PriorityQueue<>();
        private final Object lock = new Object();
        
        public void offer(int value) {
            synchronized (lock) {
                queue.offer(value);
            }
        }
        
        public Integer poll() {
            synchronized (lock) {
                return queue.poll();
            }
        }
    }
    
    // 方案3：使用PriorityBlockingQueue（线程安全版本）
    public static void useThreadSafeVersion() {
        PriorityBlockingQueue<Integer> safeQueue = new PriorityBlockingQueue<>();
        
        // 多线程安全操作
        Thread producer = new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                safeQueue.offer(i);
            }
        });
        
        Thread consumer = new Thread(() -> {
            while (!safeQueue.isEmpty()) {
                Integer value = safeQueue.poll();
                if (value != null) {
                    System.out.println("消费: " + value);
                }
            }
        });
        
        producer.start();
        consumer.start();
    }
    
    public static void main(String[] args) throws InterruptedException {
        System.out.println("线程安全解决方案示例");
        useThreadSafeVersion();
        Thread.sleep(1000);
    }
}
```

### 问题2：相同优先级顺序不稳定
**解决方案**：在比较器中加入稳定排序因素
```java
import java.util.PriorityQueue;
import java.util.Comparator;

public class StablePrioritySolution {
    
    static class StableTask {
        String name;
        int priority;
        long sequenceNumber;  // 序列号用于稳定排序
        
        StableTask(String name, int priority, long sequenceNumber) {
            this.name = name;
            this.priority = priority;
            this.sequenceNumber = sequenceNumber;
        }
    }
    
    public static void main(String[] args) {
        // 稳定比较器：先按优先级，再按序列号
        Comparator<StableTask> stableComparator = Comparator
            .comparingInt((StableTask t) -> t.priority)
            .thenComparingLong(t -> t.sequenceNumber);
        
        PriorityQueue<StableTask> stableQueue = new PriorityQueue<>(stableComparator);
        
        long sequence = 0;
        
        // 添加相同优先级的任务
        stableQueue.offer(new StableTask("任务A", 1, sequence++));
        stableQueue.offer(new StableTask("任务B", 1, sequence++));
        stableQueue.offer(new StableTask("任务C", 1, sequence++));
        stableQueue.offer(new StableTask("任务D", 2, sequence++));
        stableQueue.offer(new StableTask("任务E", 1, sequence++));
        
        System.out.println("稳定优先级顺序:");
        while (!stableQueue.isEmpty()) {
            StableTask task = stableQueue.poll();
            System.out.println(task.name + " (优先级:" + task.priority + 
                ", 序列号:" + task.sequenceNumber + ")");
        }
    }
}
```

### 问题3：迭代器遍历顺序不确定
**解决方案**：不要依赖迭代器顺序，使用poll按优先级遍历
```java
import java.util.PriorityQueue;
import java.util.Iterator;

public class IteratorSolution {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.addAll(Arrays.asList(5, 1, 8, 3, 10, 2));
        
        System.out.println("错误的遍历方式（迭代器）:");
        Iterator<Integer> iterator = pq.iterator();
        while (iterator.hasNext()) {
            System.out.print(iterator.next() + " ");  // 顺序不确定
        }
        
        System.out.println("\n\n正确的遍历方式（poll）:");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + " ");  // 按优先级顺序
        }
    }
}
```

## 最佳实践

1. **选择合适的比较器**：
   - 最小堆：使用自然顺序或默认比较器
   - 最大堆：使用`Comparator.reverseOrder()`
   - 自定义排序：实现稳定的比较逻辑

2. **容量管理**：
   - 预估元素数量，预分配足够容量
   - 避免频繁扩容带来的性能开销

3. **线程安全**：
   - 单线程环境直接使用PriorityQueue
   - 多线程环境使用外部同步或PriorityBlockingQueue

4. **遍历方式**：
   - 使用poll()按优先级顺序遍历
   - 不要依赖迭代器的顺序

5. **性能优化**：
   - 避免频繁的remove(Object)操作
   - 批量操作时使用合适的构造方法
   - 考虑使用更高效的数据结构（如斐波那契堆）

## 总结

PriorityQueue 是 Java 集合框架中一个高效的非线程安全优先级队列实现，基于二叉堆数据结构。它在任务调度、数据流处理、算法优化等场景中有着广泛的应用。

**主要优势：**
- 插入和删除操作的时间复杂度为 O(log n)
- 支持自定义比较器实现复杂排序逻辑
- 内存效率高，基于数组实现

**使用注意事项：**
- 非线程安全，多线程环境需要额外同步
- 迭代器遍历顺序不确定，应使用poll()按优先级遍历
- 相同优先级元素的顺序不稳定，需要额外处理

在实际应用中，PriorityQueue 通常与其他数据结构配合使用，如在中位数查找、Dijkstra算法、Huffman编码等经典算法中发挥重要作用。

最后更新时间：2024-01-15