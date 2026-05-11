# InfluxDB Flux 查询语言核心解析：管道语法、聚合窗口与数据变换

Flux 是 InfluxDB 2.x 引入的**函数式管道查询语言**，它的设计目标是统一时序数据的查询、转换、告警和任务编排。理解 Flux 的管道思维和核心函数，是掌握 InfluxDB 2.x 查询能力的关键。

---

## Flux 的设计哲学

### 为什么需要 Flux

InfluxDB 1.x 使用 **InfluxQL**（类 SQL 语法），在简单查询上表现良好，但面对复杂的时序分析场景时力不从心：

| 场景 | InfluxQL 局限 | Flux 解决方式 |
|------|--------------|--------------|
| 跨 bucket 联合查询 | 不支持 | `join()`、`union()` 原生支持 |
| 数据变换后重新写入 | 需借助外部工具 | `to()` 函数直接写回 |
| 复杂数学运算 | 函数有限 | `map()` 支持任意表达式 |
| 条件分支逻辑 | 不支持 | `filter()` + 多级管道实现 |
| 定时任务编排 | 依赖外部 Cron | 内置 `task` 系统 |

Flux 的核心设计思想：**一切操作都是函数，函数通过管道 `|>` 串联**。这与 Unix Shell 的管道哲学一致——每个函数接收一个表（table），处理后再传给下一个函数。

### Flux vs InfluxQL vs SQL 对比

| 维度 | Flux | InfluxQL | SQL |
|------|------|----------|-----|
| **语法范式** | 函数式管道 | 声明式类 SQL | 声明式标准 SQL |
| **时间处理** | `range()` + `window()` 原生 | `WHERE time` + `GROUP BY time()` | `WHERE` + 窗口函数 |
| **聚合能力** | 丰富（内置 + 自定义） | 中等（内置为主） | 丰富（标准 + 扩展） |
| **Join 支持** | 原生时序 Join | 不支持 | 标准关系 Join |
| **数据写入** | `to()` 直接写回 | `INTO` 子句 | `INSERT`/`UPDATE` |
| **学习曲线** | 中等（新范式） | 低（类 SQL） | 低（通用） |
| **生态成熟度** | Grafana 支持良好 | 历史工具多 | 极成熟 |

> **选型建议**：简单查询（单表聚合、时间过滤）用 InfluxQL 更顺手；复杂分析（多表关联、数据变换、任务编排）必须用 Flux。

---

## 管道语法基础

Flux 查询始终以 `from()` 开始，以消费结果结束。管道操作符 `|>` 将左侧的表流传给右侧的函数。

### 最简单的查询

```flux
from(bucket: "my_bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
```

执行流程：

```mermaid
flowchart LR
    A["from(bucket)\n加载指定 bucket"] -->| |> | B["range(start:-1h)\n过滤最近1小时"]
    B -->| |> | C["filter(_measurement==cpu)\n筛选 CPU 指标"]
    C -->| |> | D["filter(_field==usage_user)\n筛选用户态使用率"]
    D --> E["输出结果表"]
```

### 核心概念：表流（Stream of Tables）

Flux 处理的不是单张表，而是**表流**——一系列具有相同 schema 的表。每个函数对表流中的每张表执行操作，然后传出新的表流。

```mermaid
graph TD
    subgraph "输入表流"
        T1["表1: _measurement=cpu, host=A"]
        T2["表2: _measurement=cpu, host=B"]
        T3["表3: _measurement=mem, host=A"]
    end

    F["filter(fn: (r) => r._measurement == "cpu")"]

    subgraph "输出表流"
        O1["表1: _measurement=cpu, host=A"]
        O2["表2: _measurement=cpu, host=B"]
    end

    T1 --> F
    T2 --> F
    T3 --> F
    F --> O1
    F --> O2
```

---

## 核心函数详解

### from() — 数据源指定

```flux
from(bucket: "metrics")
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `bucket` | string | 要查询的 bucket 名称（v2.x） |
| `host` | string | 可选，指定远程 InfluxDB 地址 |
| `org` | string | 可选，指定 organization |

> **v1.x 映射**：v1 的 `database` + `retention policy` 在 v2 中合并为 `bucket`。若从 v1 迁移，需将每个 `db.rp` 组合创建为一个 bucket。

### range() — 时间范围过滤

**唯一必需参数**，Flux 查询必须限定时间范围：

```flux
// 相对时间
|> range(start: -1h)        // 最近1小时
|> range(start: -24h, stop: -1h)  // 昨天（排除最近1小时）

