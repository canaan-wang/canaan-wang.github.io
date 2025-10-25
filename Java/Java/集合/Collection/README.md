## 概述


`java.util.Collection` 是 Java 集合框架的根接口之一，定义了所有集合（Collection）的通用操作。它是 List、Set、Queue 等接口的父接口，提供了对集合元素进行添加、删除、遍历、判断等基础操作的规范。




## 核心方法分类



### 1. 元素添加



- **`boolean add(E e)`**向集合中添加指定元素（成功返回 true，若集合不允许重复元素且元素已存在则返回 false）。示例：

    ```Java
    List<String> list = new ArrayList<>();
list.add("apple"); // 返回 true
    ```

- **`boolean addAll(Collection<? extends E> c)`**将另一个集合中的所有元素添加到当前集合（添加成功返回 true）。示例：

    ```Java
    List<Integer> list1 = Arrays.asList(1, 2);
List<Integer> list2 = new ArrayList<>();
list2.addAll(list1); // list2 变为 [1, 2]
    
    ```



### 2. 元素删除



- **`boolean remove(Object o)`**移除集合中第一个与指定元素相等的元素（成功返回 true）。注意：依赖元素的 `equals()` 方法判断相等性。

- **`boolean removeAll(Collection<?> c)`**移除当前集合中所有包含在指定集合中的元素（即保留差集）。

- **`boolean retainAll(Collection<?> c)`**仅保留当前集合中与指定集合共有的元素（即保留交集）。

- **`void clear()`**清空集合中所有元素。



### 3. 元素查询与判断



- **`int size()`**返回集合中元素的数量。

- **`boolean isEmpty()`**判断集合是否为空（元素数量为 0 时返回 true）。

- **`boolean contains(Object o)`**判断集合是否包含指定元素（依赖 `equals()` 方法）。

- **`boolean containsAll(Collection<?> c)`**判断当前集合是否包含指定集合中的所有元素。



### 4. 集合转换



- **`Object[] toArray()`**将集合转换为 Object 数组。

- **`<T> T[] toArray(T[] a)`**将集合转换为指定类型的数组（更常用，避免类型转换问题）。示例：

    ```Java
    List<String> list = Arrays.asList("a", "b");
String[] arr = list.toArray(new String[0]); // 结果为 ["a", "b"]
    ```



### 5. 遍历方式



- **迭代器（Iterator）**通过 `Iterator<E> iterator()` 获取迭代器，支持遍历和安全删除元素。示例：

    ```Java
    Collection<String> coll = new HashSet<>();
coll.add("x");
coll.add("y");

Iterator<String> it = coll.iterator();
while (it.hasNext()) {
    String elem = it.next();
    if (elem.equals("x")) {
        it.remove(); // 迭代中安全删除元素
    }
}
    ```

- **增强 for 循环（foreach）**简化遍历代码（底层仍使用迭代器，但不能在遍历中修改集合结构）。示例：

    ```Java
    for (String elem : coll) {
    System.out.println(elem);
}
    ```

- **Java 8+ 流（Stream）**通过 `stream()` 或 `parallelStream()` 进行函数式编程风格的遍历和处理。示例：

    ```Java
coll.stream().filter(s -> s.length() > 2).forEach(System.out::println);
    ```



## 子接口特点



- **List**：有序集合（元素有索引），允许重复元素（如 ArrayList、LinkedList）。

- **Set**：无序集合（无索引），不允许重复元素（如 HashSet、TreeSet）。

- **Queue**：队列（通常按 FIFO 顺序处理元素，如 LinkedList、PriorityQueue）。



## 注意事项



1. **线程安全**：默认实现类（如 ArrayList、HashSet）均非线程安全，多线程环境需手动同步或使用 `Collections.synchronizedCollection()` 包装。

2. **元素类型**：集合中存储的是对象引用，基本类型需使用包装类（如 int → Integer）。

3. **equals() 与 hashCode()**：若集合元素是自定义对象，需重写这两个方法以保证 `contains()`、`remove()` 等方法的正确性（尤其对 Set 和 Map 的键）。

4. **集合清空**：`clear()` 仅删除元素引用，不会销毁集合对象本身。

5. **null元素添加规则**：不同子接口的实现类对null元素的支持不同，需重点注意：

    1. **List接口实现类**：允许添加null元素，且支持添加多个null（因List有序且允许重复）。例如 ArrayList、LinkedList 均可执行 `list.add(null)`，多次添加后集合中会存在多个null元素，通过索引可访问指定位置的null。

    2. **Set接口实现类**：分情况讨论：
    - HashSet：允许添加1个null元素（因Set不允许重复，多次添加null仅保留1个）；
    - TreeSet：不允许添加null元素（TreeSet基于自然排序或比较器排序，null无法参与排序，添加时会抛出 `NullPointerException`）；
    - LinkedHashSet：与HashSet一致，允许添加1个null元素。

    3. **Queue接口实现类**：分情况讨论：
    - LinkedList（可作为Queue实现）：允许添加null元素；
    - PriorityQueue：不允许添加null元素（优先级队列需基于元素优先级排序，null无法参与排序，添加时抛出 `NullPointerException`）；
    - ArrayDeque：不允许添加null元素（作为双端队列，添加null会抛出 `NullPointerException`）。