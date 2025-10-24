# ConcurrentHashMap

## 一、ConcurrentHashMap 概述

- **定义**：`java.util.concurrent.ConcurrentHashMap` 是 Java 并发包提供的线程安全的哈希表实现，专为高并发场景设计
- **继承关系**：继承自 `AbstractMap`，实现了 `ConcurrentMap`、`Serializable` 接口
- **核心特点**：
  - 线程安全（比 Hashtable 更高效的并发实现）
  - 支持高并发读写操作
  - 允许 null 值，但不允许 null 键
  - 无序存储（插入顺序与遍历顺序不一致）

## 二、不同版本的实现差异

### 1. JDK 7 实现
- **分段锁机制**：
  - 将哈希表分为多个 Segment（段）
  - 每个 Segment 是一个独立的哈希表，有自己的锁
  - 不同段之间的操作可以并行执行
- **结构**：`Segment[]` + `HashEntry[]` + 链表

### 2. JDK 8+ 实现
- **CAS + synchronized 机制**：
  - 放弃了分段锁，采用更细粒度的锁
  - 使用 CAS 操作进行无锁更新
  - 仅在必要时（如链表头节点）使用 synchronized
- **结构**：Node[] + 链表/红黑树（与 HashMap 类似）

## 三、JDK 8+ 核心数据结构

### 1. 基本结构
- **Node 数组**：作为哈希桶数组
- **链表**：处理哈希冲突
- **红黑树**：当链表长度超过阈值（8）时转换为红黑树

### 2. 节点类型

```java
// 普通节点
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;
    // 构造函数和方法...
}

// 用于头节点的特殊节点，支持锁操作
static class TreeNode<K,V> extends Node<K,V> {
    TreeNode<K,V> parent;  // red-black tree links
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;    // needed to unlink next upon deletion
    boolean red;
    // 构造函数和方法...
}

// 用于扩容的节点
static final class ForwardingNode<K,V> extends Node<K,V> {
    final Node<K,V>[] nextTable;
    // 构造函数和方法...
}

// 用于计算键的哈希值的工具
static final class SpreadableValueNode<K,V> extends Node<K,V> {
    // 构造函数和方法...
}
```

## 四、核心参数与构造函数

### 1. 核心参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| DEFAULT_INITIAL_CAPACITY | 16 | 默认初始容量 |
| MAXIMUM_CAPACITY | 1<<30 | 最大容量 |
| DEFAULT_LOAD_FACTOR | 0.75f | 默认负载因子 |
| TREEIFY_THRESHOLD | 8 | 链表转红黑树的阈值 |
| UNTREEIFY_THRESHOLD | 6 | 红黑树转链表的阈值 |
| MIN_TREEIFY_CAPACITY | 64 | 树化的最小数组容量 |
| MOVED | -1 | 表示正在扩容的节点哈希值 |
| TREEBIN | -2 | 表示红黑树节点的哈希值 |
| RESERVED | -3 | 表示保留的节点哈希值 |

### 2. 构造函数

```java
// 无参构造函数，使用默认容量和负载因子
public ConcurrentHashMap() {}

// 指定初始容量
public ConcurrentHashMap(int initialCapacity) {}

// 指定初始容量和负载因子
public ConcurrentHashMap(int initialCapacity, float loadFactor) {}

// 指定初始容量、负载因子和并发级别（JDK 8 中已废弃并发级别参数）
public ConcurrentHashMap(int initialCapacity, float loadFactor, int concurrencyLevel) {}

// 使用其他 Map 初始化
public ConcurrentHashMap(Map<? extends K, ? extends V> m) {}
```

## 五、JDK 8+ 关键方法实现原理

### 1. put 方法

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

