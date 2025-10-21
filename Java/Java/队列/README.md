# Java 队列实现

## 文件夹主题概述
本目录收录了Java中各种队列的实现，包括阻塞队列、非阻塞并发队列、优先级队列等，旨在提供不同场景下队列选择与使用的参考。

## 内容分类逻辑
按队列的特性和使用场景进行分类：
- **阻塞队列（BlockingQueue）**：支持阻塞操作的队列，适用于生产者-消费者模式
- **非阻塞并发队列**：基于CAS实现的无锁队列，适用于高并发场景
- **非并发优先级队列**：单线程环境下的优先级队列实现

## 子文件/子文件夹跳转链接

### 阻塞队列（BlockingQueue）
- [ArrayBlockingQueue](ArrayBlockingQueue.md)：有界，数组实现，单锁+两个条件，固定容量限流。
- [LinkedBlockingQueue](LinkedBlockingQueue.md)：链表实现，双锁，建议显式容量，高并发吞吐。
- [SynchronousQueue](SynchronousQueue.md)：零容量handoff，生产者消费者一对一交接。
- [PriorityBlockingQueue](PriorityBlockingQueue.md)：无界优先级队列，按优先级排序。
- [DelayQueue](DelayQueue.md)：无界延迟队列，元素实现Delayed，按到期时间取出。

### 非阻塞并发队列
- [ConcurrentLinkedQueue](ConcurrentLinkedQueue.md)：CAS无锁队列，不阻塞，无背压。

### 非并发优先级队列
- [PriorityQueue](PriorityQueue.md)：单线程或外部同步下的优先级队列，非稳定。

## 补充说明
- 队列选择建议：根据并发需求、是否需要阻塞、是否需要优先级等因素选择合适的队列实现
- 阻塞队列适用于需要背压控制的场景，非阻塞队列适用于追求高吞吐的场景
- 队列通常用于解耦生产者和消费者，实现异步处理和流量削峰
- 最后更新时间：2024-01-15