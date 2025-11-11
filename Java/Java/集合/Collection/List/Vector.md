# Vector

## 概述

Vector 是 Java 集合框架中 `java.util` 包下的**动态数组容器**，诞生于 JDK 1.0，是早期集合框架的重要成员。

Vector 本质是"可动态扩容的数组"，与 ArrayList 功能相似，区别在于 **Vector 是线程安全的**——其核心方法（如 add、remove、get 等）都被 `synchronized` 关键字修饰，可在多线程环境中直接使用（但效率较低）。

## 核心特性

- **线程安全**：核心方法加 `synchronized` 锁，多线程并发访问时能保证数据一致性，但会带来性能开销
- **动态扩容**：底层基于数组实现，当元素数量超过当前容量时，会自动扩容（默认扩容为原容量的 2 倍，也可指定扩容增量）
- **随机访问高效**：实现 `RandomAccess` 接口，支持通过索引快速访问元素（时间复杂度 O(1)）
- **元素有序可重复**：按插入顺序存储元素，允许存储重复元素，也支持 null 元素
- **遗留特性**：作为 JDK 1.0 遗留类，部分方法（如 `addElement()`、`elementAt()`）与集合框架规范方法（如 `add()`、`get()`）功能重复

## 构造方法

Vector 提供 4 个构造方法，可根据需求指定初始容量、扩容增量或直接传入集合初始化：

### 1. 无参构造
默认初始容量为 10，扩容增量为 0（即默认扩容为原容量 2 倍）

```java
// 初始容量 10，扩容策略：原容量 * 2
Vector<String> vector = new Vector<>();
```

### 2. 指定初始容量
仅设置初始容量，扩容策略默认为原容量的 2 倍

```java
// 初始容量 20，扩容策略：原容量 * 2
Vector<String> vector = new Vector<>(20);
```

### 3. 指定初始容量和扩容增量
精确控制扩容规则

```java
// 初始容量 10，扩容增量 5（满了之后每次加 5）
Vector<String> vector = new Vector<>(10, 5);
```

### 4. 通过集合初始化
将指定集合的元素导入 Vector

```java
List<String> list = Arrays.asList("a", "b", "c");
// 初始元素为 list 的元素，容量为元素个数，扩容策略默认
Vector<String> vector = new Vector<>(list);
```

## 核心方法使用

### 元素增删改查

```java
Vector<String> vector = new Vector<>();

// 添加元素（推荐使用标准集合方法）
vector.add("Java");                        // 末尾添加，返回 boolean
vector.add(1, "Python");                   // 指定索引插入，索引越界抛异常
vector.addAll(Arrays.asList("C++", "Go")); // 批量添加集合元素

// 遗留添加方法
vector.addElement("JavaScript");  // 末尾添加，无返回值

// 删除元素
vector.remove("Python");           // 删除指定元素，返回 boolean
vector.remove(2);                   // 删除指定索引元素，返回被删元素
vector.removeAll(Arrays.asList("C++")); // 批量删除
vector.clear();                    // 清空所有元素

// 遗留删除方法
vector.removeElement("Go");        // 删除指定元素，返回 boolean
vector.removeAllElements();        // 清空所有元素（同 clear()）

// 修改元素
vector.set(0, "Java SE");          // 修改指定索引元素，返回旧元素

// 查询元素
String elem = vector.get(0);       // 获取指定索引元素
boolean hasElem = vector.contains("Java");  // 判断是否包含元素
int index = vector.indexOf("Java");         // 获取第一次出现的索引
int size = vector.size();                   // 获取元素个数
boolean isEmpty = vector.isEmpty();         // 判断是否为空
```

### 容量相关方法

```java
Vector<String> vector = new Vector<>(10, 5);

int capacity = vector.capacity();  // 获取当前容量
vector.ensureCapacity(15);         // 确保容量至少为 15
vector.trimToSize();               // 修剪容量为当前元素个数，减少内存占用
```

### 遍历方式

Vector 支持多种遍历方式，可根据场景选择：

```java
Vector<String> vector = new Vector<>(Arrays.asList("a", "b", "c"));

// 1. 普通 for 循环（随机访问高效，推荐）
for (int i = 0; i < vector.size(); i++) {
    System.out.println(vector.get(i));
}

// 2. 增强 for 循环（简洁）
for (String s : vector) {
    System.out.println(s);
}

// 3. 迭代器（支持安全删除）
Iterator<String> iterator = vector.iterator();
while (iterator.hasNext()) {
    String s = iterator.next();
    if (s.equals("b")) {
        iterator.remove();  // 避免 ConcurrentModificationException
    }
}

// 4. 遗留迭代器 Enumeration
Enumeration<String> enumeration = vector.elements();
while (enumeration.hasMoreElements()) {
    System.out.println(enumeration.nextElement());
}
```

