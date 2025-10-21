# Java 并发编程

## 文件夹主题概述
本目录收录了Java并发编程相关知识，包括多线程基础、同步机制、并发工具类等内容，是Java高级编程的重要组成部分。涵盖了从基础线程概念到高级并发特性的完整知识体系。

## 内容分类逻辑
按Java并发编程的主题和学习进阶路径进行分类：
- **线程基础**：线程创建、生命周期、调度等基础知识
- **同步与内存语义**：线程同步机制、内存模型、可见性等核心概念
- **并发工具**：并发容器、辅助工具类、线程协调机制等
- **并发问题与解决方案**：死锁、线程中断等常见问题及应对策略
- **现代Java并发**：CompletableFuture、虚拟线程等现代Java并发特性

## 子文件/子文件夹跳转链接

### 线程基础
- [线程基础](线程.md)：线程创建、生命周期、调度等基础知识
- [线程池](线程池.md)：线程池原理、类型与使用
- [Runnable 与 Callable](Callable&Runnable.md)：任务定义接口比较与详细使用
- [Future](Future.md)：异步计算结果处理与局限性分析
- [CompletableFuture](CompletableFuture.md)：函数式异步编程与任务编排
- [定时与周期任务](定时任务.md)：定时执行与周期性任务调度
- [ForkJoinPool 并行分治](ForkJoinPool.md)：并行任务处理框架与工作窃取算法

### 同步与内存语义
- [synchronized 内置锁](synchronized.md)：Java内置同步机制详解
- [锁：ReentrantLock/ReadWriteLock/StampedLock](锁.md)：显式锁框架与AQS原理
- [volatile 内存可见性](volatile.md)：内存可见性与指令重排序语义
- [Java 内存模型（JMM）](JMM.md)：Java内存模型与happens-before规则
- [LockSupport 与 park/unpark](LockSupport.md)：线程挂起与唤醒底层机制
- [CAS 与无锁编程](CAS.md)：无锁算法与实现原理
- [原子类](atomic.md)：原子操作类详解与使用场景

### 线程协调与工具
- [并发工具类总览](并发工具.md)：CountDownLatch、CyclicBarrier、Semaphore、Phaser详解
- [并发容器综述](并发容器.md)：线程安全的容器实现与性能对比
- [并发容器详解](concurrent-containers.md)：ConcurrentHashMap、CopyOnWriteArrayList等详细分析
- [ThreadLocal 线程本地变量](ThreadLocal.md)：线程局部变量机制与内存泄漏防范
- [Condition](condition.md)：条件变量与线程等待通知机制
- [Semaphore](semaphore.md)：信号量与资源并发控制
- [CountDownLatch](countdown-latch.md)：一次性门闩与线程同步
- [CyclicBarrier](cyclic-barrier.md)：循环屏障与多阶段任务协调

### 并发问题与解决方案
- [线程中断与取消](线程中断.md)：线程中断机制与任务取消策略
- [死锁与避免策略](死锁与避免.md)：死锁产生原因与避免方法
- [wait/notify 机制](wait-notify.md)：对象监视器与线程通信
- [sleep 与 yield](sleep.md)：线程休眠与让步操作

### 现代Java并发
- [虚拟线程（Project Loom）](虚拟线程.md)：Java轻量级线程与协程
- [CompletableFuture 高级用法](CompletableFuture.md)：异步编程最佳实践

## 补充说明
- 并发编程是Java开发中的难点，建议先掌握基础概念再学习高级特性
- 每个文档都包含原理讲解、代码示例和使用注意事项
- 并发编程需要特别注意线程安全问题，理解内存模型和同步机制
- 文档按照学习路径组织，建议按顺序阅读：线程基础 → 同步机制 → 并发工具 → 高级特性
- 持续更新中，重点关注Java 8+的并发特性和最佳实践
- 最后更新时间：2024-12-19