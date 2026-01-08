# Redis Set 数据类型

## 数据类型定义

Redis Set 是`无序`、`唯一`、`不重复`的字符串集合，类似于编程语言（如 Python）中的 `set` 类型，但基于 Redis 内存数据库实现，支持丰富的集合操作（交集、并集、差集）。

Set 的核心特性包括：

- `无序`：元素没有固定的排列顺序，无法通过下标访问（区别于 List）
- `唯一性`：集合中不会存储重复的元素，添加重复元素时会自动忽略
- `底层实现`：底层基于哈希表（Hash Table）实现，因此添加、删除、查找元素的时间复杂度都是 $O(1)$，性能极高

---

## 核心命令

### 基础操作

| 命令 | 作用 | 示例 |
|---|---|---|
| `SADD key member...` | 向集合中添加一个/多个元素（重复则忽略） | `SADD myset a b c` → 返回 3（成功添加的元素数） |
| `SMEMBERS key` | 获取集合中所有元素 | `SMEMBERS myset` → 返回 ["a","b","c"] |
| `SISMEMBER key member` | 判断元素是否在集合中 | `SISMEMBER myset a` → 返回 1（存在）；`SISMEMBER myset d` → 返回 0（不存在） |
| `SREM key member...` | 删除集合中指定元素 | `SREM myset b` → 返回 1（成功删除的元素数） |
| `SCARD key` | 获取集合的元素个数（基数） | `SCARD myset` → 返回 2（剩余 a、c） |
| `SPOP key [count]` | 随机弹出集合中的 1 个/多个元素 | `SPOP myset` → 随机返回 "a"，集合剩余 ["c"] |
| `SRANDMEMBER key [count]` | 随机获取 1 个/多个元素（不删除） | `SRANDMEMBER myset 2` → 随机返回 ["c","a"]（若元素足够） |

### 集合间操作

这是 Set 最具价值的功能，常用于社交、标签、权限等场景。

| 命令 | 作用 | 示例（假设有集合 `set1={a,b,c}`、`set2={b,c,d}`） |
|---|---|---|
| `SINTER key1 key2...` | 求多个集合的`交集`（共同元素） | `SINTER set1 set2` → ["b","c"] |
| `SUNION key1 key2...` | 求多个集合的`并集`（所有元素，去重） | `SUNION set1 set2` → ["a","b","c","d"] |
| `SDIFF key1 key2...` | 求多个集合的`差集`（key1 有、key2 无） | `SDIFF set1 set2` → ["a"] |
| `SINTERSTORE dest key1 key2...` | 将交集结果存入新集合 | `SINTERSTORE set_inter set1 set2` → 新集合 `set_inter` 包含 ["b","c"] |

```mermaid
graph TD
    subgraph 命令入口
        CMD1[SADD key member...]
        CMD2[SISMEMBER key member]
        CMD3[SREM key member...]
    end

    CMD1 --> Step1{判断 Set 底层结构?}
    Step1 -->|intset| Step1a[调用 intsetAdd 方法]
    Step1 -->|哈希表| Step1b[调用 dictAdd 方法]
    Step1a & Step1b --> Step1c{元素是否重复?}
    Step1c -->|是| Step1d[忽略, 返回 0]
    Step1c -->|否| Step1e[添加成功, 返回 1]

    CMD2 --> Step2{判断底层结构?}
    Step2 -->|intset| Step2a[intsetFind 查询]
    Step2 -->|哈希表| Step2b[dictFind 查询]
    Step2a & Step2b --> Step2c{元素存在?}
    Step2c -->|是| Step2d[返回 1]
    Step2c -->|否| Step2e[返回 0]

    CMD3 --> Step3{判断底层结构?}
    Step3 -->|intset| Step3a[intsetRemove 删除]
    Step3 -->|哈希表| Step3b[dictDelete 删除]
    Step3a & Step3b --> Step3c{元素存在?}
    Step3c -->|是| Step3d[删除成功, 返回 1]
    Step3c -->|否| Step3e[返回 0]
```

