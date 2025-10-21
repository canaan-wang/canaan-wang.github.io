# LockSupport 与 park/unpark

- 作用：底层阻塞/唤醒原语，支持线程挂起与唤醒，避免丢失信号问题。
- API：
  - LockSupport.park()：挂起当前线程。
  - LockSupport.unpark(thread)：唤醒指定线程。
- 与 wait/notify 的区别：
  - 不要求持有对象监视器，无需在同步块中调用。
  - 先 unpark 后 park 也能生效（许可语义），避免信号丢失。
- 场景：实现自定义同步器、队列或在特殊场景下精细控制线程阻塞。