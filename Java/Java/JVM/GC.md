# Java 垃圾回收（GC）机制

## 定义与作用
垃圾回收（Garbage Collection，GC）是Java虚拟机（JVM）自动管理内存的机制，负责自动回收不再使用的对象所占用的内存空间。GC机制避免了手动内存管理的复杂性，减少了内存泄漏和野指针等问题，是Java语言的重要特性之一。

## 垃圾回收算法

### 分代收集理论（Generational Collection）
基于"弱分代假说"：绝大多数对象都是朝生夕死的。
- **新生代（Young Generation）**：存放新创建的对象，回收频繁
- **老年代（Old Generation）**：存放长期存活的对象，回收较少
- **永久代/元空间（PermGen/Metaspace）**：存放类元数据（JDK 8+使用元空间）

### 标记-复制算法（Mark-Copy）
主要用于新生代的垃圾回收。

#### 算法原理
- 内存划分为同等大小的两块（Eden、Survivor0、Survivor1）
- 新对象在Eden区创建
- 垃圾回收时，将Eden和Survivor0中的存活对象复制到Survivor1
- 清空Eden和Survivor0，交换Survivor0和Survivor1的角色

```java
// 新生代对象创建和回收示例
public class YoungGenerationExample {
    public static void main(String[] args) {
        // 新对象在Eden区创建
        List<String> tempList = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            tempList.add("temp" + i);
        }
        
        // 方法结束后，tempList不再被引用，将在下次GC时被回收
        // 如果对象存活时间足够长，会被晋升到老年代
    }
}
```

#### 优缺点
**优点：**
- 实现简单，效率高
- 没有内存碎片问题

**缺点：**
- 空间浪费高（可用内存缩小了一半）
- 在存活对象多时，会产生大量的复制开销

### 标记-清除算法（Mark-Sweep）
主要用于老年代的垃圾回收。

#### 算法原理
1. **标记阶段**：标记所有需要回收的对象
2. **清除阶段**：回收被标记的对象所占用的空间

#### 优缺点
**优点：**
- 实现相对简单

**缺点：**
- 产生内存碎片
- 效率不稳定（取决于存活对象数量）

### 标记-整理算法（Mark-Compact）
主要用于老年代的垃圾回收。

#### 算法原理
1. **标记阶段**：标记所有需要回收的对象
2. **整理阶段**：所有存活对象向内存空间的一端移动
3. **清理阶段**：清理掉边界以外的区域

#### 优缺点
**优点：**
- 解决了内存碎片问题
- 内存利用率高

**缺点：**
- 老年代存活对象较多，移动存活对象并更新所有引用操作较重
- 此操作还需要暂停用户程序（Stop-The-World）

## 垃圾回收器

### Serial 收集器
- **特点**：单线程，新生代使用标记-复制，老年代使用标记-整理
- **适用场景**：客户端应用，内存较小的服务器
- **JVM参数**：`-XX:+UseSerialGC`

### Parallel Scavenge 收集器（吞吐量优先）
- **特点**：多线程，关注吞吐量（用户代码运行时间/总运行时间）
- **适用场景**：后台运算，不需要太多交互的任务
- **JVM参数**：`-XX:+UseParallelGC`

### ParNew 收集器
- **特点**：Serial收集器的多线程版本，与CMS配合使用
- **适用场景**：服务端应用
- **JVM参数**：`-XX:+UseParNewGC`

### CMS（Concurrent Mark Sweep）收集器
以最短回收停顿时间为目标的收集器。

#### 回收过程
1. **初始标记（Initial Mark）**：有STW，仅标记一下GC Roots能直接关联的对象，速度很快
2. **并发标记（Concurrent Mark）**：从GC Roots的直接关联对象开始遍历整个对象图，耗时较长，不需要停顿用户线程
3. **重新标记（Remark）**：有STW，为了修正并发标记期间用户程序导致标记产生变动的对象的标记记录，停顿时间比初始标记时间长，比并发标记时间短
4. **并发清除（Concurrent Sweep）**：清除被标记为死亡的对象

#### 优缺点
**优点：**
- 并发收集，低停顿
- 适合对响应时间要求高的应用

**缺点：**
- 对CPU资源敏感
- 无法处理浮动垃圾
- 会产生内存碎片

### G1（Garbage-First）收集器
面向服务端应用的垃圾收集器，JDK 9+的默认收集器。

#### 核心特性
- **Mixed GC模式**：面向堆内存中的任何部分，选择垃圾数量最多，回收收益最大的内存进行回收
- **Region分区**：Java堆被划分为多个大小相等的独立区域（Region）
- **优先级回收**：根据各Region里的垃圾堆积价值维护优先级列表

#### Region类型
- **Eden Region**：新生代Eden区
- **Survivor Region**：新生代Survivor区
- **Old Region**：老年代
- **Humongous Region**：存储大对象（超过Region一半的对象）

#### 回收过程
1. **初始标记（Initial Mark）**：有STW
2. **并发标记（Concurrent Mark）**：与用户线程并发执行
3. **最终标记（Final Mark）**：有STW
4. **筛选回收（Live Data Counting and Evacuation）**：根据GC停顿预测模型选择收益最大的Region进行回收

