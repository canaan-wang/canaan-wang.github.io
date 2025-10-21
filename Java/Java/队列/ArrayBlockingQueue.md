# ArrayBlockingQueue

## 定义与作用

ArrayBlockingQueue 是 Java 并发包中基于数组实现的有界阻塞队列，遵循 FIFO（先进先出）原则。它提供了线程安全的队列操作，支持阻塞式的插入和移除操作，是生产者-消费者模式的经典实现。

**主要特性：**
- 有界队列：容量固定，创建时指定
- 阻塞操作：支持 put/take 等阻塞方法
- 线程安全：内部使用 ReentrantLock 保证线程安全
- FIFO 顺序：保证元素的先进先出顺序

## 核心原理

### 数据结构
ArrayBlockingQueue 使用循环数组作为底层存储结构：

```java
// 核心数据结构
final Object[] items;        // 存储元素的数组
int takeIndex;              // 下一个要取出的元素索引
int putIndex;               // 下一个要插入的元素索引
int count;                  // 队列中元素数量
final ReentrantLock lock;   // 主锁，用于所有访问
private final Condition notEmpty;  // 等待非空的条件
private final Condition notFull;   // 等待非满的条件
```

### 锁机制
ArrayBlockingQueue 采用单一锁机制：
- **单锁设计**：所有操作共享一个 ReentrantLock
- **两个条件变量**：notEmpty（队列非空）和 notFull（队列非满）
- **公平性选项**：构造时可选择公平锁或非公平锁

### 循环数组实现
通过循环使用数组实现队列功能：
```java
// 插入元素时索引移动
putIndex = (putIndex + 1) % items.length;

// 取出元素时索引移动  
takeIndex = (takeIndex + 1) % items.length;
```

## 构造方法

### 基本构造方法
```java
// 指定容量，使用非公平锁
ArrayBlockingQueue<Integer> queue1 = new ArrayBlockingQueue<>(100);

// 指定容量和公平性
ArrayBlockingQueue<Integer> queue2 = new ArrayBlockingQueue<>(100, true);

// 指定容量、公平性，并初始化集合
Collection<Integer> initialElements = Arrays.asList(1, 2, 3);
ArrayBlockingQueue<Integer> queue3 = new ArrayBlockingQueue<>(100, true, initialElements);
```

### 构造参数说明
| 参数 | 类型 | 说明 |
|------|------|------|
| capacity | int | 队列容量，必须大于0 |
| fair | boolean | 公平性，true 使用公平锁，false 使用非公平锁 |
| c | Collection | 初始元素集合，元素数量不能超过容量 |

## 核心方法详解

### 插入操作

#### put() 方法 - 阻塞插入
```java
public class PutExample {
    public static void main(String[] args) throws InterruptedException {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(3);
        
        // 正常插入
        queue.put(1);
        queue.put(2);
        queue.put(3);
        
        // 队列已满，阻塞等待
        new Thread(() -> {
            try {
                System.out.println("尝试插入4...");
                queue.put(4);  // 阻塞，直到有空间
                System.out.println("插入4成功");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        Thread.sleep(1000);
        
        // 消费者取出元素，释放空间
        Integer value = queue.take();
        System.out.println("取出: " + value);  // 此时插入线程会继续执行
    }
}
```

#### offer() 方法 - 非阻塞插入
```java
public class OfferExample {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        
        // 正常插入
        boolean result1 = queue.offer(1);  // true
        boolean result2 = queue.offer(2);  // true
        
        // 队列已满，立即返回false
        boolean result3 = queue.offer(3);  // false
        
        // 带超时的offer
        try {
            boolean result4 = queue.offer(4, 1, TimeUnit.SECONDS);  // 等待1秒
            System.out.println("带超时插入结果: " + result4);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

#### add() 方法 - 异常插入
```java
public class AddExample {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2);
        
        queue.add(1);  // 成功
        queue.add(2);  // 成功
        
        try {
            queue.add(3);  // 抛出 IllegalStateException: Queue full
        } catch (IllegalStateException e) {
            System.out.println("队列已满，无法添加: " + e.getMessage());
        }
    }
}
```

### 取出操作

#### take() 方法 - 阻塞取出
```java
public class TakeExample {
    public static void main(String[] args) throws InterruptedException {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(3);
        
        // 消费者线程，队列为空时阻塞
        Thread consumer = new Thread(() -> {
            try {
                System.out.println("等待获取元素...");
                Integer value = queue.take();  // 阻塞，直到有元素
                System.out.println("获取到元素: " + value);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        consumer.start();
        
        Thread.sleep(1000);
        
        // 生产者插入元素，唤醒消费者
        queue.put(100);
        System.out.println("插入元素100");
    }
}
```

#### poll() 方法 - 非阻塞取出
```java
public class PollExample {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(3);
        
        // 队列为空，立即返回null
        Integer value1 = queue.poll();  // null
        
        queue.offer(1);
        queue.offer(2);
        
        // 正常取出
        Integer value2 = queue.poll();  // 1
        Integer value3 = queue.poll();  // 2
        
        // 带超时的poll
        try {
            Integer value4 = queue.poll(1, TimeUnit.SECONDS);  // 等待1秒
            System.out.println("带超时取出结果: " + value4);  // null
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
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(3);
        
        // 队列为空时返回null
        Integer value1 = queue.peek();  // null
        
        queue.offer(1);
        queue.offer(2);
        
        // 查看队首元素但不移除
        Integer value2 = queue.peek();  // 1
        Integer value3 = queue.peek();  // 1（仍然是1）
        
        // 实际取出
        Integer value4 = queue.poll();  // 1
        Integer value5 = queue.peek();  // 2
    }
}
```

### 其他重要方法

#### remainingCapacity() - 剩余容量
```java
public class CapacityExample {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);
        
        System.out.println("初始剩余容量: " + queue.remainingCapacity());  // 5
        
        queue.offer(1);
        queue.offer(2);
        
        System.out.println("插入2个元素后剩余容量: " + queue.remainingCapacity());  // 3
        
        queue.poll();
        System.out.println("取出1个元素后剩余容量: " + queue.remainingCapacity());  // 4
    }
}
```

#### drainTo() - 批量转移
```java
public class DrainToExample {
    public static void main(String[] args) {
        ArrayBlockingQueue<Integer> source = new ArrayBlockingQueue<>(5);
        ArrayBlockingQueue<Integer> target = new ArrayBlockingQueue<>(10);
        
        // 填充源队列
        for (int i = 1; i <= 5; i++) {
            source.offer(i);
        }
        
        // 批量转移所有元素
        int transferred = source.drainTo(target);
        System.out.println("转移了 " + transferred + " 个元素");  // 5
        System.out.println("源队列大小: " + source.size());      // 0
        System.out.println("目标队列大小: " + target.size());    // 5
        
        // 转移指定数量的元素
        source.offer(6);
        source.offer(7);
        source.offer(8);
        
        int partialTransferred = source.drainTo(target, 2);  // 最多转移2个
        System.out.println("部分转移了 " + partialTransferred + " 个元素");  // 2
    }
}
```

## 生产者-消费者模式实现

### 完整示例
```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

public class ProducerConsumerDemo {
    private static final ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);
    private static final AtomicInteger counter = new AtomicInteger(0);
    private static volatile boolean running = true;
    
