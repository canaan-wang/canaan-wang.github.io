# HashSet

## 一、基础认知：什么是 HashSet？

### 1.1 核心定义

HashSet 是 Java 集合框架中 `java.util` 包下的实现类，核心实现 `Set` 接口，间接实现 `Collection` 和 `Iterable` 接口，是基于哈希表的**无序、不可重复**集合。
### 1.2 核心特性速览

- 不可重复性：无重复元素，依赖 `hashCode()` 和 `equals()` 实现

- 无序性：存储与迭代顺序不与添加顺序一致，且不保证永久不变

- 允许null：仅支持存储1个null元素（哈希值固定为0）

- 非线程安全：并发修改可能导致数据不一致或异常

- 无索引：无通过索引访问元素的方法（如 `get(int index)`）

## 二、底层原理：HashSet 如何工作？

### 2.1 底层依赖：HashMap

HashSet 本身无独立存储结构，**完全依赖 HashMap 实现**：将元素作为 HashMap 的「键（Key）」存储，值（Value）固定使用一个空对象 `PRESENT` 占位。

```java

// HashSet 核心成员变量（JDK 源码简化）
private transient HashMap<E, Object> map; // 底层存储容器
private static final Object PRESENT = new Object(); // 固定值占位
```

### 2.2 初始化机制

所有构造方法本质是初始化底层 HashMap，关键参数为「初始容量」和「负载因子」：

|构造方法|核心作用|默认值|
|---|---|---|
|HashSet()|默认初始化|容量16，负载因子0.75|
|HashSet(int initialCapacity)|指定初始容量|负载因子0.75|
|HashSet(int initialCapacity, float loadFactor)|指定容量和负载因子|无默认，需手动传入|
|HashSet(Collection<? extends E> c)|集合转换|容量为集合大小1.5倍，负载因子0.75|
### 2.3 核心逻辑：添加与去重流程

HashSet 不可重复性的核心是 HashMap 的键去重逻辑，步骤如下：

1. **计算哈希值**：调用元素的 `hashCode()` 得到哈希值，通过哈希算法转换为 HashMap 数组的索引

2. **判断索引位置**：
        索引为空：直接将元素作为键、PRESENT作为值存入，添加成功

3. 索引非空（哈希冲突）：调用 `equals()` 与该位置元素对比
            equals返回true：元素已存在，添加失败（去重核心）

4. equals返回false：通过链表（JDK1.7及以前）或红黑树（JDK1.8+，链表长度≥8时）解决冲突，挂载新元素


      关键原则：存储自定义对象时，必须重写 `hashCode()` 和 `equals()`，且需满足「相等对象必同哈希值，同哈希值对象不一定相等」
    

## 三、常用方法：实操必备

所有方法均间接调用 HashMap 对应方法，核心方法按功能分类如下：

### 3.1 增删改查核心方法

|方法签名|功能描述|返回值/注意事项|
|---|---|---|
|boolean add(E e)|添加元素|成功返回true，已存在返回false|
|boolean remove(Object o)|删除指定元素|存在并删除返回true，否则false|
|boolean contains(Object o)|判断元素是否存在|存在返回true，时间复杂度接近O(1)|
|void clear()|清空所有元素|无返回值，底层清空HashMap|
|int size()|获取元素个数|返回int类型数量|
|boolean isEmpty()|判断集合是否为空|空返回true，否则false|
### 3.2 遍历方式

无索引，支持3种遍历方式，推荐根据场景选择：
> （注：文档部分内容可能由 AI 生成）### 3.2.1 迭代器遍历
通过 `iterator()` 方法获取迭代器，遍历集合元素：
```java
HashSet<String> set = new HashSet<>();
set.add("apple");
set.add("banana");
Iterator<String> iterator = set.iterator();
while (iterator.hasNext()) {
    String element = iterator.next();
    System.out.println(element);
}
```
- 特点：支持在遍历过程中通过 `iterator.remove()` 安全删除元素，若使用集合的 `remove()` 方法可能抛出 `ConcurrentModificationException`。


