# TreeMap

## 一、TreeMap 概述

- **定义**：`java.util.TreeMap` 是基于红黑树实现的有序键值对集合，实现了 `NavigableMap` 接口
- **继承关系**：继承自 `AbstractMap`，实现了 `NavigableMap`、`Cloneable`、`Serializable` 接口
- **核心特点**：
  - 非线程安全
  - 按键有序（自然排序或定制排序）
  - 不允许 null 键（但允许 null 值）
  - 访问、插入和删除操作的时间复杂度为 O(log n)

## 二、底层数据结构

### 1. 红黑树简介

红黑树是一种自平衡的二叉搜索树，每个节点都有一个颜色属性（红色或黑色），通过以下规则保持平衡：

1. 每个节点要么是红色，要么是黑色
2. 根节点是黑色
3. 所有叶子节点（null节点）是黑色
4. 如果一个节点是红色，则其两个子节点都是黑色（不能有连续的红色节点）
5. 从任一节点到其每个叶子的所有路径都包含相同数目的黑色节点

### 2. TreeMap 的节点结构

```java
static final class Entry<K,V> implements Map.Entry<K,V> {
    K key;
    V value;
    Entry<K,V> left;   // 左子节点
    Entry<K,V> right;  // 右子节点
    Entry<K,V> parent; // 父节点
    boolean color = BLACK; // 节点颜色
    
    // 构造函数
    Entry(K key, V value, Entry<K,V> parent) {
        this.key = key;
        this.value = value;
        this.parent = parent;
    }
    
    // 其他方法...
}
```

## 三、核心参数与构造函数

### 1. 核心参数

```java
private final Comparator<? super K> comparator; // 比较器
private transient Entry<K,V> root;              // 根节点
private transient int size = 0;                 // 元素数量
private transient int modCount = 0;             // 修改计数
```

### 2. 构造函数

```java
// 默认构造函数，使用自然排序
public TreeMap() {
    comparator = null;
}

// 使用指定比较器
public TreeMap(Comparator<? super K> comparator) {
    this.comparator = comparator;
}

// 使用已有的 Map 初始化，并使用自然排序
public TreeMap(Map<? extends K, ? extends V> m) {
    comparator = null;
    putAll(m);
}

// 使用已有的 SortedMap 初始化，保持其排序方式
public TreeMap(SortedMap<K, ? extends V> m) {
    comparator = m.comparator();
    try {
        buildFromSorted(m.size(), m.entrySet().iterator(), null, null);
    } catch (java.io.IOException cannotHappen) {
    } catch (ClassNotFoundException cannotHappen) {
    }
}
```

## 四、排序机制

TreeMap 提供两种排序方式：

### 1. 自然排序

- 要求键实现 `Comparable` 接口
- 使用键的 `compareTo()` 方法进行比较
- 适用于具有自然顺序的类（如 Integer、String 等）

### 2. 定制排序

- 通过构造函数传入 `Comparator` 接口实现
- 使用比较器的 `compare()` 方法进行比较
- 适用于自定义类或需要非标准排序的场景

## 五、关键方法实现原理

### 1. put 方法

```java
public V put(K key, V value) {
    Entry<K,V> t = root;
    // 如果树为空，创建根节点
    if (t == null) {
        compare(key, key); // 检查 key 是否为 null
        root = new Entry<>(key, value, null);
        size = 1;
        modCount++;
        return null;
    }
    int cmp;
    Entry<K,V> parent;
    // 确定比较器
    Comparator<? super K> cpr = comparator;
    if (cpr != null) {
        // 使用定制排序
        do {
            parent = t;
            cmp = cpr.compare(key, t.key);
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
            else
                // 键已存在，替换值
                return t.setValue(value);
        } while (t != null);
    } else {
        // 使用自然排序
        if (key == null)
            throw new NullPointerException();
        Comparable<? super K> k = (Comparable<? super K>) key;
        do {
            parent = t;
            cmp = k.compareTo(t.key);
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value);
        } while (t != null);
    }
    // 创建新节点并插入
    Entry<K,V> e = new Entry<>(key, value, parent);
    if (cmp < 0)
        parent.left = e;
    else
        parent.right = e;
    // 修复红黑树性质
    fixAfterInsertion(e);
    size++;
    modCount++;
    return null;
}
```

### 2. get 方法

