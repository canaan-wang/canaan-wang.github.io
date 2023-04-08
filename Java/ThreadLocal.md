## 介绍
    通过为每个线程提供变量副本，实现多个线程对共享变量的数据隔离

## 使用
- 共享变量定义
```java
    private ThreadLocal<String> threadLocal = new ThreadLocal<>();
```
- 设置变量值
```java
    public void set(Object value)
```
- 获取变量值
```java
    public Object get()
```
- 删除变量值: 
  - 可以将变量值删除，减少内存占用。
  - 线程结束后也可以将其删除，但是使用该方法可以使内存回收更及时。
```java
    public void remove()
```
- 获取变量初始值：ThreadLocal 默认为 null，用于在继承类中覆盖.
- 在第一次调用 get() 方法时会调用到
```java
protected Object initialValue()
```

