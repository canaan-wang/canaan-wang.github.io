# 原子类（java.util.concurrent.atomic）

## 定义与作用

Java 原子类（java.util.concurrent.atomic）提供了一组基于 CAS（Compare-And-Swap）算法的线程安全操作类，用于实现无锁并发更新。原子类通过硬件级别的原子指令来保证单个变量的线程安全，避免了传统锁机制的性能开销。

## 核心原理

### CAS 算法原理

CAS（Compare-And-Swap）是一种无锁算法，包含三个操作数：
- 内存位置（V）
- 预期原值（A）
- 新值（B）

CAS 操作逻辑：
```java
public class CASAlgorithm {
    public boolean compareAndSwap(int[] memory, int offset, int expected, int newValue) {
        if (memory[offset] == expected) {
            memory[offset] = newValue;
            return true;
        }
        return false;
    }
}
```

### 硬件支持

现代 CPU 通过提供原子指令来支持 CAS 操作：
- **x86/x64**: `CMPXCHG` 指令
- **ARM**: `LDREX` 和 `STREX` 指令对
- **PowerPC**: `lwarx` 和 `stwcx` 指令对

## 基本原子类

### AtomicInteger

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicIntegerExample {
    private final AtomicInteger counter = new AtomicInteger(0);
    
    // 基本操作
    public void demonstrateOperations() {
        // 设置值
        counter.set(100);
        
        // 获取值
        int current = counter.get();
        
        // 递增操作
        int afterIncrement = counter.incrementAndGet(); // 先增后取
        int beforeIncrement = counter.getAndIncrement(); // 先取后增
        
        // 递减操作
        int afterDecrement = counter.decrementAndGet(); // 先减后取
        int beforeDecrement = counter.getAndDecrement(); // 先取后减
        
        // 加法操作
        int afterAdd = counter.addAndGet(10); // 先加后取
        int beforeAdd = counter.getAndAdd(10); // 先取后加
        
        // 比较并交换
        boolean updated = counter.compareAndSet(120, 150);
        
        // 更新函数
        int updatedValue = counter.updateAndGet(x -> x * 2 + 1);
        int oldValue = counter.getAndUpdate(x -> x / 2);
        
        // 累积操作
        int accumulated = counter.accumulateAndGet(5, (x, y) -> x + y * 2);
    }
    
    // 实用示例：线程安全计数器
    public class ThreadSafeCounter {
        private final AtomicInteger count = new AtomicInteger();
        
        public void increment() {
            count.incrementAndGet();
        }
        
        public void decrement() {
            count.decrementAndGet();
        }
        
        public int getValue() {
            return count.get();
        }
        
        public boolean compareAndSet(int expected, int update) {
            return count.compareAndSet(expected, update);
        }
        
        public int addAndGet(int delta) {
            return count.addAndGet(delta);
        }
    }
}
```

### AtomicLong

```java
import java.util.concurrent.atomic.AtomicLong;

public class AtomicLongExample {
    private final AtomicLong sequenceGenerator = new AtomicLong(0);
    
    public void demonstrateOperations() {
        // 生成唯一序列号
        long sequenceId = sequenceGenerator.incrementAndGet();
        
        // 批量生成序列号
        long batchStart = sequenceGenerator.getAndAdd(100);
        
        // 高性能计数器
        class HighPerformanceCounter {
            private final AtomicLong[] counters;
            private static final int STRIPES = 8;
            
            public HighPerformanceCounter() {
                counters = new AtomicLong[STRIPES];
                for (int i = 0; i < STRIPES; i++) {
                    counters[i] = new AtomicLong();
                }
            }
            
            public void increment() {
                int stripe = Thread.currentThread().hashCode() % STRIPES;
                counters[stripe].incrementAndGet();
            }
            
            public long getTotal() {
                long total = 0;
                for (AtomicLong counter : counters) {
                    total += counter.get();
                }
                return total;
            }
        }
    }
    
