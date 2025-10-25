# LinkedHashSet

## 一、基本定义

LinkedHashSet 是 Java 集合框架中 `java.util` 包下的类，继承自 `HashSet`，同时实现了 `Set` 接口。其核心定位是：**在 HashSet 保证元素唯一性的基础上，额外维护元素的插入顺序**，避免了 HashSet 元素存储顺序无序的问题。

类定义源码：

```java

public class LinkedHashSet<E> extends HashSet<E> implements Set<E>, Cloneable, java.io.Serializable {
    // 构造方法及核心逻辑
}
```

## 二、核心特点

结合继承关系和底层实现，LinkedHashSet 具备以下 4 个核心特点，可对比 HashSet 理解：

1. **元素唯一**：继承自 HashSet，基于哈希表（HashMap）实现，通过元素的 `hashCode()` 和 `equals()` 方法保证元素不重复。

2. **有序性**：维护元素的**插入顺序**（而非自然排序），遍历集合时会按照元素添加的先后顺序输出，这是与 HashSet 最核心的区别。

3. **非线程安全**：与 HashSet、HashMap 一致，LinkedHashSet 没有线程同步机制，多线程环境下并发修改可能导致数据异常或 ConcurrentModificationException。

4. **允许存储 null 元素**：由于底层依赖 HashMap，支持存储一个 null 元素（因 null 的 hashCode 固定，且 equals 方法可区分，保证唯一性）。

## 三、底层实现原理

### 3.1 依赖 HashSet 的构造方法

HashSet 提供了一个包访问权限的构造方法，允许传入一个 `Map` 实例作为底层存储容器。LinkedHashSet 的所有构造方法都会调用这个方法，并传入 `LinkedHashMap` 实例，从而将底层存储容器指定为 LinkedHashMap。

LinkedHashSet 核心构造方法源码：

```java

// 无参构造：调用 HashSet 的构造方法，传入 LinkedHashMap
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

关键结论：**LinkedHashSet 的底层存储容器是 LinkedHashMap**，其有序性和唯一性均由 LinkedHashMap 保证。

### 3.2 LinkedHashMap 维护插入顺序的原理

LinkedHashMap 是 HashMap 的子类，在 HashMap 哈希桶（数组+链表/红黑树）的基础上，额外维护了一个**双向链表**，用于记录元素的插入顺序。每次添加元素时，除了按照 HashMap 的规则存入哈希桶，还会将元素节点加入双向链表的尾部；遍历集合时，直接遍历这个双向链表即可按插入顺序输出元素。

## 四、常用 API 操作

LinkedHashSet 没有新增独有的方法，所有方法均继承自 HashSet 和 Collection 接口，核心常用 API 如下（按功能分类）：

### 4.1 添加元素

- `boolean add(E e)`：添加指定元素，若元素已存在则不添加并返回 false；若不存在则添加并返回 true（遵循“唯一且有序”规则）。

- `boolean addAll(Collection<? extends E> c)`：添加指定集合中的所有元素，返回是否成功添加至少一个元素。

### 4.2 删除元素

- `boolean remove(Object o)`：删除指定元素，若存在则删除并返回 true，否则返回 false；删除时会同时更新哈希桶和双向链表。

- `boolean removeAll(Collection<?> c)`：删除集合中与指定集合交集的所有元素，返回是否有元素被删除。

- `void clear()`：清空集合中所有元素，哈希桶和双向链表均会被重置。

### 4.3 查询与判断

- `boolean contains(Object o)`：判断集合是否包含指定元素，基于元素的 hashCode 和 equals 方法判断，查询效率与 HashMap 一致（平均 O(1)）。

- `int size()`：返回集合中元素的个数。

- `boolean isEmpty()`：判断集合是否为空（size == 0 时返回 true）。

### 4.4 遍历元素

由于维护了插入顺序，遍历 LinkedHashSet 时会按元素添加顺序输出，常用遍历方式：

```java

LinkedHashSet<String> set = new LinkedHashSet<>();
set.add("A");
set.add("B");
set.add("C");

// 1. 增强 for 循环（最常用）
for (String s : set) {
    System.out.println(s); // 输出：A、B、C（插入顺序）
}

// 2. 迭代器遍历
Iterator<String> iterator = set.iterator();
while (iterator.hasNext()) {
    System.out.println(iterator.next());
}

