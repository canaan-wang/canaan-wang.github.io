# 队列目录分组索引

阻塞队列（BlockingQueue）
- [ArrayBlockingQueue](./ArrayBlockingQueue.md)：有界，数组实现，单锁+两个条件，固定容量限流。
- [LinkedBlockingQueue](./LinkedBlockingQueue.md)：链表实现，双锁，建议显式容量，高并发吞吐。
- [SynchronousQueue](./SynchronousQueue.md)：零容量 handoff，生产者消费者一对一交接。
- [PriorityBlockingQueue](./PriorityBlockingQueue.md)：无界优先级队列，按优先级排序。
- [DelayQueue](./DelayQueue.md)：无界延迟队列，元素实现 Delayed，按到期时间取出。

非阻塞并发队列
- [ConcurrentLinkedQueue](./ConcurrentLinkedQueue.md)：CAS 无锁队列，不阻塞，无背压。

非并发优先级队列
- [PriorityQueue](./PriorityQueue.md)：单线程或外部同步下的优先级队列，非稳定。

说明
- 若需要选择建议与常见坑，请参见概览页：[队列（Queue）概览](../队列.md)