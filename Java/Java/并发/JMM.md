# Java 内存模型（JMM）详解

## 定义与作用

### 什么是 Java 内存模型
Java 内存模型（Java Memory Model, JMM）是 Java 虚拟机规范中定义的一种抽象概念，用于屏蔽各种硬件和操作系统的内存访问差异，实现 Java 程序在各种平台下都能达到一致的内存访问效果。

### JMM 的主要作用
1. **定义内存访问规则**：规范线程如何与主内存和工作内存交互
2. **保证可见性**：确保一个线程对共享变量的修改对其他线程可见
3. **保证有序性**：防止指令重排序导致程序行为异常
4. **保证原子性**：对基本数据类型的读写操作具有原子性

## JMM 的核心概念

### 1. 主内存与工作内存
JMM 规定了所有变量都存储在主内存中，每个线程有自己的工作内存：

- **主内存**：所有线程共享的内存区域，存储所有实例字段、静态字段和数组元素
- **工作内存**：每个线程私有的内存区域，存储该线程使用到的变量的主内存副本

```java
public class JMMExample {
    private int sharedValue = 0; // 存储在主内存
    
    public void increment() {
        // 线程从主内存读取sharedValue到工作内存
        int localCopy = sharedValue;
        
        // 在工作内存中修改
        localCopy++;
        
        // 将修改后的值写回主内存
        sharedValue = localCopy;
    }
}
```

### 2. 内存间交互操作
JMM 定义了8种原子操作来完成主内存与工作内存之间的交互：

| 操作 | 作用 |
|------|------|
| lock（锁定） | 作用于主内存变量，标识为线程独占 |
| unlock（解锁） | 作用于主内存变量，释放锁定状态 |
| read（读取） | 从主内存传输变量值到工作内存 |
| load（载入） | 将read得到的值放入工作内存变量副本 |
| use（使用） | 将工作内存变量值传递给执行引擎 |
| assign（赋值） | 将执行引擎接收的值赋给工作内存变量 |
| store（存储） | 将工作内存变量值传输到主内存 |
| write（写入） | 将store得到的值放入主内存变量 |

## happens-before 规则

happens-before 是 JMM 的核心概念，用于描述操作之间的内存可见性关系。

### 1. 程序次序规则（Program Order Rule）
在一个线程内，按照程序代码顺序，书写在前面的操作 happens-before 书写在后面的操作。

```java
public class ProgramOrderExample {
    int x = 0;
    boolean flag = false;
    
    public void writer() {
        x = 42;          // 1
        flag = true;     // 2
    }
    
    public void reader() {
        if (flag) {      // 3
            System.out.println(x); // 4
        }
    }
}
```

**规则**：操作1 happens-before 操作2

### 2. 监视器锁规则（Monitor Lock Rule）
对一个锁的解锁操作 happens-before 于后续对这个锁的加锁操作。

```java
public class MonitorLockExample {
    private final Object lock = new Object();
    private int value = 0;
    
    public void writer() {
        synchronized (lock) {
            value = 42;  // 解锁 happens-before 后续加锁
        }
    }
    
    public void reader() {
        synchronized (lock) {
            System.out.println(value); // 能看到writer的修改
        }
    }
}
```

### 3. volatile 变量规则（Volatile Variable Rule）
对一个 volatile 变量的写操作 happens-before 于后续对这个变量的读操作。

```java
public class VolatileExample {
    private volatile boolean flag = false;
    private int data = 0;
    
    public void writer() {
        data = 42;      // 普通写
        flag = true;    // volatile写 happens-before 后续volatile读
    }
    
    public void reader() {
        if (flag) {     // volatile读
            System.out.println(data); // 能看到data=42
        }
    }
}
```

### 4. 线程启动规则（Thread Start Rule）
Thread 对象的 start() 方法调用 happens-before 于该线程的每一个动作。

```java
public class ThreadStartExample {
    private int value = 0;
    
    public void test() {
        value = 42;
        
        Thread thread = new Thread(() -> {
            System.out.println(value); // 能看到value=42
        });
        
        thread.start(); // start() happens-before run()
    }
}
```

### 5. 线程终止规则（Thread Termination Rule）
线程中的所有操作都 happens-before 于其他线程检测到该线程已经终止。

```java
public class ThreadTerminationExample {
    private int result = 0;
    
    public void test() throws InterruptedException {
        Thread thread = new Thread(() -> {
            result = 42; // 线程内的操作
        });
        
        thread.start();
        thread.join();   // join()返回 happens-before 后续操作
        
        System.out.println(result); // 能看到result=42
    }
}
```

### 6. 线程中断规则（Thread Interruption Rule）
对线程 interrupt() 方法的调用 happens-before 于被中断线程检测到中断事件。

```java
public class ThreadInterruptionExample {
    public void test() {
        Thread thread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                // 正常工作
            }
            // 检测到中断 happens-before 后续操作
        });
        
        thread.start();
        thread.interrupt(); // interrupt() happens-before isInterrupted()
    }
}
```

### 7. 对象终结规则（Finalizer Rule）
一个对象的初始化完成（构造函数执行结束） happens-before 于它的 finalize() 方法的开始。

### 8. 传递性规则（Transitivity Rule）
如果 A happens-before B，且 B happens-before C，那么 A happens-before C。

## 内存可见性问题

### 1. 可见性问题示例
```java
public class VisibilityProblem {
    private boolean ready = false;
    private int number = 0;
    
    public void writer() {
        number = 42;    // 可能被重排序到ready=true之后
        ready = true;  // 对其他线程可见
    }
    
    public void reader() {
        while (!ready) {
            // 空循环等待
        }
        System.out.println(number); // 可能输出0而不是42
    }
}
```