```java
// G1收集器配置示例
public class G1GCExample {
    public static void main(String[] args) {
        // 设置G1相关参数
        // -XX:+UseG1GC -Xmx4g -XX:MaxGCPauseMillis=200
        
        // 创建大量对象测试G1回收
        List<byte[]> list = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            list.add(new byte[1024 * 1024]); // 1MB对象
            if (i % 100 == 0) {
                System.gc(); // 建议GC，实际由JVM决定
            }
        }
    }
}
```

### ZGC（Z Garbage Collector）
JDK 11引入的低延迟垃圾收集器。

#### 特点
- 停顿时间不超过10ms
- 支持TB级堆内存
- 并发处理所有阶段

#### JVM参数
`-XX:+UseZGC -Xmx<size>`

### Shenandoah GC
低停顿时间的垃圾收集器。

#### 特点
- 与ZGC类似，但实现方式不同
- 停顿时间与堆大小无关

#### JVM参数
`-XX:+UseShenandoahGC`

## GC Roots 与对象可达性

### GC Roots 类型
- **虚拟机栈中引用的对象**：当前正在执行的方法中的局部变量
- **方法区中的静态变量**：类的静态字段引用的对象
- **方法区中常量**：字符串常量池等
- **本地方法栈中引用的对象**：JNI引用的对象
- **JVM内部的引用**：基本数据类型对应的Class对象，常驻的异常对象，系统类加载器
- **所有被同步锁持有的对象**：synchronized持有的对象
- **反映Java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等**

### 对象可达性级别
1. **强引用（Strong Reference）**：普通对象引用，不会被GC回收
2. **软引用（Soft Reference）**：内存不足时会被回收
3. **弱引用（Weak Reference）**：下次GC时会被回收
4. **虚引用（Phantom Reference）**：用于对象回收跟踪

```java
import java.lang.ref.*;

public class ReferenceExample {
    public static void main(String[] args) {
        // 强引用
        Object strongRef = new Object();
        
        // 软引用
        SoftReference<Object> softRef = new SoftReference<>(new Object());
        
        // 弱引用
        WeakReference<Object> weakRef = new WeakReference<>(new Object());
        
        // 虚引用
        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        PhantomReference<Object> phantomRef = new PhantomReference<>(new Object(), queue);
        
        System.gc(); // 建议GC
        
        // 弱引用和虚引用对象可能已被回收
        System.out.println("弱引用: " + (weakRef.get() != null));
    }
}
```

## finalize() 方法

### 作用
在垃圾收集器将对象从内存中清除出去之前做必要的清理工作。这个方法是由垃圾收集器在销毁对象时调用的。

### 使用注意事项
- 对象的类对其重写后，可在对象被回收前执行一次（下次回收不执行）
- 执行时如果将其变为可达对象则不会被回收，如果没有还是会被回收
- **不推荐使用**：finalize()方法执行时间不确定，可能影响GC效率

```java
public class FinalizeExample {
    private static FinalizeExample instance;
    
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("finalize()方法被调用");
        instance = this; // "复活"对象，但只生效一次
    }
    
    public static void main(String[] args) throws InterruptedException {
        instance = new FinalizeExample();
        instance = null; // 失去引用
        
        System.gc(); // 建议GC
        Thread.sleep(1000); // 等待finalize执行
        
        System.out.println("对象是否复活: " + (instance != null));
    }
}
```

## GC 性能调优

### 常用JVM参数
```bash
# 通用参数
-Xms512m -Xmx2g           # 堆内存设置
-XX:+PrintGC              # 打印GC日志
-XX:+PrintGCDetails       # 打印详细GC信息

# 新生代参数
-XX:NewRatio=2           # 新生代与老年代比例
-XX:SurvivorRatio=8       # Eden与Survivor比例

# 收集器选择
-XX:+UseG1GC             # 使用G1收集器
-XX:MaxGCPauseMillis=200 # 最大GC停顿时间
-XX:G1HeapRegionSize=16m # G1 Region大小

# CMS参数
-XX:+UseConcMarkSweepGC  # 使用CMS收集器
-XX:CMSInitiatingOccupancyFraction=75 # CMS触发百分比
```

### 监控工具
1. **jstat**：监控GC统计信息
   ```bash
   jstat -gc <pid> 1000 10  # 每1秒监控一次，共10次
   ```

2. **jmap**：生成堆转储
   ```bash
   jmap -heap <pid>         # 查看堆信息
   jmap -dump:format=b,file=heap.bin <pid>  # 生成堆转储文件
   ```

3. **jvisualvm**：图形化监控

### 调优策略
1. **合理设置堆大小**：避免频繁GC和内存溢出
2. **选择合适的收集器**：根据应用特点选择
3. **监控GC日志**：及时发现性能问题
4. **避免创建过多临时对象**：减少GC压力
5. **使用对象池**：复用对象减少创建开销

## 总结
垃圾回收是Java内存管理的核心机制，理解不同GC算法和收集器的特点对于性能优化至关重要。在实际应用中，应根据具体业务场景选择合适的GC策略，并通过监控工具持续优化GC性能。随着JDK版本的更新，新的GC技术（如ZGC、Shenandoah）提供了更好的低延迟特性，为高性能应用提供了更多选择。

最后更新时间：2024-01-15