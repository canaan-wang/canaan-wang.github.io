# CopyOnWriteArraySet
## 1. 简介
`CopyOnWriteArraySet` 是 Java 并发包（`java.util.concurrent`）中的**线程安全 Set 实现**，核心是基于 `CopyOnWriteArrayList` 封装实现，底层通过数组存储元素，核心特性是“**写时复制**”（Write-On-Write），同时严格保证元素唯一性（Set 接口的核心契约）。


## 2. 核心特性
- **线程安全**：支持多线程并发操作，内部通过锁保证写操作安全，读操作无锁
- **无锁读取**：读操作直接访问当前数组，无需同步，性能优异
- **写时复制**：所有修改操作（add/remove等）会复制一份新数组，修改后替换旧数组，不影响读操作
- **元素有序**：元素存储顺序与插入顺序一致（继承自底层数组的特性）
- **严格唯一**：通过底层逻辑保证元素不重复（核心区别于 `CopyOnWriteArrayList`）


## 3. 底层实现原理
`CopyOnWriteArraySet` 本身不存储数据，**完全委托内部的 `CopyOnWriteArrayList` 实例（变量名 `al`）实现所有功能**，其核心差异在于：通过 `CopyOnWriteArrayList` 的 `addIfAbsent()` 方法替代普通 `add()` 方法，从而实现元素唯一性。


### 3.1 关键：唯一性保证机制
`CopyOnWriteArraySet` 能保证元素唯一，本质是**依赖 `CopyOnWriteArrayList` 的 `addIfAbsent(E e)` 方法**，该方法会先判断元素是否已存在，仅在不存在时才执行“写时复制”添加操作。

#### 3.1.1 核心逻辑拆解（结合源码）
`addIfAbsent()` 是保证唯一性的核心方法，其执行步骤如下：
1. **加锁**：通过 `ReentrantLock` 加锁，保证并发写时不会出现重复添加（避免多线程同时判断“元素不存在”导致重复）；
2. **查旧数组**：获取当前底层数组（`getArray()`）；
3. **判断元素是否存在**：遍历旧数组，通过 `equals()` 方法对比元素（因此元素类需正确重写 `equals()` 和 `hashCode()`）；
4. **决策是否添加**：
   - 若元素已存在：直接解锁，返回 `false`（表示添加失败，保证唯一性）；
   - 若元素不存在：复制一份新数组（长度=旧数组长度+1），将新元素加入新数组，用新数组替换旧数组，解锁后返回 `true`（添加成功）。

#### 3.1.2 核心源码片段（唯一性关键）
```java
public class CopyOnWriteArraySet<E> extends AbstractSet<E> implements Serializable {
    private final CopyOnWriteArrayList<E> al;

    // 构造方法：初始化内部的 CopyOnWriteArrayList
    public CopyOnWriteArraySet() {
        al = new CopyOnWriteArrayList<>();
    }

    // 1. Set 的 add 方法：直接调用 CopyOnWriteArrayList 的 addIfAbsent
    public boolean add(E e) {
        return al.addIfAbsent(e); // 关键：用 addIfAbsent 替代普通 add
    }

    // ---------------- 以下是 CopyOnWriteArrayList 的 addIfAbsent 源码 ----------------
    public boolean addIfAbsent(E e) {
        Object[] snapshot = getArray(); // 获取当前数组快照
        // 先判断元素是否存在（存在则直接返回 false）
        return indexOf(e, snapshot, 0, snapshot.length) >= 0 ? false :
            // 不存在则执行添加（加锁+复制数组）
            addIfAbsent(e, snapshot);
    }

    private boolean addIfAbsent(E e, Object[] snapshot) {
        final ReentrantLock lock = this.lock;
        lock.lock(); // 加锁：保证并发写安全
        try {
            Object[] current = getArray();
            int len = current.length;
            // 二次检查：避免快照和当前数组不一致（防止其他线程已添加）
            if (snapshot != current) {
                int common = Math.min(snapshot.length, len);
                for (int i = 0; i < common; i++) {
                    if (current[i] != snapshot[i] && eq(e, current[i])) {
                        return false; // 其他线程已添加，返回失败
                    }
                }
                if (indexOf(e, current, common, len) >= 0) {
                    return false; // 元素已存在，返回失败
                }
            }
            // 复制新数组并添加元素
            Object[] newElements = Arrays.copyOf(current, len + 1);
            newElements[len] = e;
            setArray(newElements); // 替换旧数组
            return true;
        } finally {
            lock.unlock(); // 解锁
        }
    }

    // 辅助方法：判断元素是否相等（优先用 ==，再用 equals）
    private static boolean eq(Object o1, Object o2) {
        return (o1 == null) ? (o2 == null) : o1.equals(o2);
    }
}
```