/** Implementation for put and putIfAbsent */
final V putVal(K key, V value, boolean onlyIfAbsent) {
    // 检查键值是否为 null
    if (key == null || value == null) throw new NullPointerException();
    // 计算哈希值
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        // 如果表未初始化，先初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        // 如果目标桶为空，尝试使用 CAS 插入新节点
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value, null)))
                break;                  // no lock when adding to empty bin
        }
        // 如果遇到正在扩容的节点，帮助扩容
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            // 锁定桶的头节点
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    if (fh >= 0) { // 链表节点
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            // 找到相同的键，替换值
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            // 到达链表尾部，添加新节点
                            if ((e = e.next) == null) {
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    else if (f instanceof TreeBin) { // 红黑树节点
                        Node<K,V> p;
                        binCount = 2;
                        // 在红黑树中插入或更新
                        if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key, value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            // 检查是否需要将链表转换为红黑树
            if (binCount != 0) {
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    // 增加元素计数，并检查是否需要扩容
    addCount(1L, binCount);
    return null;
}
```

### 2. get 方法

```java
public V get(Object key) {
    Node<K,V>[] tab;
    Node<K,V> e, p;
    int n, eh; K ek;
    // 计算哈希值
    int h = spread(key.hashCode());
    // 检查表是否初始化，且目标桶是否存在
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // 检查桶的头节点
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        // 如果是红黑树节点或正在扩容
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        // 遍历链表查找
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

### 3. 扩容机制

```java
/**
 * 扩容的主要方法
 */
private final void transfer(Node<K,V>[] tab, Node<K,V>[] nextTab) {
    int n = tab.length, stride;
    // 计算每个线程处理的桶数量
    if ((stride = (NCPU > 1) ? (n >>> 3) / NCPU : n) < MIN_TRANSFER_STRIDE)
        stride = MIN_TRANSFER_STRIDE; // subdivide range
    // 初始化新表
    if (nextTab == null) {            // initiating
        try {
            @SuppressWarnings("unchecked")
            Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n << 1];
            nextTab = nt;
        } catch (Throwable ex) {      // try to cope with OOME
            sizeCtl = Integer.MAX_VALUE;
            return;
        }
        nextTable = nextTab;
        transferIndex = n;
    }
    int nextn = nextTab.length;
    // 创建转发节点
    ForwardingNode<K,V> fwd = new ForwardingNode<K,V>(nextTab);
    boolean advance = true;
    boolean finishing = false; // to ensure sweep before committing nextTab
    // 多线程分段迁移数据
    for (int i = 0, bound = 0;;) {
        Node<K,V> f;
        int fh;
        while (advance) {
            int nextIndex, nextBound;
            if (--i >= bound || finishing)
                advance = false;
            else if ((nextIndex = transferIndex) <= 0) {
                i = -1;
                advance = false;
            }
            else if (U.compareAndSwapInt(this, TRANSFERINDEX, nextIndex,
                                         nextBound = (nextIndex > stride ?
                                                      nextIndex - stride : 0))) {
                bound = nextBound;
                i = nextIndex - 1;
                advance = false;
            }
        }
        // 迁移完成
        if (i < 0 || i >= n || i + n >= nextn) {
            int sc;
            if (finishing) {
                nextTable = null;
                table = nextTab;
                sizeCtl = (n << 1) - (n >>> 1);
                return;
            }
            if (U.compareAndSwapInt(this, SIZECTL, sc = sizeCtl, sc - 1)) {
                if ((sc - 2) != resizeStamp(n) << RESIZE_STAMP_SHIFT)
                    return;
                finishing = advance = true;
                i = n; // recheck before commit
            }
        }
        // 处理每个桶
        else if ((f = tabAt(tab, i)) == null)
            advance = casTabAt(tab, i, null, fwd);
        else if ((fh = f.hash) == MOVED)
            advance = true; // already processed
        else {
            // 锁定桶的头节点进行迁移
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    Node<K,V> ln, hn;
                    if (fh >= 0) {
                        // 链表节点迁移（与 HashMap 类似）
                        int runBit = fh & n;
                        Node<K,V> lastRun = f;
                        for (Node<K,V> p = f.next; p != null; p = p.next) {
                            int b = p.hash & n;
                            if (b != runBit) {
                                runBit = b;
                                lastRun = p;
                            }
                        }
                        if (runBit == 0) {
                            ln = lastRun;
                            hn = null;
                        }
                        else {
                            hn = lastRun;
                            ln = null;
                        }
                        for (Node<K,V> p = f; p != lastRun; p = p.next) {
                            int ph = p.hash;
                            K pk = p.key;
                            V pv = p.val;
                            if ((ph & n) == 0)
                                ln = new Node<K,V>(ph, pk, pv, ln);
                            else
                                hn = new Node<K,V>(ph, pk, pv, hn);
                        }
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                    else if (f instanceof TreeBin) {
                        // 红黑树节点迁移
                        TreeBin<K,V> t = (TreeBin<K,V>)f;
                        TreeNode<K,V> lo = null, loTail = null;
                        TreeNode<K,V> hi = null, hiTail = null;
                        int lc = 0, hc = 0;
                        for (Node<K,V> e = t.first; e != null; e = e.next) {
                            int h = e.hash;
                            TreeNode<K,V> p = (TreeNode<K,V>)e;
                            if ((h & n) == 0) {
                                if ((p.prev = loTail) == null)
                                    lo = p;
                                else
                                    loTail.next = p;
                                loTail = p;
                                ++lc;
                            }
                            else {
                                if ((p.prev = hiTail) == null)
                                    hi = p;
                                else
                                    hiTail.next = p;
                                hiTail = p;
                                ++hc;
                            }
                        }
                        // 根据节点数量决定是使用链表还是红黑树
                        ln = (lc <= UNTREEIFY_THRESHOLD) ? untreeify(lo) :
                            (hc != 0) ? new TreeBin<K,V>(lo) : t;
                        hn = (hc <= UNTREEIFY_THRESHOLD) ? untreeify(hi) :
                            (lc != 0) ? new TreeBin<K,V>(hi) : t;
                        setTabAt(nextTab, i, ln);
                        setTabAt(nextTab, i + n, hn);
                        setTabAt(tab, i, fwd);
                        advance = true;
                    }
                }
            }
        }
    }
}
```

## 六、线程安全机制

### 1. JDK 7 线程安全：分段锁

- 将整个哈希表分为多个 Segment
- 每个 Segment 独立加锁，互不影响
- 不同 Segment 上的操作可以并行执行
- 缺点：
  - 内存占用较大（每个 Segment 都有独立的数组和锁）
  - 并发度受限于 Segment 数量

### 2. JDK 8+ 线程安全：CAS + synchronized

- **无锁操作**：使用 CAS 进行数组初始化、插入空桶等操作
- **细粒度锁**：仅在操作链表头节点或红黑树时使用 synchronized
- **桶级锁定**：只锁定正在操作的桶，而不是整个表
- **帮助扩容**：其他线程发现扩容时会主动参与扩容
- **优势**：
  - 更高的并发度
  - 更好的内存利用率
  - 更灵活的锁策略

## 七、性能特点

1. **时间复杂度**：
   - 基本操作（get、put、remove）平均时间复杂度为 O(1)
   - 在哈希冲突严重时，红黑树操作复杂度为 O(log n)

2. **并发性能**：
   - 比 Hashtable 高很多（细粒度锁 vs 全表锁）
   - 读操作几乎无锁（非阻塞读）
   - 写操作只锁定单个桶

3. **内存占用**：
   - JDK 8 比 JDK 7 更低（不再需要多个 Segment）
   - 略高于 HashMap（需要额外的线程安全机制）

## 八、使用注意事项

1. **null 值处理**：
   - 不允许使用 null 作为键
   - 允许使用 null 作为值

2. **线程安全保证**：
   - get 操作不阻塞（读不加锁）
   - 迭代器弱一致性（不会抛出 ConcurrentModificationException）
   - 不保证原子性复合操作（如 putIfAbsent 是原子的，但 putAll 不是）

3. **性能调优**：
   - 初始容量设置：根据预期并发级别和元素数量
   - 避免热点键：尽量使键的哈希分布均匀
   - 减少锁竞争：避免频繁修改同一键值对

4. **原子操作支持**：
   - ConcurrentHashMap 实现了 ConcurrentMap 接口，提供了额外的原子操作：
     - `putIfAbsent(K key, V value)`：仅当键不存在时才插入
     - `remove(Object key, Object value)`：仅当键值匹配时才删除
     - `replace(K key, V oldValue, V newValue)`：仅当旧值匹配时才替换

## 九、使用示例

### 1. 基本使用

```java
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapDemo {
    public static void main(String[] args) {
        // 创建 ConcurrentHashMap
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        
        // 添加元素
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("orange", 15);
        map.put("grape", null); // 允许 null 值
        
        // 尝试添加 null 键会抛出异常
        try {
            map.put(null, 5); // 抛出 NullPointerException
        } catch (NullPointerException e) {
            System.out.println("ConcurrentHashMap 不允许 null 键");
        }
        
        // 原子操作示例
        Integer oldValue = map.putIfAbsent("orange", 25); // 已存在，返回旧值 15
        boolean removed = map.remove("banana", 20); // 值匹配，删除成功
        boolean replaced = map.replace("apple", 10, 100); // 旧值匹配，替换成功
        
        System.out.println("oldValue: " + oldValue);
        System.out.println("removed: " + removed);
        System.out.println("replaced: " + replaced);
        System.out.println("apple: " + map.get("apple")); // 100
        
        // 遍历
        System.out.println("\n遍历 ConcurrentHashMap:");
        map.forEach((k, v) -> System.out.println(k + ": " + v));
    }
}
```

### 2. 多线程示例

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;

public class ConcurrentHashMapMultithreadedDemo {
    public static void main(String[] args) throws InterruptedException {
        final ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        final int threadCount = 10;
        final int operationsPerThread = 1000;
        final CountDownLatch latch = new CountDownLatch(threadCount);
        
        // 创建多个线程并发读写
        for (int t = 0; t < threadCount; t++) {
            final int threadId = t;
            new Thread(() -> {
                try {
                    // 写操作
                    for (int i = 0; i < operationsPerThread; i++) {
                        String key = "key-" + (i % 10); // 10个不同的键
                        map.put(key, i);
                    }
                    
                    // 读操作
                    for (int i = 0; i < operationsPerThread; i++) {
                        String key = "key-" + (i % 10);
                        map.get(key);
                    }
                    
                    // 原子操作
                    for (int i = 0; i < operationsPerThread / 10; i++) {
                        String key = "atomic-key-" + (i % 5);
                        map.putIfAbsent(key, i);
                    }
                } finally {
                    latch.countDown();
                }
            }, "Thread-" + threadId).start();
        }
        
        // 等待所有线程完成
        latch.await();
        
        System.out.println("所有线程执行完成");
        System.out.println("map size: " + map.size());
        
        // 验证结果
        System.out.println("\n验证结果:");
        for (int i = 0; i < 10; i++) {
            System.out.println("key-" + i + ": " + map.get("key-" + i));
        }
    }
}
```

## 十、ConcurrentHashMap vs Hashtable vs HashMap

| 特性 | ConcurrentHashMap | Hashtable | HashMap |
|---|---|---|---|
| 线程安全 | 是（细粒度锁/CAS） | 是（全表锁） | 否 |
| null 键值 | 键不允许，值允许 | 都不允许 | 都允许 |
| 并发性能 | 高 | 低 | 高（但非线程安全） |
| 迭代器特性 | 弱一致性 | 快速失败 | 快速失败 |
| 数据结构 | 数组+链表/红黑树 | 数组+链表 | 数组+链表/红黑树 |
| 适用场景 | 高并发读写 | 多线程（已过时） | 单线程或线程安全环境 |

## 十一、常见问题

1. **ConcurrentHashMap 为什么不允许 null 键？**
   - 为了避免歧义：get 返回 null 时，无法区分是键不存在还是值为 null
   - 与 ConcurrentMap 接口规范一致

2. **ConcurrentHashMap 的迭代器是弱一致性的，这意味着什么？**
   - 迭代器创建后，对映射的修改不会抛出 ConcurrentModificationException
   - 但迭代器不一定能反映映射的最新状态
   - 适合并发读取场景，不需要严格的一致性视图

3. **ConcurrentHashMap 在高并发下如何避免死锁？**
   - JDK 8 中使用 CAS 操作和细粒度锁，避免了嵌套锁定
   - 扩容时使用特殊的 ForwardingNode 标记，协调多线程工作

4. **ConcurrentHashMap 中的 size 方法是否准确？**
   - 不是完全准确的，因为并发环境下计数可能变化
   - size 方法返回的是一个估计值，但通常接近实际值
   - 对于需要精确计数的场景，应使用额外的同步机制

5. **如何选择合适的并发集合？**
   - 线程安全的 Map：ConcurrentHashMap
   - 线程安全的 List：CopyOnWriteArrayList（读多写少）
   - 线程安全的 Set：CopyOnWriteArraySet（读多写少）
   - 队列：ConcurrentLinkedQueue（无界非阻塞）、LinkedBlockingQueue（有界阻塞）
   - 双端队列：ConcurrentLinkedDeque