---

## 底层实现

### 存储结构

Set 有两种底层存储方式：`intset`（整数集合）和`哈希表`。

当集合中的元素都是整数，且元素数量不超过 `set-max-intset-entries`（默认 512）时，会使用 `intset` 作为底层存储，而不是哈希表。

`intset` 的优势：`内存占用极低`（连续内存存储，无哈希表的元数据开销）

触发转换条件：当添加非整数元素，或元素数量超过阈值时，会自动转为哈希表

```mermaid
graph TB
    A[Redis Set 键] -->|条件1: 元素全是整数 且 数量 ≤ 512| B(intset 结构)
    A -->|条件2: 含非整数元素 或 数量 > 512| C(哈希表结构)

    B --> B1(encoding: 编码类型<br/>INT16/INT32/INT64)
    B --> B2(length: 元素个数)
    B --> B3(contents[]: 连续内存存储整数数组)

    C --> C1(dict 结构)
    C1 --> C11(table: 哈希桶数组)
    C1 --> C12(size: 桶数量)
    C1 --> C13(used: 已使用桶数)
    C11 --> C111(桶1: 键=元素值, 值=NULL)
    C11 --> C112(桶2: 键=元素值, 值=NULL)
```

### 存储结构转换

```mermaid
flowchart LR
    S1[初始化 Set, 添加整数元素] --> S2{判断是否满足 intset 条件?}
    S2 -->|是: 全整数 + count ≤ 512| S3[使用 intset 存储]
    S2 -->|否: 含非整数 或 count > 512| S4[触发结构转换]

    S3 --> S31[添加新元素] --> S32{新元素是否为非整数?<br/>或 count 是否超过 512?}
    S32 -->|是| S4
    S32 -->|否| S31

    S4 --> S41[创建哈希表 dict]
    S4 --> S42[将 intset 中所有元素迁移到 dict]
    S4 --> S43[释放 intset 内存]
    S4 --> S44[Set 底层切换为哈希表]
```

### 哈希表扩容与收缩

Set 基于哈希表实现时，会遵循 Redis 哈希表的通用规则：

- 扩容：负载因子（元素数/桶数）> 1 时，自动扩容为 2 倍
- 收缩：负载因子 < 0.1 时，自动收缩以节省内存
- 影响：扩容/收缩时会有短暂的 rehash 操作，但 Redis 采用`渐进式 rehash`，不会阻塞主线程

### 源码结构

以 Redis 6.2 为例，`intset` 结构定义：

```c
typedef struct intset {
    uint32_t encoding; // 编码方式：INTSET_ENC_INT16/32/64
    uint32_t length;   // 元素个数
    int8_t contents[]; // 存储元素的数组（柔性数组）
} intset;
```

编码自动升级：当添加的整数超过当前编码范围时，自动升级编码（如 INT16 → INT32），但`不支持降级`

Set 对应的 `redisObject` 的 `type` 是 `REDIS_SET`，`encoding` 是 `REDIS_ENCODING_HT`（哈希表）或 `REDIS_ENCODING_INTSET`（整数集合）

---

## 进阶命令

### 元素移动

`SMOVE source destination member`：原子性地将元素从源集合移动到目标集合（如果源集合没有该元素，则操作失败）

原子性保证：在分布式场景下，避免了 "先删后加" 导致的元素丢失

示例：`SMOVE set1 set2 a` → 将 set1 中的 `a` 移动到 set2

### 批量操作优化

`SADD`/`SREM` 支持多元素批量操作

推荐实践：批量添加/删除元素时，尽量用一条命令传递多个元素，减少网络往返次数（相比循环单条命令，性能提升 10 倍以上）

错误实践：在 Go 等语言中，循环调用 `redisClient.SAdd(ctx, key, member)`，而不是用 `SAdd(ctx, key, members...)` 批量传递

### 迭代器命令

`SSCAN` 命令用于解决 `SMEMBERS` 会一次性返回所有元素的问题。当集合元素量极大（如百万级）时，`SMEMBERS` 会阻塞 Redis 主线程。

