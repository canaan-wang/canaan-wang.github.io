# InfluxDB 高可用与集群架构核心解析：单节点、企业集群与 3.x 云原生方案

InfluxDB 的高可用方案随着版本演进发生了显著变化。从 1.x 的闭源企业集群到 2.x 的开源高可用再到 3.x 的 IOx 云原生架构，理解各代的集群方案是生产部署的基础。

---

## 版本演进与高可用策略

| 版本 | 集群方案 | 开源状态 | 推荐场景 |
|------|---------|---------|---------|
| **1.x OSS** | 单节点，无集群 | 完全开源 | 开发、测试、小型单节点 |
| **1.x Enterprise** | Meta + Data 节点集群 | 闭源付费 | 中大型生产（已逐步淘汰） |
| **2.x OSS** | 单节点 + 外部 HA | 完全开源 | 中小生产，依赖外部方案 |
| **3.x (IOx)** | 无状态查询节点 + 对象存储 | 开源 | 云原生、大规模 |
| **InfluxDB Edge** | 边缘采集 + 云端汇聚 | 开源 | IoT、边缘计算 |

---

## 1.x 企业版集群架构

### Meta 节点 + Data 节点

1.x Enterprise 采用分层架构：

```mermaid
graph TD
    subgraph "Meta 节点集群（3/5节点）"
        M1["Meta 1\n集群元数据"]
        M2["Meta 2"]
        M3["Meta 3"]
    end

    subgraph "Data 节点集群"
        D1["Data 1\nShard A, B"]
        D2["Data 2\nShard C, D"]
        D3["Data 3\nShard E, F"]
    end

    subgraph "负载均衡层"
        L1["HAProxy / Nginx"]
    end

    L1 --> D1
    L1 --> D2
    L1 --> D3

    M1 -->|"元数据同步"| M2
    M2 --> M3
    D1 -->|"反熵同步"| D2
```

| 节点类型 | 职责 | 数量要求 |
|----------|------|---------|
| **Meta 节点** | 存储集群元数据（database、RP、用户、Shard 分配） | 3 或 5（奇数） |
| **Data 节点** | 存储实际 TSM 数据 | 2+ |

### 数据复制与一致性

Enterprise 集群通过 **Hinted Handoff** 机制实现数据复制：

```mermaid
flowchart LR
    A["写入请求"] --> B["Data Node 1"]
    B -->|"复制到"| C["Data Node 2"]
    B -->|"复制到"| D["Data Node 3"]
    C -->|"节点暂时离线"| E["Hinted Handoff 队列"]
    E -->|"恢复后"| C
```

| 复制因子 | 可容忍故障 | 存储开销 |
|----------|-----------|---------|
| 1 | 0 节点 | 1x |
| 2 | 1 节点 | 2x |
| 3 | 2 节点 | 3x |

> **1.x Enterprise 现状**：InfluxData 已将企业版功能全部开源到 2.x，不再销售 1.x Enterprise 新授权。

---

## 2.x 高可用方案

### 官方架构限制

InfluxDB 2.x **开源版本身不提供集群功能**，单节点是唯一的官方支持部署方式。生产环境高可用需借助外部方案。

### 外部高可用方案

| 方案 | 架构 | RPO | RTO | 复杂度 |
|------|------|-----|-----|--------|
| **主从复制** | 主节点 + 从节点 + 手动切换 | 取决于同步间隔 | 分钟级 | 低 |
| **双主负载** | 两个独立实例 + 客户端分发 | 无（数据分片） | 秒级 | 中 |
| **对象存储备份** | 主节点 + S3 备份 + 快速重建 | 取决于备份间隔 | 分钟级 | 低 |
| **Kubernetes StatefulSet** | 单 Pod + PVC + 自动重建 | 取决于存储 | 分钟级 | 中 |

### 主从复制实现

```bash
# 主节点配置：启用备份 + 复制用户
# 从节点：定期从主节点恢复备份

# 主节点执行备份脚本（cron 每分钟）
influx backup /backup/$(date +%Y%m%d%H%M)

# 从节点同步（rsync / S3）
rsync -avz --delete root@master:/backup/ /backup/

# 从节点恢复（需要时）
influx restore /backup/latest/
```

