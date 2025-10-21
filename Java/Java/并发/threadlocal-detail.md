# ThreadLocal（线程本地存储）

作用与概念
- 为每个线程提供变量的独立副本，实现线程隔离，减少同步与锁争用。
- 常用于保存与线程相关的上下文数据（如用户信息、事务/请求上下文、格式化器）。

核心 API
- 定义共享变量：`ThreadLocal<T> tl = new ThreadLocal<>();`
- 设值：`tl.set(value)`
- 取值：`tl.get()`（第一次调用若未设值，返回 `initialValue()`，默认 `null`）
- 删除：`tl.remove()`（及时清理可避免内存占用与脏数据传播）
- 覆盖初始值：在子类中重写 `protected T initialValue()` 提供默认值

使用示例
```java
public class ContextHolder {
    private static final ThreadLocal<String> USER = new ThreadLocal<>();

    public static void set(String user) { USER.set(user); }
    public static String get() { return USER.get(); }
    public static void clear() { USER.remove(); }
}
```

典型场景
- Web 请求上下文（如用户ID、traceId）；日志链路追踪；数据库事务上下文等。
- 无状态工具的线程安全替代：如 `DateTimeFormatter`、`NumberFormat` 等。

注意事项（尤其在线程池环境）
- 线程池中的线程会复用，若不 `remove()`，之前线程的值可能“泄漏”到后续任务。
- `ThreadLocalMap` 使用弱引用保存 Key，但 Value 可能在 Key 被回收后仍存在于 Map 中，直到下一次访问/清理。
- 建议使用 try/finally 模式确保清理：
```java
try {
    ContextHolder.set("user-123");
    // 业务逻辑...
} finally {
    ContextHolder.clear();
}
```

对比与选择
- 相比使用全局变量+锁：ThreadLocal 更适合保存与“线程上下文”绑定的数据，不用于线程间共享。
- 与参数传递：当层级很深、横切面较多时，ThreadLocal 可减少穿透式参数传递，但需严格治理生命周期。