// 绝对时间
|> range(start: 2024-01-01T00:00:00Z, stop: 2024-01-02T00:00:00Z)

// 混合
|> range(start: 2024-01-01T00:00:00Z, stop: now())
```

| 参数 | 说明 |
|------|------|
| `start` | 起始时间（必需），支持相对（`-1h`）或绝对（RFC3339） |
| `stop` | 结束时间（可选，默认 `now()`） |

### filter() — 条件过滤

```flux
// 单条件
|> filter(fn: (r) => r._measurement == "cpu")

// 多条件 AND
|> filter(fn: (r) => r._measurement == "cpu" and r.host == "server01")

// 多条件 OR
|> filter(fn: (r) => r.host == "server01" or r.host == "server02")

// 正则匹配
|> filter(fn: (r) => r.host =~ /^server[0-9]+$/)

// 排除匹配
|> filter(fn: (r) => r.host !~ /^test-/)
```

> **性能提示**：`filter()` 对 tag 的过滤会走索引，对 field 的过滤需要全表扫描。尽量把过滤条件放在管道早期。

### 聚合函数

```flux
// 基础聚合
|> mean()           // 平均值
|> sum()            // 求和
|> count()          // 计数
|> max()            // 最大值
|> min()            // 最小值
|> median()         // 中位数
|> percentile(
      column: "_value",
      q: 0.99        // P99
   )

// 变化率
|> derivative(
      unit: 1s,      // 每秒变化率
      nonNegative: true
   )

// 差值
|> difference(
      nonNegative: true
   )

// 累积和
|> cumulativeSum()

// 移动平均
|> movingAverage(n: 5)
```

### aggregateWindow() — 时间窗口聚合

时序查询中最常用的函数，按固定时间窗口分组并聚合：

```flux
|> aggregateWindow(
      every: 5m,           // 每 5 分钟一个窗口
      fn: mean,             // 窗口内取平均
      column: "_value",      // 聚合目标列
      createEmpty: false     // 空窗口不生成记录
   )
```

```mermaid
timeline
    title aggregateWindow(every: 5m, fn: mean) 示意
    section 原始数据
        10:00 : value=10
        10:01 : value=20
        10:02 : value=30
        10:03 : value=40
        10:04 : value=50
        10:05 : value=60
        10:06 : value=70
    section 聚合后
        10:00 : mean=30
        10:05 : mean=65
```

### window() — 原始窗口划分

只分组不聚合，需要配合 `aggregateWindow()` 或自定义聚合：

```flux
|> window(every: 1h)
|> mean()
|> duplicate(column: "_start", as: "_time")
```

### pivot() — 宽表转长表

将多个 field 的查询结果转为宽表格式，便于 Grafana 展示：

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user" or r._field == "usage_system")
  |> aggregateWindow(every: 5m, fn: mean)
  |> pivot(
      rowKey: ["_time"],
      columnKey: ["_field"],
      valueColumn: "_value"
   )
// 结果：_time | usage_user | usage_system
```

### join() — 表关联

Flux 的 `join()` 通过 **时间 + tag 的精确匹配** 实现时序数据的关联：

```flux
// 查询 CPU 数据
cpu = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean)

// 查询内存数据
mem = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "memory")
  |> filter(fn: (r) => r._field == "used_percent")
  |> aggregateWindow(every: 5m, fn: mean)

// join：按 _time 和 host 关联
cpu
  |> join(
      tables: {mem: mem},
      on: ["_time", "host"],
      method: "inner"
   )
```

> **时序 Join 的特殊性**：InfluxDB 的 join 以**时间对齐**为核心，不像 SQL 以键值匹配为主。如果两个序列的时间戳不完全一致，需先用 `aggregateWindow()` 对齐到相同粒度。

---

## 完整查询示例

### 示例1：最近 1 小时的 CPU 平均值（按 host 分组）

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean)
  |> yield(name: "cpu_mean")
```

### 示例2：Top 5 内存使用率最高的服务器

```flux
from(bucket: "metrics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "memory")
  |> filter(fn: (r) => r._field == "used_percent")
  |> group(columns: ["host"])
  |> last()
  |> group()
  |> sort(columns: ["_value"], desc: true)
  |> limit(n: 5)
```

### 示例3：网络 IO 流入流出对比（join 双序列）

```flux
in_bytes = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "net")
  |> filter(fn: (r) => r._field == "bytes_recv")
  |> aggregateWindow(every: 5m, fn: sum)

