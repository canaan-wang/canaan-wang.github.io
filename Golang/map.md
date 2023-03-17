## map
### 模型
- Go 中的 map 采用哈希查找表实现，并通过链表解决 hash 冲突，链表中的每个元素是一个 bucket，每个 bucket 可存储 8 个元素
### key
- Go 中除 slice、map、functions 外的所有类型均可以作为 key
- float 作为 key 时会通过 Float64frombits 先转化为一个 uint64 后塞入 map，可能会因为精度的问题发生一些异常逻辑，慎用。
- key 遍历是无序的遍历时会选择一个随机的 bucket 以及其随机的一个 cell 开始遍历
### value
- 任何类型都可以作为 value
### 线程安全
- map 非线程安全，异常操作会发生 panic
### put
- 对 Key 做哈希得到 hash 值，拿到哈希值的后 B 位，得到 bucket 的下标 2 的 B 次方。在 bucekt 链表中找到一个空闲位置，判断该 key 在此链表中是否存在，不存在则放入该空闲位置，存在则覆盖原位置
- 扩容场景下：计算 hash 值的 后 B 位，确定新 bucket 位置，确保新 bucekt 对应的 old bucket 已迁移结束，再 put 到新 bucket 中。
### get
- 对 Key 做哈希得到 hash 值，拿到哈希值的后 B 位，得到 bucket 的下标 2 的 B 次方，遍历 bucekt 链表查找 tophash（高 8 位） 相同的元素，并进行 key 对比，均相同后返回该值。
- 扩容场景下：回到 old bucket 中进行查询
### map 遍历
- 非扩容状态：随机 bucket、随机 cell 开始遍历，遍历整个哈希表
- 扩容状态：哈希表中未迁移的 bucket 回到 old bucket 中遍历，仅选择会落入该 bucket 的 kv。
### map 扩容
#### 扩容触发条件
- 装载因子：map 内元素数量除以 2 的 B 次方。（每个 bucket 内元素的平均值），超过 6.5 时进行扩容
- overflow bucket 过多：B 小于 16 时，overflow bucket 数量大于等于 2 的 B 次方则发生扩容，B 大于等于 16 时，overflow bucket 数量大于等于 2 的 15 次方就发生扩容
    - bucket 过多条件是对装载因子条件的补充，用于解决 bucket 空置率高的问题，也仅会在 bucekt 空置率高的情况下触发
    - 触发场景：map 被不断的 put、del，但是一直未触发 装载因子扩容条件，overflow bucket 空置率高，会触发该条件
    - overflow bucket，bucket 链表除首节点后续的 bucket
#### 扩容逻辑
- 内存分配：老 bucket 挂载到 oldBucket，分配新 bucket 空间，如果因为装载因子导致的扩容则 B + 1，否则仍为 B。
- overflow bucket 过多导致的扩容，仅为内存整理，数组不翻倍
- bucekt 迁移：为避免因数据迁移导致的 map 使用阻塞，故采用渐进式迁移，在 map put、del 操作时执行 bucekt 迁移操作代码，一次仅迁移一个 bucekt 链表
### 注：
- map 的 KV 不允许取地址（扩容后会发生地址转变）
- map 可以边遍历、边进行写操作吗：理论上可以，但是不建议。