## 底层原理

### 存储结构

Vector 底层基于 **Object 类型数组**存储元素，核心成员变量包括：

- `elementData`：存储元素的数组（transient 修饰，序列化时会特殊处理）
- `elementCount`：当前实际元素个数
- `capacityIncrement`：扩容增量（构造时指定，默认 0）

### 扩容机制


#### 2. 扩容流程详解
1. **计算需要的最小容量**：<br/>
需要的最小容量 = 当前元素数量 + 要添加的元素总数

2. **检查是否需要扩容**：<br/>
将需要的最小容量与当前数组的容量比较，如果需要的最小容量 > 当前数组容量，则触发扩容

3. **计算新容量**：<br/>
如果构造时指定了扩容增量(capacityIncrement > 0)：新容量 = 原容量 + 扩容增量<br/>
如果未指定扩容增量(capacityIncrement ≤ 0)：新容量 = 原容量 * 2（默认策略）

4. **确保新容量满足需求**：<br/>
如果按上述规则计算出的新容量仍然小于需要的最小容量，则直接使用需要的最小容量作为新容量

5. **执行扩容**：<br/>
创建一个新的更大的数组，将原数组中的所有元素复制到新数组，用新数组替换原数组

### 线程安全实现

Vector 的线程安全通过在核心方法上添加 `synchronized` 关键字实现，例如：

```java
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}
```
执行方法时，会获取 Vector 实例的锁，确保同一时间只有一个线程可以执行方法，从而实现线程安全。

## 优缺点与使用场景

### 优点

- 线程安全，可直接用于多线程环境，无需手动加锁
- 支持随机访问，查询效率高（时间复杂度 O(1)）
- 扩容策略灵活，可指定增量减少扩容开销
- 兼容性好，支持遗留方法，适配旧代码

### 缺点

- 线程安全导致并发效率低，单线程环境下性能不如 ArrayList
- 默认扩容为原容量 2 倍，可能造成内存浪费
- 方法级锁粒度粗，多线程下竞争激烈时性能瓶颈明显

### 适用场景

- 多线程环境下需要动态存储元素，且对并发效率要求不高的场景
- 需要频繁通过索引查询元素，且元素数量波动较大的场景
- 维护旧系统时，需兼容使用 Vector 遗留方法的代码

**注意**：若为单线程环境或对并发效率要求高，优先使用 ArrayList + 手动锁（ReentrantLock）或 CopyOnWriteArrayList。

## 使用建议与最佳实践

1. **初始化优化**：预估元素数量，合理设置初始容量和扩容增量，减少扩容次数
2. **避免在单线程环境使用**：单线程场景优先使用 ArrayList 提升性能
3. **并发场景考虑替代方案**：
   - 读多写少：使用 CopyOnWriteArrayList
   - 写多读少：考虑使用 Collections.synchronizedList() 包装 ArrayList
   - 精细锁控制：使用 ReentrantLock 手动控制锁粒度
4. **迭代时注意线程安全**：迭代过程中如需线程安全，使用同步代码块包裹
5. **及时释放内存**：元素数量稳定后调用 trimToSize() 释放多余容量

## 常见问题（FAQ）

1. **Q：Vector 可以存储 null 吗？**
   A：可以，Vector 允许存储 null 元素，且可重复存储。

2. **Q：Vector 的 iterator 是线程安全的吗？**
   A：不绝对。虽然 Vector 方法加锁，但迭代过程中若其他线程修改 Vector，仍可能抛出 ConcurrentModificationException。建议迭代时加锁，或使用 Collections.synchronizedList() 包装后迭代。

3. **Q：JDK 1.8+ 中 Vector 还有使用价值吗？**
   A：有，但场景有限。多线程场景下更推荐 CopyOnWriteArrayList（读无锁，写有锁，适合读多写少），单线程场景用 ArrayList。仅在需兼容旧代码或简单多线程场景下使用 Vector。

4. **Q：Vector 的 trimToSize() 有什么用？**
   A：将容量修剪为当前元素个数，释放多余内存，适合元素数量稳定后调用。