    // ID 生成器
    public class IdGenerator {
        private final AtomicLong idCounter = new AtomicLong(System.currentTimeMillis());
        
        public long nextId() {
            return idCounter.incrementAndGet();
        }
        
        public long nextBatch(int size) {
            return idCounter.getAndAdd(size);
        }
    }
}
```

### AtomicBoolean

```java
import java.util.concurrent.atomic.AtomicBoolean;

public class AtomicBooleanExample {
    private final AtomicBoolean initialized = new AtomicBoolean(false);
    private final AtomicBoolean shutdownRequested = new AtomicBoolean(false);
    
    // 初始化控制
    public void initialize() {
        if (initialized.compareAndSet(false, true)) {
            // 执行初始化逻辑
            performInitialization();
        }
    }
    
    // 优雅关闭
    public void shutdown() {
        if (shutdownRequested.compareAndSet(false, true)) {
            // 执行关闭逻辑
            performShutdown();
        }
    }
    
    // 状态机示例
    public class StateMachine {
        private final AtomicBoolean running = new AtomicBoolean(false);
        
        public void start() {
            if (running.compareAndSet(false, true)) {
                // 启动逻辑
                System.out.println("Service started");
            }
        }
        
        public void stop() {
            if (running.compareAndSet(true, false)) {
                // 停止逻辑
                System.out.println("Service stopped");
            }
        }
        
        public boolean isRunning() {
            return running.get();
        }
    }
    
    private void performInitialization() {
        // 初始化实现
    }
    
    private void performShutdown() {
        // 关闭实现
    }
}
```

### AtomicReference

```java
import java.util.concurrent.atomic.AtomicReference;

public class AtomicReferenceExample {
    // 缓存示例
    public class Cache<T> {
        private final AtomicReference<T> cache = new AtomicReference<>();
        
        public T get() {
            return cache.get();
        }
        
        public void set(T value) {
            cache.set(value);
        }
        
        public boolean compareAndSet(T expected, T update) {
            return cache.compareAndSet(expected, update);
        }
        
        public T getAndSet(T newValue) {
            return cache.getAndSet(newValue);
        }
    }
    
    // 不可变对象更新
    public class ImmutableConfig {
        private final String name;
        private final int version;
        
        public ImmutableConfig(String name, int version) {
            this.name = name;
            this.version = version;
        }
        
        // getter 方法
        public String getName() { return name; }
        public int getVersion() { return version; }
    }
    
    public class ConfigManager {
        private final AtomicReference<ImmutableConfig> config = 
            new AtomicReference<>(new ImmutableConfig("default", 1));
        
        public void updateConfig(String name, int version) {
            ImmutableConfig oldConfig = config.get();
            ImmutableConfig newConfig = new ImmutableConfig(name, version);
            
            while (!config.compareAndSet(oldConfig, newConfig)) {
                oldConfig = config.get();
                newConfig = new ImmutableConfig(name, version);
            }
        }
        
        public ImmutableConfig getConfig() {
            return config.get();
        }
    }
    
    // 栈实现
    public class ConcurrentStack<T> {
        private static class Node<T> {
            final T value;
            final Node<T> next;
            
            Node(T value, Node<T> next) {
                this.value = value;
                this.next = next;
            }
        }
        
        private final AtomicReference<Node<T>> top = new AtomicReference<>();
        
        public void push(T value) {
            Node<T> newHead = new Node<>(value, top.get());
            while (!top.compareAndSet(newHead.next, newHead)) {
                newHead = new Node<>(value, top.get());
            }
        }
        
        public T pop() {
            Node<T> oldHead = top.get();
            while (oldHead != null && !top.compareAndSet(oldHead, oldHead.next)) {
                oldHead = top.get();
            }
            return oldHead != null ? oldHead.value : null;
        }
        
        public boolean isEmpty() {
            return top.get() == null;
        }
    }
}
```

## 字段更新器

### AtomicIntegerFieldUpdater

```java
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

