# ConcurrentSkipListSet

## 一、定义与概述

**ConcurrentSkipListSet** 是 Java 并发集合框架中的一个线程安全的有序集合实现，基于跳表（Skip List）数据结构，实现了 `NavigableSet` 接口。它提供了与 `TreeSet` 类似的排序功能，但具有更好的并发性能，适用于高并发环境下需要有序集合的场景。

## 二、核心特性

- **线程安全**：支持多线程并发读写操作，无需额外同步
- **有序性**：元素按照自然顺序或自定义比较器排序
- **无界集合**：理论上可以存储无限多的元素
- **不允许 null 元素**：与 TreeSet 类似，不支持 null 元素
- **支持并发修改**：迭代器弱一致（weakly consistent），不会抛出 `ConcurrentModificationException`
- **实现了 NavigableSet 接口**：提供丰富的导航方法（如 lower、higher、ceiling、floor 等）

## 三、实现原理

### 1. 底层数据结构

ConcurrentSkipListSet 内部通过包装一个 `ConcurrentSkipListMap` 来实现，元素作为 ConcurrentSkipListMap 的键（key）存储，值（value）使用一个常量对象。这种设计复用了 ConcurrentSkipListMap 的并发控制机制和跳表实现。

### 2. 跳表原理

跳表是一种基于链表的数据结构，通过在链表上增加多层索引来加速查找操作：

- **层级结构**：底层是完整的有序链表，每个节点可能在更高层出现
- **概率性构建**：新节点插入时，通过随机数决定其层数
- **查找路径**：从最高层开始，向右比较，小于目标值则向右，否则向下移动
- **时间复杂度**：查找、插入、删除操作的平均时间复杂度为 O(log n)

### 3. 并发控制

- **无锁设计**：使用 CAS（Compare-And-Swap）操作保证线程安全
- **节点添加**：从高到低逐层尝试插入，失败则回退重试
- **节点删除**：标记删除法，先标记节点为删除状态，再物理移除
- **弱一致性迭代器**：迭代器反映创建时或稍后的集合状态，可能不包含并发添加的元素

## 四、使用方法

### 1. 创建实例

```java
// 自然排序（元素需实现 Comparable 接口）
ConcurrentSkipListSet<String> set1 = new ConcurrentSkipListSet<>();

// 自定义比较器
ConcurrentSkipListSet<Integer> set2 = new ConcurrentSkipListSet<>(Collections.reverseOrder());

// 从现有集合创建
Set<String> source = new HashSet<>(Arrays.asList("a", "b", "c"));
ConcurrentSkipListSet<String> set3 = new ConcurrentSkipListSet<>(source);
```

### 2. 基本操作

```java
ConcurrentSkipListSet<String> set = new ConcurrentSkipListSet<>();

// 添加元素
set.add("Java");
set.add("Python");
set.add("Go");

// 删除元素
set.remove("Python");

// 检查元素是否存在
boolean contains = set.contains("Java");

// 获取大小
int size = set.size();

// 清空集合
set.clear();
```

### 3. 导航方法（NavigableSet 特有）

```java
ConcurrentSkipListSet<Integer> nums = new ConcurrentSkipListSet<>(
    Arrays.asList(10, 20, 30, 40, 50));

// 获取小于 30 的最大元素
Integer lower = nums.lower(30); // 20

// 获取小于等于 30 的最大元素
Integer floor = nums.floor(30); // 30

// 获取大于 30 的最小元素
Integer higher = nums.higher(30); // 40

// 获取大于等于 30 的最小元素
Integer ceiling = nums.ceiling(30); // 30

// 获取第一个元素
Integer first = nums.first(); // 10

// 获取最后一个元素
Integer last = nums.last(); // 50

// 获取并移除第一个元素
Integer pollFirst = nums.pollFirst(); // 10

// 获取并移除最后一个元素
Integer pollLast = nums.pollLast(); // 50
```

### 4. 视图操作

```java
ConcurrentSkipListSet<Integer> set = new ConcurrentSkipListSet<>(
    Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));

// 获取子集 [3, 7]
NavigableSet<Integer> subSet = set.subSet(3, true, 7, true);

// 获取头部视图（小于 5 的元素）
NavigableSet<Integer> headSet = set.headSet(5, false);

// 获取尾部视图（大于等于 6 的元素）
NavigableSet<Integer> tailSet = set.tailSet(6, true);

// 获取逆序视图
NavigableSet<Integer> descSet = set.descendingSet();
```

## 五、并发性能特点

### 1. 读操作性能

- 读操作不需要锁，并发性能极高
- 多线程可以同时读取，互不干扰
- 读操作不会阻塞写操作，写操作也不会阻塞读操作

### 2. 写操作性能

- 写操作采用无锁 CAS 机制，减少线程阻塞
- 不同区域的写操作可以并行执行
- 高并发写入时，可能会出现 CAS 重试，影响性能

### 3. 内存开销

- 跳表结构需要额外的索引空间，内存占用较高
- 每个节点可能出现在多个层级中，增加了内存消耗

## 六、使用注意事项

### 1. 元素比较的一致性

- 元素的比较逻辑（compareTo 或比较器）必须与 equals 方法保持一致，否则可能破坏集合的契约
- 当自定义比较器时，要确保比较结果的正确性和一致性

### 2. 性能考量

- 对于不需要排序的场景，优先考虑使用 ConcurrentHashMap 包装的 Set
- 读多写少的场景，可考虑 CopyOnWriteArraySet
- 元素数量较少时，简单同步的 TreeSet 可能更高效

### 3. 避免的操作

- 不要在迭代过程中依赖集合的当前状态（迭代器是弱一致性的）
- 避免频繁的范围操作（如 subSet、headSet、tailSet），可能影响性能
- 不要存储大量 null 元素（不允许存储 null）

### 4. 并发安全保证

- 单个操作是原子的，但复合操作（如 "检查后更新"）需要额外同步
- 迭代器不会抛出 ConcurrentModificationException，但也不保证反映最新状态

## 七、应用场景

1. **高并发排序集合**：需要在多线程环境下维护有序集合
2. **并发查找和遍历**：需要频繁并发读取和遍历有序元素
3. **区间操作**：需要频繁进行范围查询、头尾元素操作
4. **事件调度**：按时间顺序存储和处理事件
5. **优先级队列替代**：当需要按顺序访问所有元素时

## 八、总结

ConcurrentSkipListSet 是一个功能强大的线程安全有序集合实现，通过跳表数据结构和无锁并发控制机制，在保证线程安全的同时提供了良好的并发性能。它适用于需要在高并发环境下维护有序集合，并且有频繁的查找、插入、删除操作的场景。在选择使用时，需要权衡其排序功能、并发性能和内存开销，根据具体业务需求做出合适的选择。

**最后更新时间：2024-01-15**