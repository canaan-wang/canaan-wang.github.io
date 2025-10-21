# Java 并发编程

## 文件夹主题概述
本目录收录了Java并发编程相关知识，包括多线程基础、同步机制、并发工具类等内容，是Java高级编程的重要组成部分。

## 内容分类逻辑
按Java并发编程的主题和学习进阶路径进行分类：
- **线程基础**：线程创建、生命周期、调度等基础知识
- **同步与内存语义**：线程同步机制、内存模型、可见性等核心概念
- **并发工具**：并发容器、辅助工具类、线程协调机制等
- **高级特性**：CompletableFuture、虚拟线程等现代Java并发特性

## 子文件/子文件夹跳转链接

### 线程基础
- [线程基础](线程.md)：线程创建、生命周期、调度等
- [线程池](线程池.md)：线程池原理、类型与使用
- [Runnable 与 Callable](Callable&Runnable.md)：任务定义接口比较
- [Future](Future.md)：异步计算结果处理
- [CompletableFuture](CompletableFuture.md)：函数式异步编程
- [定时与周期任务](定时任务.md)：定时执行与周期性任务
- [ForkJoinPool 并行分治](ForkJoinPool.md)：并行任务处理框架

### 同步与内存语义
- [synchronized 内置锁](synchronized.md)：Java内置同步机制
- [锁：ReentrantLock/ReadWriteLock/StampedLock](锁.md)：显式锁框架
- [volatile 内存可见性](volatile.md)：内存可见性与指令重排序
- [Java 内存模型（JMM）](JMM.md)：Java内存模型详解
- [LockSupport 与 park/unpark](LockSupport.md)：线程挂起与唤醒
- [CAS 与无锁编程](CAS.md)：无锁算法与实现原理

### 线程协调与工具
- [并发工具类总览](并发工具.md)：常用并发工具类详解
- [并发容器综述](并发容器.md)：线程安全的容器实现
- [ThreadLocal 线程本地变量](ThreadLocal.md)：线程局部变量机制
- [Condition](condition.md)：条件变量与线程等待通知
- [Semaphore](semaphore.md)：信号量与资源控制
- [CountDownLatch](countdown-latch.md)：线程同步辅助类
- [CyclicBarrier](cyclic-barrier.md)：循环屏障与线程协调

### 并发问题与解决方案
- [线程中断与取消](线程中断.md)：线程中断机制与任务取消
- [死锁与避免策略](死锁与避免.md)：死锁产生原因与避免方法

### 现代Java并发
- [虚拟线程（Project Loom）](虚拟线程.md)：Java轻量级线程
- [原子类](atomic.md)：原子操作类详解
- [锁与AQS](lock.md)：AbstractQueuedSynchronizer详解

## 补充说明
- 并发编程是Java开发中的难点，建议先掌握基础概念再学习高级特性
- 每个文档都包含原理讲解、代码示例和使用注意事项
- 并发编程需要特别注意线程安全问题，理解内存模型和同步机制
- 持续更新中，重点关注Java 8+的并发特性和最佳实践
- 最后更新时间：2024-01-15