## 进程、线程、协程
### 进程
- 有独立的地址空间
- 上下文切换开销较大
- 并发性效率低
- 有程序运行入口
- 崩溃后对其它进程不会产生影响
### 线程
- 线程拥有各自的计数器、堆栈、局部变量，共享进程内的资源
- 上下文切换开销较小
- 并发性效率高
- 操作系统调度的最小单元
- 不能够独立执行,依存在应用程序,由应用程序提供多个线程执行控制
- 崩溃后会影响到整个进程
- 线程、协程区别：
    线程是操作系统的资源,线程的创建、切换、停止等都非常消耗资源,而创建协程不需要调用操作系统的功能,编程语言自身就能完成,所以协程也被称为用户态线程,协程比线程轻量很多；
    线程在多核环境下是能做到真正意义上的并行,而协程是为并发而产生的；
    一个具有多个线程的程序可以同时运行几个线程,而协同程序却需要彼此协作的运行；
    线程进程都是同步机制,而协程则是异步；
    线程是抢占式,而协程是非抢占式的,所以需要用户自己释放使用权来切换到其他协程,因此同一时间其实只有一个协程拥有运行权,相当于单线程的能力； 
    操作系统对于线程开辟数量限制在千的级别,而协程可以达到上万的级别。

## 死锁
- 争夺共享资源而造成的一种互相等待的现象
（死锁发生，四个必须条件）
### 互斥条件
- 进程对所分配到的资源进行排它性使用,即在一段时间内某资源只由一个进程占用
### 请求保持
- 进程已经保持至少一个资源,但又提出了新的资源请求,而该资源已被其它进程占有,此时请求进程阻塞,但又对自己已获得的其它资源保持不放
### 不剥夺
- 指进程已获得的资源,在未使用完之前,不能被剥夺,只能在使用完时由自己释放
### 环路等待
- 指在发生死锁时,必然存在一个进程——资源的环形链

## 进程间通信（IPC）
### 管道
- 本质是内核维护的一块内存缓冲区， Linux 系统通过 pipe() 创建管道，生成读写的两个文件描述符（只能应用于有亲缘关系的进程间通信）
### 命名管道
- 为了解决管道仅能亲缘关系进程间通信的问题，提供了一个与路径关联的 FIFO 文件，通过该文件进行数据交互。
### 信号（软件中断）
- 事件发生时对进程的通知机制，是一种异步通信。
### 消息队列
- 消息链表，
### 共享内存
- 多个进程可共享同一块物理内存
### 内存映射
- 磁盘文件的数据映射到内存,用户通过修改内存就能修改磁盘文件
### 信号量
- 主要用来解决进程和线程间并发执行时的同步问题
- 信号量的操作分为 P 操作和 V 操作
- P 操作是将信号量的值减 1
- V 操作是将信号量的值加 1。
- 当信号量的值小于等于 0 之后,再进行 P 操作时,当前进程或线程会被阻塞,直到另一个进程或线程执行了 V 操作将信号量的值增加到大于 0 之时。
### Socket
- 网络中不同主机上的应用进程之间进行双向通信的端点的抽象。
- 一个套接字就是网络上进程通信的一端,提供了应用层进程利用网络协议交换数据的机制。
- Socket 一般用于网络中不同主机上的进程之间的通信。

## CPU 
### CAS
- 一种对内存中的共享数据进行操作的一种特殊指令，这个指令会对内存中的共享数据做原子的读写操作。其作用是让CPU比较内存中某个值是否和CPU 中原值相同，如果相同则将这个值更新为新值，不相同则不做更新。

## 内存
### 物理内存
- 使用物理地址，寻址范围有限
### 虚拟内存
- 为解决物理内存，内存有限，内存碎片化问题而引入的内存管理技术。应用程序与物理内存避免直接交互，应用程序使用的内存由虚拟内存决定
### 内存管理
- 段页式存储管理
    将用户程序分为若干段，每段赋予段名
    将若干段分成若干页
- 为了实现从逻辑地址到物理地址的转化，同时配置了段表和页表
- 系统为每一个进程建立一张段表，每个分段有一只页表


## IO
### IO 模型
#### 阻塞 IO（BIO）
- 最常用
- 所用文件操作都是阻塞的（socket 操作也是）
#### 非阻塞 IO （NIO）
#### 异步 IO (O)
### IO 多路复用
- 把多个 IO 阻塞复用到一个 select or epoll 阻塞上，实现单线程下同时处理多个客户端请求
- 优势：系统开销小，不需要创建额外的进程 or 线程，节省了系统资源。
- 目前支持多路复用的系统调用：select、pselect、poll、epoll，目前 Linux 使用的 epoll
#### epoll
- 支持进程打开的 socket（FD）树不受限制，在高并发场景下能够得到有力的网络支持。
- 通过回调的方式得到活跃的 socket，在多数 socket 不活跃的情况下，比 select 效率高出很多。
- 通过 mmap（使用同一块内存） 加速内核与用户空间的消息传递
#### select
- 支持打开的 socket 有限
- 通过线性扫描的方式得到活跃的 socket
- 通过复制的方式传到用户空间

### 介绍
- 全称：Unix Domain Sockets 简称 UDS 别名 IPC Socket
- 功能：使同一机器上多个进程间相互通信

### 与 TCP/IP 通信的区别
维度:	    UDS	                                            TCP/IP      socket
标识:
- UDS：一个文件名，例如：/var/lib/example/example.socket
- TCP/IP：IP:Port，例如：192.168.0.2::9090
包处理过程：
- UDS：将应用层数据从一个进程拷贝到另一个进程
- TCP/IP：需要经过网络协议栈，打包拆包、计算校验和、维护序号和应答等
使用场景：
- UDS：同一台机器上两个或多个进程间通信，速度更快
- TCP/IP：跨网络通信
