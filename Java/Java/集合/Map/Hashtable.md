# Hashtable

## 一、Hashtable 概述

- **定义**：`java.util.Hashtable` 是 Java 最早的键值对存储实现之一，是一个古老但仍在使用的线程安全的哈希表实现
- **继承关系**：继承自 `Dictionary`，实现了 `Map`、`Cloneable`、`Serializable` 接口
- **核心特点**：
  - 线程安全（所有方法使用 synchronized 同步）
  - 不允许 null 键和 null 值
  - 无序存储（插入顺序与遍历顺序不一致）
  - 性能较低，在高并发场景下效率不高

## 二、底层数据结构

### 1. 数据结构
- **数组 + 链表**：
  - 数组（称为桶/bucket）作为主体
  - 链表解决哈希冲突（拉链法）
  - 注意：Hashtable 没有像 JDK 8 的 HashMap 那样引入红黑树优化

### 2. 节点结构
```java
private static class Entry<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Entry<K,V> next;

    protected Entry(int hash, K key, V value, Entry<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }
    
    // 其他方法...
}
```

## 三、核心参数与构造函数

### 1. 核心参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| DEFAULT_INITIAL_CAPACITY | 11 | 默认初始容量（注意与 HashMap 不同，不是 2 的幂） |
| MAX_ARRAY_SIZE | Integer.MAX_VALUE - 8 | 最大数组大小 |
| DEFAULT_LOAD_FACTOR | 0.75f | 默认负载因子 |

### 2. 构造函数

```java
// 无参构造函数，使用默认容量和负载因子
public Hashtable() {
    this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR);
}

// 指定初始容量
public Hashtable(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}

// 指定初始容量和负载因子
public Hashtable(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal Capacity: " + initialCapacity);
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal Load: " + loadFactor);

    if (initialCapacity == 0)
        initialCapacity = 1;
    this.loadFactor = loadFactor;
    table = new Entry<?,?>[initialCapacity];
    threshold = (int)Math.min(initialCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
}

// 使用其他 Map 初始化
public Hashtable(Map<? extends K, ? extends V> t) {
    this(Math.max(2*t.size(), DEFAULT_INITIAL_CAPACITY), DEFAULT_LOAD_FACTOR);
    putAll(t);
}
```

## 四、关键方法实现原理

### 1. put 方法

```java
public synchronized V put(K key, V value) {
    // 如果 value 为 null，抛出异常
    if (value == null) {
        throw new NullPointerException();
    }

    // 确保 key 不重复
    Entry<?,?> tab[] = table;
    int hash = key.hashCode(); // 直接使用 key 的 hashCode
    int index = (hash & 0x7FFFFFFF) % tab.length; // 计算索引
    @SuppressWarnings("unchecked")
    Entry<K,V> entry = (Entry<K,V>)tab[index];
    
    // 遍历链表查找重复键
    for(; entry != null ; entry = entry.next) {
        if ((entry.hash == hash) && entry.key.equals(key)) {
            V old = entry.value;
            entry.value = value; // 替换值
            return old;
        }
    }

    // 添加新节点
    addEntry(hash, key, value, index);
    return null;
}

private void addEntry(int hash, K key, V value, int index) {
    modCount++;

    Entry<?,?> tab[] = table;
    if (count >= threshold) {
        // 扩容
        rehash();

        tab = table;
        hash = key.hashCode();
        index = (hash & 0x7FFFFFFF) % tab.length;
    }

    // 创建新节点并插入链表头部
    @SuppressWarnings("unchecked")
    Entry<K,V> e = (Entry<K,V>) tab[index];
    tab[index] = new Entry<>(hash, key, value, e);
    count++;
}
```

### 2. get 方法

```java
public synchronized V get(Object key) {
    Entry<?,?> tab[] = table;
    int hash = key.hashCode(); // 直接使用 key 的 hashCode
    int index = (hash & 0x7FFFFFFF) % tab.length; // 计算索引
    
    // 遍历链表查找键
    for (Entry<?,?> e = tab[index] ; e != null ; e = e.next) {
        if ((e.hash == hash) && e.key.equals(key)) {
            return (V)e.value;
        }
    }
    return null;
}
```

### 3. rehash 方法（扩容机制）

```java
protected void rehash() {
    int oldCapacity = table.length;
    Entry<?,?>[] oldMap = table;

    // 计算新容量（扩大约两倍）
    int newCapacity = (oldCapacity << 1) + 1;
    if (newCapacity - MAX_ARRAY_SIZE > 0) {
        if (oldCapacity == MAX_ARRAY_SIZE)
            // 已经是最大容量，不再扩容
            return;
        newCapacity = MAX_ARRAY_SIZE;
    }
    Entry<?,?>[] newMap = new Entry<?,?>[newCapacity];

    modCount++;
    threshold = (int)Math.min(newCapacity * loadFactor, MAX_ARRAY_SIZE + 1);
    table = newMap;

    // 重新计算哈希并迁移元素
    for (int i = oldCapacity ; i-- > 0 ;) {
        for (Entry<K,V> old = (Entry<K,V>)oldMap[i] ; old != null ; ) {
            Entry<K,V> e = old;
            old = old.next;

            int index = (e.hash & 0x7FFFFFFF) % newCapacity;
            e.next = (Entry<K,V>)newMap[index];
            newMap[index] = e;
        }
    }
}
```

## 五、与 HashMap 的区别