`SSCAN` 优势：`游标式迭代`，分批获取元素，不阻塞主线程

用法：`SSCAN key cursor [MATCH pattern] [COUNT count]`

示例：`SSCAN myset 0 MATCH a* COUNT 100` → 从游标 0 开始，匹配以 `a` 开头的元素，每次返回 100 个左右

### 阻塞式弹出

`BLPOP` 是 List 的命令，Set 没有对应的阻塞弹出，但可以结合 `BRPOP` + 临时 List 模拟

场景：如果需要等待 Set 中有元素时再弹出，可以将 Set 元素转移到 List，再用 `BRPOP` 阻塞获取

---

## 集合运算原理

以 `SINTER key1 key2` 为例，展示交集的计算流程：

```mermaid
flowchart LR
    OP1[输入多个 Set 键: key1, key2...] --> OP2[选择元素数量最少的 Set 作为基准集合]
    OP2 --> OP3[遍历基准集合的每个元素]
    OP3 --> OP4{判断元素是否存在于所有其他 Set?}
    OP4 -->|是: 所有 Set 都包含| OP5[加入交集结果集]
    OP4 -->|否: 任意一个 Set 不包含| OP6[跳过该元素]
    OP5 --> OP3
    OP6 --> OP3
    OP3 -->|遍历结束| OP7[返回交集结果集]
    OP7 -->|可选: 使用 SINTERSTORE 存入新键| OP8[新 Set 键存储结果]
```

---

## 性能优化

### 大集合运算优化

问题：`SINTER`/`SUNION`/`SDIFF` 直接返回结果，当集合元素很多时，结果会占用大量内存和带宽

优化方案：使用 `SINTERSTORE`/`SUNIONSTORE`/`SDIFFSTORE` 将运算结果存入新集合，而不是直接返回，后续可以通过 `SSCAN` 分批读取新集合

推荐实践：大集合运算优先用 `*STORE` 命令，避免直接返回大结果集

### 与 Sorted Set 的对比

很多人会混淆 Set 和 Sorted Set（ZSet），核心区别如下：

| 特性 | Set | Sorted Set（ZSet） |
|---|---|---|
| 有序性 | 无序 | 按 score 有序 |
| 元素唯一性 | 唯一 | 唯一（member 唯一，score 可重复） |
| 核心操作 | 集合运算（交并差） | 排序、范围查询（ZRANGE/ZREVRANGE） |
| 底层实现 | 哈希表/intset | 跳跃表 + 哈希表 |
| 选型建议 | 去重、集合关系 | 排序、排行榜、带权重的场景 |

### 过期时间限制

Set 本身`不支持给单个元素设置过期时间`，只能给整个 Set 键设置过期时间（`EXPIRE key seconds`）

需求矛盾：如果需要给集合中的元素单独设置过期，不要用 Set，推荐用 `Sorted Set`（将过期时间作为 score，定期删除过期元素）

---

## 应用场景

### 用户标签管理

给用户打标签（如 "运动"、"美食"、"旅行"），用 Set 存储（自动去重，避免重复标签）

求「同时喜欢运动和美食的用户」（交集）、「喜欢运动或美食的用户」（并集）

### 社交场景

存储用户的关注列表、粉丝列表、共同好友（交集）

随机抽奖：用 `SPOP` 随机抽取中奖用户（弹出后自动从集合移除，避免重复中奖）

### 去重统计

统计网站的独立访客（UV）：将每个访客的 ID 加入 Set，`SCARD` 直接获取 UV 数（比 List 去重效率高）

### 权限控制

存储某角色的所有权限，用 `SISMEMBER` 判断用户是否拥有某权限

---

## 可扩展方向

### 分布式场景

Redis Cluster 中 Set 命令的路由规则：单 key 命令路由到 slot，多 key 命令要求所有 key 在同一 slot

### 语言客户端

如 `go-redis` 库中 Set 相关方法的最佳实践

### 问题排查

如 Set 内存占用过高、集合运算阻塞等问题的定位思路
