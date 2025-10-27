# List

## 一、基本概念



- List 是 Java 集合框架（Collection Framework）中的一个接口，继承自 Collection 接口

- 特点：有序集合（元素存入顺序与取出顺序一致）、允许重复元素、可以通过索引访问元素

- 主要实现类：ArrayList、LinkedList、Vector、Stack（其中 Stack 是 Vector 的子类）



## 二、核心方法（按功能分类）



### 1. 新增元素



- `boolean add(E e)`：在列表末尾添加元素，返回是否添加成功

- `void add(int index, E element)`：在指定索引位置插入元素，原位置及后续元素后移

- `boolean addAll(Collection<? extends E> c)`：添加指定集合的所有元素到末尾

- `boolean addAll(int index, Collection<? extends E> c)`：从指定索引开始插入集合所有元素



### 2. 删除元素



- `E remove(int index)`：删除指定索引的元素，返回被删除的元素

- `boolean remove(Object o)`：删除第一个匹配的元素（通过 equals() 判断），返回是否删除成功

- `boolean removeAll(Collection<?> c)`：删除所有包含在指定集合中的元素

- `void clear()`：清空列表所有元素

- `boolean retainAll(Collection<?> c)`：仅保留列表中与指定集合共有的元素（交集）



### 3. 查找与访问



- `E get(int index)`：获取指定索引的元素

- `int indexOf(Object o)`：返回指定元素第一次出现的索引，不存在则返回 -1

- `int lastIndexOf(Object o)`：返回指定元素最后一次出现的索引，不存在则返回 -1

- `boolean contains(Object o)`：判断列表是否包含指定元素

- `boolean containsAll(Collection<?> c)`：判断列表是否包含指定集合的所有元素



### 4. 修改元素



- `E set(int index, E element)`：替换指定索引的元素，返回被替换的旧元素



### 5. 遍历与转换



- `Iterator<E> iterator()`：返回迭代器，用于遍历元素

- `ListIterator<E> listIterator()`：返回列表迭代器（支持双向遍历和修改）

- `ListIterator<E> listIterator(int index)`：从指定索引开始的列表迭代器

- `Object[] toArray()`：转换为 Object 数组

- `<T> T[] toArray(T[] a)`：转换为指定类型的数组

- `List<E> subList(int fromIndex, int toIndex)`：返回子列表（[fromIndex, toIndex)，与原列表共享数据）



### 6. 其他常用



- `int size()`：返回元素数量

- `boolean isEmpty()`：判断是否为空



## 三、主要实现类对比



|实现类|底层结构|线程安全|随机访问效率|插入删除效率（中间位置）|适用场景|
|---|---|---|---|---|---|
|ArrayList|动态数组|否|高（O(1)）|低（需移动元素 O(n)）|频繁查询，少量增删|
|LinkedList|双向链表|否|低（O(n)）|高（只需修改指针 O(1)）|频繁增删，少量查询|
|Vector|动态数组|是（同步）|高（O(1)）|低（O(n)）|多线程环境，需线程安全时|
|Stack|动态数组（继承Vector）|是|高|低|实现栈结构（LIFO）|


## 四、注意事项



1. **索引越界**：操作时索引需在 [0, size-1] 范围内，否则抛出 `IndexOutOfBoundsException`

2. **subList 注意**：subList 返回的是原列表的视图，修改子列表会影响原列表，且原列表结构修改（增删元素）会导致子列表操作抛出 `ConcurrentModificationException`

3. **迭代器并发修改**：使用迭代器遍历的同时，通过列表自身方法修改元素（增删），会抛出 `ConcurrentModificationException`，建议使用迭代器的 `remove()` 方法

4. **equals 与 hashCode**：当 List 中存放自定义对象时，需重写 `equals()` 和 `hashCode()` 方法，否则 `contains()`、`indexOf()` 等方法可能无法正确工作

5. **线程安全**：ArrayList 和 LinkedList 均非线程安全，多线程环境下可使用 `Collections.synchronizedList(List)` 包装为线程安全列表，或使用 `CopyOnWriteArrayList`



## 五、常用操作示例



```Java

```



## 六、扩展知识



- `List.of()`（Java 9+）：创建不可变列表，不允许增删改

- `Arrays.asList(T... a)`：返回固定大小的列表（由数组支持），增删会抛异常，修改元素会影响原数组

- 排序：可使用 `Collections.sort(list)` 或 `list.sort(Comparator)` 进行排序

- 空列表：`Collections.emptyList()` 返回不可变空列表，避免返回 null
> （注：文档部分内容可能由 AI 生成）