#### 3.1.3 关键注意点
- **依赖 equals() 方法**：元素唯一性判断基于 `equals()`，若存储的元素类（如自定义类）未正确重写 `equals()` 和 `hashCode()`，会导致唯一性判断失效（例如两个“逻辑相等”的对象被判定为不同元素）；
- **无 null 元素**：与 `CopyOnWriteArrayList` 允许 `null` 不同，`CopyOnWriteArraySet` 禁止添加 `null`（因为 `equals(null)` 会抛出 `NullPointerException`，源码未处理 `null` 场景）；
- **并发安全**：`addIfAbsent()` 中的锁保证了“判断-添加”的原子性，避免多线程并发添加时出现重复元素。


## 4. 常用方法（含唯一性相关说明）
| 方法                | 说明                                                                 |
|---------------------|----------------------------------------------------------------------|
| `add(E e)`          | 核心添加方法：调用 `addIfAbsent(e)`，元素不存在则添加，返回 `true`，否则返回 `false` |
| `addAll(Collection<? extends E> c)` | 批量添加：对集合中每个元素调用 `addIfAbsent()`，仅添加不存在的元素       |
| `remove(Object o)`  | 移除元素：复制新数组时排除目标元素，返回是否移除成功                     |
| `contains(Object o)`| 判断元素是否存在：遍历当前数组，通过 `equals()` 对比，无锁操作           |
| `size()`            | 返回元素数量：直接读取当前数组长度，无锁                               |
| `iterator()`        | 返回迭代器：弱一致性（遍历的是创建迭代器时的数组快照）                  |


## 5. 迭代器特性
- **弱一致性**：迭代器创建时会保存当前数组的快照，迭代过程中集合的修改（add/remove）不会反映到迭代器中；
- **不支持修改**：迭代器的 `remove()` 方法会直接抛出 `UnsupportedOperationException`；
- **无并发异常**：迭代时无需加锁，不会抛出 `ConcurrentModificationException`（区别于 `HashSet` 的“快速失败”迭代器）。

```java
CopyOnWriteArraySet<String> set = new CopyOnWriteArraySet<>();
set.add("A");
set.add("B");

// 创建迭代器（快照为 ["A", "B"]）
Iterator<String> it = set.iterator();

// 并发添加元素（新数组为 ["A", "B", "C"]，但迭代器看不到）
set.add("C");

// 迭代结果：仅输出 A、B（快照不变）
while (it.hasNext()) {
    System.out.println(it.next()); // A, B
}
```


## 6. 适用场景
- **读多写少**：读操作远多于写操作（如配置缓存、日志收集），写操作少则“复制数组”的开销可忽略；
- **无需实时一致性**：允许读操作读取到旧数据（如非实时统计场景）；
- **元素量少**：元素数量不多，避免写操作时复制大数组导致内存开销过高；
- **迭代频繁**：需要频繁遍历集合，且不希望迭代时抛出并发异常。


## 7. 优缺点分析
### 优点
1. 读操作性能极高：无锁设计，支持多线程并发读；
2. 线程安全：内部锁保证写操作安全，无需手动加锁；
3. 迭代安全：不会抛出 `ConcurrentModificationException`；
4. 元素有序：保持插入顺序，满足有序遍历需求。

