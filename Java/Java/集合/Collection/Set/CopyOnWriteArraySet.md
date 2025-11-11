# CopyOnWriteArraySet
## 一、简介
`CopyOnWriteArraySet` 是 Java 并发包（`java.util.concurrent`）中的线程安全 Set 实现，基于 `CopyOnWriteArrayList` 封装，通过写时复制机制保证线程安全，同时严格遵循 Set 接口的元素唯一性契约。

## 二、核心特性
- **线程安全**：读操作无锁，写操作通过锁保证原子性
- **写时复制**：修改操作会创建新数组，修改后替换旧数组
- **元素有序**：保持元素插入顺序
- **严格唯一**：通过特殊机制确保元素不重复
- **弱一致性**：读操作可能访问到旧数据，迭代器基于快照工作

## 三、底层实现原理
`CopyOnWriteArraySet` 本身不存储数据，完全委托内部的 `CopyOnWriteArrayList` 实例（变量名 `al`）实现所有功能。其与 `CopyOnWriteArrayList` 的核心差异在于：通过调用 `addIfAbsent()` 方法替代普通 `add()` 方法，从而实现元素唯一性。

### 3.1 唯一性保证机制
唯一性保证是通过 `CopyOnWriteArrayList` 的 `addIfAbsent(E e)` 方法实现的，该方法在添加元素前会先检查元素是否已存在：

1. 获取当前数组快照
2. 快速检查元素是否已存在，存在则直接返回 false
3. 不存在则加锁，进行二次检查（防止其他线程已添加）
4. 确认不存在后，复制新数组并添加元素

```java
public class CopyOnWriteArraySet<E> extends AbstractSet<E> implements Serializable {
    private final CopyOnWriteArrayList<E> al;

    public CopyOnWriteArraySet() {
        al = new CopyOnWriteArrayList<>();
    }

    // 关键：使用 addIfAbsent 而非普通 add
    public boolean add(E e) {
        return al.addIfAbsent(e);
    }
}
```



## 四、常用方法
| 方法 | 说明 |
|------|------|
| `add(E e)` | 仅当元素不存在时添加，返回添加是否成功 |
| `addAll(Collection<? extends E> c)` | 批量添加不存在的元素 |
| `remove(Object o)` | 移除元素，返回是否移除成功 |
| `contains(Object o)` | 判断元素是否存在，无锁操作 |
| `size()` | 返回元素数量，无锁操作 |
| `iterator()` | 返回弱一致性迭代器 |

## 五、迭代器特性
- **弱一致性**：迭代器基于创建时的数组快照，对集合的后续修改不会影响迭代结果
- **不可修改**：迭代器不支持 `remove()` 操作
- **无需同步**：迭代时不需要额外的同步措施，不会抛出 `ConcurrentModificationException`

```java
CopyOnWriteArraySet<String> set = new CopyOnWriteArraySet<>();
set.add("A");
set.add("B");

Iterator<String> it = set.iterator(); // 基于 ["A", "B"] 的快照
set.add("C"); // 修改不会影响迭代器

// 迭代结果：仅输出 A、B
while (it.hasNext()) {
    System.out.println(it.next());
}
```

## 六、适用场景
- **读多写少**：如配置缓存、系统状态管理等场景
- **高并发读**：需要并发读取且不希望读操作被阻塞
- **频繁迭代**：需要频繁遍历集合且不希望出现并发修改异常
- **元素数量少**：避免写操作时复制大数组导致的性能开销

## 七、优缺点分析
### 优点
- **读性能优异**：读操作无锁，可并发执行
- **线程安全**：内部实现同步，使用简单
- **迭代安全**：不会抛出并发修改异常
- **元素有序**：保持插入顺序

### 缺点
- **写性能较差**：每次写操作需复制数组，时间复杂度 O(n)
- **内存开销大**：写操作期间存在新旧两份数组
- **最终一致性**：不保证读操作能立即看到最新修改
- **批量操作效率低**：`addAll()` 等操作可能触发多次数组复制
## 八、注意事项
- **元素类需正确实现 equals() 和 hashCode()**：确保唯一性判断准确
- **支持存储 null 元素**：内部通过特殊的 null 处理机制确保安全
- **避免频繁写操作**：高频写场景性能极差
- **注意内存消耗**：写操作会创建数组副本，大数据量时内存压力大
- **谨慎使用批量操作**：`addAll()` 方法效率较低，因为内部会遍历集合并对每个元素单独调用 `addIfAbsent()`，每个元素的添加都可能触发一次数组复制和扩容操作
- **理解弱一致性**：读操作可能获取到旧数据