public class FieldUpdaterExample {
    // 目标类
    public class Counter {
        private volatile int count; // 必须 volatile
        
        public Counter(int initial) {
            this.count = initial;
        }
        
        // getter 必须存在
        public int getCount() {
            return count;
        }
    }
    
    // 创建字段更新器
    private static final AtomicIntegerFieldUpdater<Counter> COUNT_UPDATER =
        AtomicIntegerFieldUpdater.newUpdater(Counter.class, "count");
    
    public void demonstrateUsage() {
        Counter counter = new Counter(0);
        
        // 原子操作
        COUNT_UPDATER.incrementAndGet(counter);
        COUNT_UPDATER.addAndGet(counter, 10);
        COUNT_UPDATER.compareAndSet(counter, 10, 20);
        
        System.out.println("Final count: " + counter.getCount());
    }
    
    // 性能敏感场景
    public class PerformanceSensitiveClass {
        private volatile int hotField;
        
        private static final AtomicIntegerFieldUpdater<PerformanceSensitiveClass> UPDATER =
            AtomicIntegerFieldUpdater.newUpdater(PerformanceSensitiveClass.class, "hotField");
        
        public void updateHotField() {
            UPDATER.incrementAndGet(this);
        }
        
        public int getHotField() {
            return hotField;
        }
    }
}
```

### AtomicReferenceFieldUpdater

```java
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;

public class ReferenceFieldUpdaterExample {
    public class Node {
        private volatile Node next; // 必须 volatile
        private final String data;
        
        public Node(String data) {
            this.data = data;
        }
        
        public Node getNext() {
            return next;
        }
        
        public String getData() {
            return data;
        }
    }
    
    private static final AtomicReferenceFieldUpdater<Node, Node> NEXT_UPDATER =
        AtomicReferenceFieldUpdater.newUpdater(Node.class, Node.class, "next");
    
    public void demonstrateUsage() {
        Node first = new Node("first");
        Node second = new Node("second");
        
        // 原子更新
        NEXT_UPDATER.compareAndSet(first, null, second);
        
        // 链表操作
        Node current = first;
        while (current != null) {
            System.out.println(current.getData());
            current = current.getNext();
        }
    }
}
```

## 原子数组

### AtomicIntegerArray

```java
import java.util.concurrent.atomic.AtomicIntegerArray;

public class AtomicArrayExample {
    // 直方图统计
    public class Histogram {
        private final AtomicIntegerArray counts;
        private final int numBins;
        
        public Histogram(int numBins) {
            this.numBins = numBins;
            this.counts = new AtomicIntegerArray(numBins);
        }
        
        public void increment(int bin) {
            if (bin >= 0 && bin < numBins) {
                counts.incrementAndGet(bin);
            }
        }
        
        public int getCount(int bin) {
            return counts.get(bin);
        }
        
        public int[] getSnapshot() {
            int[] snapshot = new int[numBins];
            for (int i = 0; i < numBins; i++) {
                snapshot[i] = counts.get(i);
            }
            return snapshot;
        }
    }
    
    // 环形缓冲区
    public class RingBuffer<T> {
        private final T[] buffer;
        private final AtomicIntegerArray indices;
        private final int capacity;
        
        @SuppressWarnings("unchecked")
        public RingBuffer(int capacity) {
            this.capacity = capacity;
            this.buffer = (T[]) new Object[capacity];
            this.indices = new AtomicIntegerArray(2); // [readIndex, writeIndex]
        }
        
        public boolean offer(T item) {
            int writeIndex = indices.get(1);
            int nextWriteIndex = (writeIndex + 1) % capacity;
            
            if (nextWriteIndex == indices.get(0)) {
                return false; // 缓冲区满
            }
            
            buffer[writeIndex] = item;
            indices.set(1, nextWriteIndex);
            return true;
        }
        