### 2. 解决方案
使用 volatile 关键字保证可见性：
```java
public class VisibilitySolution {
    private volatile boolean ready = false;
    private int number = 0;
    
    public void writer() {
        number = 42;
        ready = true;  // volatile写，保证之前的所有操作对其他线程可见
    }
    
    public void reader() {
        while (!ready) {
            // 空循环等待
        }
        System.out.println(number); // 保证输出42
    }
}
```

## 指令重排序问题

### 1. 重排序示例
```java
public class ReorderingExample {
    int a = 0;
    int b = 0;
    
    public void method1() {
        a = 1;  // 操作1
        b = 2;  // 操作2
    }
    
    public void method2() {
        if (b == 2) {
            System.out.println(a); // 可能输出0，即使b=2
        }
    }
}
```

### 2. 防止重排序
使用内存屏障（Memory Barrier）防止指令重排序：

```java
public class MemoryBarrierExample {
    private int a = 0;
    private volatile int b = 0; // volatile变量作为内存屏障
    
    public void method1() {
        a = 1;          // 普通写
        b = 2;          // volatile写，创建内存屏障
    }
    
    public void method2() {
        if (b == 2) {   // volatile读，创建内存屏障
            System.out.println(a); // 保证看到a=1
        }
    }
}
```

## JMM 与并发工具

### 1. synchronized 的内存语义
```java
public class SynchronizedMemory {
    private int value = 0;
    
    public synchronized void setValue(int newValue) {
        value = newValue; // 解锁时保证修改对其他线程可见
    }
    
    public synchronized int getValue() {
        return value; // 加锁时从主内存读取最新值
    }
}
```

### 2. final 字段的内存语义
```java
public class FinalFieldExample {
    private final int finalValue;
    private int normalValue;
    
    public FinalFieldExample() {
        normalValue = 1;   // 普通字段赋值
        finalValue = 42;   // final字段赋值（有特殊内存语义）
    }
    
    public void reader() {
        // 保证看到finalValue=42，但normalValue可能看到默认值0
        System.out.println("Final: " + finalValue);
        System.out.println("Normal: " + normalValue);
    }
}
```

## 安全发布模式

### 1. 静态初始化
```java
public class StaticInitialization {
    // 静态字段由JVM保证安全发布
    public static final Singleton INSTANCE = new Singleton();
}
```

### 2. volatile 字段
```java
public class VolatilePublication {
    private volatile Singleton instance;
    
    public Singleton getInstance() {
        if (instance == null) {
            synchronized (this) {
                if (instance == null) {
                    instance = new Singleton(); // 安全发布
                }
            }
        }
        return instance;
    }
}
```

### 3. final 字段
```java
public class FinalFieldPublication {
    private final Singleton instance;
    
    public FinalFieldPublication() {
        this.instance = new Singleton(); // 安全发布
    }
    
    public Singleton getInstance() {
        return instance;
    }
}
```

## 双重检查锁定（DCL）模式

### 1. 错误的 DCL
```java
public class BrokenDCL {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (BrokenDCL.class) {      // 加锁
                if (instance == null) {            // 第二次检查
                    instance = new Singleton();    // 问题：可能发生重排序
                }
            }
        }
        return instance;
    }
}
```

### 2. 正确的 DCL（使用 volatile）
```java
public class CorrectDCL {
    private volatile static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {                    // 第一次检查
            synchronized (CorrectDCL.class) {      // 加锁
                if (instance == null) {            // 第二次检查
                    instance = new Singleton();    // volatile写防止重排序
                }
            }
        }
        return instance;
    }
}
```

## 最佳实践

### 1. 可见性保证
```java
// 使用volatile保证标志位的可见性
public class VisibilityBestPractice {
    private volatile boolean shutdownRequested = false;
    
    public void shutdown() {
        shutdownRequested = true; // 对其他线程立即可见
    }
    
    public void doWork() {
        while (!shutdownRequested) {
            // 执行工作
        }
    }
}
```

### 2. 有序性保证
```java
// 使用锁保证操作的有序性
public class OrderingBestPractice {
    private final Object lock = new Object();
    private boolean initialized = false;
    private Data data;
    
    public void initialize() {
        synchronized (lock) {
            if (!initialized) {
                data = loadData(); // 初始化操作
                initialized = true; // 设置标志
            }
        }
    }
    
    public Data getData() {
        synchronized (lock) {
            return data;
        }
    }
}
```

### 3. 原子性保证
```java
// 使用原子类保证复合操作的原子性
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicityBestPractice {
    private AtomicInteger counter = new AtomicInteger(0);
    
    public void increment() {
        counter.incrementAndGet(); // 原子操作
    }
    
    public int getValue() {
        return counter.get();
    }
}
```

## 常见问题与解决方案

### 1. 内存可见性问题
**症状**：一个线程的修改对其他线程不可见。

**解决方案**：
- 使用 volatile 关键字
- 使用 synchronized 同步块
- 使用 Lock 接口的实现类

### 2. 指令重排序问题
**症状**：程序行为与代码顺序不一致。

**解决方案**：
- 使用内存屏障（volatile、synchronized）
- 使用 happens-before 规则
- 避免依赖指令执行顺序

### 3. 安全发布问题
**症状**：对象发布后，其他线程看到不一致的状态。

**解决方案**：
- 使用 final 字段
- 使用静态初始化
- 使用 volatile 字段
- 使用锁保护发布过程

## 总结

Java 内存模型是理解 Java 并发编程的基础，它通过 happens-before 规则和内存屏障机制保证了多线程环境下的内存可见性、有序性和原子性。在实际开发中，应该根据具体需求选择合适的同步策略，遵循最佳实践，避免常见的并发问题。

最后更新时间：2024-01-15