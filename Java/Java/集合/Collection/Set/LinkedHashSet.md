# LinkedHashSet

## 一、基本定义

LinkedHashSet 是 Java 集合框架中 `java.util` 包下的类，继承自 `HashSet` 并实现 `Set` 接口。其核心特性是：**在保证元素唯一性的基础上，额外维护元素的插入顺序**。

类定义源码：
```java
public class LinkedHashSet<E> extends HashSet<E> implements Set<E>, Cloneable, java.io.Serializable {
    // 构造方法及核心逻辑
}
```

## 二、核心特点

LinkedHashSet 具备以下核心特点：

- **元素唯一**：继承自 HashSet，基于哈希表实现，通过元素的 `hashCode()` 和 `equals()` 方法保证元素不重复<br/>
- **有序性**：底层依赖 **LinkedHashMap**（而非 HashMap）内部的双向链表维护元素的**插入顺序**（非自然排序），遍历集合时按添加顺序输出，这是与 HashSet 的核心区别<br/>
- **非线程安全**：无内置同步机制，多线程环境下并发修改可能导致数据异常或 ConcurrentModificationException<br/>
- **允许存储 null**：支持存储一个 null 元素（遵循 LinkedHashMap 的 null 处理机制）<br/>

## 三、底层实现原理

### 3.1 构造方法设计

LinkedHashSet 通过调用 HashSet 的特殊构造方法实现所有构造方法均传入 `LinkedHashMap` 实例，从而将底层存储结构指定为 LinkedHashMap，有序性和唯一性均由 LinkedHashMap 保证。

核心构造方法源码：
```java
// 无参构造
public LinkedHashSet() {
    super(new LinkedHashMap<>());
}

// 指定初始容量的构造
public LinkedHashSet(int initialCapacity) {
    super(new LinkedHashMap<>(initialCapacity));
}

// 指定初始容量和加载因子的构造
public LinkedHashSet(int initialCapacity, float loadFactor) {
    super(new LinkedHashMap<>(initialCapacity, loadFactor));
}

// 传入集合的构造
public LinkedHashSet(Collection<? extends E> c) {
    super(new LinkedHashMap<>(Math.max((int) (c.size()/.75f) + 1, 16)));
    addAll(c);
}
```

## 四、与 HashSet、TreeSet 的区别

LinkedHashSet、HashSet、TreeSet 对比表：

|特性|LinkedHashSet|HashSet|TreeSet|
|---|---|---|---|
|底层结构|LinkedHashMap（哈希桶+双向链表）|HashMap（哈希桶）|TreeMap（红黑树）|
|有序性|有（插入顺序）|无|有（自然排序或定制排序）|
|元素唯一性|hashCode() + equals()|hashCode() + equals()|compareTo() 或 compare()（无重写时同前）|
|查询效率|平均 O(1)（略低于 HashSet）|平均 O(1)|O(log n)（红黑树查找）|
|是否允许 null|是（仅一个）|是（仅一个）|否（自然排序时会抛异常）|
## 五、使用场景

基于“唯一且有序”的核心特性，LinkedHashSet 适用于：

- **需要去重且保留插入顺序的场景**：如记录用户操作日志（按顺序展示且避免重复）、收集需按添加顺序加载的不重复配置项
- **需要稳定遍历顺序的场景**：当业务依赖遍历集合顺序（如报表生成、数据导出），且不希望顺序随机变化
- **有序去重需求**：当 HashSet 的无序性无法满足需求，且不需要 TreeSet 的排序功能时，LinkedHashSet 是轻量选择

## 六、注意事项


### 6.1 元素修改风险
- 若集合中自定义对象的属性在加入后被修改，可能导致 `hashCode()` 或 `equals()` 结果变化，破坏元素唯一性
- 建议：将存入 LinkedHashSet 的元素设为不可变对象；或避免修改影响 `hashCode` 和 `equals` 结果的属性

### 6.2 性能优化
- **初始容量选择**：初始容量过小会导致频繁扩容，过大会浪费内存。默认加载因子 0.75（平衡时间与空间效率）
- **批量插入优化**：插入大量元素时，预设合适的初始容量（如 `new LinkedHashSet<>(预计元素数 * 2)`）可减少扩容次数


### 6.3 序列化注意事项
- 自定义对象作为元素时，需确保对象也实现 `Serializable` 接口
- 反序列化后，元素的插入顺序会被保留