out_bytes = from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "net")
  |> filter(fn: (r) => r._field == "bytes_sent")
  |> aggregateWindow(every: 5m, fn: sum)

in_bytes
  |> join(
      tables: {out: out_bytes},
      on: ["_time", "host"],
      method: "inner"
   )
  |> map(fn: (r) => ({r with ratio: r._value_in / r._value_out}))
```

### 示例4：磁盘使用率告警检测

```flux
from(bucket: "metrics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "disk")
  |> filter(fn: (r) => r._field == "used_percent")
  |> filter(fn: (r) => r._value > 80.0)
  |> map(fn: (r) => ({
      r with
      severity: if r._value > 95.0 then "CRITICAL" else "WARNING",
      message: "Disk usage ${r._value}% on ${r.host}:${r.path}"
   }))
```

### 示例5：数据降采样后写入新 bucket

```flux
option task = {
    name: "downsample_cpu",
    every: 1h,
}

from(bucket: "metrics_raw")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> aggregateWindow(every: 5m, fn: mean)
  |> to(bucket: "metrics_5m")
```

### 示例6：同比环比分析

```flux
// 本周数据
this_week = from(bucket: "metrics")
  |> range(start: -7d, stop: now())
  |> filter(fn: (r) => r._measurement == "requests")
  |> filter(fn: (r) => r._field == "count")
  |> aggregateWindow(every: 1d, fn: sum)

// 上周同期（shift 7天）
last_week = from(bucket: "metrics")
  |> range(start: -14d, stop: -7d)
  |> filter(fn: (r) => r._measurement == "requests")
  |> filter(fn: (r) => r._field == "count")
  |> aggregateWindow(every: 1d, fn: sum)
  |> timeShift(duration: 7d)

// join 对比
this_week
  |> join(
      tables: {last: last_week},
      on: ["_time"],
      method: "inner"
   )
  |> map(fn: (r) => ({
      r with
      growth_rate: (r._value - r._value_last) / r._value_last * 100.0
   }))
```

### 示例7：异常检测（3-sigma 法则）

```flux
// 计算均值和标准差
stats = from(bucket: "metrics")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "api_latency")
  |> filter(fn: (r) => r._field == "duration")
  |> reduce(
      fn: (r, accumulator) => ({
          sum: accumulator.sum + r._value,
          count: accumulator.count + 1,
          sumsq: accumulator.sumsq + r._value * r._value
      }),
      identity: {sum: 0.0, count: 0, sumsq: 0.0}
   )
  |> map(fn: (r) => ({
      mean: r.sum / float(v: r.count),
      stddev: math.sqrt(x: (r.sumsq / float(v: r.count)) - (r.sum / float(v: r.count)) * (r.sum / float(v: r.count)))
   }))

// 检测当前异常点
from(bucket: "metrics")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "api_latency")
  |> filter(fn: (r) => r._field == "duration")
  |> map(fn: (r) => ({
      r with
      is_anomaly: r._value > stats.mean + 3.0 * stats.stddev
   }))
```

---

## 调试技巧

### 使用 yield() 查看中间结果

```flux
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> yield(name: "after_filter")
  |> aggregateWindow(every: 5m, fn: mean)
  |> yield(name: "after_agg")
```

### 使用 influx CLI 测试 Flux 查询

```bash
# 直接执行 Flux 查询
influx query '
from(bucket: "metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> limit(n: 10)
'

# 从文件执行
influx query --file query.flux
```

### Web UI Data Explorer 自动生成 Flux

打开 `http://localhost:8086` → Data Explorer → 选择 bucket/measurement/field → 点击 **Script Editor** 查看自动生成的 Flux 代码，是学习 Flux 的最佳途径。

---

## Flux 在 3.x 中的变化

InfluxDB 3.x 大幅改变了 Flux 的地位：

| 版本 | Flux 支持状态 | 推荐查询语言 |
|------|-------------|-------------|
| **2.x** | 原生主推 | Flux |
| **3.x** | **已弃用** | InfluxQL / 标准 SQL |

3.x 不再内置 Flux 引擎，社区对 Flux 的接受度低于预期是主要原因。如果你在 2.x 上投入了大量 Flux 查询，迁移到 3.x 时需要改写为 InfluxQL 或 SQL。

> **学习建议**：如果你是新用户，建议优先掌握 **InfluxQL**（兼容 1.x/2.x/3.x 三代）和基础 Flux（用于 2.x 环境）。不要深度投入 Flux 的高级特性，除非确定长期停留在 2.x。