| 特性 | Hashtable | HashMap |
|---|---|---|
| 线程安全 | 是（方法同步） | 否 |
| null 键值 | 不允许 | 允许（键最多一个，值多个） |
| 初始容量 | 11 | 16 |
| 扩容策略 | 原容量 * 2 + 1 | 原容量 * 2 |
| 索引计算 | (hash & 0x7FFFFFFF) % length | (length - 1) & hash |
| 数据结构 | 数组 + 链表 | 数组 + 链表 + 红黑树（JDK 8+） |
| 继承关系 | Dictionary | AbstractMap |
| 性能 | 较低（全表锁） | 较高 |

## 六、线程安全实现

Hashtable 的线程安全是通过在几乎所有公共方法上使用 `synchronized` 关键字实现的：

```java
public synchronized V put(K key, V value) { ... }
public synchronized V get(Object key) { ... }
public synchronized V remove(Object key) { ... }
public synchronized int size() { ... }
public synchronized boolean isEmpty() { ... }
public synchronized boolean contains(Object value) { ... }
public synchronized boolean containsKey(Object key) { ... }
// 更多方法...
```

这种实现方式的缺点是：
1. **全表锁**：任何对 Hashtable 的操作都会锁定整个表
2. **阻塞严重**：即使是读取操作也会阻塞其他所有操作
3. **并发效率低**：多线程环境下性能较差

## 七、性能特点

1. **时间复杂度**：
   - 基本操作（get、put、remove）平均时间复杂度为 O(1)
   - 在哈希冲突严重时，退化为 O(n)

2. **并发性能**：
   - 由于使用 synchronized 方法，并发性能较差
   - 多个线程同时访问会导致线程阻塞

3. **内存占用**：
   - 由于数据结构简单，内存占用相对较小
   - 但缺乏红黑树优化，在大数据量时性能下降明显

## 八、使用注意事项

1. **null 值处理**：
   - 不允许使用 null 作为键或值
   - 尝试使用 null 会抛出 NullPointerException

2. **线程安全**：
   - 在单线程环境下，应优先使用 HashMap 而不是 Hashtable
   - 在多线程环境下，应优先使用 ConcurrentHashMap 而不是 Hashtable

3. **容量设置**：
   - 如果预知数据量，建议设置合适的初始容量
   - 计算公式：预期元素数量 / 负载因子

4. **键的设计**：
   - 必须重写 hashCode() 和 equals() 方法
   - 推荐使用不可变对象作为键

5. **遍历方式**：
   - 与 HashMap 相同，推荐使用 entrySet() 进行遍历

## 九、使用示例

```java
import java.util.Hashtable;
import java.util.Map;

public class HashtableDemo {
    public static void main(String[] args) {
        // 创建 Hashtable
        Hashtable<String, Integer> table = new Hashtable<>();
        
        // 添加元素
        table.put("apple", 10);
        table.put("banana", 20);
        table.put("orange", 15);
        
        // 尝试添加 null 值会抛出异常
        try {
            table.put("grape", null); // 抛出 NullPointerException
        } catch (NullPointerException e) {
            System.out.println("Hashtable 不允许 null 值");
        }
        
        // 获取元素
        System.out.println("apple: " + table.get("apple"));
        
        // 遍历
        System.out.println("\n遍历 Hashtable:");
        for (Map.Entry<String, Integer> entry : table.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 其他常用操作
        System.out.println("\n是否包含键 'banana': " + table.containsKey("banana"));
        System.out.println("是否包含值 15: " + table.containsValue(15));
        System.out.println("集合大小: " + table.size());
        
        // 删除元素
        table.remove("banana");
        System.out.println("删除 'banana' 后的大小: " + table.size());
    }
}
```

## 十、替代方案

由于 Hashtable 的性能问题，在实际开发中，通常会使用以下替代方案：

1. **单线程环境**：使用 `HashMap`
   - 性能更高
   - 支持 null 值

2. **多线程环境**：
   - 使用 `ConcurrentHashMap`（推荐）
     - 并发性能更好
     - 采用分段锁或 CAS 操作
     - 支持高并发读写
   - 或使用 `Collections.synchronizedMap(new HashMap<>(...))`
     - 简单易用
     - 性能略低于 ConcurrentHashMap

3. **需要排序的多线程环境**：
   - 使用 `Collections.synchronizedSortedMap(new TreeMap<>(...))`

## 十一、常见问题

1. **Hashtable 为什么不允许 null 键和 null 值？**
   - 设计决策，确保所有键值都有意义
   - 与 contains 方法的语义有关，避免歧义

2. **Hashtable 和 ConcurrentHashMap 的区别？**
   - Hashtable 使用全表锁，ConcurrentHashMap 使用分段锁或 CAS
   - ConcurrentHashMap 并发性能更高
   - ConcurrentHashMap 支持更多高级并发操作

3. **为什么 Hashtable 的初始容量是 11 而不是 16？**
   - 历史原因，早期 Java 设计如此
   - 11 是质数，有助于减少哈希冲突

4. **Hashtable 在现代 Java 中还有使用价值吗？**
   - 主要用于维护旧代码兼容性
   - 新项目中应避免使用，推荐使用 HashMap 或 ConcurrentHashMap

5. **Hashtable 如何处理哈希冲突？**
   - 使用链表法（拉链法）
   - 当多个键映射到同一个索引时，将它们链接成一个链表
   - 注意：不支持红黑树优化，链表可能很长