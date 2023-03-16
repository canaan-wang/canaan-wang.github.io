
<!-- vscode-markdown-toc -->
* 1. [面向对象](#)
	* 1.1. [类](#-1)
	* 1.2. [对象](#-1)
	* 1.3. [面向对象的特征](#-1)
	* 1.4. [代码中如何实现多态](#-1)
	* 1.5. [虚拟机是如何实现多态的](#-1)
	* 1.6. [重载（Overload）](#Overload)
	* 1.7. [重写（Override）](#Override)
	* 1.8. [构造器](#-1)
	* 1.9. [接口的意义](#-1)
	* 1.10. [抽象类的意义](#-1)
	* 1.11. [抽象类和接口的区别](#-1)
	* 1.12. [访问修饰符](#-1)
* 2. [基本类型（数值、字符、布尔）](#-1)
* 3. [包装类型](#-1)
* 4. [运算符](#-1)
* 5. [switch](#switch)
* 6. [final](#final)
* 7. [throw、throws](#throwthrows)
* 8. [instanceof](#instanceof)
* 9. [方法](#-1)
* 10. [变量](#-1)
* 11. [static](#static)
* 12. [String](#String)
* 13. [StringBuilder、StringBuffer](#StringBuilderStringBuffer)
* 14. [equals、hashCode](#equalshashCode)
	* 14.1. [hashCode](#hashCode)
	* 14.2. [equals](#equals)
* 15. [finalize](#finalize)
* 16. [四种引用](#-1)
* 17. [ArrayList](#ArrayList)
* 18. [Vector](#Vector)
* 19. [LinkedList](#LinkedList)
* 20. [HashSet](#HashSet)
* 21. [TreeSet](#TreeSet)
* 22. [PriorityQueue](#PriorityQueue)
* 23. [TreeMap](#TreeMap)
* 24. [LinkedHashMap](#LinkedHashMap)
* 25. [WeakHashMap](#WeakHashMap)
* 26. [ConcurrentHashMap](#ConcurrentHashMap)
* 27. [HashMap](#HashMap)
	* 27.1. [put 操作过程](#put)
	* 27.2. [扩容机制](#-1)
	* 27.3. [并发场景下使用](#-1)
* 28. [Hashtable](#Hashtable)
* 29. [Concurrent 包（1.5 后新增一些并发安全容器）](#Concurrent1.5)
	* 29.1. [原子类](#-1)
	* 29.2. [锁](#-1)
	* 29.3. [并发容器](#-1)
	* 29.4. [同步工具](#-1)
	* 29.5. [ConcurrentHashMap](#ConcurrentHashMap-1)
	* 29.6. [CopyOnWriteArrayList](#CopyOnWriteArrayList)
	* 29.7. [BlockingQueue（Lock 实现的阻塞队列）](#BlockingQueueLock)
	* 29.8. [ArrayBlockingQueue（Lock 实现的阻塞队列）](#ArrayBlockingQueueLock)
* 30. [并发控制（线程安全）](#-1)
	* 30.1. [原子类](#-1)
	* 30.2. [volatile](#volatile)
		* 30.2.1. [synchronized](#synchronized)
		* 30.2.2. [Lock](#Lock)
	* 30.3. [wait](#wait)
	* 30.4. [sleep](#sleep)
	* 30.5. [awt](#awt)
* 31. [Thread](#Thread)
	* 31.1. [线程状态](#-1)
	* 31.2. [继承 Tread 类（创建线程）](#Tread)
	* 31.3. [实现 Runnable 接口（创建线程）](#Runnable)
	* 31.4. [实现 Callable 接口（创建线程，可拿到线程返回值）](#Callable)
* 32. [线程池](#-1)
	* 32.1. [相关参数](#-1)
	* 32.2. [生命状态](#-1)
	* 32.3. [线程池任务处理流程](#-1)
	* 32.4. [拒绝策略](#-1)
	* 32.5. [相关类](#-1)
	* 32.6. [ThreadLocal](#ThreadLocal)
* 33. [反射](#-1)
* 34. [泛型](#-1)
* 35. [异常处理](#-1)
	* 35.1. [Error、Exception](#ErrorException)
	* 35.2. [RuntimeException](#RuntimeException)
	* 35.3. [finally](#finally)
* 36. [IO](#IO)
	* 36.1. [NIO](#NIO)
* 37. [注解](#-1)
	* 37.1. [@Autowired](#Autowired)
	* 37.2. [@Resource](#Resource)
* 38. [类加载](#-1)
	* 38.1. [类加载阶段](#-1)
	* 38.2. [双亲委派机制](#-1)
* 39. [Collections 包](#Collections)
* 40. [JVM](#JVM)
	* 40.1. [类加载子系统](#-1)
	* 40.2. [执行引擎](#-1)
	* 40.3. [运行时数据区](#-1)
		* 40.3.1. [堆（公有）](#-1)
		* 40.3.2. [方法区（公有）](#-1)
		* 40.3.3. [虚拟机栈（线程私有）](#-1)
		* 40.3.4. [程序计数器（线程私有）](#-1)
		* 40.3.5. [本地方法栈（线程私有）](#-1)
* 41. [垃圾回收](#-1)
	* 41.1. [垃圾回收算法](#-1)
		* 41.1.1. [标记复制算法（新生代使用该算法）](#-1)
		* 41.1.2. [标记整理算法（老年代）](#-1)
	* 41.2. [垃圾回收器](#-1)
		* 41.2.1. [G1](#G1)
		* 41.2.2. [CMS](#CMS)
		* 41.2.3. [GC Roots](#GCRoots)
		* 41.2.4. [finalize](#finalize-1)
* 42. [内存](#-1)
	* 42.1. [内存溢出](#-1)
	* 42.2. [内存泄漏](#-1)
* 43. [BlockngQueue](#BlockngQueue)
* 44. [Fail-fast](#Fail-fast)
* 45. [Fil-safe](#Fil-safe)
* 46. [Spring](#Spring)
	* 46.1. [MVC](#MVC)
	* 46.2. [AOP](#AOP)
	* 46.3. [IOC](#IOC)
	* 46.4. [Bean](#Bean)
	* 46.5. [事务管理](#-1)
	* 46.6. [Spring Boot](#SpringBoot)
* 47. [MyBatis](#MyBatis)
	* 47.1. [缓存机制](#-1)
	* 47.2. [参数](#-1)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->
##  1. <a name=''></a>面向对象
###  1.1. <a name='-1'></a>类
- 对象的抽象描述，用于表示一组对象的创建模版
###  1.2. <a name='-1'></a>对象
- 系统中用来描述客观事物的一个实体，用于构成系统的基本单位，由一组属性及方法组成
###  1.3. <a name='-1'></a>面向对象的特征
- 封装：隐藏对象的属性及实现细节，仅对外提供访问方法
- 继承：从已有类继承信息定义新类的过程（父类/基类 -> 派生类/子类）
- 多态：不同类型的子类对同一方法做出不同的行为
###  1.4. <a name='-1'></a>代码中如何实现多态
- 接口实现
- 继承父类重写方法
- 同一类中进行方法重载
###  1.5. <a name='-1'></a>虚拟机是如何实现多态的
- 动态绑定技术(dynamic binding),执行期间判断所引用对象的实际类型,根据实际类型调用对应的方法.
###  1.6. <a name='Overload'></a>重载（Overload）
- 实现编译时的多态
- 发生在一个类中
- 权限没有限制
- 返回值类型没有限制
- 方法需同名
- 参数列表需不同
- 返回异常没有限制
###  1.7. <a name='Override'></a>重写（Override）
- 实现运行时的多态
- 发生在子类继承父类中
- 权限不可小于父类的访问权限
- 返回值类型需与父类相同
- 方法名需相同
- 参数列表需相同
- 返回异常需小于父类范围
###  1.8. <a name='-1'></a>构造器
- 类的构造器不可被继承（故而无法重写）
###  1.9. <a name='-1'></a>接口的意义
- 接口可以继承多个接口
- 规范
- 扩展
- 回调
- 安全
###  1.10. <a name='-1'></a>抽象类的意义
- 为其他子类提供一个公共的类型
- 封装子类中重复定义的内容
- 定义抽象方法,子类虽然有不同的实现,但是定义是一致的
###  1.11. <a name='-1'></a>抽象类和接口的区别
- 都不能进行实例化
- 抽象类可以有构造器、具体实现方法，接口中不能有构造器全为抽象方法
- 继承抽象类 or 实现接口，需要将其内的抽象方法均实现
- 接口中的成员方法均为 public
- 抽象类中可以定义成员变量，接口中则为常量
###  1.12. <a name='-1'></a>访问修饰符
修饰符	    当前类	 同包	  子类    其他包
public	    √	    √	    √	    √
protected	√	    √	    √	    ×
default	    √	    √	    ×	    ×
private	    √	    ×	    ×	    ×

##  2. <a name='-1'></a>基本类型（数值、字符、布尔）
- 除基本类型以及 enum 外均为引用类型
byte、short、char、boolean
int、long、float、double
- Java 中浮点数默认为 double 类型

##  3. <a name='-1'></a>包装类型
- 为了将基本数据类型可以当作对象使用，JDK 1.5 以后有自动装拆箱机制，可以进行互相转换

##  4. <a name='-1'></a>运算符
- += -= 等运算对运算后的值有隐式类型转化（转化为左侧引用的类型）
- &：按位与、逻辑与
- &&：短路与运算，与 & 逻辑与运算的区别是左侧如果为 flase 则不执行右侧代码。
- |：安位或、逻辑或
- ||：短路或运算，与 | 逻辑或运算的区别是如果左侧为 true 则不执行右侧代码。

##  5. <a name='switch'></a>switch
- Java5 之前，表达式只能支持：byte、short、char、int
- Java5 支持了 enum
- Java7 支持的字符串
- long、浮点数目前还不支持


##  6. <a name='final'></a>final
- 修饰类：表示该类不可被继承
- 修饰方法：表示该方法不可被重写
- 修饰变量：表示变量只能赋值一次，以后不能被修改（常量）(可以修饰成员变量、局部变量、形参)。
    成员变量：需要在定义时设定初始值，也可以在初始化模块 or 构造函数中设定初始值，不然会有语法问题
    局部变量：定义时已经制定默认值

##  7. <a name='throwthrows'></a>throw、throws
- throw 用于程序抛出一个异常
- throw 用于声明方法可能会抛出的异常范围

##  8. <a name='instanceof'></a>instanceof

##  9. <a name='-1'></a>方法
- Java 方法参数传递为值传递，不过传递的是对象的引用
- 静态方法不可以调用非静态的方法、变量

##  10. <a name='-1'></a>变量
- 静态变量：类中使用 static 修饰的变量，属于类，全局唯一
- 实例变量：属于对象，每个对象间不共享

##  11. <a name='static'></a>static
- 能修饰成员变量、方法、初始化块、内部类，不可以修饰构造器
- static 修饰的成员为类成员，会和类同时被加载、初始化。
- 静态成员只可以访问静态成员，比对象先存在。

##  12. <a name='String'></a>String
- String 为只读字符串
- 代码中的字符串常量会在方法区内创建一个唯一的字符串对象
- new 会在堆上创建一个字符串对象，但是底层的字符数组是同一个
- 被 final 修饰，不可被继承


##  13. <a name='StringBuilderStringBuffer'></a>StringBuilder、StringBuffer
- 可修改内部存储的字符串
- StringBuffer 并发安全，内部方法使用 synchronized 修饰，效率没有 StringBuilder 高

##  14. <a name='equalshashCode'></a>equals、hashCode
- 两个对象相等，hashCode 一定相同（约定）
- hashCode 相同，两个对象不一定相等
###  14.1. <a name='hashCode'></a>hashCode
- 获取对象的哈希码
###  14.2. <a name='equals'></a>equals
- 比较两个对象是否相等
- 默认使用 == 进行比较


- hashCode 用于计算对象的哈希值
- 两个对象满足 x.equals(y) == true 则 hashCode 应相同（不相同会导致 hash 表的 set 操作效率变低且存储重复 key）
- 两个对象 hashCode 相同，equals 不一定相等

##  15. <a name='finalize'></a>finalize
- 在垃圾收集器将对象从内存中清除出去之前做必要的清理工作。这个方法是由垃圾收集器在销毁对象时调用的

##  16. <a name='-1'></a>四种引用
- 有四种引用的原因：需要适当的控制对象被回收的时机,因此就诞生了不同的引用类型
- 应用场景：hashMap + 软引用/弱引用 实现高速缓存
- 强引用：如果一个对象具有强引用，它就不会被垃圾回收器回收。如果想中断强引用和某个对象之间的关联，可以显式地将引用赋值为null。
- 软引用：如果内存的空间足够，软引用就能继续被使用，而不会被垃圾回收器回收，只有在内存不足时，软引用才会被垃圾回收器回收。
- 弱引用：当 JVM 进行垃圾回收，一旦发现弱引用对象，无论当前内存空间是否充足，都会将弱引用回收。
- 虚引用：如果一个对象仅持有虚引用，那么它相当于没有引用，在任何时候都可能被垃圾回收器回收。

##  17. <a name='ArrayList'></a>ArrayList
- 模型：数组，默认空数组，首次添加元素初始化一个长度为 10 的数组
- 可以按序号索引元素，增加元素时，底层涉及内存移动操作。
- 特点：索引速度快，插入速度慢
- 扩容条件：添加元素时数组容量不足
- 扩容规则：1.5 倍，向上取整
- 扩容方式：数组拷贝
- 支持缩容，但不会自动缩容（调用 trimToSize）
- 允许 null val

##  18. <a name='Vector'></a>Vector
- 模型：数组
- 查询：支持按序号索引元素
- 增加：在中间增加元素，底层涉及到内存移动操作
- 特点：索引速度快，插入速度慢，方法均使用 synchronized 修饰，线程安全，性能较 ArrayList 差一些
- 允许 null val

##  19. <a name='LinkedList'></a>LinkedList
- 模型：双向链表，内存利用率更高
- 查询：需要遍历链表
- 增加：找到节点位置 set 即可。
- 特点：查询速度慢、插入速度快

##  20. <a name='HashSet'></a>HashSet
- 实现了 Set 接口
- 存储的是对象，集合中不允许有重复的值


##  21. <a name='TreeSet'></a>TreeSet

##  22. <a name='PriorityQueue'></a>PriorityQueue

##  23. <a name='TreeMap'></a>TreeMap
- 红黑树实现

##  24. <a name='LinkedHashMap'></a>LinkedHashMap

##  25. <a name='WeakHashMap'></a>WeakHashMap
##  26. <a name='ConcurrentHashMap'></a>ConcurrentHashMap
- 模型：数组 + 链表 + 红黑树
- 采用锁定头节点的方式降低了锁粒度
- 初始化数据 or 头节点时，没有加锁，通过 CAS 的方式进行原子替换（为什么不使用锁呢？）
- 插入数据时会进行加锁，锁定的是链表的头节点
- 支持多个线程在扩容中进行链表搬移
- 数据读取是没有进行加锁
- 扩容过程中，依然支持查找操作，如果对应链表未搬迁，则直接找，如果已搬迁，则搬迁时会留下一个转发节点，根据转发节点找对应的目标数据
- 线程在插入输入时，如果发现数组正在扩容，则它会参与到扩容操作中，完成扩容在写入先的数组中。

##  27. <a name='HashMap'></a>HashMap
- 模型：数组 + 链表 + 红黑树
- 允许使用 null KV
- KV 可以是 null
###  27.1. <a name='put'></a>put 操作过程
- 判断数组，数组为空，进行首次扩容。
- 判断头节点，头节点为空，新建链表节点存入数组
- 判断头节点，头节点不为空，向链表中加入元素
- 判断链表长度是否达到转为红黑树的条件
- 链表长度达到 8，数组长度小于 64 则扩容。
- 链表长度达到 8 ，数组长度达到 64 则转为红黑树
- 判断元素个数是否达到扩容因子，达到则扩容
###  27.2. <a name='-1'></a>扩容机制
- 扩容每次翻倍扩容（默认为 16）
- 数组为空首次扩容
- 链表长度达到 8，数组小于 64 则扩容
- 数组元素超过负载因子（0.75）进行扩容
###  27.3. <a name='-1'></a>并发场景下使用
- 非线程安全
- 可以使用 Collections 将 HashMap 转为安全的 HashMap
- 直接使用 ConcurrentHashMap

##  28. <a name='Hashtable'></a>Hashtable
- KV 不可以是 null
- 线程安全

##  29. <a name='Concurrent1.5'></a>Concurrent 包（1.5 后新增一些并发安全容器）
- JDK1.5 提供的支持并发操作的工具包，包含原子类、锁、线程池、并发容器、同步工具
###  29.1. <a name='-1'></a>原子类
- atomic 子包
- 包含原子更新基本类型、原子更新引用类型、原子更新属性、原子更新数组
###  29.2. <a name='-1'></a>锁
- Lock
###  29.3. <a name='-1'></a>并发容器
- Concurrent 开头的为降低锁粒度来提高并发性能的容器
- CopyOnWrite 开头的为写时复制技术实现的并发容器
- 采用Lock实现的阻塞队列
###  29.4. <a name='-1'></a>同步工具
- Semaphore类代表信号量,可以控制同时访问特定资源的线程数量
- CountDownLatch类则允许一个或多个线程等待其他线程完成操作
- CyclicBarrier可以让一组线程到达一个屏障时被阻塞,直到最后一个线程到达屏障时,屏障才会打开,所有被屏障拦截的线程才会继续运行。

###  29.5. <a name='ConcurrentHashMap-1'></a>ConcurrentHashMap
###  29.6. <a name='CopyOnWriteArrayList'></a>CopyOnWriteArrayList
###  29.7. <a name='BlockingQueueLock'></a>BlockingQueue（Lock 实现的阻塞队列）
###  29.8. <a name='ArrayBlockingQueueLock'></a>ArrayBlockingQueue（Lock 实现的阻塞队列）

##  30. <a name='-1'></a>并发控制（线程安全）
###  30.1. <a name='-1'></a>原子类
- java.util.concurrent.atomic
- 只能保证单个共享变量的线程安全
###  30.2. <a name='volatile'></a>volatile
- 底层采用内存屏障实现，在编译时期在指令序列中插入内存屏障禁止特定类型的指令重排序（Javac 编译优化）。
- 执行成本比 synchronized 低，不会引起线程上下文的切换和调度
- 可见行：读 volatile 变量，总是读到最新值。
- 原子性：单个 volatile 的读写是原子的。但是使用 volatile++  volatile-- 这种复合操作不具有原子性。
- volatile 通过影响内存可见性实现变量的 可见行、原子性。
- 读内存语义：读一个 volatile 变量时，线程本地内存会置为无效，强制从主内存中读取。
- 写内存语义：会把线程本地内存变量的值刷到主内存。
- 线程读取 volatile 变量时，本地缓存会置为无效，强迫线程从主内存读取共享变量。
- 只能保证单个变量的线程安全

####  30.2.1. <a name='synchronized'></a>synchronized
- 通过 “CAS + Monitor 对象信息（对象头中的 Mark Word）” 实现: 
- 隐式锁，无需显式获取、释放锁，依赖 Monitor（同步监视器）实现线程通信
    Monitor 使用 Object 中的 wait、notify、notifyAll 实现线程同步
    调用 wait 会释放锁并等待
    notify 会唤醒等待的一个线程
    notifyAll 唤醒等待的所有线程
- 加在普通方法上,则 Monitor 是当前的实例（this）
- 加在静态方法上,则 Monitor 是当前类的Class对象。
- 加在代码块上,则需要在关键字后面的小括号里,显式指定一个对象作为 Monitor。
####  30.2.2. <a name='Lock'></a>Lock
- 采用“CAS+volatile”实现，实现的 AQS
- AQS：队列同步器，定义了一个 FIFO 队列实现线程同步
- 显式锁，需要调用方法显式加锁、解锁，更加灵活，使用 Condition（由 Lock 创建） 实现线程通信
    Condition 包括 await、signal、signalAll 方法
    await：释放锁并等待
    signal 唤醒一个等待的线程
    signalAll 唤醒所有等待的线程

- 可中断获取锁：获取锁的过程中可以被中断
- 非阻塞获取锁：获取锁返回 true，否则返回 false
- 可超时获取锁：线程获取锁超时后返回 false
###  30.3. <a name='wait'></a>wait
- Object 方法，调用该方法线程进入 WTTING 状态
- 依赖 synchronized，需通过监视器调用，调用后线程会释放锁。
- WTTING 状态线程需要通过 notify notifyAll 唤醒
- 也支持超时参数，带有超时参数，线程会进入 TIMED——WTTING 状态，可以通过 notify、notifyAll 唤醒，也可以在超时时间后自动唤醒
###  30.4. <a name='sleep'></a>sleep
- Thread 类静态方法，调用该方法，线程进入 TIMED_WTTING 状态
- sleep 不依赖锁
- TIMED_WTTING 超时时间过后自动唤醒
###  30.5. <a name='awt'></a>awt
- Lock 的 Condition 对象方法，与 wait 差不多

##  31. <a name='Thread'></a>Thread
实现接口创建线程优点：线程可以继承其它类，但是编程复杂了一点
###  31.1. <a name='-1'></a>线程状态
- NEW：初始状态，线程被创建，但是还没有调用start方法。
- RUNNABLE：可运行状态，正在运行或者等待调度
- BLOCKED：阻塞状态
- WTING：等待状态，等待其它线程通知
- TIMED_WTING：超时等待状态，在 WTING 的基础上增加了超时时间
- TERMINATED：终止
###  31.2. <a name='Tread'></a>继承 Tread 类（创建线程）
- 重写 run() 方法
- 调用 start() 方法启动
###  31.3. <a name='Runnable'></a>实现 Runnable 接口（创建线程）
- 实现 run() 方法
- 创建实例
- 实例作为参数创建 Tread 对象
- 调用 tread 的 start() 方法启动线程
###  31.4. <a name='Callable'></a>实现 Callable 接口（创建线程，可拿到线程返回值）
- 实现 call() 方法
- 创建实例
- 实例作为参数创建 FutureTask 对象
- 使用 FutureTask 再创建 Tread 对象
- 启动线程
- 调用 FutureTask 对象的 get() 方法，获得线程返回值
- 优点：可以拿到线程返回值

##  32. <a name='-1'></a>线程池
- 类型 ThreadPoolExecutor
- 可以管理线程数量，让线程复用，减少线程创建、销毁的开销
###  32.1. <a name='-1'></a>相关参数
- corePoolSize 核心线程数：线程池常态保持的最小线程数
- maxinumPoolSize 最大线程数：线程池最大拥有线程数
- workQueue 等待队列：任务队列（可以有界、也可以无界，若无界则不会创建超过核心线程数的线程，这种用法很危险，会导致任务有大量的堆积，内存溢出）
- handler 拒绝策略
- keepAliveTime 空闲线程存活时间
###  32.2. <a name='-1'></a>生命状态
- RUNNING：线程池正在运行
- SHUTDOWN：调用 shutdown() 进入该状态，队列不会清空，线程池会等待任务执行完毕
- STOP：调用 shutdownNow() 进入该状态，线程池会清空队列，不等待任务执行
- TIDING：线程池、队列为空时进入该状态
- TERMINATED：线程池死亡
###  32.3. <a name='-1'></a>线程池任务处理流程
- 线程数未达到核心线程数时，新增线程执行任务
- 线程数达到核心线程数时，等待队列未满，则放入等待队列
- 等待队列满，线程数未达到最大线程数时，新建线程执行任务
- 等待队列满、线程数达到最大线程数，采用拒绝策略，拒绝执行该任务
- 新建的线程处理完当前任务后，不会立即关闭，会继续处理等待队列中的任务
- 线程的空闲时间达到 keepAliveTime，线程池会销毁部分线程，线程数量收缩值核心线程数。
###  32.4. <a name='-1'></a>拒绝策略
- RejectedExecutionHandler 接口的实现类
- 让调用者自己执行任务
- 直接抛出异常
- 丢弃任务不做处理
- 删除队列中最老的任务并把当前任务加入队列
###  32.5. <a name='-1'></a>相关类
- ThreadPoolExecutor 线程池
- ScheduledThreadPoolExecutor 调度线程池（支持定时任务）
- Executors 创建线程池的工具类：创建的线程池为无界线程池，不推荐使用

###  32.6. <a name='ThreadLocal'></a>ThreadLocal
- 线程变量：每个线程独有的资源副本，底层用的 Map。

##  33. <a name='-1'></a>反射
- 应用场景：通过 注解/XML ,反射实例化对象；

##  34. <a name='-1'></a>泛型
- 使用泛型的原因：没有泛型之前从集合读取元素需要进行类型转化，向集合写原因也没有任何控制，有泛型后编译器可以检查出该类问题，使程序变得更加安全。
- 向上转型时只支持类名的向上转型：List<t> list = new ArrayList<t>, 不支持内部元素的向上转型，因为内部元素的类型已经确定，向上转型后，避免不了写入其它类型元素的问题发生。

##  35. <a name='-1'></a>异常处理
- 提高程序的容错性、健壮性
###  35.1. <a name='ErrorException'></a>Error、Exception
- Error 用于表示系统级错误、程序不必要处理的异常（通常也无力解决）
- Exception 用于表示程序可以解决的异常
###  35.2. <a name='RuntimeException'></a>RuntimeException
- ArithmeticException（算术异常）
- ClassCastException （类转换异常）
- IllegalArgumentException （非法参数异常）
- IndexOutOfBoundsException （下标越界异常）
- NullPointerException （空指针异常）
- SecurityException （安全异常）
###  35.3. <a name='finally'></a>finally
- finally 的 return、throw 会终止 try 中的 return、throw，使用 finally 中的值

##  36. <a name='IO'></a>IO
###  36.1. <a name='NIO'></a>NIO
- 提供高速、面向块的 IO，通过定义包含数据的类以及块的形式处理数据，由 Buffer、Channel、Selector 组成
- Buffer：包含要写入、读出的数据，任何时候访问 NIO 的数据，都是通过 Buffer 操作的
- Channel：用于读取、写入数据，与 stream 不同，它是双向的
- Selector：不断轮询注册的 Channel，底层使用 epoll

##  37. <a name='-1'></a>注解
###  37.1. <a name='Autowired'></a>@Autowired
- Spring 提供
- 只能按类型注入
- 默认要求依赖对象必须存在，如果允许为 null，则设定 required=false
###  37.2. <a name='Resource'></a>@Resource
- JDK 提供
- 默认按名称注入、也支持按类型注入
- 注解标注在属性的 setter 方法上时，默认取属性名作为 bean 名称寻找依赖对象
- 装配顺序：
    同时指定来 name、type，从 Spring 上下文中找到唯一匹配的 bean
    仅指定 name，从 Spring 上下文中找
    仅制定了 type，从 上下文中找
    name、type 都没有，则按照 byName 方式进行装配。


##  38. <a name='-1'></a>类加载
###  38.1. <a name='-1'></a>类加载阶段
- 生命周期：加载、验证、准备、解析、初始化、使用、卸载（验证、准备、解析统称为连接）
- 加载：JVM在内存中生成 Class 对象，作为方法区中这个类数据的访问入口
- 验证：文件格式验证、元数据验证、字节码验证、符号引用验证。
- 准备：为类中静态变量在方法区分配内存并初始化。
- 解析：JVM 将常量池中的符号替换为直接引用。
- 初始化：执行类构造器`<clinit>()`。（执行静态代码块）

###  38.2. <a name='-1'></a>双亲委派机制
- 启动类加载：
    负责加载 java_home/lib、-Xbootclasspath=filepath 中的 jar 包
    无法被 Java 程序直接引用
    在自定义类加载器中，如果希望请求委派到启动类加载器中加载，在 getClassLoader 中返回 null 即可。
- 扩展类加载：
    负责加载 java_home/lib/ext、java.ext.dirs 中的类库
    可以在程序中使用其来加载 Class 文件
- 应用类加载：
    负责加载 ClassPath 上的所有类库
- 工作过程：
    类加载器收到类加载请求，请求先委派给父类加载，父类无法完成类加载，其才会尝试自己去加载
- 优点：Java 中的类具有层次关系，类加载不会混乱



##  39. <a name='Collections'></a>Collections 包
- synchronizedXxx() 方法，将 util 下的容器包装成线程安全的容器
- emptyXxx()：返回一个空的不可变的集合对象
- singletonXxx()：返回一个只包含指定对象的不可变的集合对象
- unmodifiableXxx()：返回指定集合对象的不可变视图

##  40. <a name='JVM'></a>JVM
###  40.1. <a name='-1'></a>类加载子系统
- 根据指定的全限定名来载入类或接口
###  40.2. <a name='-1'></a>执行引擎
- 负责执行那些包含在被载入类的方法中的指令

###  40.3. <a name='-1'></a>运行时数据区
- 存储字节码、对象、参数、返回值、局部变量、运算的中间结果等
####  40.3.1. <a name='-1'></a>堆（公有）
- 存放对象实例
####  40.3.2. <a name='-1'></a>方法区（公有）
- 存储已被虚拟机加载的类型信息、常量、静态变量
####  40.3.3. <a name='-1'></a>虚拟机栈（线程私有）
- 生命周期与线程相同
- 栈帧：Java 方法执行的内存模型，一个方法从调用到执行结束对应栈帧入栈出栈的过程。
- 方法数量超过虚拟机栈深度则会抛出 StackOverflowError
####  40.3.4. <a name='-1'></a>程序计数器（线程私有）
- 当前线程所执行的字节码的行号指示器
####  40.3.5. <a name='-1'></a>本地方法栈（线程私有）
- 为线程使用到的本地方法服务（native 方法）


##  41. <a name='-1'></a>垃圾回收
###  41.1. <a name='-1'></a>垃圾回收算法
- 基于“分代收集” 理论设计
####  41.1.1. <a name='-1'></a>标记复制算法（新生代使用该算法）
- 内存划分为同等大小的两块，每次只使用其中一块，标记不可达对象，将可达对象复制到另一块上，把原内存一次清理
- 缺点：
    空间浪费高（可用内存缩小了一半）
    在存活对象多时，会产生大量的复制开销
####  41.1.2. <a name='-1'></a>标记整理算法（老年代）
- 标记所有需要回收的对象，所有存活对象向内存空间的一端移动，清理掉边界以外的区域
- 缺点：
    老年代存活对象较多，移动存活对象并更新所有引用操作较重，此操作还需要暂停用户程序
###  41.2. <a name='-1'></a>垃圾回收器
####  41.2.1. <a name='G1'></a>G1
- Mixed GC 模式：面向堆内存中的任何部分，选择垃圾数量最多，回收收益最大的内存进行回收
- 遵循分代收集理论设计
- Java 堆被划分为多个大小相等的独立区域（Region），
    Region 根据需要确定其为新生代（Eden）、老年代（Survivor）、存储大对象的区域（Humongous Region）
    G1 认为超过 Region 一半的对象即为大对象。
    超过了整个 Region 的超大对象，会被存放在连续 N 个 Humongous Region 中
    G1 将 Humongous Region 作为老年代的一部分看待。
- G1 根据各 Region 里的垃圾堆积价值（回收获得的空间以及时间），维护一个优先级列表，优先处理价值高的 Region。
- 垃圾回收过程：
    初始标记：有 STW
    并发标记：
    重新标记：有 STW
    并发清除：
####  41.2.2. <a name='CMS'></a>CMS
- 以最短回收停顿时间为目标
- 基于标记清除算法实现
- 垃圾回收过程：
    初始标记：有 STW，仅标记一下 GC Roots 能直接关联的对象，速度很快
    并发标记：从GC Roots的直接关联对象开始遍历整个对象图，耗时较长，不需要停顿用户线程。
    重新标记：有 STW，为了修正并发标记期间,用户程序导致标记产生变动的对象的标记记录,停顿时间比初始标记时间长，比并发标记时间短。
    并发清除：清除被标记为死亡的对象
####  41.2.3. <a name='GCRoots'></a>GC Roots
- 虚拟机栈中引用的对象
- 方法区中的静态变量
- 方法区中常量
- 本地方法栈中引用的对象；
- JVM内部的引用，如基本数据类型对应的Class对象，常驻的异常对象，以及系统类加载器；
- 所有被同步锁持有的对象；
- 反映Java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等。
####  41.2.4. <a name='finalize-1'></a>finalize
- 对象的类对其重写后，可在对象被回收前执行一次（下次回收不执行），执行时如果将其变为可达对象则不会被回收，如果没有还是会被回收。

##  42. <a name='-1'></a>内存
###  42.1. <a name='-1'></a>内存溢出
- 申请的内存大于系统能够提供的内存，导致无法申请。
- 溢出原因：
    内存加载数量过大
    集合中对象引用未清空，JVM 无法回收
    代码中循环创建过多对象
    进程内存分配过小
- 解决方案：
    修改 JVM 参数，增加内存
    使用工具查看内存使用情况
- JVM 内存溢出：
    堆溢出：对象过多且无法回收
    虚拟机栈、本地方法栈溢出
###  42.2. <a name='-1'></a>内存泄漏
- 不在使用的对象仍然被引用，GC 无法回收它们的内存。
- 解决方法：
    内存分析
    启用详细垃圾回收日志 -verbose:gc
    使用引用对象：java。lang。ref 包
##  43. <a name='BlockngQueue'></a>BlockngQueue

##  44. <a name='Fail-fast'></a>Fail-fast

##  45. <a name='Fil-safe'></a>Fil-safe

##  46. <a name='Spring'></a>Spring
###  46.1. <a name='MVC'></a>MVC
- 基于 Java 实现的 MVC 架构模式的轻量级框架
- web 软件的一种设计模式，软件被分为 Model（模型）、View（视图）、Controller（控制器）
    Model：对象模型，封装数据与对数据的相关操作
    View：代表用户界面
    Controller：负责视图和模型之间的交互,控制对用户输入的响应、响应方式和流
- 服务端代码分层：表现层、业务层、数据访问层
- 经典 MVC：jsp + servlet + javabean
- 优点：降低软件系统耦合性
- 执行流程
    用户发起 Http request 请求，请求被提交到 DispatcherServlet
    DispatcherServlet 请求 HandlerMapping，返回执行器
    DispatcherServlet 将 Handler 信息发送给 HandlerAdapter
    HandlerAdapter 根据 Handler 信息执行对应的 Handler（Controller）
    Handler 执行后返回 ModelAndView（Spring MVC 对象，包括 Model、View 信息） 给 HandlerAdapter
    HandlerAdapter 将 ModelAndView 返回给 DispatcherServlet
    DispatcherServlet 通过 ViewResolver 对 ModelAndView 进行解析
    VIewResolver 将试图结果返回给 DispatchServlet
    DispatcherServlet 进行视图渲染，数据填充，生成 View
    View 返回到浏览器
- DispatcherServlet（前端控制器）
    所有请求都要经过 DispatcherServlet 统一分发。相当于一个转发器或中央处理器,控制整个流程的执行,对各个组件进行统一调度,降低组件之间的耦合性。 
- HandlerMapping（Handler 映射器）
    是根据请求的 URL 路径,通过注解或者 XML 配置,寻找匹配的处理器（Handler）信息。
- HandlerAdapter（Handler 适配器）
    根据映射器找到的处理器（Handler）信息,按照特定规则执行相关的处理器（Handler）
- Handler（处理器）
    执行相关的请求处理逻辑,并返回相应的数据和视图信息,将其封装至 ModelAndView 对象中
- VIewResolver（视图解析器）
    视图解析器,其作用是进行解析操作,通过 ModelAndView 对象中的 View 信息将逻辑视图名解析成真正的视图 View
###  46.2. <a name='AOP'></a>AOP
- 在不改动代码的情况下，通过预编译、动态代理为程序统一添加功能的技术。
- 切面：将影响多个类的公共行为封装到同一个模块中（与业务无关，却为业务模块锁共同调用的基础功能）
- 优点：降低模块耦合度，减少重复代码
- 实现方式：
    JDK 动态代理：Java 的动态代理技术，在运行时创建接口的代理实例，在接口的代理实例中植入代码（切面）（Spring AOP 默认实现方式）
    CGLib 动态代理，通过字节码技术，在运行时创建子类代理的实例（目标对象不存在接口时，Spring AOP 采用该方式， 运行时创建对象的一个子类）
- AOP 可用范围：
    AOP 只能对 IOC 容器中的 Bean 植入代码。不受容器控制的对象不行。
    采用 CGLib 情况使用 AOP 的 Bean，不能被 final 修饰
###  46.3. <a name='IOC'></a>IOC
- 控制反转：一直对象编程的设计思想，帮助软件维护对象间的依赖关系，降低对象间的耦合度（Spring 的 Bean 注入）
- DI（依赖注入）：IOC 的实现方式，通过工厂容器实现。
- 控制的是对象间依赖
- 反转的是对象间依赖的管理（由对象自身转移到 Spring 中）
###  46.4. <a name='Bean'></a>Bean
- 生命周期：定义、初始化、生存、销毁
- Bean 生命周期步骤：
    1. Spring 启动时进行 Bean 的实例化
    2. 将 Bean 的引用注入到对应 Bean 的属性中
    3. Bean 实现了 BeanNameAware 接口的情况下，将 Bean 的 Id 传递给 setBeanName 方法
    4. Bean 实现了 BeanFactoryAware 接口的情况下，调用 setBeanFactory 方法，将 BeanFactory 容器实例传染
    5. Bean 实现了 ApplicationContextAware 接口的情况下，调用 setApplicationContext 方法，将 bean 所在应用上下文传入
    6. Bean 实现了 BeanPostProcessor 接口，调用 Spring就将调用他们的postProcessBeforeInitialization 方法
    7. Bean 实现了 InitializingBean 接口，调用 afterPropertiesSet 方法，如果 Bean 使用 init-method 声明了初始化方法，该方法会被调用（PostConstruct 注解，同样功能）
    8. 如果 Bean 实现了 BeanPostProcessor 接口，调用 postProcessAfterInitialization 方法
    9. Bean 初始化结束，可以被使用
    10. Bean 实现了 DisposableBean 接口，销毁时调用 destory 接口，如果 Bean 使用了 destory-method 声明销毁方法,该方法也会被调用（@PreDestroy 注解，同样功能）
- 作用域（Bean 在 Spring 中默认为单例）：
    可以通过 @Scope 注解修改 Bean 的作用域
    singleton（Spring 中仅存在一个，单例）
    prototype（调用 getBean() 时，都会执行 new 操作，返回一个新的实例）
    request（每次 HTTP 请求都会创建一个新的 Bean）
    session（同一个 HTTP Session 共享一个 Bean）
    globalSession（同一个全局 Session 共享一个 Bean）
###  46.5. <a name='-1'></a>事务管理
- 编程式事务（TransactionTemplate）
- 声明式事务（@Transactional 注解）
    标注在类上：所有 public 且非静态方法均启用事务
    可以使用 osolation 声明事务的隔离级别
    使用 propagation 声明事务的传播机制
###  46.6. <a name='SpringBoot'></a>Spring Boot
- Spring Boot 在 Spring 的基础上，完成了一些 Spring Bean 配置，本身不提供 Spring 的核心功能，作为 Spring 的脚手架，快速构建项目，开箱即用。
- 优点：
    项目可独立运行，不依赖 Servlet 容器
    提供运行时应用监控
    提高开发、部署效率
    与云计算集成
- 核心功能：
    自动配置 针对很多Spring应用程序常见的应用功能,Spring Boot能自动提供相关配置。
    起步依赖 Spring Boot通过起步依赖为项目的依赖管理提供帮助。起步依赖其实就是特殊的Maven依赖和Gradle依赖,利用了传递依赖解析,把常用库聚合在一起,组成了几个为特定功能而定制的依赖。
    端点监控 Spring Boot 可以对正在运行的项目提供监控。
- 启动流程（Application 类中的 mv 调用 run 方法 进行 SpringApplication 的实例化操作，并完成项目的初始化和启动）
    获取监听器配置参数
    打印 Banner 信息
    创建、初始化容器
    监听器发送通知

    

##  47. <a name='MyBatis'></a>MyBatis
 - 根据时间表（如no Flush Interval ,没有刷新间隔）,缓存不会以任何时间顺序来刷新。 - 缓存会存储集合或对象（无论查询方法返回什么类型的值）的1024 个引用。 - 缓存会被视为read/write（可读／可写）的,意味着对象检索不是共享的,而且可以安全地被调用者修改,而不干扰其他调用者或线程所做的潜在修改。 加分回答 Mybatis 一级缓存失效的四种情况： - sqlsession变了 缓存失效 - sqlsession不变,查询条件不同,一级缓存失效 - sqlsession不变,中间发生了增删改操作,一级缓存失败 - sqlsession不变,手动清除缓存,一级缓存失败 MyBatis的二级缓存相对于一级缓存来说,实现了SqlSession之间缓存数据的共享,同时粒度更加的细,能够到namespace级别,通过Cache接口实现类不同的组合,对Cache的可控性也更强。 MyBatis在多表查询时,极大可能会出现脏数据,这导致安全使用二级缓存的条件比较苛刻。 由于默认的MyBatis Cache实现都是基于本地的,这导致在分布式环境下,一定会出现读取到脏数据的情况,且开发成本较高,所以开发环境中一般都会直接使用Redis,Memcached等分布式缓存.
###  47.1. <a name='-1'></a>缓存机制
- 一级缓存：
    本地缓存，默认启用且不能关闭
    存在于 SqlSession 的生命周期中。
    在同一个 SqlSession 中将查询方法和结果存入一个 Map 中。
    缓存失效：SqlSession 改变、查询条件改变、SqlSession 中间发生了增删改、手动清除缓存
- 二级缓存：
    存在于 SqlSessionFactory 的生命周期中，与命名空间（Mapper.xml）绑定。实现了 SqlSession 间缓存数据共享，缓存粒度更细，能到 namespace。
    所有 SELECT 语句都会被缓存，所有 INSERT、UPDATE、DELETE 语句均会刷新缓存，不会根据时间来刷新。
    缓存会存储集合、对象（1024 个数据）
    缓存是线程安全的（每个线程独有一份）
    缓存使用 LRU 最近最少使用 算法来收回。
    注：使用二级缓存进行多表查询时，极大可能出现脏数据。
- 使用$设置参数时,MyBatis会创建普通的SQL语句,然后在执行SQL 语句时将参数拼入SQL,而使用#设置参数时,MyBatis会创建预编译的SQL语句,然后在执行SQL时MyBatis会为预编译SQL中的占位符赋值。预编译的SQL语句执行效率高,并且可以防止注入攻击,效率和安全性都大大优于前者,但在解决一些特殊问题,如在一些根据不同的条件产生不同的动态列中,我们要传递SQL的列名,根据某些列进行排序,或者传递列名给SQL就只能使用$了
###  47.2. <a name='-1'></a>参数
- 使用 $ 设置参数时，MyBatis 会创建普通的SQL语句,在执行SQL时将参数拼入SQL。
- 使用 # 设置参数时,MyBatis会创建预编译的SQL语句,在执行SQL时为预编译SQL中的占位符赋值。
- 预编译的SQL语句执行效率高,并且可以防止注入攻击,效率和安全性都优于普通SQL
- 在解决一些特殊问题,如在一些根据不同的条件产生不同的动态列中,我们要传递SQL的列名,根据某些列进行排序,或者传递列名给SQL就只能使用$了