// 3. 转换为数组遍历
Object[] array = set.toArray();
for (Object obj : array) {
    System.out.println(obj);
}
```

## 五、元素唯一性的保证机制

LinkedHashSet 元素唯一性的保证逻辑与 HashSet 完全一致，核心依赖元素的 `hashCode()` 和 `equals()` 方法，具体流程：

1. 当调用 `add(E e)` 方法添加元素时，先调用元素 e 的 `hashCode()` 方法计算哈希值，根据哈希值定位到底层 LinkedHashMap 中的哈希桶位置。

2. 若该哈希桶为空，则直接将元素存入桶中。

3. 若该哈希桶不为空，则通过元素的 `equals()` 方法与桶中已有的元素逐一比较：
        若存在 equals 为 true 的元素，则认为元素已存在，不进行添加。

4. 若所有元素 equals 均为 false，则将新元素添加到桶中（链表或红黑树节点），同时加入双向链表尾部。


      注意：若自定义对象作为 LinkedHashSet 的元素，必须重写 `hashCode()` 和 `equals()` 方法，否则会默认使用 Object 类的方法（基于地址值计算哈希，只有同一对象才相等），导致无法正确保证唯一性。
    

## 六、与 HashSet、TreeSet 的区别

LinkedHashSet、HashSet、TreeSet 均实现了 Set 接口，核心区别在于“有序性”和“排序规则”，对比表如下：

|特性|LinkedHashSet|HashSet|TreeSet|
|---|---|---|---|
|底层结构|LinkedHashMap（哈希桶+双向链表）|HashMap（哈希桶）|TreeMap（红黑树）|
|有序性|有（插入顺序）|无|有（自然排序或定制排序）|
|元素唯一性|hashCode() + equals()|hashCode() + equals()|compareTo() 或 compare()（无重写时同前）|
|查询效率|平均 O(1)（略低于 HashSet，因维护链表）|平均 O(1)|O(log n)（红黑树查找）|
|是否允许 null|是（仅一个）|是（仅一个）|否（自然排序时会抛异常）|
## 七、使用场景

基于“唯一且有序”的核心特性，LinkedHashSet 适用于以下场景：

- **需要去重且保留插入顺序的场景**：例如，记录用户操作日志（需按操作先后顺序展示，且避免重复操作记录）、收集不重复的配置项且需按添加顺序加载。

- **需要稳定遍历顺序的场景**：若业务中依赖遍历集合的顺序（如报表生成、数据导出），且不希望顺序随机变化，LinkedHashSet 是比 HashSet 更合适的选择。

- **替代 HashSet 实现有序去重**：当 HashSet 的无序性无法满足需求，且不需要 TreeSet 的排序功能时，LinkedHashSet 是更轻量的选择（查询效率接近 HashSet）。

## 八、注意事项

1. **线程安全问题**：
   - LinkedHashSet 本身是非线程安全的，在多线程环境中，若有多个线程同时对其进行修改（如添加、删除元素），可能会导致数据不一致或抛出 `ConcurrentModificationException`。
   - 解决方式：可通过 `Collections.synchronizedSet(new LinkedHashSet<>())` 包装成线程安全的集合；或在 JDK 1.5+ 中使用 `ConcurrentHashMap` 相关集合替代（需结合场景设计）。

2. **元素修改与唯一性**：
   - 若集合中的元素是自定义对象，且对象的属性在加入集合后被修改，可能导致 `hashCode()` 或 `equals()` 结果变化，破坏元素唯一性。
   - 例如：自定义对象 `User` 以 `id` 作为 `hashCode` 和 `equals` 的依据，加入集合后修改 `id`，会导致集合无法正确识别该元素（既无法通过 `contains()` 找到，也可能插入重复元素）。
   - 建议：将存入 LinkedHashSet 的元素设为不可变对象；或避免修改影响 `hashCode` 和 `equals` 结果的属性。

3. **初始容量与加载因子**：
   - 与 HashSet 类似，初始容量（底层 LinkedHashMap 的数组长度）和加载因子（扩容阈值比例）会影响性能。
   - 初始容量过小会导致频繁扩容（重新哈希），初始容量过大则浪费内存。加载因子默认 0.75（平衡时间与空间效率），若需频繁插入大量元素，可预设合适的初始容量（如 `new LinkedHashSet<>(预计元素数 * 2)`）减少扩容次数。

4. **遍历与迭代器行为**：
   - 迭代器遍历过程中，若通过集合的 `add()`、`remove()` 等方法修改集合结构（非迭代器的 `remove()` 方法），会触发 `ConcurrentModificationException`（快速失败机制）。
   - 示例：
     ```java
     Iterator<String> it = set.iterator();
     while (it.hasNext()) {
         if (it.next().equals("A")) {
             set.remove("A"); // 触发异常
         }
     }
     ```
   - 正确做法：使用迭代器的 `remove()` 方法修改集合：
     ```java
     if (it.next().equals("A")) {
         it.remove(); // 安全删除
     }
     ```

5. **序列化与反序列化**：
   - LinkedHashSet 实现了 `Serializable` 接口，支持序列化，但需注意：
     - 若元素为自定义对象，需保证对象也可序列化（实现 `Serializable`），否则会抛出 `NotSerializableException`。
     - 反序列化后，元素的插入顺序会被保留（因 LinkedHashMap 的双向链表结构会被序列化）。

6. **与 HashMap 扩容的关联**：
   - 底层 LinkedHashMap 扩容时，会重新计算所有元素的哈希值并迁移到新数组，同时重建双向链表，此过程会消耗一定性能。因此，避免在高频插入场景中使用过小的初始容量。

7. **内存占用**：
   - 相比 HashSet，LinkedHashSet 因维护双向链表，每个元素节点多存储两个引用（前驱和后继），内存占用略高。在内存敏感场景中，需权衡有序性需求与内存消耗。