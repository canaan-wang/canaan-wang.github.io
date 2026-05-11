# InfluxDB 数据备份与迁移核心解析：全量备份、版本升级与跨平台迁移

数据备份和迁移是生产环境运维的基本功。InfluxDB 的备份机制随版本变化较大，理解各代的工具和策略是避免数据丢失的关键。

---

## 备份策略概述

| 版本 | 备份工具 | 备份粒度 | 增量支持 |
|------|---------|---------|---------|
| **1.x** | `influxd backup` | Database / Shard | 是（基于时间） |
| **2.x** | `influx backup` | Bucket / Org | 否（全量） |
| **3.x** | 对象存储天然多副本 | Parquet 文件 | 是（存储层） |

---

## 1.x 备份与恢复

### 全量备份

```bash
# 备份所有数据库
influxd backup -host localhost:8088 /backup/$(date +%Y%m%d)

# 备份指定数据库
influxd backup -database mydb /backup/mydb-$(date +%Y%m%d)

# 备份指定 RP
influxd backup -database mydb -retention autogen /backup/mydb-autogen
```

### 增量备份

```bash
# 基于时间的增量备份（备份某时间点之后的数据）
influxd backup -database mydb -start 2024-01-01T00:00:00Z /backup/mydb-incr

# 增量备份通常比全量快很多，因为只备份新增 Shard
```

### 恢复

```bash
# 恢复数据库
influxd restore -metadir /var/lib/influxdb/meta -datadir /var/lib/influxdb/data /backup/20240101

# 恢复时指定数据库
influxd restore -database mydb -newdb mydb_restored /backup/mydb-20240101
```

### 1.x 备份文件结构

```
/backup/20240101/
├── meta.00          # 元数据备份
├── mydb.autogen.00001.tar.gz  # Shard 数据
├── mydb.autogen.00002.tar.gz
└── mydb.autogen.00003.tar.gz
```

---

## 2.x 备份与恢复

### 全量备份

```bash
# 备份所有 Buckets 和元数据
influx backup /backup/$(date +%Y%m%d)   --host http://localhost:8086   --token $INFLUX_TOKEN   --org my-org

# 备份指定 Bucket
influx backup /backup/metrics-$(date +%Y%m%d)   --bucket metrics   --token $INFLUX_TOKEN   --org my-org
```

### 恢复

```bash
# 恢复（会覆盖同名 Bucket，谨慎操作）
influx restore /backup/20240101   --host http://localhost:8086   --token $INFLUX_TOKEN   --org my-org

# 恢复到新 Organization
influx restore /backup/20240101   --new-org restored-org   --token $INFLUX_TOKEN
```

### 2.x 备份文件结构

```
/backup/20240101/
├── 20240101T000000Z.bolt    # 元数据（boltDB）
├── 20240101T000000Z.manifest  # 备份清单
└── 20240101T000000Z.<bucket-id>.tar.gz  # Bucket 数据
```

> **注意**：2.x 备份是**全量**的，不支持增量。大数据量备份时可能耗时较长。

---

## 版本升级路径

### 1.x → 2.x 升级

```mermaid
flowchart LR
    A["InfluxDB 1.x"] -->|"导出数据"| B["influxd backup"]
    B -->|"安装 2.x"| C["InfluxDB 2.x"]
    C -->|"升级工具"| D["influxd upgrade"]
    D -->|"导入数据"| E["Bucket 结构"]
```

```bash
# 官方提供的自动升级工具
influxd upgrade   --source-config /etc/influxdb/influxdb.conf   --target-config /etc/influxdb/influxdb2.conf   --v1-dir /var/lib/influxdb   --v2-dir /var/lib/influxdb2   --log-path /var/log/influxdb-upgrade.log

# 升级内容：
# - Database + RP → Bucket
# - 用户 → Organization + Token
# - 数据文件 → 2.x 格式
```

| 升级项 | 1.x | 2.x |
|--------|-----|-----|
| Database | `mydb` | `mydb`（Bucket） |
| RP | `autogen` | Bucket 的 retention 属性 |
| 用户认证 | 用户名/密码 | Token |
| 连续查询 | CQ | Task（Flux） |
| 查询 | InfluxQL | InfluxQL + Flux |

### 2.x → 3.x 升级

InfluxDB 3.x 采用全新 IOx 引擎，**不支持原地升级**，必须导出导入：

```bash
# 2.x 端：导出数据为 Line Protocol
influx query '
from(bucket: "metrics")
  |> range(start: 0)
  |> filter(fn: (r) => r._measurement == "cpu")
' --raw > /export/cpu.lp

# 或使用 2.x 的 export API

# 3.x 端：导入 Line Protocol
curl -X POST "http://influxdb3:8086/api/v2/write?bucket=metrics&precision=ns"   -H "Authorization: Token $TOKEN"   --data-binary @/export/cpu.lp
```

> **3.x 兼容性**：3.x 不再支持 Flux 和 CQ，导入后需要重写查询逻辑为 InfluxQL 或 SQL。

---

## 跨平台迁移

### Docker 数据迁移

```bash
# 导出容器数据卷
docker exec influxdb influx backup /tmp/backup --token $TOKEN
docker cp influxdb:/tmp/backup ./backup-$(date +%Y%m%d)

# 新机器恢复
docker run -d --name influxdb-new -p 8086:8086 influxdb:2.7
docker cp ./backup-20240101 influxdb-new:/tmp/backup
docker exec influxdb-new influx restore /tmp/backup --token $TOKEN
```

### 云实例迁移（AWS → GCP）

```bash
# AWS EC2 导出
influx backup /backup/all --token $TOKEN
aws s3 sync /backup/all s3://my-influxdb-backup/20240101/

# GCP 实例导入
gsutil cp -r gs://my-influxdb-backup/20240101/ /backup/
influx restore /backup/20240101 --token $TOKEN
```

---

## 备份策略建议

| 场景 | 备份频率 | 保留周期 | 存储位置 |
|------|---------|---------|---------|
| 开发环境 | 每周 | 2 周 | 本地 |
| 测试环境 | 每天 | 7 天 | 本地 + NAS |
| 生产环境 | 每天全量 + 每小时 WAL | 30 天 | 异地 + 云存储 |
| 金融级 | 实时复制 | 90 天 | 多可用区 + 冷存储 |

### 自动化备份脚本

```bash
#!/bin/bash
# backup-influxdb.sh

BACKUP_DIR="/backup/influxdb"
RETENTION_DAYS=30
TOKEN="${INFLUX_TOKEN}"
ORG="my-org"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
influx backup "${BACKUP_DIR}/${DATE}"   --token "${TOKEN}"   --org "${ORG}"   2>&1 | tee "${BACKUP_DIR}/backup-${DATE}.log"

# 上传到 S3（可选）
aws s3 cp "${BACKUP_DIR}/${DATE}" "s3://my-influxdb-backups/${DATE}/" --recursive

# 清理旧备份
find "${BACKUP_DIR}" -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;

echo "Backup completed: ${DATE}"
```

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 备份文件过大 | 数据量增长 / 未清理旧备份 | 分层 RP + CQ 降采样 |
| 恢复后数据缺失 | 备份时数据正在写入 | 备份前停止写入或使用一致性快照 |
| 升级后 CQ 失效 | 2.x CQ 改为 Task | 手动迁移 CQ 为 Flux Task |
| 跨版本导入失败 | 数据格式不兼容 | 统一导出为 Line Protocol |
| 对象存储 3.x 迁移慢 | Parquet 文件大 | 分 bucket 并行迁移 |
