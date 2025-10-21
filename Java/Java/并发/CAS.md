# CAS（Compare-And-Swap）与无锁编程

## 定义与作用

CAS（Compare-And-Swap）是一种无锁编程技术，通过硬件指令实现原子操作。其核心思想是：比较内存中某位置的值与预期值是否一致，如果一致则写入新值，否则失败重试。

CAS 是现代并发编程的基础，广泛应用于原子类、无锁数据结构等场景，相比传统锁机制具有更高的并发性能。

## 核心原理

### CAS 操作语义

CAS 操作包含三个参数：
- 内存地址（V）
- 预期原值（A）
- 新值（B）

操作逻辑：
```java
if (V == A) {
    V = B;
    return true;
} else {
    return false;
}
```

### 硬件支持

现代 CPU 通过特殊的硬件指令实现 CAS 的原子性：
- x86 架构：`CMPXCHG` 指令
- ARM 架构：`LDREX/STREX` 指令对
- 这些指令在硬件层面保证比较和交换操作的原子性

## Java 中的 CAS 实现

### Atomic 类族

Java 通过 `java.util.concurrent.atomic` 包提供 CAS 支持：

```java
import java.util.concurrent.atomic.AtomicInteger;

public class CASExample {
    private AtomicInteger counter = new AtomicInteger(0);
    
    public void increment() {
        int oldValue, newValue;
        do {
            oldValue = counter.get();
            newValue = oldValue + 1;
        } while (!counter.compareAndSet(oldValue, newValue));
    }
    
    public int getValue() {
        return counter.get();
    }
}
```

### 常用 Atomic 类

| 类名 | 用途 | 特点 |
|------|------|------|
| AtomicInteger | 原子整型操作 | 支持加减等运算 |
| AtomicLong | 原子长整型操作 | 64位原子操作 |
| AtomicReference | 原子引用操作 | 可包装任意对象 |
| AtomicBoolean | 原子布尔操作 | 状态标志位 |

## CAS 的典型问题

### ABA 问题

#### 问题描述
ABA 问题指：值从 A 变为 B 再变回 A，虽然最终值相同，但中间过程已被修改。

```java
// 线程1：读取 A，准备修改为 C
// 线程2：修改 A → B → A
// 线程1：CAS(A, C) 成功，但中间状态已被修改
```

#### 解决方案

**AtomicStampedReference**：通过版本戳解决 ABA 问题

```java
import java.util.concurrent.atomic.AtomicStampedReference;

public class ABAExample {
    private AtomicStampedReference<Integer> atomicRef = 
        new AtomicStampedReference<>(0, 0);
    
    public boolean update(int expectedValue, int newValue, 
                         int expectedStamp, int newStamp) {
        return atomicRef.compareAndSet(expectedValue, newValue, 
                                      expectedStamp, newStamp);
    }
}
```

**AtomicMarkableReference**：通过布尔标记解决 ABA 问题

```java
import java.util.concurrent.atomic.AtomicMarkableReference;

public class MarkableExample {
    private AtomicMarkableReference<String> ref = 
        new AtomicMarkableReference<>("initial", false);
    
    public boolean update(String expected, String newValue) {
        boolean[] markHolder = new boolean[1];
        String current = ref.get(markHolder);
        return ref.compareAndSet(current, newValue, markHolder[0], !markHolder[0]);
    }
}
```

### 自旋开销问题

#### 问题描述
在高并发场景下，多个线程同时竞争 CAS 操作，导致大量重试，消耗 CPU 资源。

#### 优化策略

1. **指数退避**：重试间隔逐渐增加
2. **适应性自旋**：根据竞争情况动态调整自旋次数
3. **队列化**：将竞争线程排队，减少冲突

```java
public class AdaptiveCAS {
    private AtomicInteger counter = new AtomicInteger(0);
    private volatile int spinCount = 1;
    
    public void adaptiveIncrement() {
        int oldValue, newValue;
        int currentSpin = spinCount;
        
        do {
            oldValue = counter.get();
            newValue = oldValue + 1;
            
            // 适应性自旋
            for (int i = 0; i < currentSpin; i++) {
                Thread.onSpinWait(); // JDK9+ 优化自旋
            }
            
            // 动态调整自旋次数
            if (currentSpin < 100) {
                currentSpin++;
            }
        } while (!counter.compareAndSet(oldValue, newValue));
        
        spinCount = currentSpin;
    }
}
```

## CAS 的应用场景

### 1. 原子计数器

```java
public class AtomicCounter {
    private AtomicLong count = new AtomicLong(0);
    
    public long increment() {
        return count.incrementAndGet();
    }
    
    public long add(long delta) {
        return count.addAndGet(delta);
    }
    
    public long get() {
        return count.get();
    }
}
```

### 2. 无锁栈（Lock-Free Stack）

```java
import java.util.concurrent.atomic.AtomicReference;

public class LockFreeStack<T> {
    private static class Node<T> {
        final T value;
        Node<T> next;
        
        Node(T value) {
            this.value = value;
        }
    }
    
    private AtomicReference<Node<T>> top = new AtomicReference<>();
    
    public void push(T value) {
        Node<T> newHead = new Node<>(value);
        Node<T> oldHead;
        
        do {
            oldHead = top.get();
            newHead.next = oldHead;
        } while (!top.compareAndSet(oldHead, newHead));
    }
    
    public T pop() {
        Node<T> oldHead, newHead;
        
        do {
            oldHead = top.get();
            if (oldHead == null) {
                return null;
            }
            newHead = oldHead.next;
        } while (!top.compareAndSet(oldHead, newHead));
        
        return oldHead.value;
    }
}
```

### 3. 无锁队列（Lock-Free Queue）

