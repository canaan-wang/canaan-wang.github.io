# LinkedHashMap

## 一、LinkedHashMap 概述

- **定义**：`java.util.LinkedHashMap` 是 `HashMap` 的子类，在其基础上通过维护一个双向链表来保持元素的插入顺序或访问顺序
- **继承关系**：继承自 `HashMap`，实现了 `Map` 接口
- **核心特点**：
  - 非线程安全
  - 允许 null 键和 null 值
  - 可以维护元素的顺序（插入顺序或访问顺序）
  - 性能略低于 HashMap，但提供了顺序保证

## 二、底层数据结构

### 1. 结构组成
- **哈希表**：继承自 HashMap，使用数组 + 链表/红黑树存储键值对
- **双向链表**：额外维护一个双向链表，用于记录元素的顺序

### 2. 节点结构
```java
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after; // 双向链表的前后指针
    Entry(int hash, K key, V value, Node<K,V> next) {
        super(hash, key, value, next);
    }
}
```

## 三、核心参数与构造函数

### 1. 核心参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| accessOrder | false | 排序模式，false 表示插入顺序，true 表示访问顺序 |

### 2. 构造函数

```java
// 无参构造函数，默认容量 16，负载因子 0.75，插入顺序
public LinkedHashMap() {
    super();
    accessOrder = false;
}

// 指定初始容量
public LinkedHashMap(int initialCapacity) {
    super(initialCapacity);
    accessOrder = false;
}

// 指定初始容量和负载因子
public LinkedHashMap(int initialCapacity, float loadFactor) {
    super(initialCapacity, loadFactor);
    accessOrder = false;
}

// 指定初始容量、负载因子和排序模式
public LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder) {
    super(initialCapacity, loadFactor);
    this.accessOrder = accessOrder;
}

// 使用其他 Map 初始化
public LinkedHashMap(Map<? extends K, ? extends V> m) {
    super();
    accessOrder = false;
    putMapEntries(m, false);
}
```

## 四、关键方法与实现原理

### 1. 双向链表维护

```java
// 初始化时调用，创建头节点和尾节点
void init() {
    head = tail = null;
}

// 将节点链接到链表尾部（插入顺序）
private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
    LinkedHashMap.Entry<K,V> last = tail;
    tail = p;
    if (last == null)
        head = p;
    else {
        p.before = last;
        last.after = p;
    }
}

// 在访问节点后调整链表（访问顺序模式）
void afterNodeAccess(Node<K,V> e) { // move node to last
    LinkedHashMap.Entry<K,V> last;
    if (accessOrder && (last = tail) != e) {
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e,
            b = p.before,
            a = p.after;
        p.after = null;
        if (b == null)
            head = a;
        else
            b.after = a;
        if (a != null)
            a.before = b;
        else
            last = b;
        if (last == null)
            head = p;
        else {
            p.before = last;
            last.after = p;
        }
        tail = p;
        ++modCount;
    }
}

// 插入节点后链接到链表
void afterNodeInsertion(boolean evict) { // possibly remove eldest
    LinkedHashMap.Entry<K,V> first;
    // 根据需要删除最老的元素（用于 LRU 缓存）
    if (evict && (first = head) != null && removeEldestEntry(first)) {
        K key = first.key;
        removeNode(hash(key), key, null, false, true);
    }
}
```

### 2. 重写 HashMap 的关键方法

```java
// 创建新节点，返回 LinkedHashMap.Entry 而不是 HashMap.Node
Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
    LinkedHashMap.Entry<K,V> p = 
        new LinkedHashMap.Entry<K,V>(hash, key, value, e);
    linkNodeLast(p); // 链接到链表尾部
    return p;
}

// 红黑树节点也需要支持双向链表
TreeNode<K,V> newTreeNode(int hash, K key, V value, Node<K,V> next) {
    TreeNode<K,V> p = new TreeNode<K,V>(hash, key, value, next);
    linkNodeLast(p);
    return p;
}

// 遍历优先使用双向链表，而不是哈希表
public Set<K> keySet() {
    Set<K> ks = keySet;
    if (ks == null) {
        ks = new LinkedKeySet();
        keySet = ks;
    }
    return ks;
}

public Collection<V> values() {
    Collection<V> vs = values;
    if (vs == null) {
        vs = new LinkedValues();
        values = vs;
    }
    return vs;
}

public Set<Map.Entry<K,V>> entrySet() {
    Set<Map.Entry<K,V>> es;
    return (es = entrySet) == null ? (entrySet = new LinkedEntrySet()) : es;
}
```

## 五、两种排序模式

### 1. 插入顺序模式（默认，accessOrder = false）
- 元素的迭代顺序与插入顺序一致
- 即使重新插入已存在的键，顺序也不会改变

