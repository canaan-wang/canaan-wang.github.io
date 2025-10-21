# Java synchronized 关键字详解

## 定义与作用

### 什么是 synchronized
synchronized 是 Java 中的内置锁机制，用于实现线程同步，确保多个线程对共享资源的互斥访问。它是 Java 中最基本的同步工具，也是实现线程安全的重要手段。

### synchronized 的主要作用
1. **互斥访问**：确保同一时刻只有一个线程可以执行同步代码块
2. **内存可见性**：保证一个线程对共享变量的修改对其他线程可见
3. **有序性**：防止指令重排序，确保代码执行顺序

## synchronized 的使用方式

### 1. 同步实例方法
锁对象是当前实例（this）。

```java
public class SynchronizedExample {
    private int count = 0;
    
    // 同步实例方法
    public synchronized void increment() {
        count++;
        System.out.println("Count: " + count + " by " + Thread.currentThread().getName());
    }
    
    // 测试方法
    public static void main(String[] args) {
        SynchronizedExample example = new SynchronizedExample();
        
        // 创建多个线程访问同一个实例
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                example.increment();
            }
        }, "Thread-1");
        
        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                example.increment();
            }
        }, "Thread-2");
        
        thread1.start();
        thread2.start();
    }
}
```

**特点**：
- 锁对象是当前实例
- 不同实例之间的同步方法互不影响
- 适合保护实例级别的共享数据

### 2. 同步静态方法
锁对象是当前类的 Class 对象。

```java
public class StaticSynchronizedExample {
    private static int staticCount = 0;
    
    // 同步静态方法
    public static synchronized void staticIncrement() {
        staticCount++;
        System.out.println("Static Count: " + staticCount + " by " + Thread.currentThread().getName());
    }
    
    // 测试方法
    public static void main(String[] args) {
        // 创建多个线程访问静态方法
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                StaticSynchronizedExample.staticIncrement();
            }
        }, "Thread-1");
        
        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                StaticSynchronizedExample.staticIncrement();
            }
        }, "Thread-2");
        
        thread1.start();
        thread2.start();
    }
}
```

**特点**：
- 锁对象是类的 Class 对象
- 所有实例共享同一个锁
- 适合保护类级别的静态共享数据

### 3. 同步代码块
锁对象可以是任意对象。

```java
public class BlockSynchronizedExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    private int count1 = 0;
    private int count2 = 0;
    
    // 使用不同锁对象的同步代码块
    public void increment1() {
        synchronized (lock1) {
            count1++;
            System.out.println("Count1: " + count1 + " by " + Thread.currentThread().getName());
        }
    }
    
    public void increment2() {
        synchronized (lock2) {
            count2++;
            System.out.println("Count2: " + count2 + " by " + Thread.currentThread().getName());
        }
    }
    
    // 测试方法
    public static void main(String[] args) {
        BlockSynchronizedExample example = new BlockSynchronizedExample();
        
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                example.increment1();
                example.increment2();
            }
        }, "Thread-1");
        
        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                example.increment1();
                example.increment2();
            }
        }, "Thread-2");
        
        thread1.start();
        thread2.start();
    }
}
```

**特点**：
- 锁对象可以灵活指定
- 可以实现更细粒度的锁控制
- 减少锁竞争，提高并发性能

## synchronized 的特性

### 1. 可重入性（Reentrant）
同一个线程可以多次获取同一个锁。

```java
public class ReentrantExample {
    public synchronized void method1() {
        System.out.println("Method1 called by " + Thread.currentThread().getName());
        method2(); // 可以再次获取同一个锁
    }
    
    public synchronized void method2() {
        System.out.println("Method2 called by " + Thread.currentThread().getName());
    }
    
    public static void main(String[] args) {
        ReentrantExample example = new ReentrantExample();
        
        Thread thread = new Thread(() -> {
            example.method1();
        }, "Test-Thread");
        
        thread.start();
    }
}
```

**优势**：
- 避免死锁
- 支持递归调用
- 提高代码灵活性

### 2. 内存可见性（Memory Visibility）
synchronized 保证一个线程释放锁之前对共享变量的修改对其他线程可见。

```java
public class VisibilityExample {
    private boolean flag = false;
    private int value = 0;
    
    public synchronized void writer() {
        flag = true;
        value = 42;
        // 释放锁时，对flag和value的修改对其他线程可见
    }
    
    public synchronized void reader() {
        if (flag) {
            System.out.println("Value: " + value); // 总是能看到42
        }
    }
}
```

### 3. 有序性（Ordering）
synchronized 确保同步代码块内的指令不会被重排序到同步块之外。

## synchronized 的实现原理

### 1. 对象头与 Monitor
每个 Java 对象都有一个对象头，其中包含锁信息：
- **Mark Word**：存储对象的哈希码、分代年龄、锁状态等信息
- **Klass Pointer**：指向对象所属的类元数据

### 2. 锁升级过程
synchronized 的锁状态会随着竞争情况升级：

```
无锁状态 → 偏向锁 → 轻量级锁 → 重量级锁
```

**偏向锁**：
- 适用于只有一个线程访问同步块的场景
- 通过 CAS 操作在对象头中记录线程ID
- 减少不必要的同步开销

**轻量级锁**：
- 适用于多个线程交替访问同步块的场景
- 通过 CAS 操作和自旋等待实现
- 避免线程阻塞和唤醒的开销

**重量级锁**：
- 适用于多个线程竞争激烈的场景
- 使用操作系统的互斥量（Mutex）实现
- 线程会进入阻塞状态

### 3. 字节码层面
synchronized 在字节码层面通过 monitorenter 和 monitorexit 指令实现：

