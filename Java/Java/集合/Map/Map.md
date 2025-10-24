# Map

## 一、Map 接口概述



- **定义**：`java.util.Map` 是 Java 集合框架中用于存储键值对（key-value）的接口，不属于 Collection 体系

- **核心特点**：

    - 键（key）唯一，每个 key 只能映射一个 value

    - value 可以重复

    - 键值对之间没有固定顺序（部分实现类如 TreeMap 有顺序）

    - 允许使用 null 作为 key 或 value（但 HashMap 只允许一个 null key，HashTable 不允许 null）



## 二、常用实现类及特性



|实现类|底层结构|线程安全|有序性|允许 null|适用场景|
|---|---|---|---|---|---|
|HashMap|数组+链表+红黑树|否|无序|是|一般场景，查询效率高|
|LinkedHashMap|继承 HashMap，加双向链表|否|插入/访问顺序|是|需要保持插入顺序或访问顺序|
|TreeMap|红黑树|否|自然排序/定制排序|是（key 不能为 null）|需要排序的场景|
|Hashtable|数组+链表|是（方法加 synchronized）|无序|否|多线程环境（已被 ConcurrentHashMap 替代）|
|ConcurrentHashMap|分段锁/ CAS + synchronized|是|无序|是|高并发场景|


## 三、核心方法



### 1. 基本操作



- `V put(K key, V value)`：添加键值对，返回被覆盖的旧值（无则返回 null）

- `V get(Object key)`：根据 key 获取 value，无则返回 null

- `V remove(Object key)`：删除指定 key 的键值对，返回被删除的 value

- `boolean containsKey(Object key)`：判断是否包含指定 key

- `boolean containsValue(Object value)`：判断是否包含指定 value

- `int size()`：返回键值对数量

- `boolean isEmpty()`：判断是否为空

- `void clear()`：清空所有键值对



### 2. 视图操作（返回集合视图，可用于遍历）



- `Set<K> keySet()`：返回所有 key 的集合

- `Collection<V> values()`：返回所有 value 的集合

- `Set<Map.Entry<K,V>> entrySet()`：返回键值对实体的集合（推荐遍历方式）



## 四、遍历方式



1. **keySet 遍历（效率较低，需二次 get）**



```Java
for (K key : map.keySet()) {
    V value = map.get(key);
}
```



1. **entrySet 遍历（推荐，一次获取键值对）**



```Java
for (Map.Entry<K, V> entry : map.entrySet()) {
    K key = entry.getKey();
    V value = entry.getValue();
}
```



1. **迭代器遍历（支持在遍历中删除元素）**



```Java
Iterator<Map.Entry<K, V>> iterator = map.entrySet().iterator();
while (iterator.hasNext()) {
    Map.Entry<K, V> entry = iterator.next();
    // 安全删除：iterator.remove()
}
```



1. **Java 8+ 流式遍历**



```Java
map.forEach((k, v) -> {
    // 处理 k 和 v
});
```



## 五、注意事项



1. **HashMap 扩容机制**：

    - 初始容量 16，负载因子 0.75（达到 16*0.75=12 时扩容）

    - 扩容为原容量的 2 倍，需重新计算哈希并迁移元素

    - JDK 8 中当链表长度 > 8 且数组长度 > 64 时，链表转为红黑树

2. **key 的设计原则**：

    - 必须重写 `hashCode()` 和 `equals()` 方法（保证 key 唯一性）

    - 推荐使用不可变对象作为 key（如 String、Integer），避免 key 变化导致哈希值改变

3. **线程安全问题**：

    - 多线程环境下使用 HashMap 可能导致死循环（JDK 7 及之前）或数据不一致

    - 替代方案：`ConcurrentHashMap`（高效）或 `Collections.synchronizedMap(map)`（全表锁，低效）

4. **TreeMap 排序**：

    - 实现 `Comparable` 接口（自然排序）或传入 `Comparator`（定制排序）

    - 排序依据 key，与 value 无关



## 六、常见问题



- **HashMap 与 HashTable 区别**：线程安全（HashTable 安全）、null 允许（HashMap 允许）、效率（HashMap 更高）

- **LinkedHashMap 如何实现顺序**：通过双向链表记录插入顺序或访问顺序（`accessOrder=true` 时为访问顺序，适用于 LRU 缓存）

- **如何实现 LRU 缓存**：使用 `LinkedHashMap` 并重写 `removeEldestEntry` 方法

- **TreeMap 与 Collections.sort() 区别**：TreeMap 是存储时排序，后者是对已有集合排序



## 七、使用示例（HashMap）



```Java
public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        
        // 添加元素
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("orange", 15);
        
        // 获取元素
        System.out.println(map.get("apple")); // 10
        
        // 遍历
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 其他操作
        map.remove("banana");
        System.out.println(map.containsKey("orange")); // true
        System.out.println(map.size()); // 2
    }
}
```