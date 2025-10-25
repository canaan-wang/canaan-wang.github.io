# Queue

# 一、Queue 接口的核心定位

Queue 接口是 Java 集合框架的核心成员，它定义了一个**先进先出（FIFO）**的数据结构规范，专注于“队列”的基础操作，不包含具体实现逻辑。直接继承自 `Collection` 接口，主要用于处理需要按“顺序排队”的场景，例如任务队列、消息队列等。

## 1. 核心特性

1. **FIFO 原则**：默认情况下，元素的插入（尾部）和移除（头部）遵循“先进先出”规则，与现实中的排队逻辑一致。

2. **双端扩展**：部分实现类（如 `LinkedList`）实现了 `Deque` 接口，支持从头部和尾部双向操作，突破了纯 FIFO 限制。

3. **操作两种风格**：所有核心操作都提供“抛出异常”和“返回特殊值”两种版本，适配不同的业务容错需求。

# 二、Queue 接口的核心方法

Queue 接口的方法可分为**插入、移除、查看**三类，每类方法都有两种行为风格，是学习的核心重点。

|操作类型|抛出异常（失败时）|返回特殊值（失败时）|方法作用|
|---|---|---|---|
|插入|`add(E e)`|`offer(E e)`|向队列尾部添加元素|
|移除|`remove()`|`poll()`|移除并返回队列头部元素|
|查看|`element()`|`peek()`|仅返回队列头部元素（不移除）|
## 1. 方法详解

- **add(E e) vs offer(E e)**：两者均添加元素，`add` 在队列满（如固定容量队列）时抛出 `IllegalStateException`，`offer` 则返回 `false`，更适合非阻塞场景。

- **remove() vs poll()**：两者均移除头部元素，`remove` 在队列为空时抛出 `NoSuchElementException`，`poll` 则返回 `null`，需注意判断返回值是否为 `null`（若队列存 `null` 元素会有歧义）。

- **element() vs peek()**：两者均查看头部元素，`element` 在队列为空时抛出 `NoSuchElementException`，`peek` 则返回 `null`，用法与移除类方法逻辑一致。

# 三、Queue 与相关接口的关系

Queue 接口并非孤立存在，它与 `Collection`、`Deque`、`BlockingQueue` 等接口形成了清晰的继承和扩展关系，理解这些关系能更好地定位其用途。

## 1. 继承关系

- **父接口**：直接继承 `Collection` 接口，因此拥有 `size()`、`isEmpty()`、`contains(Object o)` 等 Collection 通用方法。

- **子接口** **：** 

    - `Deque`：双端队列接口，扩展了 Queue，支持从头部/尾部插入、移除元素（如 `addFirst(E e)`、`pollLast()`），实现类有 `LinkedList`、`ArrayDeque`。

    - `BlockingQueue`：阻塞队列接口，在 Queue 基础上增加了“阻塞等待”特性（如队列满时等待空间、队列空时等待元素），是多线程编程的核心工具，实现类有 `ArrayBlockingQueue`、`LinkedBlockingQueue`。

    - `BlockingDeque`：阻塞双端队列接口，继承 `Deque` 和 `BlockingQueue`，支持双端阻塞操作，适合需要双向阻塞访问的场景，实现类如 `LinkedBlockingDeque`。

    - `TransferQueue`：传递队列接口，继承 `BlockingQueue`，新增“生产者直接传递元素给消费者”的特性，实现类如 `LinkedTransferQueue`。

## 2. 与 List 接口的区别

Queue 与同为 Collection 子接口的 List（如 `ArrayList`、`LinkedList`）定位差异显著，核心区别在“操作目标”和“顺序规则”：

|对比维度|Queue 接口|List 接口|
|---|---|---|
|核心定位|按“队列规则”操作（头部/尾部）|按“索引”随机访问（任意位置）|
|顺序规则|默认 FIFO，可通过 Deque 扩展|元素顺序由插入顺序或排序规则决定|
|核心方法|聚焦 add/offer、remove/poll 等队列操作|聚焦 get(int index)、set(int index, E e) 等索引操作|
# 四、Queue 接口的典型实现类（非接口本身，仅作关联参考）

Queue 是接口，需通过实现类使用，常见实现类的特性如下（了解实现类可更好地理解接口设计意图）：

- **LinkedList**：实现了 `Queue` 和 `Deque` 接口，基于链表实现，支持双端操作，无固定容量限制，同时也实现了 `List` 接口可兼顾索引访问。

- **ArrayDeque**：实现了 `Deque` 接口，基于动态数组实现，双端操作（增删头尾）效率极高，无容量限制（自动扩容），是 `Stack` 类的推荐替代者。

- **PriorityQueue**：实现了 `Queue` 接口，**打破 FIFO 规则**，按元素优先级排序（默认自然排序或自定义 `Comparator`），基于数组实现堆结构，头部始终是优先级最高元素。

- **ArrayBlockingQueue**：实现了 `BlockingQueue` 接口，基于数组的有界阻塞队列，创建时需指定容量，支持公平/非公平访问策略，多线程场景中常用。

- **LinkedBlockingQueue**：实现了 `BlockingQueue` 接口，基于链表实现，默认无界（容量为 `Integer.MAX_VALUE`），也可指定容量，并发性能优于 `ArrayBlockingQueue`。

- **LinkedBlockingDeque**：实现了 `BlockingDeque` 接口，基于链表的阻塞双端队列，支持双向阻塞增删，适合需要双向调度的多线程场景（如线程池任务调度）。

- **ConcurrentLinkedQueue**：实现了 `Queue` 接口，基于链表的无界非阻塞队列，采用 CAS 算法保证并发安全，无锁设计使其在高并发场景下性能优异。

- **DelayQueue**：实现了 `BlockingQueue` 接口，专门存储带延迟时间的元素，元素仅在延迟到期后才可被取出，常用于定时任务调度场景（如订单超时取消）。

# 五、Queue 接口的使用注意事项

1. **null 元素限制**：多数 Queue 实现类（如 `PriorityQueue`、`BlockingQueue` 子类、`ConcurrentLinkedQueue`）不允许插入 `null` 元素，插入 `null` 会抛出 `NullPointerException`；仅 `LinkedList` 允许 `null`，但不推荐（会影响 `poll()` 方法的 `null` 判断逻辑）。

2. **容量限制差异**：
        无界队列：如 `LinkedList`、`PriorityQueue`、`ConcurrentLinkedQueue`，理论上容量可无限增长（受内存限制），`add()` 方法不会因容量问题抛出异常。

3. 有界队列：如 `ArrayBlockingQueue`、`LinkedBlockingQueue`（指定容量时）、`LinkedBlockingDeque`（指定容量时），满容量时 `add()` 抛异常，`offer()` 返回 `false`。

4. **PriorityQueue 的特殊排序**：`PriorityQueue` 是 Queue 接口的“特殊实现”，其 `peek()`/`poll()` 返回的是优先级最高的元素，而非最早插入的元素，使用时需注意排序规则（自定义 `Comparator` 时需确保逻辑正确）。

5. **并发安全问题**：普通实现类（如 `LinkedList`、`ArrayDeque`、`PriorityQueue`）均非线程安全，多线程环境下需手动加锁；若需并发安全，优先选择 `ConcurrentLinkedQueue`（非阻塞）或 `BlockingQueue` 子类（阻塞）。