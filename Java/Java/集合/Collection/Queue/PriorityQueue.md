# PriorityQueue

## 一、基本概念

`PriorityQueue` 是 Java 集合框架中 `java.util` 包下的一个类，实现了 `Queue` 接口，是一种**基于优先级的无界队列**。

其核心特点是：队列中的元素会按照指定的优先级进行排序，每次取出（`poll()`、`remove()`）的元素都是**优先级最高的元素**，而非遵循先进先出（FIFO）规则。

注意：PriorityQueue 是“无界队列”，但底层基于数组实现，会自动扩容；默认不是线程安全的。

## 二、核心特性

1. **排序规则**：
        默认是**小根堆**（即优先级最高的是最小元素）；

2. 可通过构造方法传入 `Comparator` 接口自定义排序规则（实现大根堆或其他优先级逻辑）；

3. 元素必须是可比较的：要么元素类实现 `Comparable` 接口，要么构造时传入 `Comparator`，否则会抛出 `ClassCastException`。

4. **无界性**：初始化时有默认容量（11），当元素数量超过容量时会自动扩容，无需手动指定最大容量。

5. **null 元素禁止**：不允许向队列中添加 `null` 元素，否则抛出 `NullPointerException`。

6. **非线程安全**：多线程环境下并发操作需手动保证线程安全，或使用 `java.util.concurrent.PriorityBlockingQueue`（线程安全的优先级队列）。

7. **迭代器不保证排序**：通过 `iterator()` 获得的迭代器遍历队列时，元素顺序不保证是优先级顺序，仅通过 `poll()`/`peek()` 等方法获取时才遵循优先级。

## 三、构造方法

PriorityQueue 提供了 7 个构造方法，核心常用的有以下 4 个，按使用频率排序：

|构造方法|说明|
|---|---|
|`PriorityQueue()`|默认构造：初始容量 11，默认小根堆（依赖元素的 Comparable 实现）|
|`PriorityQueue(int initialCapacity)`|指定初始容量：初始容量为指定值，默认小根堆|
|`PriorityQueue(Comparator<? super E> comparator)`|指定比较器：初始容量 11，按自定义比较器规则排序（可实现大根堆）|
|`PriorityQueue(Collection<? extends E> c)`|集合初始化：将指定集合的元素初始化到队列中，默认小根堆（若集合是 SortedSet，则沿用其排序规则）|
示例：创建大根堆`// 方式1：Integer 类型，通过 Comparator 反转排序（默认小根堆→大根堆）
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());

// 方式2：自定义对象，通过 Comparator 指定优先级
PriorityQueue<Person> pq = new PriorityQueue<>((p1, p2) -> p2.getAge() - p1.getAge()); // 按年龄降序`

## 四、常用核心方法

PriorityQueue 实现了 Queue 接口的核心方法，同时扩展了部分特性方法，按功能分类如下：

### 1. 元素添加（增）

|方法|说明|异常情况|
|---|---|---|
|`boolean add(E e)`|添加元素到队列，成功返回 true|元素为 null 抛 NPE；元素不可比较抛 ClassCastException|
|`boolean offer(E e)`|同 add()，无界队列下始终返回 true|同 add()（无界队列不会因容量不足抛异常）|
注：无界队列中 add() 和 offer() 功能一致，区别于有界队列（如 ArrayBlockingQueue）中 offer() 容量不足时返回 false。

### 2. 元素获取与删除（查、删）

|方法|说明|异常情况|
|---|---|---|
|`E peek()`|获取优先级最高的元素（不删除），队列为空返回 null|无|
|`E element()`|同 peek()，但队列为空时抛异常|队列为空抛 NoSuchElementException|
|`E poll()`|获取并删除优先级最高的元素，队列为空返回 null|无|
|`E remove()`|同 poll()，但队列为空时抛异常|队列为空抛 NoSuchElementException|
|`boolean remove(Object o)`|删除指定元素（若存在），返回是否删除成功；需遍历查找，效率较低|无（元素为 null 直接返回 false）|
### 3. 队列状态查询

- `int size()`：返回队列中元素的个数；

- `boolean isEmpty()`：判断队列是否为空，为空返回 true；

- `Object[] toArray()`：将队列元素转为数组（顺序不保证优先级）。

### 4. 其他方法

- `void clear()`：清空队列中所有元素；

- `Comparator<? super E> comparator()`：返回队列使用的比较器，若为默认排序（依赖 Comparable）则返回 null。

## 五、底层实现原理

PriorityQueue 底层基于**动态数组**实现，核心数据结构是**二叉堆**（小根堆或大根堆），堆的特性决定了优先级排序逻辑。

### 1. 二叉堆的特性

二叉堆是一种完全二叉树，满足以下堆序性：

- 小根堆：每个父节点的值 ≤ 其左右子节点的值（根节点是最小值）；

- 大根堆：每个父节点的值 ≥ 其左右子节点的值（根节点是最大值）。

完全二叉树的特性使得其可以用数组高效存储：若父节点索引为 `i`，则左子节点索引为 `2i+1`，右子节点索引为 `2i+2`；若子节点索引为 `j`，则父节点索引为 `(j-1)/2`（整数除法）。