### 双主负载分发

```mermaid
flowchart TD
    A["Telegraf Agent"] -->|"50% 流量"| B["InfluxDB Node 1"]
    A -->|"50% 流量"| C["InfluxDB Node 2"]

    D["Grafana 查询"] -->|"轮询"| B
    D --> C

    B -->|"独立存储"| E["Disk 1"]
    C -->|"独立存储"| F["Disk 2"]
```

> **注意**：双主方案中两个节点数据不共享，查询聚合时需要客户端合并或只查单个节点。

---

## 3.x IOx 云原生架构

### 架构变革

InfluxDB 3.x 基于 IOx 引擎，采用**无状态查询节点 + 对象存储**的完全云原生架构：

```mermaid
graph TD
    subgraph "查询层（无状态，可水平扩展）"
        Q1["Query Node 1"]
        Q2["Query Node 2"]
        Q3["Query Node N"]
    end

    subgraph "存储层"
        S1["Apache Parquet Files"]
        S2["对象存储: S3 / MinIO / GCS"]
    end

    subgraph "元数据层"
        M1["Catalog Service"]
    end

    Q1 -->|"读取 Parquet"| S2
    Q2 --> S2
    Q1 -->|"获取元数据"| M1

    W1["写入请求"] -->|" Arrow Flight"| Q1
    Q1 -->|"写入 Parquet"| S2
    Q1 -->|"更新 Catalog"| M1
```

### 3.x 架构优势

| 特性 | 2.x TSM | 3.x IOx |
|------|---------|---------|
| **节点状态** | 有状态 | 无状态 |
| **水平扩展** | 不支持 | 查询层可无限扩展 |
| **存储分离** | 本地磁盘 | S3 / 对象存储 |
| **计算成本** | 固定 | 按需扩展 |
| **运维复杂度** | 中 | 低（容器化） |
| **容灾恢复** | 备份恢复 | 对象存储天然多副本 |

---

## InfluxDB Edge（边缘方案）

### 边缘到云端的数据流

```mermaid
graph LR
    subgraph "边缘层"
        E1["IoT 设备 / 工控机"]
        E2["边缘网关\n(InfluxDB Edge)"]
    end

    subgraph "汇聚层"
        C1["云端 InfluxDB"]
        C2["Grafana 监控"]
    end

    E1 -->|"MQTT / HTTP"| E2
    E2 -->|"批量同步\n(定时/阈值)"| C1
    C1 --> C2
```

### 边缘层配置

```toml
# 边缘 InfluxDB 配置：轻量 + 压缩 + 定时上传
[data]
  cache-max-memory-size = "128m"
  max-series-per-database = 50000

[edge]
  # 数据保留时长（边缘只存近期）
  retention = "24h"

  # 上传触发条件
  upload-trigger-size = "10mb"
  upload-trigger-interval = "1h"
```

---

## 选型决策树

```mermaid
flowchart TD
    A["需要集群？"] -->|否| B["单节点 InfluxDB 2.x"]
    A -->|是| C{"数据规模？"}
    C -->|"< 1TB"| D["2.x 单节点 + 外部 HA"]
    C -->|"1TB ~ 10TB"| E["2.x 主从 + 分层 RP"]
    C -->|"> 10TB"| F["3.x IOx + 对象存储"]
    C -->|"IoT 边缘"| G["InfluxDB Edge + 云端汇聚"]
```

---

## 高可用检查清单

| 检查项 | 要求 |
|--------|------|
| 定期备份 | 至少每天一次完整备份 |
| 备份验证 | 每月至少一次恢复演练 |
| 监控告警 | 节点离线、磁盘满、内存告警 |
| 故障切换 | 有明确的切换手册，RTO < 30 分钟 |
| 数据冗余 | 关键数据复制因子 ≥ 2 |
| 跨可用区 | 生产环境至少双 AZ 部署 |