```java
public V get(Object key) {
    Entry<K,V> p = getEntry(key);
    return (p == null ? null : p.value);
}

final Entry<K,V> getEntry(Object key) {
    // 使用比较器
    if (comparator != null)
        return getEntryUsingComparator(key);
    if (key == null)
        throw new NullPointerException();
    // 使用自然排序
    @SuppressWarnings("unchecked")
    Comparable<? super K> k = (Comparable<? super K>) key;
    Entry<K,V> p = root;
    while (p != null) {
        int cmp = k.compareTo(p.key);
        if (cmp < 0)
            p = p.left;
        else if (cmp > 0)
            p = p.right;
        else
            return p;
    }
    return null;
}
```

### 3. 红黑树维护方法

```java
// 插入后修复红黑树性质
private void fixAfterInsertion(Entry<K,V> x) {
    x.color = RED;

    while (x != null && x != root && x.parent.color == RED) {
        if (parentOf(x) == leftOf(parentOf(parentOf(x)))) {
            Entry<K,V> y = rightOf(parentOf(parentOf(x)));
            if (colorOf(y) == RED) {
                setColor(parentOf(x), BLACK);
                setColor(y, BLACK);
                setColor(parentOf(parentOf(x)), RED);
                x = parentOf(parentOf(x));
            } else {
                if (x == rightOf(parentOf(x))) {
                    x = parentOf(x);
                    rotateLeft(x);
                }
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateRight(parentOf(parentOf(x)));
            }
        } else {
            Entry<K,V> y = leftOf(parentOf(parentOf(x)));
            if (colorOf(y) == RED) {
                setColor(parentOf(x), BLACK);
                setColor(y, BLACK);
                setColor(parentOf(parentOf(x)), RED);
                x = parentOf(parentOf(x));
            } else {
                if (x == leftOf(parentOf(x))) {
                    x = parentOf(x);
                    rotateRight(x);
                }
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateLeft(parentOf(parentOf(x)));
            }
        }
    }
    root.color = BLACK;
}

// 左旋
private void rotateLeft(Entry<K,V> p) {
    if (p != null) {
        Entry<K,V> r = p.right;
        p.right = r.left;
        if (r.left != null)
            r.left.parent = p;
        r.parent = p.parent;
        if (p.parent == null)
            root = r;
        else if (p.parent.left == p)
            p.parent.left = r;
        else
            p.parent.right = r;
        r.left = p;
        p.parent = r;
    }
}

// 右旋
private void rotateRight(Entry<K,V> p) {
    if (p != null) {
        Entry<K,V> l = p.left;
        p.left = l.right;
        if (l.right != null)
            l.right.parent = p;
        l.parent = p.parent;
        if (p.parent == null)
            root = l;
        else if (p.parent.right == p)
            p.parent.right = l;
        else
            p.parent.left = l;
        l.right = p;
        p.parent = l;
    }
}
```

## 六、NavigableMap 接口的扩展方法

TreeMap 实现了 NavigableMap 接口，提供了丰富的导航方法：

### 1. 边界相关方法

```java
// 返回小于指定键的最大键
public K lowerKey(K key) {}

// 返回小于等于指定键的最大键
public K floorKey(K key) {}

// 返回大于等于指定键的最小键
public K ceilingKey(K key) {}

// 返回大于指定键的最小键
public K higherKey(K key) {}

// 返回最小键
public K firstKey() {}

// 返回最大键
public K lastKey() {}
```

### 2. 子Map相关方法

```java
// 返回键在 [fromKey, toKey) 范围内的子Map
public NavigableMap<K,V> subMap(K fromKey, boolean fromInclusive,
                               K toKey,   boolean toInclusive) {}

// 返回键小于 toKey 的子Map
public NavigableMap<K,V> headMap(K toKey, boolean inclusive) {}

// 返回键大于 fromKey 的子Map
public NavigableMap<K,V> tailMap(K fromKey, boolean inclusive) {}

// 返回逆序的 Map
public NavigableMap<K,V> descendingMap() {}
```

### 3. 集合视图方法

```java
// 返回键的降序集合
public NavigableSet<K> descendingKeySet() {}

// 返回键的升序集合
public NavigableSet<K> navigableKeySet() {}
```

## 七、性能特点

1. **时间复杂度**：
   - get、put、remove 操作：O(log n)
   - 查找最大/最小键：O(log n)
   - 范围查询：O(log n + k)，其中 k 是结果集大小

2. **空间复杂度**：O(n)

3. **与 HashMap 的性能对比**：
   - TreeMap 对于顺序操作更高效
   - HashMap 对于随机访问操作更高效

## 八、使用注意事项