### 3.2.2 增强 for 循环遍历
基于迭代器的简化语法，适用于仅读取元素的场景：
```java
HashSet<String> set = new HashSet<>();
set.add("cat");
set.add("dog");
for (String element : set) {
    System.out.println(element);
}
```
- 注意：遍历过程中不能直接修改集合结构（如添加/删除元素），否则会抛出异常。


### 3.2.3 流式遍历（JDK 8+）
结合 Stream API 进行函数式风格遍历，支持过滤、映射等操作：
```java
HashSet<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.stream().forEach(System.out::println); // 打印所有元素
set.stream().filter(num -> num > 1).forEach(System.out::println); // 过滤并打印大于1的元素
```


## 四、性能分析：时间与空间权衡

### 4.1 时间复杂度
- **添加（add）、删除（remove）、查询（contains）**：理想情况下（无哈希冲突）为 O(1)，因直接通过哈希值定位索引。
- **最坏情况**：哈希冲突严重（所有元素哈希值相同），退化为链表或红黑树操作，时间复杂度分别为 O(n)（链表）和 O(log n)（红黑树）。


### 4.2 空间复杂度
- 底层依赖 HashMap，需存储键、值（固定占位对象）及哈希表结构，空间复杂度为 O(n)，其中 n 为元素个数。
- 初始容量和负载因子影响空间占用：初始容量过大浪费空间，过小则易触发扩容（重新哈希，性能损耗）。


## 五、使用场景与注意事项

### 5.1 典型使用场景
- 去重需求：如筛选列表中不重复的元素。
- 快速查找：需频繁判断元素是否存在（如缓存判重）。
- 无需保证顺序：不依赖元素存储或迭代顺序的场景。


### 5.2 关键注意事项
1. **自定义对象必须重写 hashCode() 和 equals()**
   - 若未重写，默认使用 Object 类的方法（基于内存地址），可能导致重复元素存入。
   - 重写原则：
     - 两个对象 `equals()` 返回 true 时，`hashCode()` 必须相等。
     - `hashCode()` 相等时，`equals()` 不一定返回 true（允许哈希冲突）。
   - 示例：
   ```java
   class Person {
       private String name;
       private int age;

       // 重写 equals()
       @Override
       public boolean equals(Object o) {
           if (this == o) return true;
           if (o == null || getClass() != o.getClass()) return false;
           Person person = (Person) o;
           return age == person.age && Objects.equals(name, person.name);
       }

       // 重写 hashCode()
       @Override
       public int hashCode() {
           return Objects.hash(name, age); // 结合关键属性计算哈希值
       }
   }
   ```

2. **线程安全问题**
   - 多线程环境下可使用 `Collections.synchronizedSet(new HashSet<>())` 包装为同步集合，或使用 `java.util.concurrent.ConcurrentHashMap` 实现的 `ConcurrentHashSet`（JDK 9+ 可通过 `Set.copyOf()` 结合并发 Map 创建）。

3. **扩容机制影响性能**
   - 当元素数量超过「当前容量 × 负载因子」时，HashMap 会扩容为原容量的 2 倍，触发所有元素重新计算哈希值和索引，建议初始化时预估容量以减少扩容次数。


## 六、与其他集合的对比

|集合类型|核心差异|适用场景|
|---|---|---|
|HashSet|无序、基于哈希表|去重、快速查找，不依赖顺序|
|TreeSet|有序（自然排序或定制排序）、基于红黑树|需排序的场景，如按规则筛选最大/最小值|
|LinkedHashSet|有序（保持插入顺序）、基于哈希表+链表|需保证迭代顺序与插入顺序一致的去重场景|


## 七、总结

HashSet 作为基于 HashMap 的高效集合，以「无序、不可重复」为核心特性，通过哈希算法实现 O(1) 级别的增删查效率，是处理去重和快速查找需求的首选工具。使用时需注意重写自定义对象的 `hashCode()` 和 `equals()`，合理设置初始容量以优化性能，并在并发场景下做好线程安全处理。