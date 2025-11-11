# Hashtable

## 一、Hashtable 概述

- **定义**：`java.util.Hashtable` 是 Java 最早的键值对存储实现之一，是一个线程安全的哈希表
- **继承关系**：继承自 `Dictionary`，实现了 `Map`、`Cloneable`、`Serializable` 接口
- **核心特点**：
  - 线程安全（所有方法使用 synchronized 同步）
  - 不允许 null 键和 null 值（设计决策，确保所有键值都有意义）
  - 无序存储（插入顺序与遍历顺序不一致）
  - 性能较低，高并发场景下效率不高

## 二、底层数据结构

### 1. 数据结构
- **数组 + 链表**：
  - 数组（称为桶/bucket）作为主体
  - 链表解决哈希冲突（拉链法）
  - 注意：Hashtable 没有引入红黑树优化（与 JDK 8+ 的 HashMap 不同）

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
}
```

## 三、核心参数与构造函数

### 1. 核心参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| DEFAULT_INITIAL_CAPACITY | 11 | 默认初始容量（非 2 的幂） |
| MAX_ARRAY_SIZE | Integer.MAX_VALUE - 8 | 最大数组大小 |
| DEFAULT_LOAD_FACTOR | 0.75f | 默认负载因子 |

### 2. 构造函数
Hashtable 提供了多种构造函数，支持默认初始化、指定容量和负载因子，以及从其他 Map 复制初始化。核心初始化逻辑是设置容量、负载因子并创建数组。

## 四、关键方法原理

### 1. put 方法
- 首先检查 value 不为 null
- 计算 key 的哈希值和数组索引
- 查找是否存在相同 key，有则替换值并返回旧值
- 不存在则创建新节点并添加到链表头部
- 若元素数量超过阈值，则触发扩容

### 2. get 方法
- 计算 key 的哈希值和数组索引
- 遍历对应链表查找匹配的 key
- 找到则返回对应 value，否则返回 null

### 3. rehash 方法（扩容机制）
- 新容量 = 原容量 * 2 + 1
- 创建新数组并重新计算所有元素的哈希索引
- 将元素迁移到新数组中

## 五、线程安全实现

Hashtable 通过在公共方法上使用 `synchronized` 关键字实现线程安全，这导致了以下问题：
1. **全表锁**：任何操作都会锁定整个表
2. **阻塞严重**：读取操作也会阻塞其他所有操作
3. **并发效率低**：多线程环境下性能较差

## 六、性能特点

- **时间复杂度**：基本操作平均 O(1)，哈希冲突严重时退化为 O(n)
- **并发性能**：由于全表锁，并发性能较差
- **内存占用**：数据结构简单，内存占用相对较小

## 七、使用注意事项

1. **null 值处理**：不允许 null 键或值，否则抛出 NullPointerException
2. **线程安全**：单线程用 HashMap，多线程用 ConcurrentHashMap
3. **容量设置**：预知数据量时设置合适初始容量，计算公式为：预期元素数量 / 负载因子
4. **键的设计**：键对象必须重写 hashCode() 和 equals() 方法
5. **遍历方式**：推荐使用 entrySet() 进行遍历