```java
import java.util.concurrent.atomic.AtomicReference;

public class LockFreeQueue<T> {
    private static class Node<T> {
        final T value;
        AtomicReference<Node<T>> next;
        
        Node(T value) {
            this.value = value;
            this.next = new AtomicReference<>(null);
        }
    }
    
    private AtomicReference<Node<T>> head = new AtomicReference<>();
    private AtomicReference<Node<T>> tail = new AtomicReference<>();
    
    public LockFreeQueue() {
        Node<T> dummy = new Node<>(null);
        head.set(dummy);
        tail.set(dummy);
    }
    
    public void enqueue(T value) {
        Node<T> newNode = new Node<>(value);
        Node<T> currentTail;
        
        while (true) {
            currentTail = tail.get();
            Node<T> tailNext = currentTail.next.get();
            
            if (currentTail == tail.get()) {
                if (tailNext != null) {
                    // 帮助其他线程完成入队
                    tail.compareAndSet(currentTail, tailNext);
                } else {
                    if (currentTail.next.compareAndSet(null, newNode)) {
                        tail.compareAndSet(currentTail, newNode);
                        return;
                    }
                }
            }
        }
    }
    
    public T dequeue() {
        Node<T> currentHead, currentTail, firstNode;
        T value;
        
        while (true) {
            currentHead = head.get();
            currentTail = tail.get();
            firstNode = currentHead.next.get();
            
            if (currentHead == head.get()) {
                if (currentHead == currentTail) {
                    if (firstNode == null) {
                        return null; // 队列为空
                    }
                    // 帮助其他线程完成入队
                    tail.compareAndSet(currentTail, firstNode);
                } else {
                    value = firstNode.value;
                    if (head.compareAndSet(currentHead, firstNode)) {
                        return value;
                    }
                }
            }
        }
    }
}
```

### 4. 并发容器内部实现

Java 并发容器大量使用 CAS：
- `ConcurrentHashMap`：分段锁 + CAS
- `ConcurrentLinkedQueue`：完全基于 CAS 的无锁队列
- `CopyOnWriteArrayList`：写时复制 + CAS

## CAS 与锁的对比

### 性能对比

| 特性 | CAS | 锁 |
|------|-----|----|
| 并发度 | 高 | 中等 |
| 上下文切换 | 无 | 有 |
| 适用场景 | 轻量操作 | 重量操作 |
| 实现复杂度 | 高 | 低 |

### 选择策略

**使用 CAS 的场景：**
- 操作简单，临界区短
- 竞争不激烈
- 需要高吞吐量

**使用锁的场景：**
- 操作复杂，临界区长
- 竞争激烈
- 需要复杂的同步逻辑

## 最佳实践

### 1. 避免过度自旋

```java
// 不好的做法：无限自旋
while (!atomicInt.compareAndSet(oldValue, newValue)) {
    // 空循环，消耗 CPU
}

// 好的做法：限制自旋次数
int maxSpins = 1000;
int spins = 0;
while (!atomicInt.compareAndSet(oldValue, newValue) && spins < maxSpins) {
    spins++;
    Thread.onSpinWait();
}
if (spins >= maxSpins) {
    // 回退到锁机制
    synchronized (this) {
        // 执行操作
    }
}
```

### 2. 合理处理竞争

```java
public class ContentionAwareCAS {
    private AtomicInteger counter = new AtomicInteger(0);
    private LongAdder contentionCounter = new LongAdder();
    
    public void increment() {
        int oldValue, newValue;
        int retries = 0;
        
        do {
            oldValue = counter.get();
            newValue = oldValue + 1;
            retries++;
        } while (!counter.compareAndSet(oldValue, newValue) && retries < 10);
        
        if (retries > 1) {
            contentionCounter.increment();
        }
        
        // 根据竞争情况调整策略
        if (contentionCounter.sum() > 1000) {
            // 切换到锁或其他策略
        }
    }
}
```

### 3. 考虑内存屏障

```java
public class MemoryBarrierCAS {
    private AtomicInteger value = new AtomicInteger(0);
    private volatile boolean flag = false;
    
    public void updateWithBarrier(int newValue) {
        int oldValue;
        do {
            oldValue = value.get();
            // 确保读取到最新值
        } while (!value.compareAndSet(oldValue, newValue));
        
        // 写操作完成后设置标志
        flag = true;
    }
    
    public int readWithBarrier() {
        // 确保读取到最新值
        boolean currentFlag = flag;
        int result = value.get();
        // 再次检查标志确保一致性
        if (currentFlag != flag) {
            result = value.get(); // 重新读取
        }
        return result;
    }
}
```

## 常见问题与解决方案

### 问题1：CAS 失败率过高

**症状：** 大量线程在 CAS 操作上自旋

**解决方案：**
1. 减少竞争：使用更细粒度的原子变量
2. 回退策略：CAS 失败后使用锁
3. 队列化：将竞争线程排队

### 问题2：内存可见性问题

**症状：** CAS 操作成功但其他线程看不到最新值

**解决方案：**
1. 使用 `volatile` 修饰相关变量
2. 确保适当的 happens-before 关系
3. 使用内存屏障

### 问题3：ABA 问题导致逻辑错误

**症状：** 值看似未变但中间状态已被修改

**解决方案：**
1. 使用 `AtomicStampedReference`
2. 使用 `AtomicMarkableReference`
3. 引入版本号或时间戳

## 总结

CAS 是现代并发编程的重要技术，通过硬件指令实现无锁操作，提供高性能的并发控制。正确使用 CAS 需要：

1. 理解 ABA 问题并采取适当防护
2. 合理控制自旋开销
3. 根据竞争情况选择合适的同步策略
4. 注意内存可见性和一致性

在合适的场景下，CAS 可以显著提升系统并发性能，是现代高并发系统不可或缺的技术。

最后更新时间：2024-01-15