        public T poll() {
            int readIndex = indices.get(0);
            if (readIndex == indices.get(1)) {
                return null; // 缓冲区空
            }
            
            T item = buffer[readIndex];
            buffer[readIndex] = null; // 帮助 GC
            indices.set(0, (readIndex + 1) % capacity);
            return item;
        }
    }
}
```

### AtomicReferenceArray

```java
import java.util.concurrent.atomic.AtomicReferenceArray;

public class AtomicReferenceArrayExample {
    // 线程安全哈希表
    public class ConcurrentHashTable<K, V> {
        private static class Entry<K, V> {
            final K key;
            volatile V value;
            
            Entry(K key, V value) {
                this.key = key;
                this.value = value;
            }
        }
        
        private final AtomicReferenceArray<Entry<K, V>> table;
        private final int capacity;
        
        @SuppressWarnings("unchecked")
        public ConcurrentHashTable(int capacity) {
            this.capacity = capacity;
            this.table = new AtomicReferenceArray<>(capacity);
        }
        
        public V put(K key, V value) {
            int hash = key.hashCode() % capacity;
            Entry<K, V> newEntry = new Entry<>(key, value);
            
            while (true) {
                Entry<K, V> oldEntry = table.get(hash);
                if (oldEntry == null) {
                    if (table.compareAndSet(hash, null, newEntry)) {
                        return null;
                    }
                } else if (oldEntry.key.equals(key)) {
                    V oldValue = oldEntry.value;
                    if (table.compareAndSet(hash, oldEntry, newEntry)) {
                        return oldValue;
                    }
                } else {
                    // 处理哈希冲突
                    hash = (hash + 1) % capacity;
                }
            }
        }
        
        public V get(K key) {
            int hash = key.hashCode() % capacity;
            Entry<K, V> entry = table.get(hash);
            return (entry != null && entry.key.equals(key)) ? entry.value : null;
        }
    }
}
```

## 累加器类（Java 8+）

### LongAdder 和 DoubleAdder

```java
import java.util.concurrent.atomic.LongAdder;
import java.util.concurrent.atomic.DoubleAdder;

public class AdderExample {
    // 高性能计数器
    public class HighPerformanceCounter {
        private final LongAdder counter = new LongAdder();
        
        public void increment() {
            counter.increment();
        }
        
        public void add(long value) {
            counter.add(value);
        }
        
        public long sum() {
            return counter.sum();
        }
        
        public void reset() {
            counter.reset();
        }
        
        public long sumThenReset() {
            return counter.sumThenReset();
        }
    }
    
    // 统计信息收集
    public class StatisticsCollector {
        private final LongAdder requestCount = new LongAdder();
        private final LongAdder totalLatency = new LongAdder();
        private final LongAdder errorCount = new LongAdder();
        
        public void recordRequest(long latency, boolean success) {
            requestCount.increment();
            totalLatency.add(latency);
            if (!success) {
                errorCount.increment();
            }
        }
        
        public Statistics getStatistics() {
            long count = requestCount.sum();
            long total = totalLatency.sum();
            long errors = errorCount.sum();
            
            return new Statistics(count, total, errors);
        }
        
        public static class Statistics {
            public final long requestCount;
            public final long totalLatency;
            public final long errorCount;
            public final double averageLatency;
            public final double errorRate;
            
            public Statistics(long requestCount, long totalLatency, long errorCount) {
                this.requestCount = requestCount;
                this.totalLatency = totalLatency;
                this.errorCount = errorCount;
                this.averageLatency = requestCount > 0 ? (double) totalLatency / requestCount : 0;
                this.errorRate = requestCount > 0 ? (double) errorCount / requestCount : 0;
            }
        }
    }
}
```

### LongAccumulator 和 DoubleAccumulator

```java
import java.util.concurrent.atomic.LongAccumulator;
import java.util.concurrent.atomic.DoubleAccumulator;

public class AccumulatorExample {
    // 最大值跟踪
    public class MaxValueTracker {
        private final LongAccumulator maxValue = new LongAccumulator(Math::max, Long.MIN_VALUE);
        