1. **键的约束**：
   - 不能使用 null 键（会抛出 NullPointerException）
   - 键必须具有可比性（实现 Comparable 或提供 Comparator）

2. **线程安全**：
   - 非线程安全，多线程环境需额外同步
   - 可使用 `Collections.synchronizedSortedMap()` 包装

3. **自定义比较器**：
   - 比较器的实现必须与 equals 方法保持一致
   - 即对于两个相等的对象，compare 方法应返回 0

4. **序列化**：
   - 支持序列化，但自定义的比较器也需要是可序列化的

## 九、使用示例

### 1. 基本使用（自然排序）

```java
import java.util.TreeMap;

public class TreeMapDemo {
    public static void main(String[] args) {
        // 创建 TreeMap（默认自然排序）
        TreeMap<Integer, String> map = new TreeMap<>();
        
        // 添加元素
        map.put(3, "Three");
        map.put(1, "One");
        map.put(2, "Two");
        map.put(5, "Five");
        map.put(4, "Four");
        
        // 遍历，按键排序
        System.out.println("按键自然排序:");
        map.forEach((k, v) -> System.out.println(k + ": " + v));
        
        // 导航方法
        System.out.println("\n导航方法示例:");
        System.out.println("第一个键: " + map.firstKey());
        System.out.println("最后一个键: " + map.lastKey());
        System.out.println("小于 3 的最大键: " + map.lowerKey(3));
        System.out.println("大于等于 3 的最小键: " + map.ceilingKey(3));
    }
}
```

### 2. 自定义排序

```java
import java.util.Comparator;
import java.util.TreeMap;

public class TreeMapCustomSortDemo {
    public static void main(String[] args) {
        // 创建使用自定义比较器的 TreeMap（按字符串长度排序）
        TreeMap<String, Integer> map = new TreeMap<>(Comparator.comparingInt(String::length));
        
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("pear", 5);
        map.put("orange", 15);
        
        System.out.println("按字符串长度排序:");
        map.forEach((k, v) -> System.out.println(k + ": " + v));
        
        // 范围查询
        System.out.println("\n键长度大于等于5的子Map:");
        map.tailMap("apple", true).forEach((k, v) -> System.out.println(k + ": " + v));
    }
}
```

### 3. 使用自定义类作为键

```java
import java.util.Comparator;
import java.util.TreeMap;

class Student implements Comparable<Student> {
    private String name;
    private int age;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 自然排序（按年龄）
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.age, other.age);
    }
    
    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + "}";
    }
}

public class TreeMapCustomKeyDemo {
    public static void main(String[] args) {
        // 自然排序
        TreeMap<Student, String> ageMap = new TreeMap<>();
        ageMap.put(new Student("Alice", 20), "Computer Science");
        ageMap.put(new Student("Bob", 22), "Mathematics");
        ageMap.put(new Student("Charlie", 19), "Physics");
        
        System.out.println("按年龄排序:");
        ageMap.forEach((k, v) -> System.out.println(k + " - " + v));
        
        // 按姓名排序的自定义比较器
        TreeMap<Student, String> nameMap = new TreeMap<>(Comparator.comparing(s -> s.toString().split("'")[1]));
        nameMap.putAll(ageMap);
        
        System.out.println("\n按姓名排序:");
        nameMap.forEach((k, v) -> System.out.println(k + " - " + v));
    }
}
```

## 十、常见问题

1. **TreeMap 为什么不允许 null 键？**
   - 因为排序需要比较，如果键为 null，无法进行比较操作
   - 而 null 值是允许的，因为值不参与排序

2. **TreeMap 如何保证线程安全？**
   - TreeMap 本身不是线程安全的
   - 可以使用 `Collections.synchronizedSortedMap(new TreeMap<>(...))`
   - 或在外部加锁同步

3. **红黑树和 AVL 树的区别？**
   - AVL 树是严格平衡的，红黑树是近似平衡的
   - AVL 树查询更快，但插入删除操作更慢
   - 红黑树在频繁修改的场景下性能更好

4. **TreeMap 和 LinkedHashMap 的选择？**
   - 如果需要按键排序，选择 TreeMap
   - 如果需要保持插入顺序或访问顺序，选择 LinkedHashMap
   - 如果对性能要求极高且不需要顺序，选择 HashMap

5. **如何处理 TreeMap 中的自定义类型键？**
   - 要么让键类实现 Comparable 接口
   - 要么在创建 TreeMap 时提供一个 Comparator
   - 确保比较逻辑与 equals 方法一致