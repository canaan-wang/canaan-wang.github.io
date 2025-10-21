# 原子类（java.util.concurrent.atomic）

- 基于 CAS（Compare-And-Swap）+ volatile 实现无锁并发更新。
- 适用于“单个共享变量”的原子性保障；复杂复合操作需搭配其他同步手段。
- 常见类型：`AtomicInteger`、`AtomicLong`、`AtomicBoolean`、`AtomicReference<T>`
- 字段更新器：`AtomicIntegerFieldUpdater`、`AtomicLongFieldUpdater`、`AtomicReferenceFieldUpdater`
- 原子数组：`AtomicIntegerArray`、`AtomicLongArray`、`AtomicReferenceArray`

示例：计数器
```java
import java.util.concurrent.atomic.AtomicInteger;

public class Counter {
    private final AtomicInteger count = new AtomicInteger();

    public void inc() {
        count.incrementAndGet();
    }
    public int get() {
        return count.get();
    }
}
```