### 2. 访问顺序模式（accessOrder = true）
- 每次访问（get 或 put 已存在的键）后，该元素会移到链表尾部
- 链表头部是最久未使用的元素（Least Recently Used, LRU）
- 链表尾部是最近使用的元素（Most Recently Used, MRU）

## 六、LRU 缓存实现

LinkedHashMap 非常适合实现 LRU（Least Recently Used）缓存，只需要：
1. 设置 `accessOrder = true`
2. 重写 `removeEldestEntry()` 方法

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true
        this.capacity = capacity;
    }
    
    // 当添加新元素后，如果链表长度超过容量，删除最老的元素
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

使用示例：

```java
public class LRUCacheDemo {
    public static void main(String[] args) {
        LRUCache<String, Integer> cache = new LRUCache<>(3);
        
        // 添加元素
        cache.put("A", 1);
        cache.put("B", 2);
        cache.put("C", 3);
        System.out.println("初始缓存: " + cache); // 顺序: A, B, C
        
        // 访问元素，会将其移到尾部
        cache.get("A");
        System.out.println("访问 A 后: " + cache); // 顺序: B, C, A
        
        // 添加新元素，会删除最老的元素 B
        cache.put("D", 4);
        System.out.println("添加 D 后: " + cache); // 顺序: C, A, D
    }
}
```

## 七、性能特点

1. **时间复杂度**：
   - get/put 操作平均时间复杂度为 O(1)
   - 迭代操作的时间复杂度为 O(n)，但比 HashMap 更高效（直接遍历链表）

2. **空间复杂度**：
   - 比 HashMap 多消耗空间，因为需要维护双向链表
   - 每个节点额外需要两个引用（before 和 after）

3. **与 HashMap 的性能差异**：
   - 插入、删除操作略慢于 HashMap（需要维护双向链表）
   - 顺序遍历效率高于 HashMap（O(n)，而 HashMap 需要遍历整个数组）

## 八、使用注意事项

1. **线程安全问题**：
   - 非线程安全，多线程环境下需额外同步
   - 可以使用 `Collections.synchronizedMap()` 或 `ConcurrentHashMap`

2. **LRU 缓存实现要点**：
   - 正确设置初始容量，避免频繁扩容
   - 根据实际需求重写 `removeEldestEntry()` 方法
   - 注意线程安全问题，必要时进行同步

3. **遍历性能**：
   - 如果需要频繁遍历并保持顺序，LinkedHashMap 是更好的选择
   - 对于只关注随机访问性能的场景，HashMap 更高效

## 九、使用示例

### 1. 基本使用（插入顺序）

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapDemo {
    public static void main(String[] args) {
        // 创建 LinkedHashMap（默认插入顺序）
        Map<String, Integer> map = new LinkedHashMap<>();
        
        // 添加元素
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("orange", 15);
        
        // 遍历，保持插入顺序
        System.out.println("插入顺序遍历:");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 重新插入已存在的键，顺序不变
        map.put("banana", 25);
        System.out.println("\n重新插入后的顺序:");
        map.forEach((k, v) -> System.out.println(k + ": " + v));
    }
}
```

### 2. 访问顺序模式

```java
import java.util.LinkedHashMap;
import java.util.Map;

public class AccessOrderDemo {
    public static void main(String[] args) {
        // 创建访问顺序模式的 LinkedHashMap
        Map<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
        
        map.put("A", 1);
        map.put("B", 2);
        map.put("C", 3);
        System.out.println("初始顺序: " + map);
        
        // 访问元素，会调整顺序
        map.get("A");
        System.out.println("访问 A 后: " + map);
        
        // 修改已存在的键也会视为访问
        map.put("B", 22);
        System.out.println("修改 B 后: " + map);
    }
}
```

## 十、常见问题

1. **LinkedHashMap 如何保持顺序？**
   - 通过维护一个额外的双向链表
   - 每个节点包含 before 和 after 引用
   - 根据 accessOrder 参数决定是按插入顺序还是访问顺序排序

2. **为什么 LinkedHashMap 比 HashMap 慢？**
   - 需要额外维护双向链表的引用关系
   - 插入、删除时需要多一些操作来调整链表

3. **LinkedHashMap 的迭代效率为什么比 HashMap 高？**
   - HashMap 迭代需要遍历整个数组，包括大量空槽位
   - LinkedHashMap 直接遍历双向链表，只访问实际存在的元素

4. **如何实现线程安全的 LinkedHashMap？**
   - 使用 `Collections.synchronizedMap(new LinkedHashMap<>(...))`
   - 或在所有访问方法上添加同步锁
   - 注意：即使如此，迭代时仍需要外部同步

5. **LinkedHashMap 与 TreeMap 的区别？**
   - LinkedHashMap：保持插入顺序或访问顺序，基于哈希表
   - TreeMap：按键的自然顺序或自定义顺序排序，基于红黑树
   - 性能：随机访问 LinkedHashMap 更快，有序遍历两者都高效