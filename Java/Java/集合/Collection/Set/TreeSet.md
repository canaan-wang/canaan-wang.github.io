# Java TreeSet 详解

## 一、概述

`TreeSet` 是 Java 集合框架中 `java.util` 包下的有序集合实现类，实现了 `NavigableSet` 接口（间接实现 `Set` 接口），底层基于 `TreeMap` 实现。

**核心特点**：
- 元素唯一（基于比较结果去重）
- 元素有序（支持自然排序或自定义排序）
- 非线程安全
- JDK 7 及以上版本不允许添加 `null` 元素


## 二、底层实现

`TreeSet` 内部通过 `TreeMap` 存储元素，利用红黑树结构实现有序性。核心实现细节：

```java
public class TreeSet<E> extends AbstractSet<E>
    implements NavigableSet<E>, Cloneable, java.io.Serializable {
    // 底层存储结构
    private transient NavigableMap<E, Object> m;
    // 所有元素共享的占位值
    private static final Object PRESENT = new Object();

    // 构造方法
    public TreeSet() {
        this(new TreeMap<>());
    }

    public TreeSet(Comparator<? super E> comparator) {
        this(new TreeMap<>(comparator));
    }
    // ...
}
```

- 元素存储在 `TreeMap` 的 `key` 部分，`value` 统一为常量 `PRESENT`
- 完全复用 `TreeMap` 的排序和去重机制


## 三、排序方式

`TreeSet` 支持两种排序方式：

### 3.1 自然排序（默认）

元素类需实现 `Comparable` 接口并覆写 `compareTo()` 方法：

```java
public class Student implements Comparable<Student> {
    private String name;
    private int age;

    // 按年龄升序排序
    @Override
    public int compareTo(Student o) {
        return Integer.compare(this.age, o.age);
    }

    // 构造方法、getter、setter 省略
}

// 使用示例
TreeSet<Student> set = new TreeSet<>();
set.add(new Student("Alice", 20));
set.add(new Student("Bob", 18)); // 存储时会按年龄排序
```


### 3.2 自定义排序

通过构造函数传入 `Comparator` 接口实现：

```java
// 按年龄降序排序（Lambda 表达式）
TreeSet<Student> set = new TreeSet<>((s1, s2) -> 
    Integer.compare(s2.age, s1.age)
);

set.add(new Student("Alice", 20));
set.add(new Student("Bob", 18)); // 将按 20, 18 顺序存储
```


## 四、核心方法

### 4.1 基本操作方法

| 方法                | 说明                                  |
|---------------------|---------------------------------------|
| `add(E e)`          | 添加元素（成功返回 true，重复返回 false） |
| `remove(Object o)`  | 移除指定元素                          |
| `contains(Object o)`| 判断是否包含指定元素                  |
| `size()`            | 返回元素数量                          |
| `isEmpty()`         | 判断是否为空                          |
| `clear()`           | 清空集合                              |

### 4.2 导航方法（NavigableSet 特性）

`TreeSet` 最具特色的是提供了丰富的导航方法：

| 方法                  | 说明                                  |
|-----------------------|---------------------------------------|
| `first()`             | 返回第一个（最小）元素                |
| `last()`              | 返回最后一个（最大）元素              |
| `lower(E e)`          | 返回小于 e 的最大元素                 |
| `higher(E e)`         | 返回大于 e 的最小元素                 |
| `floor(E e)`          | 返回小于等于 e 的最大元素             |
| `ceiling(E e)`        | 返回大于等于 e 的最小元素             |
| `pollFirst()`         | 移除并返回第一个元素                  |
| `pollLast()`          | 移除并返回最后一个元素                |

### 4.3 范围视图方法

| 方法                  | 说明                                  |
|-----------------------|---------------------------------------|
| `subSet(from, to)`   | 返回子集合 [from, to)                 |
| `headSet(to)`        | 返回小于 to 的所有元素                |
| `tailSet(from)`      | 返回大于等于 from 的所有元素          |


## 五、去重原理

`TreeSet` 基于比较结果判断元素是否重复：
- 当 `compareTo()`（自然排序）或 `compare()`（自定义排序）返回 `0` 时，认为元素重复
- 虽然与 `hashCode()` 和 `equals()` 无直接关系，但**强烈建议**保持三者逻辑一致，即比较结果为 0 时 `equals()` 应返回 true


## 六、性能分析

- **添加、删除、查询**：时间复杂度 `O(log n)`（基于红黑树实现）
- **遍历**：时间复杂度 `O(n)`
- **注意**：不要在使用过程中修改元素的关键排序字段，这会破坏集合的有序性


## 七、注意事项

1. **线程安全问题**：多线程环境下需额外同步，可使用 `Collections.synchronizedSortedSet()`
2. **排序稳定性**：确保比较逻辑稳定，不要修改已存储元素的排序关键属性
3. **空值限制**：JDK 7 及以上版本不允许 `null` 元素
4. **比较器一致性**：比较逻辑必须正确实现，避免出现不一致的排序行为


## 八、适用场景

- 需要**有序存储**且无重复元素的场景
- 需要频繁进行**范围查询**（如获取小于/大于某个值的元素）
- 需要快速获取最大/最小元素的场景
- 不适合对插入/删除性能要求极高的场景（此时应选择 `HashSet`）