    public static void main(String[] args) throws InterruptedException {
        // 启动生产者
        Thread producer1 = new Thread(new Producer(), "Producer-1");
        Thread producer2 = new Thread(new Producer(), "Producer-2");
        
        // 启动消费者
        Thread consumer1 = new Thread(new Consumer(), "Consumer-1");
        Thread consumer2 = new Thread(new Consumer(), "Consumer-2");
        
        producer1.start();
        producer2.start();
        consumer1.start();
        consumer2.start();
        
        // 运行10秒后停止
        Thread.sleep(10000);
        running = false;
        
        producer1.interrupt();
        producer2.interrupt();
        consumer1.interrupt();
        consumer2.interrupt();
        
        producer1.join();
        producer2.join();
        consumer1.join();
        consumer2.join();
        
        System.out.println("程序结束，队列剩余元素: " + queue.size());
    }
    
    static class Producer implements Runnable {
        @Override
        public void run() {
            while (running && !Thread.currentThread().isInterrupted()) {
                try {
                    int value = counter.incrementAndGet();
                    queue.put(value);
                    System.out.println(Thread.currentThread().getName() + " 生产: " + value);
                    Thread.sleep(100);  // 模拟生产耗时
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
                    Integer value = queue.take();
                    System.out.println(Thread.currentThread().getName() + " 消费: " + value);
                    Thread.sleep(150);  // 模拟消费耗时
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
- **单锁设计**：所有操作共享一个锁，争用集中
- **内存效率**：数组实现，内存连续，缓存友好
- **公平性影响**：公平锁减少饥饿但降低吞吐

### 与 LinkedBlockingQueue 对比
| 特性 | ArrayBlockingQueue | LinkedBlockingQueue |
|------|-------------------|-------------------|
| 数据结构 | 数组 | 链表 |
| 锁机制 | 单锁 | 双锁（putLock/takeLock） |
| 内存使用 | 固定预分配 | 动态分配 |
| 并发性能 | 中等 | 高（读写分离） |
| 适用场景 | 内存受限，容量固定 | 高并发，容量可变 |

### 使用建议
1. **容量选择**：根据业务需求合理设置容量，避免过大或过小
2. **公平性选择**：高吞吐场景使用非公平锁，公平性要求高时使用公平锁
3. **监控队列大小**：定期监控队列使用情况，避免长时间阻塞

## 常见问题与解决方案

### 问题1：生产者过快导致消费者饥饿
**解决方案**：使用合适的队列容量，结合背压机制
```java
// 使用有界队列控制生产速度
ArrayBlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);

// 生产者检查队列状态
if (queue.remainingCapacity() < 10) {
    // 减缓生产速度或拒绝新任务
    Thread.sleep(100);
}
```

### 问题2：死锁风险
**解决方案**：避免在持有队列锁的情况下调用其他可能阻塞的方法
```java
// 错误做法：可能死锁
synchronized (lock) {
    queue.put(item);  // 可能阻塞
}

// 正确做法：先获取队列锁
queue.put(item);  // 队列内部处理锁
```

### 问题3：内存泄漏
**解决方案**：及时清理不再使用的队列引用
```java
// 使用完毕后及时清理
queue.clear();
queue = null;  // 帮助GC回收
```

## 最佳实践

1. **合理设置容量**：根据系统资源和业务需求设置合适的队列容量
2. **使用合适的阻塞方法**：根据业务场景选择 put/take 或 offer/poll
3. **异常处理**：妥善处理 InterruptedException
4. **资源清理**：程序退出时及时清理队列资源
5. **性能监控**：监控队列使用情况，及时发现性能瓶颈

## 总结

ArrayBlockingQueue 是 Java 并发编程中重要的有界阻塞队列实现，适用于需要固定容量限制的生产者-消费者场景。通过合理使用其特性，可以构建稳定、高效的并发系统。

最后更新时间：2024-01-15