### 2. 核心操作的实现逻辑

PriorityQueue 的 add/offer、poll 操作本质是堆的“上浮”（sift up）和“下沉”（sift down）操作，以维护堆序性。

#### （1）添加元素（offer()）→ 上浮操作

1. 将元素添加到数组末尾（完全二叉树的最后一个位置）；

2. 执行上浮：将该元素与父节点比较，若不满足堆序性（如小根堆中子节点 < 父节点），则交换两者位置；

3. 重复步骤 2，直到元素上浮到根节点或满足堆序性为止。

时间复杂度：O(log n)（树的高度为 log n）。

#### （2）删除元素（poll()）→ 下沉操作

1. 取出数组第一个元素（根节点，即优先级最高的元素）；

2. 将数组末尾元素移到根节点位置，缩小数组大小；

3. 执行下沉：将根节点与左右子节点中优先级最高的节点（小根堆取最小值，大根堆取最大值）比较，若不满足堆序性，则交换两者位置；

4. 重复步骤 3，直到元素下沉到叶子节点或满足堆序性为止。

时间复杂度：O(log n)。

#### （3）扩容机制

当元素数量达到当前容量时，触发扩容：

- 若当前容量 < 64，则扩容为原来的 2 倍 + 2；

- 若当前容量 ≥ 64，则扩容为原来的 1.5 倍；

- 扩容后会将原数组元素复制到新数组中。

## 六、使用场景

PriorityQueue 适用于需要“动态获取优先级最高元素”的场景，常见场景如下：

1. **任务调度**：如线程池中的任务调度（如 ScheduledThreadPoolExecutor 底层用到优先级队列），优先级高的任务先执行；

2. **Top K 问题**：如获取数组中前 K 个最大元素（用小根堆，维护堆大小为 K，遍历元素后堆中即为结果）；

3. **最短路径算法**：如 Dijkstra 算法（迪杰斯特拉），用优先级队列存储待处理的节点，每次取出距离起点最近的节点；

4. **合并有序链表**：如 LeetCode 第 23 题“合并 K 个升序链表”，用优先级队列存储各链表的头节点，每次取出最小节点拼接。

Top K 问题示例：求数组中前 3 个最大元素`int[] arr = {5,2,7,3,1,6};
int k = 3;
PriorityQueue<Integer> minHeap = new PriorityQueue<>(k);
for (int num : arr) {
    if (minHeap.size() < k) {
        minHeap.offer(num);
    } else if (num > minHeap.peek()) {
        minHeap.poll();
        minHeap.offer(num);
    }
}
// 堆中元素即为前 3 个最大元素：5,6,7`

## 七、注意事项

1. **元素可比较性**：添加的元素必须实现 Comparable 接口，或构造时传入 Comparator，否则抛 ClassCastException；

2. **禁止 null 元素**：添加 null 会抛 NullPointerException；

3. **迭代器无序**：iterator() 遍历的顺序不是优先级顺序，若需按优先级遍历，需通过 poll() 逐个取出；

4. **线程安全问题**：多线程环境下，避免并发 add/poll 操作，建议使用 PriorityBlockingQueue（并发安全，基于 ReentrantLock 实现）；

5. **equals 与 hashCode 重写**：若自定义对象作为元素，且需要使用 remove(Object o) 方法，需重写 equals() 和 hashCode() 方法，否则无法正确识别元素；

6. **容量初始化**：若已知元素数量，建议初始化时指定容量，减少扩容次数，提升性能。

## 八、常见面试题

1. **PriorityQueue 是大根堆还是小根堆？如何实现大根堆？**
答：默认是小根堆。实现大根堆有两种方式：① 元素类实现 Comparable 时重写 compareTo() 方法，返回相反结果；② 构造时传入 Comparator.reverseOrder() 或自定义 Comparator。

2. **PriorityQueue 的底层数据结构是什么？add 和 poll 操作的时间复杂度是多少？**
答：底层是动态数组 + 二叉堆。add 和 poll 操作的时间复杂度均为 O(log n)（上浮和下沉操作的时间与树的高度成正比）。

3. **PriorityQueue 与 PriorityBlockingQueue 的区别？**
答：① 线程安全：前者非线程安全，后者线程安全（基于 ReentrantLock）；② 边界：前者无界，后者可指定边界（默认无界）；③ 阻塞特性：后者在队列为空时 poll() 会阻塞，队列满时 put() 会阻塞，前者不会。

4. **如何遍历 PriorityQueue 并保证元素按优先级顺序输出？**
答：不能直接用 iterator() 遍历，需通过循环调用 poll() 方法，每次取出优先级最高的元素并保存，直到队列为空（注意：poll() 会删除元素，若需保留原队列，需先复制一份）。

## 九、总结

PriorityQueue 是基于二叉堆的无界优先级队列，核心优势是能高效获取优先级最高的元素（add/poll 均为 O(log n)），适用于任务调度、Top K、最短路径等场景。使用时需注意元素可比较性、线程安全及迭代器无序等问题，结合实际场景选择合适的排序规则和并发安全方案。