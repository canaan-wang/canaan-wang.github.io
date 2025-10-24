# HashMap

## 一、HashMap 概述

- **定义**：`java.util.HashMap` 是 Java 集合框架中最常用的 Map 实现类，基于哈希表实现键值对存储
- **继承关系**：继承自 `AbstractMap`，实现了 `Map`、`Cloneable`、`Serializable` 接口
- **核心特点**：
  - 非线程安全
  - 允许 null 键和 null 值（最多一个 null 键）
  - 无序存储（插入顺序与遍历顺序不一致）
  - 高效的查询、插入和删除操作，平均时间复杂度为 O(1)

## 二、底层数据结构

### 1. JDK 7 及之前
- **数组 + 链表**：
  - 数组（Entry 数组，称为桶/bucket）作为主体
  - 链表解决哈希冲突（拉链法）

### 2. JDK 8 及之后
- **数组 + 链表 + 红黑树**：
  - 数组（Node 数组）作为主体
  - 链表解决哈希冲突
  - 当链表长度超过阈值（默认 8）且数组长度大于等于 64 时，链表转换为红黑树
  - 当红黑树节点数量小于阈值（默认 6）时，红黑树转回链表

## 三、核心参数与构造函数

### 1. 核心参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| DEFAULT_INITIAL_CAPACITY | 16 | 默认初始容量（必须是 2 的幂） |
| MAXIMUM_CAPACITY | 1<<30 | 最大容量 |
| DEFAULT_LOAD_FACTOR | 0.75f | 默认负载因子 |
| TREEIFY_THRESHOLD | 8 | 链表转红黑树的阈值 |
| UNTREEIFY_THRESHOLD | 6 | 红黑树转链表的阈值 |
| MIN_TREEIFY_CAPACITY | 64 | 树化的最小数组容量 |

### 2. 构造函数

```java
// 无参构造函数，使用默认容量和负载因子
public HashMap() {}

// 指定初始容量
public HashMap(int initialCapacity) {}

// 指定初始容量和负载因子
public HashMap(int initialCapacity, float loadFactor) {}

// 使用其他 Map 初始化
public HashMap(Map<? extends K, ? extends V> m) {}
```

## 四、重要方法实现原理

### 1. put 方法

```java
public V put(K key, V value) {
    // 计算 key 的哈希值
    return putVal(hash(key), key, value, false, true);
}

final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    // 1. 如果数组为空，进行初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    // 2. 计算索引并检查桶是否为空
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        // 3. 检查桶的第一个节点是否与新键相同
        if (p.hash == hash && 
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        // 4. 如果是红黑树节点，调用树的插入方法
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        // 5. 遍历链表
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    // 检查是否需要树化
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                // 找到相同的 key，退出循环
                if (e.hash == hash && 
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        // 6. 如果找到了相同的 key，替换值
        if (e != null) {
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    // 7. 检查是否需要扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

### 2. get 方法

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}

final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    // 检查数组和桶是否有效
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (first = tab[(n - 1) & hash]) != null) {
        // 检查桶的第一个节点
        if (first.hash == hash && 
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        // 遍历链表或红黑树
        if ((e = first.next) != null) {
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

### 3. resize 方法（扩容机制）

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    // 计算新容量和新阈值
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 扩容为原来的两倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    // 计算新阈值
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // 迁移元素
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    // 链表拆分，JDK 8 优化，无需重新计算哈希
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    // 低位链表保持原索引
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    // 高位链表索引 = 原索引 + 旧容量
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

## 五、关键优化点

1. **哈希计算优化**：
   ```java
   static final int hash(Object key) {
       int h;
       // 高位参与运算，减少碰撞
       return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
   }
   ```

2. **索引计算**：使用位运算 `(n - 1) & hash` 代替取模运算，提高效率（前提是容量为 2 的幂）

3. **扩容优化**：JDK 8 中扩容时，链表拆分利用 `(e.hash & oldCap) == 0` 快速判断元素应该在原索引还是新索引位置

4. **树化机制**：当链表过长时转为红黑树，提高查询效率（从 O(n) 降至 O(log n)）

## 六、线程安全问题

1. **JDK 7 中的死循环问题**：
   - 多线程并发扩容时，可能导致链表形成环
   - 原因：头插法导致链表顺序反转

2. **JDK 8 中的数据覆盖问题**：
   - 虽然修复了死循环，但仍存在数据覆盖风险
   - 原因：缺乏同步机制

3. **解决方案**：
   - 多线程环境使用 `ConcurrentHashMap`
   - 或使用 `Collections.synchronizedMap()` 包装

## 七、使用注意事项

1. **键的设计**：
   - 必须重写 `equals()` 和 `hashCode()` 方法
   - 推荐使用不可变对象作为键（如 String、Integer）

2. **初始容量设置**：
   - 如果预知数据量，建议设置合适的初始容量
   - 计算公式：期望元素数量 / 负载因子

3. **遍历方式推荐**：
   - 优先使用 `entrySet()` 遍历
   - Java 8+ 推荐使用 `forEach()` 方法

4. **null 值处理**：
   - `get(key)` 返回 null 时，需判断是键不存在还是值为 null
   - 可使用 `containsKey(key)` 进一步确认

## 八、使用示例

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExample {
    public static void main(String[] args) {
        // 创建 HashMap
        Map<String, Integer> map = new HashMap<>(16);
        
        // 添加元素
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("orange", 15);
        map.put(null, 5);  // 允许 null 键
        map.put("grape", null);  // 允许 null 值
        
        // 获取元素
        System.out.println("apple: " + map.get("apple"));
        System.out.println("null key: " + map.get(null));
        
        // 遍历方式 1：entrySet
        System.out.println("\n使用 entrySet 遍历：");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 遍历方式 2：Java 8 forEach
        System.out.println("\n使用 Java 8 forEach 遍历：");
        map.forEach((k, v) -> System.out.println(k + ": " + v));
        
        // 其他常用操作
        System.out.println("\n是否包含键 'banana': " + map.containsKey("banana"));
        System.out.println("是否包含值 15: " + map.containsValue(15));
        System.out.println("集合大小: " + map.size());
        
        // 删除元素
        map.remove("banana");
        System.out.println("删除 'banana' 后的大小: " + map.size());
    }
}
```

## 九、常见问题

1. **为什么 HashMap 的容量必须是 2 的幂？**
   - 为了使用位运算 `(n-1) & hash` 代替模运算，提高效率
   - 保证扩容时元素再分配的均匀性

2. **为什么负载因子是 0.75？**
   - 平衡空间利用率和查询性能
   - 过低：浪费空间
   - 过高：哈希冲突增加，性能下降

3. **HashMap 中如何处理 null 键？**
   - null 键的哈希值为 0
   - 始终存储在数组索引为 0 的位置

4. **为什么 JDK 8 要引入红黑树？**
   - 当哈希冲突严重时，链表过长会导致查询效率下降
   - 红黑树可以将查询时间复杂度从 O(n) 优化到 O(log n)

5. **HashMap、LinkedHashMap、TreeMap 的区别？**
   - HashMap：无序，查询效率高
   - LinkedHashMap：保持插入或访问顺序，继承自 HashMap
   - TreeMap：按键排序，底层为红黑树