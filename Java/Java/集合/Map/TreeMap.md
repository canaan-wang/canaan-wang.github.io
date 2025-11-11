# TreeMap

## 一、TreeMap 概述

- **定义**：`java.util.TreeMap` 是基于红黑树实现的有序键值对集合，实现了 `NavigableMap` 接口
- **核心特点**：
  - 非线程安全
  - 按键有序（自然排序或定制排序）
  - 不允许 null 键（但允许 null 值）
  - 访问、插入和删除操作的时间复杂度为 O(log n)

## 二、底层数据结构

### 2.1 红黑树简介

TreeMap 底层使用红黑树实现，红黑树是一种自平衡的二叉搜索树，具有以下特性：
- 自平衡，保证树高为 O(log n)
- 每个节点有颜色属性（红色或黑色）
- 通过旋转和变色操作维护平衡性
- 适合需要频繁插入、删除和范围查询的场景

## 三、排序机制

TreeMap 提供两种排序方式：

### 3.1 自然排序
- 要求键实现 `Comparable` 接口
- 使用键的 `compareTo()` 方法进行比较
- 适用于具有自然顺序的类（如 Integer、String 等）

### 3.2 定制排序
- 通过构造函数传入 `Comparator` 接口实现
- 使用比较器的 `compare()` 方法进行比较
- 适用于自定义类或需要非标准排序的场景

## 四、核心构造函数

```java
// 默认构造函数，使用自然排序
public TreeMap() {}

// 使用指定比较器
public TreeMap(Comparator<? super K> comparator) {}

// 使用已有的 Map 初始化
public TreeMap(Map<? extends K, ? extends V> m) {}

// 使用已有的 SortedMap 初始化，保持其排序方式
public TreeMap(SortedMap<K, ? extends V> m) {}
```

## 五、NavigableMap 导航功能

TreeMap 实现了 NavigableMap 接口，提供丰富的导航方法：

### 5.1 边界查找方法
- `firstKey()` / `lastKey()`: 获取最小/最大键
- `lowerKey(K)`: 获取小于指定键的最大键
- `floorKey(K)`: 获取小于等于指定键的最大键
- `ceilingKey(K)`: 获取大于等于指定键的最小键
- `higherKey(K)`: 获取大于指定键的最小键

### 5.2 范围视图方法
- `subMap(K fromKey, boolean fromInclusive, K toKey, boolean toInclusive)`: 获取键在指定范围内的子Map
- `headMap(K toKey, boolean inclusive)`: 获取键小于指定键的子Map
- `tailMap(K fromKey, boolean inclusive)`: 获取键大于指定键的子Map
- `descendingMap()`: 获取逆序的Map

## 六、使用注意事项

- **键的约束**：
  - 不能使用null键（会抛出NullPointerException）
  - **键必须具有可比性**（实现Comparable或提供Comparator）
- **线程安全**：非线程安全，多线程环境需额外同步
- **比较器一致性**：比较器实现必须与equals方法保持一致