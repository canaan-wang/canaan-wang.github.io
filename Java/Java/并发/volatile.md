# volatile 内存可见性与有序性

- 语义：
  - 可见性：对 volatile 变量的写入，会立即刷新到主内存；读取直接从主内存获取。
  - 禁止指令重排：对 volatile 变量的读写与其前后普通读写之间建立一定的有序性（happens-before）。
- 不保证原子性：对 volatile 变量的复合操作（如 i++）不是原子，需要配合原子类或锁。
- 典型应用：
  - 状态标志位（如停止标志）。
  - 配合双重检查锁（DCL）初始化单例，防止重排序导致对象“半初始化”。
- 示例：
```
class Stopper {
  volatile boolean stop = false;
}
```
- 与 Atomic 的区别：Atomic 类通过 CAS 保证原子性；volatile 仅提供可见性与有序性。
- 注意：过度使用 volatile 不能替代更强的同步机制，易导致隐蔽并发 bug。