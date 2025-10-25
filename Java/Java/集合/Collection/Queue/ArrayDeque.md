# ArrayDeque

## 一、核心定义与本质



`ArrayDeque` 是 Java 集合框架中 **双端队列（Double-Ended Queue）** 的实现类，底层基于 **可动态扩容的数组** 实现，不属于线程安全类。



- 所属包：`java.util.ArrayDeque`

- 实现接口：`Deque`、`Queue`、`Collection`，支持队列（FIFO）、栈（LIFO）两种数据结构的操作逻辑。

- 存储特点：数组容量默认初始化为 16，当元素满时会自动扩容（通常扩容为原容量的 2 倍）。



## 二、关键特性



`ArrayDeque` 的核心优势体现在“双端操作”和“效率”上，与常见集合的对比如下：



|特性|ArrayDeque|LinkedList|Stack（已过时）|
|---|---|---|---|
|底层结构|动态数组|双向链表|数组（继承 Vector）|
|双端操作效率|高（O(1)，数组下标访问）|高（O(1)，链表节点操作）|不支持（仅栈顶操作）|
|随机访问效率|高（O(1)）|低（O(n)，需遍历链表）|中（O(1)，但仅支持栈操作）|
|线程安全|不安全|不安全|安全（继承 Vector，同步）|
|扩容机制|自动扩容为原容量 2 倍|无需扩容（链表动态节点）|扩容为原容量 2 倍 + 1|


## 三、常用方法（按功能分类）



`ArrayDeque` 的方法围绕“双端操作”设计，可分为 **队列操作**、**栈操作**、**双端通用操作** 和 **集合通用操作** 四类。



### 1. 队列操作（FIFO：先进先出）



模拟普通队列，仅从“队尾添加、队首移除”：



- `boolean offer(E e)`：向队尾添加元素，成功返回 `true`（容量不足时抛异常，区别于 `Queue` 的 `offer`）。

- `E poll()`：移除并返回队首元素，队列为空时返回 `null`。

- `E peek()`：返回队首元素（不移除），队列为空时返回 `null`。

- `E remove()`：移除并返回队首元素，队列为空时抛 `NoSuchElementException`。

- `E element()`：返回队首元素（不移除），队列为空时抛 `NoSuchElementException`。



### 2. 栈操作（LIFO：后进先出）



模拟栈，仅从“队尾（栈顶）添加/移除”，推荐替代过时的 `Stack` 类：



- `void push(E e)`：向栈顶（队尾）添加元素，容量不足时抛异常。

- `E pop()`：移除并返回栈顶（队尾）元素，栈为空时抛 `NoSuchElementException`。

- `E peek()`：返回栈顶（队尾）元素（不移除），栈为空时返回 `null`（与队列的 `peek` 方法复用）。



### 3. 双端通用操作（队首/队尾均可操作）



`Deque` 接口特有的方法，是 `ArrayDeque` 的核心能力：



- **添加元素**：

    - `void addFirst(E e)`：向队首添加元素，容量不足时抛异常。

    - `void addLast(E e)`：向队尾添加元素，容量不足时抛异常（等同于 `add(E e)`）。

    - `boolean offerFirst(E e)`：向队首添加元素，成功返回 `true`。

    - `boolean offerLast(E e)`：向队尾添加元素，成功返回 `true`（等同于队列的 `offer(E e)`）。

- **移除元素**：

    - `E removeFirst()`：移除并返回队首元素，为空时抛异常（等同于队列的 `remove()`）。

    - `E removeLast()`：移除并返回队尾元素，为空时抛异常。

    - `E pollFirst()`：移除并返回队首元素，为空时返回 `null`（等同于队列的 `poll()`）。

    - `E pollLast()`：移除并返回队尾元素，为空时返回 `null`。

- **查看元素**：

    - `E getFirst()`：返回队首元素（不移除），为空时抛异常（等同于队列的 `element()`）。

    - `E getLast()`：返回队尾元素（不移除），为空时抛异常。

    - `E peekFirst()`：返回队首元素（不移除），为空时返回 `null`（等同于队列的 `peek()`）。

    - `E peekLast()`：返回队尾元素（不移除），为空时返回 `null`。



### 4. 集合通用操作



继承自 `Collection` 接口的基础方法：



- `int size()`：返回元素个数。

- `boolean isEmpty()`：判断是否为空（`size() == 0`）。

- `boolean contains(Object o)`：判断是否包含指定元素（需重写 `equals()` 方法）。

- `void clear()`：清空所有元素。

- `Iterator<E> iterator()`：获取迭代器（默认从队首到队尾遍历）。

- `Object[] toArray()`：将元素转为数组。



## 四、使用场景



`ArrayDeque` 适合需要 **高效双端操作** 或 **替代传统栈/队列** 的场景，典型场景包括：



1. **实现栈结构**：用 `push()`/`pop()`/`peek()` 替代过时的 `Stack` 类，效率更高。

2. **实现队列结构**：用 `offer()`/`poll()`/`peek()` 替代 `LinkedList`（数组结构随机访问更快）。

3. **需要双向遍历/操作的场景**：如“最近访问记录”“滑动窗口”等，需从两端添加/删除元素。

4. **高性能场景**：避免使用 `LinkedList` 的遍历开销，或 `Vector`/`Stack` 的同步开销（单线程环境）。



## 五、注意事项



1. **线程安全问题**：`ArrayDeque` 非线程安全，多线程环境下需手动加锁（如用 `synchronized`），或使用并发类 `ConcurrentLinkedDeque`。

2. **null 元素禁止**：`ArrayDeque` 不允许添加 `null` 元素，否则会抛 `NullPointerException`（区别于 `LinkedList`）。

3. **扩容机制**：默认初始容量 16，扩容时直接翻倍，若需存储大量元素，建议初始化时指定容量（如 `new ArrayDeque<>(1000)`），减少扩容次数。

4. **迭代器故障快速检测**：迭代过程中若通过非迭代器方法（如 `add()`/`remove()`）修改集合，会抛 `ConcurrentModificationException`。



## 六、代码示例（常用场景）



### 1. 作为栈使用



```Java

```



### 2. 作为队列使用



```Java

```