### 缺点
1. 写操作性能差：每次写操作需复制数组，时间复杂度 O(n)，且消耗内存（旧数组未回收前会存在两份数组）；
2. 不保证实时一致性：读操作可能读取到旧数据（写操作未完成前，旧数组仍被访问）；
3. 禁止 null 元素：添加 `null` 会抛出 `NullPointerException`；
4. 批量操作效率低：`addAll()` 会多次复制数组（若集合元素多），需谨慎使用。


## 8. 与其他 Set 实现的对比
| 集合实现                | 线程安全 | 元素唯一性保障          | 写时复制 | 迭代特性       | 性能特点       | 支持 null |
|-------------------------|----------|-------------------------|----------|----------------|----------------|-----------|
| `CopyOnWriteArraySet`   | 是       | `addIfAbsent()` + 锁    | 是       | 弱一致性       | 读快写慢       | 否        |
| `HashSet`               | 否       | `hashCode()` + `equals()`| 否       | 快速失败       | 读写均衡（非并发）| 是        |
| `ConcurrentHashMap.newKeySet()` | 是 | `ConcurrentHashMap` 键唯一 | 否 | 弱一致性 | 读写均衡（并发）| 否        |
| `Collections.synchronizedSet(Set)` | 是 | 原 Set 逻辑 + 全局锁 | 否 | 需手动同步迭代 | 读写均加锁（慢）| 看原 Set  |


## 9. 注意事项
1. **元素类需重写 equals() 和 hashCode()**：否则 `addIfAbsent()` 无法正确判断元素唯一性（例如两个逻辑相同的自定义对象被判定为不同）；
2. 避免频繁写操作：写操作（add/remove）会复制数组，高频写场景会导致严重性能问题；
3. 谨慎使用批量操作：`addAll()`、`removeAll()` 会多次触发数组复制，建议拆分或评估必要性；
4. 不适合大数据量：元素超过万级时，写操作复制数组的内存和时间开销会显著增加；
5. 禁止 null 元素：添加 `null` 会抛出 `NullPointerException`，需提前做非空校验。


## 10. 典型使用示例（含唯一性验证）
```java
import java.util.Iterator;
import java.util.concurrent.CopyOnWriteArraySet;

// 自定义元素类（需重写 equals() 和 hashCode() 保证唯一性）
class User {
    private String id;
    private String name;

    public User(String id, String name) {
        this.id = id;
        this.name = name;
    }

    // 重写 equals()：基于 id 判断唯一性
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id.equals(user.id);
    }

    // 重写 hashCode()：与 equals() 逻辑一致
    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "User{id='" + id + "', name='" + name + "'}";
    }
}

public class CopyOnWriteArraySetDemo {
    public static void main(String[] args) {
        // 1. 创建 Set 实例
        CopyOnWriteArraySet<User> userSet = new CopyOnWriteArraySet<>();

        // 2. 添加元素（验证唯一性）
        User user1 = new User("1001", "张三");
        User user2 = new User("1002", "李四");
        User user3 = new User("1001", "张三（重复）"); // id 与 user1 相同，逻辑重复

        System.out.println(userSet.add(user1)); // true（添加成功）
        System.out.println(userSet.add(user2)); // true（添加成功）
        System.out.println(userSet.add(user3)); // false（重复，添加失败）

        // 3. 遍历集合（验证有序性和唯一性）
        System.out.println("\n集合元素：");
        for (User user : userSet) {
            System.out.println(user); // 仅输出 user1、user2，无 user3
        }

        // 4. 并发场景：读时写不影响
        new Thread(() -> {
            Iterator<User> it = userSet.iterator();
            while (it.hasNext()) {
                System.out.println("\n读线程1：" + it.next());
                try { Thread.sleep(500); } 
                catch (InterruptedException e) { e.printStackTrace(); }
            }
        }).start();

        // 写线程：添加新元素
        new Thread(() -> {
            try {
                Thread.sleep(1000); // 等待读线程开始迭代
                User user4 = new User("1003", "王五");
                userSet.add(user4);
                System.out.println("\n写线程：添加 user4 成功");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```

**输出结果说明**：
- `user3` 添加返回 `false`，未被加入集合，验证唯一性；
- 读线程迭代的是“添加 user4 前的快照”，不会输出 user4，验证弱一致性。