        public void update(long value) {
            maxValue.accumulate(value);
        }
        
        public long getMax() {
            return maxValue.get();
        }
        
        public void reset() {
            maxValue.reset();
        }
    }
    
    // 自定义聚合
    public class CustomAggregator {
        private final LongAccumulator aggregator = new LongAccumulator((x, y) -> x * y + y, 1);
        
        public void accumulate(long value) {
            aggregator.accumulate(value);
        }
        
        public long getResult() {
            return aggregator.get();
        }
    }
    
    // 滑动窗口统计
    public class SlidingWindowStatistics {
        private final LongAccumulator[] windows;
        private final int windowSize;
        private int currentWindow = 0;
        
        public SlidingWindowStatistics(int numWindows, int windowSize) {
            this.windowSize = windowSize;
            this.windows = new LongAccumulator[numWindows];
            for (int i = 0; i < numWindows; i++) {
                windows[i] = new LongAccumulator(Long::sum, 0);
            }
        }
        
        public void recordValue(long value) {
            windows[currentWindow].accumulate(value);
        }
        
        public void advanceWindow() {
            currentWindow = (currentWindow + 1) % windows.length;
            windows[currentWindow].reset();
        }
        
        public long getWindowSum(int windowIndex) {
            return windows[windowIndex].get();
        }
        
        public long getTotalSum() {
            long total = 0;
            for (LongAccumulator window : windows) {
                total += window.get();
            }
            return total;
        }
    }
}
```

## 性能考虑

### 原子类 vs 同步

| 场景 | 原子类 | synchronized |
|------|--------|--------------|
| 单变量更新 | 高性能 | 中等性能 |
| 复合操作 | 不适用 | 适用 |
| 竞争激烈 | 可能自旋 | 阻塞等待 |
| 内存开销 | 较小 | 较大 |

### 性能优化建议

1. **选择合适的原子类**：
   - 单变量更新：使用基本原子类
   - 高并发计数：使用 LongAdder
   - 复杂操作：考虑使用锁

2. **避免过度使用**：
   - 只在真正需要原子性时使用
   - 避免在循环中频繁 CAS

3. **考虑缓存行填充**：
   ```java
   @sun.misc.Contended
   public class PaddedAtomicLong extends AtomicLong {
       // 减少伪共享
   }
   ```

## 最佳实践

### 1. 正确使用模式

```java
public class AtomicBestPractices {
    // 正确的初始化
    private final AtomicInteger counter = new AtomicInteger(0);
    
    // 正确的更新模式
    public void safeIncrement() {
        int oldValue, newValue;
        do {
            oldValue = counter.get();
            newValue = oldValue + 1;
        } while (!counter.compareAndSet(oldValue, newValue));
    }
    
    // 使用内置方法
    public void betterIncrement() {
        counter.incrementAndGet(); // 更简洁高效
    }
}
```

### 2. 错误处理

```java
public class AtomicErrorHandling {
    private final AtomicInteger retryCount = new AtomicInteger(0);
    