```java
// 源代码
public void synchronizedMethod() {
    synchronized (this) {
        // 同步代码
    }
}

// 对应的字节码
public synchronizedMethod()V
  ALOAD 0
  DUP
  ASTORE 1
  MONITORENTER      ; 获取锁
  ...              ; 同步代码
  ALOAD 1
  MONITOREXIT       ; 释放锁
  GOTO L1
  ...
```

## synchronized 的性能考虑

### 1. 锁竞争的影响
- **低竞争**：性能开销小
- **高竞争**：线程频繁阻塞和唤醒，性能下降明显

### 2. 优化策略

#### 减小锁粒度
```java
// 不推荐：锁粒度太大
public class CoarseLockExample {
    private final Object lock = new Object();
    private Map<String, String> cache1 = new HashMap<>();
    private Map<String, String> cache2 = new HashMap<>();
    
    public void put1(String key, String value) {
        synchronized (lock) {
            cache1.put(key, value);
        }
    }
    
    public void put2(String key, String value) {
        synchronized (lock) {
            cache2.put(key, value);
        }
    }
}

// 推荐：锁粒度更细
public class FineGrainedLockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();
    private Map<String, String> cache1 = new HashMap<>();
    private Map<String, String> cache2 = new HashMap<>();
    
    public void put1(String key, String value) {
        synchronized (lock1) {
            cache1.put(key, value);
        }
    }
    
    public void put2(String key, String value) {
        synchronized (lock2) {
            cache2.put(key, value);
        }
    }
}
```

#### 避免锁嵌套
```java
// 不推荐：容易导致死锁
public class NestedLockExample {
    private final Object lockA = new Object();
    private final Object lockB = new Object();
    
    public void method1() {
        synchronized (lockA) {
            synchronized (lockB) {
                // 业务逻辑
            }
        }
    }
    
    public void method2() {
        synchronized (lockB) {
            synchronized (lockA) {
                // 业务逻辑
            }
        }
    }
}

// 推荐：按固定顺序获取锁
public class OrderedLockExample {
    private final Object lockA = new Object();
    private final Object lockB = new Object();
    
    public void method1() {
        synchronized (lockA) {
            synchronized (lockB) {
                // 业务逻辑
            }
        }
    }
    
    public void method2() {
        synchronized (lockA) {
            synchronized (lockB) {
                // 业务逻辑
            }
        }
    }
}
```

## synchronized 与其它同步机制对比

### synchronized vs Lock 接口

| 特性 | synchronized | Lock 接口 |
|------|-------------|----------|
| 实现方式 | JVM 内置 | Java API |
| 锁获取 | 自动获取和释放 | 手动控制 |
| 可中断 | 不支持 | 支持 |
| 超时机制 | 不支持 | 支持 |
| 公平性 | 非公平 | 可配置公平/非公平 |
| 条件变量 | 有限的 wait/notify | 丰富的 Condition |

### synchronized vs volatile

| 特性 | synchronized | volatile |
|------|-------------|----------|
| 互斥性 | 支持 | 不支持 |
| 可见性 | 支持 | 支持 |
| 原子性 | 支持（代码块） | 支持（单个变量） |
| 性能 | 相对较低 | 较高 |
| 使用场景 | 复杂同步逻辑 | 简单标志位 |

## 最佳实践

### 1. 锁对象选择
```java
// 推荐：使用私有final对象作为锁
public class BestPracticeExample {
    private final Object lock = new Object();
    
    public void safeMethod() {
        synchronized (lock) {
            // 业务逻辑
        }
    }
}

// 不推荐：使用公共对象或字符串字面量作为锁
public class BadPracticeExample {
    // 可能被其他代码意外使用
    public static final String LOCK = "LOCK";
    
    public void unsafeMethod() {
        synchronized (LOCK) {  // 可能与其他代码冲突
            // 业务逻辑
        }
    }
}
```

### 2. 避免在锁中执行耗时操作
```java
// 不推荐：在锁中执行IO操作
public void processData() {
    synchronized (this) {
        // 读取大文件（耗时操作）
        String data = readLargeFile();
        // 处理数据
        process(data);
    }
}

// 推荐：尽量减少锁内操作
public void processDataOptimized() {
    String data = readLargeFile(); // 在锁外执行IO
    
    synchronized (this) {
        // 只同步必要的处理逻辑
        process(data);
    }
}
```

### 3. 使用双重检查锁定（Double-Checked Locking）
```java
public class Singleton {
    private volatile static Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (Singleton.class) {      // 加锁
                if (instance == null) {            // 第二次检查
                    instance = new Singleton();    // 创建实例
                }
            }
        }
        return instance;
    }
}
```

**注意**：必须使用 volatile 关键字防止指令重排序。

## 常见问题与解决方案

### 1. 死锁问题
**问题**：多个线程相互等待对方释放锁。

**解决方案**：
- 按固定顺序获取锁
- 使用 tryLock() 超时机制
- 使用死锁检测工具

### 2. 性能瓶颈
**问题**：锁竞争导致性能下降。

**解决方案**：
- 减小锁粒度
- 使用读写锁（ReadWriteLock）
- 考虑使用无锁数据结构

### 3. 内存泄漏
**问题**：锁对象被不当持有导致无法回收。

**解决方案**：
- 避免在锁中持有大对象引用
- 及时释放锁资源

## 总结

synchronized 是 Java 并发编程的基础工具，理解其原理和使用方式对于编写线程安全的程序至关重要。在实际开发中，应该根据具体场景选择合适的同步策略，遵循最佳实践，注意性能优化和避免常见陷阱。

最后更新时间：2024-01-15