# Java TreeSet 详解

## 1. 概述

`TreeSet` 是 Java 集合框架中 `java.util` 包下的一个类，它实现了 `NavigableSet` 接口（间接实现 `Set` 接口），底层基于 `TreeMap` 实现，是一种有序的集合。

- **特点**：
  - 元素唯一（无重复）
  - 元素有序（默认自然排序或自定义排序）
  - 非同步（线程不安全）
  - 不允许 `null` 元素（添加 `null` 会抛出 `NullPointerException`）


## 2. 底层实现

`TreeSet` 内部通过一个 `TreeMap` 来存储元素，其核心源码片段如下：

```java
public class TreeSet<E> extends AbstractSet<E>
    implements NavigableSet<E>, Cloneable, java.io.Serializable {
    // 底层使用 TreeMap 存储元素
    private transient NavigableMap<E, Object> m;

    // 用一个固定的对象作为 TreeMap 的 value
    private static final Object PRESENT = new Object();

    // 构造方法，初始化 TreeMap
    public TreeSet() {
        this(new TreeMap<>());
    }

    public TreeSet(Comparator<? super E> comparator) {
        this(new TreeMap<>(comparator));
    }

    TreeSet(NavigableMap<E, Object> m) {
        this.m = m;
    }
    // ... 其他方法
}
```

- 元素存储在 `TreeMap` 的 `key` 中，`value` 固定为一个静态常量 `PRESENT`（节省空间）
- 借助 `TreeMap` 的特性实现元素的排序和去重


## 3. 排序方式

`TreeSet` 的排序分为两种方式：

### 3.1 自然排序（默认）

- 要求元素类实现 `Comparable` 接口，并覆写 `compareTo()` 方法
- 示例：自定义类实现自然排序

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

// 使用自然排序的 TreeSet
TreeSet<Student> set = new TreeSet<>();
set.add(new Student("Alice", 20));
set.add(new Student("Bob", 18)); // 会按年龄排序
```


### 3.2 自定义排序

- 创建 `TreeSet` 时传入 `Comparator` 接口实现类（匿名内部类或 Lambda 表达式）
- 示例：使用自定义排序

```java
// 按年龄降序排序
TreeSet<Student> set = new TreeSet<>((s1, s2) -> 
    Integer.compare(s2.age, s1.age)
);

set.add(new Student("Alice", 20));
set.add(new Student("Bob", 18)); // 按年龄降序排列
```


## 4. 常用方法

### 4.1 基本操作

| 方法                | 说明                                  |
|---------------------|---------------------------------------|
| `add(E e)`          | 添加元素（成功返回 true，重复返回 false） |
| `remove(Object o)`  | 移除指定元素                          |
| `contains(Object o)`| 判断是否包含指定元素                  |
| `size()`            | 返回元素数量                          |
| `isEmpty()`         | 判断是否为空                          |
| `clear()`           | 清空集合                              |


### 4.2 导航方法（特有）

`TreeSet` 实现了 `NavigableSet` 接口，提供了丰富的导航方法：

| 方法                  | 说明                                  |
|-----------------------|---------------------------------------|
| `first()`             | 返回第一个元素（最小元素）            |
| `last()`              | 返回最后一个元素（最大元素）          |
| `lower(E e)`          | 返回小于 e 的最大元素                 |
| `higher(E e)`         | 返回大于 e 的最小元素                 |
| `floor(E e)`          | 返回小于等于 e 的最大元素             |
| `ceiling(E e)`        | 返回大于等于 e 的最小元素             |
| `pollFirst()`         | 移除并返回第一个元素                  |
| `pollLast()`          | 移除并返回最后一个元素                |


### 4.3 视图方法

| 方法                  | 说明                                  |
|-----------------------|---------------------------------------|
| `subSet(E fromElement, E toElement)` | 返回子集合 [fromElement, toElement)  |
| `headSet(E toElement)`              | 返回小于 toElement 的子集合           |
| `tailSet(E fromElement)`            | 返回大于等于 fromElement 的子集合     |


## 5. 去重原理

`TreeSet` 通过比较元素的结果来判断是否重复：
- 若 `compareTo()`（自然排序）或 `compare()`（自定义排序）返回 `0`，则认为元素重复，会被忽略
- 注意：与 `hashCode()` 和 `equals()` 方法无关，但建议保持一致性（即比较结果为 0 时，`equals()` 也应返回 true）


## 6. 性能分析

- **添加、删除、查询**：时间复杂度为 `O(log n)`（基于红黑树的特性）
- **遍历**：时间复杂度为 `O(n)`
- 不适合频繁修改元素（尤其是影响排序的字段），修改后可能导致集合秩序混乱


## 7. 注意事项

1. 线程不安全：多线程环境下需手动同步（如使用 `Collections.synchronizedSortedSet()`）
2. 排序一致性：元素的比较逻辑需保持稳定，避免在使用过程中修改影响排序的字段
3. 空元素：不允许添加 `null`（与 `HashSet` 不同）
4. 自定义对象排序：必须保证排序逻辑正确，否则可能导致集合行为异常


## 8. 与 HashSet 的区别

| 特性         | TreeSet                  | HashSet                  |
|--------------|--------------------------|--------------------------|
| 底层实现     | TreeMap                  | HashMap                  |
| 排序         | 有序（自然/自定义排序）  | 无序（哈希表顺序）       |
| 去重依据     | compareTo()/compare()    | hashCode() + equals()    |
| 时间复杂度   | 添加/删除 O(log n)       | 添加/删除 O(1)（平均）   |
| 空元素       | 不允许                   | 允许一个 null            |


## 9. 适用场景

- 需要有序存储且无重复元素的场景
- 需要频繁进行范围查询（如获取小于/大于某个值的元素）
- 不适合对性能要求极高的插入/删除操作场景（此时优先考虑 `HashSet`）