    public void performOperationWithRetry() {
        int attempts = 0;
        int maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                // 执行可能失败的操作
                doOperation();
                break; // 成功则退出
            } catch (OperationException e) {
                attempts = retryCount.incrementAndGet();
                if (attempts >= maxAttempts) {
                    throw new RuntimeException("Operation failed after " + attempts + " attempts", e);
                }
                // 等待后重试
                waitBeforeRetry(attempts);
            }
        }
    }
    
    private void doOperation() throws OperationException {
        // 操作实现
    }
    
    private void waitBeforeRetry(int attempt) {
        try {
            Thread.sleep(attempt * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

### 3. 测试策略

```java
import org.junit.Test;
import java.util.concurrent.*;
import static org.junit.Assert.*;

public class AtomicTest {
    @Test
    public void testAtomicIntegerConcurrency() throws InterruptedException {
        AtomicInteger counter = new AtomicInteger(0);
        int numThreads = 10;
        int incrementsPerThread = 1000;
        
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        
        // 创建任务
        Runnable incrementTask = () -> {
            for (int i = 0; i < incrementsPerThread; i++) {
                counter.incrementAndGet();
            }
        };
        
        // 提交任务
        for (int i = 0; i < numThreads; i++) {
            executor.submit(incrementTask);
        }
        
        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.MINUTES);
        
        // 验证结果
        assertEquals(numThreads * incrementsPerThread, counter.get());
    }
    
    @Test
    public void testCompareAndSet() {
        AtomicInteger atomicInt = new AtomicInteger(10);
        
        // 成功案例
        assertTrue(atomicInt.compareAndSet(10, 20));
        assertEquals(20, atomicInt.get());
        
        // 失败案例
        assertFalse(atomicInt.compareAndSet(10, 30));
        assertEquals(20, atomicInt.get());
    }
}
```

## 常见问题与解决方案

### 问题1：ABA 问题

**症状：** 值从 A 变为 B 又变回 A，CAS 无法检测到中间变化

**解决方案：**

```java
import java.util.concurrent.atomic.AtomicStampedReference;

public class ABASolution {
    private final AtomicStampedReference<String> reference = 
        new AtomicStampedReference<>("initial", 0);
    
    public void updateWithStamp(String expected, String newValue) {
        int[] stampHolder = new int[1];
        String current = reference.get(stampHolder);
        
        if (current.equals(expected)) {
            reference.compareAndSet(current, newValue, stampHolder[0], stampHolder[0] + 1);
        }
    }
}
```

### 问题2：复合操作

**症状：** 需要原子更新多个变量

**解决方案：**

```java
public class CompoundOperation {
    private final AtomicReference<CompoundState> state = 
        new AtomicReference<>(new CompoundState(0, 0));
    
    public void updateBoth(int a, int b) {
        CompoundState current, next;
        do {
            current = state.get();
            next = new CompoundState(a, b);
        } while (!state.compareAndSet(current, next));
    }
    
    private static class CompoundState {
        final int valueA;
        final int valueB;
        
        CompoundState(int a, int b) {
            this.valueA = a;
            this.valueB = b;
        }
    }
}
```

### 问题3：性能瓶颈

**症状：** 高竞争下 CAS 频繁失败

**解决方案：**

```java
public class PerformanceOptimization {
    // 使用 LongAdder 替代 AtomicLong 用于计数
    private final LongAdder counter = new LongAdder();
    
    // 使用线程本地缓存减少竞争
    private final ThreadLocal<Long> localCounter = ThreadLocal.withInitial(() -> 0L);
    private final LongAdder globalCounter = new LongAdder();
    
    public void increment() {
        long local = localCounter.get() + 1;
        localCounter.set(local);
        
        // 定期同步到全局计数器
        if (local % 100 == 0) {
            globalCounter.add(local);
            localCounter.set(0L);
        }
    }
    
    public long getCount() {
        return globalCounter.sum() + localCounter.get();
    }
}
```

## 总结

Java 原子类提供了高效的无锁并发编程工具：

1. **基本原子类**：AtomicInteger、AtomicLong、AtomicBoolean、AtomicReference
2. **字段更新器**：用于现有类的字段原子更新
3. **原子数组**：提供数组元素的原子操作
4. **累加器类**：LongAdder、DoubleAdder 用于高性能计数
5. **自定义累加器**：LongAccumulator、DoubleAccumulator 支持自定义函数

使用原子类时需要注意：
- 选择合适的原子类类型
- 避免 ABA 问题（使用 AtomicStampedReference）
- 对于复合操作考虑使用锁或其他同步机制
- 在高竞争场景下使用累加器类优化性能

掌握原子类的原理和最佳实践，对于开发高性能并发应用至关重要。

最后更新时间：2024-01-15