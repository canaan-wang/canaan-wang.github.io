## MVVC（多版本并发控制）：
- 通过维护数据历史版本，从而解决并发访问情况下的读一致性问题。
### 版本链
- InnoDB 中，每行记录都包含了两个隐藏字段：事务id(trx_id)和回滚指针(roll_pointer)。
    事务id：每次修改某行记录时，都会把该事务的事务id赋值给trx_id隐藏列。
    回滚指针：每次修改某行记录时，都会把undo日志地址赋值给roll_pointer隐藏列。
- 对该条记录的修改日志串联起来就形成了一个版本链，版本链的头节点就是当前记录最新的值。
### ReadView（事务开始时创建）
- 已提交读或者可重复读，需要遍历版本链中的每一条记录，判断该条记录是否对当前事务可见，直到找到为。InnoDB通过 ReadView 实现了这个功能。
    m_ids：表示在生成 ReadView 时当前系统中活跃的读写事务的事务id列表。
    min_trx_id：表示在生成 ReadView 时当前系统中活跃的读写事务中最小的事务id，也就是m_ids中的最小值。
    max_trx_id：表示生成 ReadView 时系统中应该分配给下一个事务的id值。   
    creator_trx_id：表示生成该 ReadView 事务的事务id。
- 判断版本对当前事务是否可见
    如果被访问版本的trx_id属性值与ReadView中的creator_trx_id值相同，意味着当前事务在访问它自己修改过的记录，所以该版本可以被当前事务访问。
    如果被访问版本的trx_id属性值小于ReadView中的min_trx_id值，表明生成该版本的事务在当前事务生成ReadView前已经提交，所以该版本可以被当前事务访问。
    如果被访问版本的trx_id属性值大于或等于ReadView中的max_trx_id值，表明生成该版本的事务在当前事务生成ReadView后才开启，所以该版本不可以被当前事务访问。
    如果被访问版本的trx_id属性值在ReadView的min_trx_id和max_trx_id之间，那就需要判断一下trx_id属性值是不是在m_ids列表中，如果在，说明创建ReadView时生成该版本的事务还是活跃的，该版本不可以被访问；如果不在，说明创建ReadView时生成该版本的事务已经被提交，该版本可以被访问。

## 锁
### 乐观锁：
- 读写均不加锁，写时通过版本进行控制，选择最新的版本
### 悲观锁：
- 读写都加锁
### 锁的粒度
- 行锁：作用在数据行上，锁的粒度比较小。
- 表锁：作用在整张数据表上，锁的粒度比较大。

当我们给一行数据加上共享锁之前，数据库会自动在这张表上面加一个意向共享锁(IS锁)；当我们给一行数据加上排他锁之前，数据库会自动在这张表上面加一个意向排他锁(IX锁)。意向锁可以认为是S锁和X锁在数据表上的标识，通过意向锁可以快速判断表中是否有记录被上锁，从而避免通过遍历的方式来查看表中有没有记录被上锁，提升加锁效率。例如，我们要加表级别的X锁，这时候数据表里面如果存在行级别的X锁或者S锁的，加锁就会失败，此时直接根据意向锁就能知道这张表是否有行级别的X锁或者S锁。
### 锁的分类
- 共享锁：在事务要读取一条记录时，需要先获取该记录的共享锁。可以在同一时刻被多个事务同时持有。我们可以用 select ...... lock in share mode 的方式手工加上。
- 排他锁：在事务要改动一条记录时，需要先获取该记录的排他锁。在同一时刻最多只能被一个事务持有。
        X锁的加锁方式有两种，第一种是自动加锁，在对数据进行增删改的时候，都会默认加上。
        还有一种是手工加锁，我们用一个FOR UPDATE给一行数据加上。
- 如果一个事务已经持有了某行记录的共享锁，另一个事务是无法为这行记录加上排他锁的，反之亦然。
- 意向锁：
    由数据库维护，在加锁的时候会在表上加对应的意向锁（共享锁 -> 意向共享锁，排他锁 -> 意向排他锁）
    通过意向锁可以快速判断表中是否有记录被上锁，从而避免通过遍历的方式来查看表中有没有记录被上锁，提升加锁效率。
### InnoDB 行锁
- 记录锁：直接锁定某行记录。当我们使用唯一性的索引(包括唯一索引和聚簇索引)进行等值查询且精准匹配到一条记录时，此时就会直接将这条记录锁定。
- 间隙锁：锁定某些间隙区间的。当我们使用用等值查询或者范围查询，并且没有命中任何一个record，此时就会将对应的间隙区间锁定。
- 临键锁：记录锁(Record Locks)和间隙锁(Gap Locks)的结合，即除了锁住记录本身，还要再锁住索引之间的间隙。当我们使用范围查询，并且命中了部分record记录，此时锁住的就是临键区间。


## InnoDB
- 支持事务
- 支持行级锁，提供优秀的并发能力
- 增删改 性能优
- 不支持全文索引（但是可以通过插件实现）
- 支持外键
- 在磁盘中存储为一个文件
- InnoDB 需要比 MyISAM 更多的内存和存储
- 默认事务隔离级别：可重复读
- 幻读避免方式：Next-Key Lock 锁算法
- 行级锁实现：在索引的索引项上加锁实现