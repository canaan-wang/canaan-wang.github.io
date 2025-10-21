# Runnable 与 Callable

- Runnable：无返回值、不能抛出受检异常；适合简单任务。
- Callable<V>：有返回值、可抛出异常；常与 Future/FutureTask 配合使用。
- Future/FutureTask：表示一个异步计算的结果，可取消、查询是否完成、阻塞获取结果。
- 使用建议：
  - 需要返回值或异常传播时，用 Callable。
  - 与线程池配合时，优先向 Executor 提交 Runnable/Callable，而不是显式创建 Thread。
- 示例：
```
Callable<Integer> task = () -> 42;
FutureTask<Integer> ft = new FutureTask<>(task);
new Thread(ft).start();
Integer r = ft.get();
```