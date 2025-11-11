# ArrayList

## 一、核心特性



- **底层结构**：动态数组（`Object[] elementData`），支持随机访问

- **元素特性**：允许重复、允许null、保持插入顺序（有序）

- **性能特点**：

    - 查询快：通过索引直接访问，时间复杂度O(1)

    - 增删慢：涉及元素移位（尾部操作除外），时间复杂度O(n)

- **线程安全**：非线程安全，多线程场景可选`Collections.synchronizedList()`或`CopyOnWriteArrayList`



## 二、核心属性与初始化



### 1. 关键属性



```Java
transient Object[] elementData; // 存储元素的数组（transient避免序列化空元素）
private int size; // 实际元素数量（≠数组长度）
private static final int DEFAULT_CAPACITY = 10; // 默认初始容量
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {}; // 无参构造初始值

```



### 2. 构造方法



|构造方式|说明|适用场景|
|---|---|---|
|`new ArrayList<>()`|初始为 empty 数组，首次添加元素扩容至10|元素数量未知|
|`new ArrayList<>(int initialCapacity)`|直接初始化指定容量的数组|已知大致元素数量（减少扩容）|
|`new ArrayList<>(Collection<? extends E> c)`|复制集合元素到新数组|基于已有集合初始化|


## 三、核心方法



### 1. 新增元素（`add`系列）



- **尾部添加**（`add(E e)`）：若容量不足则扩容，直接赋值`elementData[size++] = e`（O(1)，高效）

- **指定位置插入**（`add(int index, E e)`）：先检查索引合法性，再将`index`后元素整体后移一位，最后插入新元素（O(n)，低效）



### 2. 删除元素（`remove`系列）



- **按索引删除**（`remove(int index)`）：取出目标元素，将`index`后元素整体前移一位，最后置空末尾元素（避免内存泄漏）

- **按元素删除**（`remove(Object o)`）：先通过`equals`查找首次出现的索引，再执行上述移位操作（需重写`equals`）



### 3. 查询与修改



- `get(int index)`：直接返回`elementData[index]`（O(1)）

- `set(int index, E e)`：替换`elementData[index]`并返回旧值（O(1)）



## 四、扩容机制



1. **触发条件**：添加元素时，`size == elementData.length`（容量不足）

2. **扩容计算**：

    - 非空数组：新容量 = 旧容量 + 旧容量/2（1.5倍扩容）

    - 空数组（无参构造首次添加）：直接扩容至`DEFAULT_CAPACITY`（10）

    - 特殊情况：若计算容量小于最小需求（如一次添加大量元素），则扩容至最小需求

3. **执行过程**：通过`Arrays.copyOf()`创建新数组并复制元素（耗时操作，建议初始化时指定容量）



## 五、遍历与删除陷阱



|遍历方式|边遍历边删除的问题|正确做法|
|---|---|---|
|增强for循环|抛`ConcurrentModificationException`（迭代器检测到结构修改）|避免使用|
|普通for循环|正向遍历会漏删元素（索引移位）|倒序遍历（`for (int i = size-1; i >=0; i--)`）|
|迭代器（Iterator）|调用`list.remove()`会触发异常|使用迭代器自身的`remove()`方法|


## 六、注意事项



1. **null值处理**：支持存储null，`indexOf(null)`通过`==`判断位置

2. **subList视图**：`subList(from, to)`返回原列表的视图，修改会同步影响原列表；原列表结构修改（如add/remove）会导致子列表操作抛`ConcurrentModificationException`

3. **序列化优化**：`elementData`被`transient`修饰，通过重写`writeObject()`只序列化实际元素（`size`范围内），减少空间占用

4. **自定义对象**：`contains`、`indexOf`等方法依赖`equals`，需重写（建议同时重写`hashCode`）



## 七、示例代码



```Java
List<String> list = new ArrayList<>(10); // 指定初始容量
list.add("a");
list.add(0, "b"); // 插入到首位（元素移位）

// 迭代器安全删除
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("a")) {
        it.remove(); // 正确删除
    }
}

// 转换为指定类型数组
String[] arr = list.toArray(new String[0]);
```