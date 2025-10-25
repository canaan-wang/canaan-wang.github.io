# ArrayList

## 一、基本概念



- **本质**：基于动态数组实现的List接口实现类，允许存储重复元素、null值，有序（插入顺序=遍历顺序）

- **特点**：查询快（随机访问，时间复杂度O(1)），增删慢（涉及元素移动，时间复杂度O(n)）

- **线程安全**：非线程安全，多线程环境下需手动同步（如`Collections.synchronizedList()`）或使用`CopyOnWriteArrayList`



## 二、核心属性



```Java
// 底层存储元素的数组
transient Object[] elementData;
// 实际元素数量（区别于数组长度）
private int size;
// 默认初始容量（无参构造时，首次添加元素会扩容到此值）
private static final int DEFAULT_CAPACITY = 10;
// 空数组（无参构造初始值）
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
```



## 三、常用构造方法



1. **无参构造**`List<String> list = new ArrayList<>();`  

    - 初始元素数组为`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`（空数组）  

    - 首次添加元素时，自动扩容至默认容量10

2. **指定初始容量**`List<Integer> list = new ArrayList<>(20);`  

    - 适合已知大致元素数量的场景，减少扩容次数，提高效率

3. **通过集合初始化**`List<String> list = new ArrayList<>(Arrays.asList("a", "b"));`  

    - 将传入集合的元素全部复制到新数组中



## 四、常用方法（按功能分类）



### 1. 增



- `add(E e)`：在末尾添加元素（返回boolean）  

- `add(int index, E e)`：在指定索引插入元素（索引越界会抛`IndexOutOfBoundsException`）  

- `addAll(Collection<? extends E> c)`：添加另一个集合的所有元素到末尾  

- `addAll(int index, Collection<? extends E> c)`：从指定索引开始添加另一个集合的元素



### 2. 删



- `remove(int index)`：删除指定索引的元素，返回被删除元素  

- `remove(Object o)`：删除第一个匹配的元素（需重写`equals`方法），返回boolean  

- `removeAll(Collection<?> c)`：删除两个集合的交集元素  

- `retainAll(Collection<?> c)`：保留两个集合的交集元素（删除其他元素）  

- `clear()`：清空所有元素（size=0，但数组容量不变）



### 3. 改



- `set(int index, E e)`：替换指定索引的元素，返回被替换的旧元素



### 4. 查



- `get(int index)`：获取指定索引的元素  

- `indexOf(Object o)`：返回元素首次出现的索引（不存在返回-1）  

- `lastIndexOf(Object o)`：返回元素最后出现的索引（不存在返回-1）  

- `contains(Object o)`：判断是否包含元素（依赖`equals`方法）  

- `isEmpty()`：判断是否为空（size==0）  

- `size()`：返回元素数量  



### 5. 遍历



- **for循环**：适合随机访问（通过索引）  

    ```Java
    for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
    ```

- **增强for循环**：简洁，适合遍历所有元素  

    ```Java
    for (String s : list) {
    System.out.println(s);
}
    ```

- **迭代器（Iterator）**：支持边遍历边删除（避免`ConcurrentModificationException`）  

    ```Java
    Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("a")) {
        it.remove(); // 正确删除方式
    }
}
    ```



### 6. 其他



- `toArray()`：转换为Object数组  

- `toArray(T[] a)`：转换为指定类型数组（推荐，避免类型转换问题）  

- `subList(int fromIndex, int toIndex)`：返回子列表（注意：子列表是原列表的视图，修改会影响原列表）  



## 五、扩容机制



1. **触发时机**：添加元素时，若当前数组容量不足（`size == elementData.length`），则触发扩容  

2. **扩容规则**：  

    - 新容量 = 旧容量 + 旧容量/2（即1.5倍扩容）  

    - 若初始为空数组（无参构造），首次扩容直接到10  

    - 若计算的新容量小于最小需求（如添加大量元素时），则直接扩容至最小需求容量  

3. **扩容过程**：创建新数组，将旧数组元素复制到新数组（`Arrays.copyOf()`），效率较低，建议初始化时指定合适容量  



## 六、注意事项



1. **遍历删除问题**：  

    - 增强for循环中直接调用`list.remove()`会抛`ConcurrentModificationException`  

    - 需使用迭代器的`remove()`方法，或倒序for循环删除  

2. **null值处理**：允许存储null，`indexOf(null)`可查找null的位置（依赖`==`判断）  

3. **元素比较**：`contains`、`indexOf`等方法依赖元素的`equals`方法，自定义对象需重写  

4. **subList陷阱**：子列表不是独立集合，是原列表的视图，原列表结构修改（如add/remove）会导致子列表操作抛异常  

5. **序列化**：`elementData`被`transient`修饰，通过重写`writeObject()`实现序列化（只序列化实际元素，节省空间）  

## 八、示例代码（常用操作汇总）



```Java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        // 初始化
        List<String> list = new ArrayList<>();
        
        // 添加元素
        list.add("a");
        list.add("b");
        list.add(1, "c"); // 在索引1插入"c"，此时列表为[a, c, b]
        
        // 获取元素
        System.out.println(list.get(2)); // 输出b
        
        // 修改元素
        list.set(0, "A"); // 列表变为[A, c, b]
        
        // 遍历（迭代器方式）
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if (s.equals("c")) {
                it.remove(); // 删除"c"，列表变为[A, b]
            }
        }
        
        // 判断包含
        System.out.println(list.contains("A")); // 输出true
        
        // 清空
        list.clear();
        System.out.println(list.isEmpty()); // 输出true
    }
}
```