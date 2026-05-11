# InfluxDB 安装与快速上手指南

本文的目标很明确：让你在 10 分钟内，在本地跑起一个可用的 InfluxDB 实例，完成第一条数据的写入和查询。全文以 **Docker 部署为主推方式**（跨平台一致、环境隔离、可复现），同时简要覆盖本地二进制安装路径。

---

## 环境准备

开始前，确认你的环境满足以下条件：

| 需求 | 说明 |
|------|------|
| **Docker** | 20.10+ 版本，Docker Desktop 或 Engine 均可 |
| **curl** | 用于 HTTP API 测试（macOS/Linux 自带，Windows 可用 PowerShell） |
| **内存** | 建议至少 2GB 可用内存（InfluxDB 默认缓存会占用一定内存） |
| **磁盘** | 至少 5GB 可用空间（TSM 引擎和数据文件） |

验证 Docker：

```bash
docker --version
docker compose version
```

---

## 方式一：Docker 安装（推荐）

Docker 方式是跨平台、可复现、最干净的部署方式，也是生产环境的推荐起步方案。

### 1. 拉取镜像并启动容器

```bash
# 创建数据持久化目录
mkdir -p ~/influxdb-data

# 启动 InfluxDB 2.x 容器
docker run -d \
  --name influxdb2 \
  --restart unless-stopped \
  -p 8086:8086 \
  -v ~/influxdb-data:/var/lib/influxdb2 \
  -e DOCKER_INFLUXDB_INIT_MODE=setup \
  -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
  -e DOCKER_INFLUXDB_INIT_PASSWORD=your-password \
  -e DOCKER_INFLUXDB_INIT_ORG=my-org \
  -e DOCKER_INFLUXDB_INIT_BUCKET=metrics \
  -e DOCKER_INFLUXDB_INIT_RETENTION=7d \
  influxdb:2.7
```

参数说明：

| 参数 | 说明 |
|------|------|
| `-p 8086:8086` | 映射 HTTP API 和 Web UI 端口 |
| `-v ~/influxdb-data:/var/lib/influxdb2` | 数据持久化到宿主机，容器删除数据不丢 |
| `DOCKER_INFLUXDB_INIT_MODE=setup` | 自动执行首次初始化，创建管理员账户 |
| `DOCKER_INFLUXDB_INIT_USERNAME` | 管理员用户名 |
| `DOCKER_INFLUXDB_INIT_PASSWORD` | 管理员密码（**生产环境请使用强密码**） |
| `DOCKER_INFLUXDB_INIT_ORG` | 默认 Organization 名称 |
| `DOCKER_INFLUXDB_INIT_BUCKET` | 默认 Bucket 名称 |
| `DOCKER_INFLUXDB_INIT_RETENTION` | 默认 Bucket 数据保留时长 |

### 2. 查看容器状态

```bash
docker ps -a | grep influxdb2
docker logs influxdb2 --tail 20
```

看到 `InfluxDB initialization complete` 即表示初始化成功。

### 3. 获取管理员 Token

初始化完成后，Token 会被写入容器日志。提取它：

```bash
ADMIN_TOKEN=$(docker logs influxdb2 2>&1 | grep "token=" | head -1 | sed 's/.*token=//')
echo "Admin Token: $ADMIN_TOKEN"
```

> **保存这个 Token**，它是后续所有 API 调用的认证凭证。2.x 中所有操作都需要 Token，没有用户名/密码的直接 HTTP Basic Auth（密码仅用于 Web UI 登录）。

---

## 方式二：本地二进制安装（简要）

如果你需要在裸机或 VM 上直接运行，可下载官方二进制：

```bash
# macOS (Apple Silicon / Intel)
wget https://dl.influxdata.com/influxdb/releases/influxdb2-2.7.10-darwin-amd64.tar.gz
tar xzf influxdb2-2.7.10-darwin-amd64.tar.gz
sudo mv influxdb2-2.7.10-darwin-amd64/influxd /usr/local/bin/

# Linux (AMD64)
wget https://dl.influxdata.com/influxdb/releases/influxdb2-2.7.10-linux-amd64.tar.gz
tar xzf influxdb2-2.7.10-linux-amd64.tar.gz
sudo mv influxdb2-2.7.10-linux-amd64/influxd /usr/local/bin/
```

启动服务：

```bash
influxd --bolt-path=~/.influxdbv2/influxd.bolt \
        --engine-path=~/.influxdbv2/engine \
        --http-bind-address=:8086
```

首次启动后，打开 `http://localhost:8086` 完成 Web UI 初始化（创建管理员账户、Org、Bucket）。

**systemd 服务配置（Linux）**：

```ini
# /etc/systemd/system/influxdb.service
[Unit]
Description=InfluxDB 2.x
After=network.target

[Service]
Type=simple
User=influxdb
Group=influxdb
ExecStart=/usr/local/bin/influxd
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now influxdb
sudo systemctl status influxdb
```

---

## 首次启动初始化（2.x 的 setup 流程）

如果你使用 Docker 的自动初始化模式（`DOCKER_INFLUXDB_INIT_MODE=setup`），setup 已经在容器启动时自动完成。以下讲解手动 setup 的流程，适用于本地二进制安装或需要自定义参数的场景。

### 手动执行 setup

```bash
influx setup \
  --username admin \
  --password your-password \
  --org my-org \
  --bucket metrics \
  --retention 7d \
  --token your-custom-token \
  --force
```

setup 完成后，系统会输出：

- **Organization ID**：组织的唯一标识
- **Bucket ID**：Bucket 的唯一标识
- **User ID**：管理员用户标识
- **Token**：API 访问令牌

> 如果省略 `--token`，InfluxDB 会自动生成一个随机 Token。建议生产环境显式指定便于轮换管理。

---

## influx CLI 工具安装与基本命令

`influx` CLI 是管理 InfluxDB 的瑞士军刀，支持 Bucket 管理、数据写入/查询、Task 配置等。

### 安装 CLI

```bash
# macOS
brew install influxdb-cli

# Linux
wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-2.7.10-linux-amd64.tar.gz
tar xzf influxdb2-client-2.7.10-linux-amd64.tar.gz
sudo mv influx /usr/local/bin/
```

### 配置连接

```bash
# 设置环境变量（避免每次命令都传参数）
export INFLUX_HOST=http://localhost:8086
export INFLUX_ORG=my-org
export INFLUX_TOKEN=$ADMIN_TOKEN

# 验证连接
influx ping
# 期望输出：OK
```

### 常用命令速查

| 命令 | 功能 |
|------|------|
| `influx ping` | 检查服务健康 |
| `influx org list` | 列出所有 Organization |
| `influx bucket list` | 列出所有 Bucket |
| `influx bucket create --name logs --retention 30d` | 创建新 Bucket |
| `influx user list` | 列出用户 |
| `influx auth list` | 列出 API Token |
| `influx write --bucket metrics "cpu,host=server01 usage_user=23.5"` | 写入单条数据 |
| `influx query "from(bucket:\"metrics\") |> range(start:-1h)"` | 执行 Flux 查询 |

---

## 第一条数据写入

以下展示三种写入方式，**HTTP API + curl 是最高效的方式**，适合批量写入和集成；CLI 适合快速测试；Web UI 适合手动导入。

### 方式 A：HTTP API + curl（推荐）

```bash
# 设置变量
INFLUX_HOST="http://localhost:8086"
INFLUX_TOKEN="$ADMIN_TOKEN"  # 使用前面获取的 Token
ORG="my-org"
BUCKET="metrics"

# 单条写入
curl -i -X POST "${INFLUX_HOST}/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=s" \
  -H "Authorization: Token ${INFLUX_TOKEN}" \
  -H "Content-Type: text/plain; charset=utf-8" \
  --data-raw "cpu,host=server01,region=beijing usage_user=23.5,usage_system=4.2,usage_idle=72.3"

# 批量写入（推荐，减少网络往返）
cat > /tmp/metrics.txt << 'EOF'
cpu,host=server01,region=beijing,cpu=cpu0 usage_user=23.5,usage_system=4.2,usage_idle=72.3 1715500800
cpu,host=server01,region=beijing,cpu=cpu1 usage_user=18.2,usage_system=3.8,usage_idle=78.0 1715500800
cpu,host=server02,region=shanghai,cpu=cpu0 usage_user=31.4,usage_system=6.1,usage_idle=62.5 1715500800
memory,host=server01,region=beijing usage_percent=45.2,used=8589934592,total=17179869184 1715500800
memory,host=server02,region=shanghai usage_percent=62.8,used=10737418240,total=17179869184 1715500800
EOF

curl -i -X POST "${INFLUX_HOST}/api/v2/write?org=${ORG}&bucket=${BUCKET}&precision=s" \
  -H "Authorization: Token ${INFLUX_TOKEN}" \
  -H "Content-Type: text/plain; charset=utf-8" \
  --data-binary @/tmp/metrics.txt
```

关键参数：

| 参数 | 说明 |
|------|------|
| `precision=s` | 时间戳精度为秒（可选 `ns`、`us`、`ms`、`s`） |
| `--data-binary` | 读取文件内容作为请求体，支持批量数据 |
| `Authorization: Token` | 2.x 的标准认证头格式 |

### 方式 B：influx CLI 写入

```bash
# 单条写入
influx write \
  --bucket metrics \
  --precision s \
  "temperature,device=sensor01,location=room1 value=25.6"

# 从文件批量写入
influx write \
  --bucket metrics \
  --file /tmp/metrics.txt \
  --precision s
```

### 方式 C：Web UI 数据导入

1. 打开浏览器访问 `http://localhost:8086`
2. 使用 setup 时设置的用户名/密码登录
3. 左侧导航 → **Data Explorer**
4. 选择目标 Bucket（如 `metrics`）
5. 点击 **ADD DATA** → **Line Protocol**
6. 粘贴 Line Protocol 数据，点击 **Write Data**

> Web UI 导入适合一次性手动操作或调试，生产环境建议使用 HTTP API 或 Telegraf。

---

## 第一条查询

写入数据后，通过三种方式验证数据是否成功写入。

### 方式 A：Web UI Data Explorer（最直观）

1. 打开 `http://localhost:8086`
2. 左侧导航 → **Data Explorer**
3. 选择 **Query Builder** 模式：
   - **FROM**：选择 `metrics` Bucket
   - **FILTER**：选择 `cpu` Measurement，勾选 `usage_user` Field
   - **GROUP**：勾选 `host` Tag
   - **AGGREGATE**：选择 `mean`，窗口 `5m`
4. 点击 **SUBMIT**，右侧显示时序图表

> Data Explorer 会自动生成对应的 Flux 查询语句，是学习和验证 Flux 语法的最佳工具。

### 方式 B：influx CLI 查询

```bash
# 查询最近 1 小时的 CPU 数据
influx query 'from(bucket:"metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")'

# 查询并聚合：最近 1 小时，按 host 分组，每 5 分钟平均
influx query 'from(bucket:"metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean)
  |> group(columns: ["host"])'
```

### 方式 C：HTTP API + curl 查询

```bash
# Flux 查询（返回 CSV 格式）
curl -s -X POST "${INFLUX_HOST}/api/v2/query?org=${ORG}" \
  -H "Authorization: Token ${INFLUX_TOKEN}" \
  -H "Content-Type: application/vnd.flux" \
  -H "Accept: application/csv" \
  --data '
from(bucket:"metrics")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> filter(fn: (r) => r._field == "usage_user")
  |> aggregateWindow(every: 5m, fn: mean)
  |> yield(name: "cpu_avg")
'
```

### Flux 查询语法速览

Flux 是 2.x 的查询语言，基于函数式管道思想：

```flux
from(bucket: "metrics")           // 指定数据源
  |> range(start: -1h)            // 时间范围：最近 1 小时
  |> filter(fn: (r) =>            // 过滤条件
      r._measurement == "cpu" and
      r._field == "usage_user")
  |> aggregateWindow(             // 窗口聚合
      every: 5m,                  // 每 5 分钟一个窗口
      fn: mean)                   // 聚合函数：平均值
  |> group(columns: ["host"])     // 按 host 分组
  |> yield(name: "result")         // 输出结果
```

常用聚合函数：

| 函数 | 说明 |
|------|------|
| `mean()` | 平均值 |
| `sum()` | 求和 |
| `count()` | 计数 |
| `median()` | 中位数 |
| `stddev()` | 标准差 |
| `min()` / `max()` | 最小值 / 最大值 |
| `first()` / `last()` | 窗口首值 / 末值 |
| `derivative()` | 变化率 |
| `cumulativeSum()` | 累积和 |

---

## 常用端口与配置项速查表

### 端口说明

| 端口 | 协议 | 用途 | 是否必需暴露 |
|------|------|------|-------------|
| **8086** | HTTP | API 写入/查询、Web UI | 是 |
| 8088 | HTTP | 1.x RPC 服务（2.x 已废弃） | 否 |
| 8089 | UDP | 1.x UDP Line Protocol（2.x 推荐用 Telegraf） | 可选 |

> 生产环境建议将 8086 放在反向代理（Nginx/Traefik）之后，启用 TLS。

### 核心配置项

配置文件路径（容器内）：`/etc/influxdb2/config.yml`

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `http-bind-address` | `:8086` | HTTP 服务监听地址 |
| `bolt-path` | `~/.influxdbv2/influxd.bolt` | 元数据数据库（SQLite）路径 |
| `engine-path` | `~/.influxdbv2/engine` | TSM 存储引擎数据目录 |
| `storage-cache-max-memory-size` | `1GB` | 内存缓存上限 |
| `storage-cache-snapshot-memory-size` | `25MB` | 触发 Cache 快照的内存阈值 |
| `storage-retention-check-interval` | `30m` | 保留策略检查间隔 |
| `log-level` | `info` | 日志级别（debug/info/warn/error） |

Docker 方式修改配置：

```bash
# 方式 1：环境变量（推荐简单场景）
docker run -e INFLUXDB_HTTP_BIND_ADDRESS=:8086 ...

# 方式 2：挂载自定义配置文件
docker run -v /path/to/config.yml:/etc/influxdb2/config.yml ...
```

---

## 安装后验证清单

部署完成后，按以下清单逐项验证，确保环境就绪：

| 步骤 | 验证命令 / 操作 | 期望结果 |
|------|---------------|---------|
| 1. 服务运行 | `docker ps` / `systemctl status influxdb` | 容器/服务状态为 running |
| 2. API 可达 | `curl http://localhost:8086/health` | 返回 JSON，`status="pass"` |
| 3. Web UI 登录 | 浏览器访问 `http://localhost:8086` | 可正常登录，显示 Dashboard |
| 4. CLI 连接 | `influx ping` | 输出 `OK` |
| 5. Org/Bucket 存在 | `influx bucket list` | 显示 setup 时创建的 Bucket |
| 6. 写入测试 | HTTP API / CLI 写入一条数据 | HTTP 返回 `204 No Content` |
| 7. 查询测试 | Data Explorer 或 CLI 查询 | 返回写入的数据点 |
| 8. Token 有效 | `influx auth list` | 显示管理员 Token |

### 一键健康检查脚本

```bash
#!/bin/bash
# save as: check-influxdb.sh

HOST="http://localhost:8086"
TOKEN="${ADMIN_TOKEN:-your-token-here}"

echo "=== InfluxDB 健康检查 ==="

# 1. 服务状态
echo -n "[1/5] 服务状态: "
if curl -s "${HOST}/health" | grep -q '"status":"pass"'; then
    echo "✅ 正常"
else
    echo "❌ 异常"
    exit 1
fi

# 2. 查询组织
echo -n "[2/5] 组织查询: "
if curl -s -H "Authorization: Token ${TOKEN}" "${HOST}/api/v2/orgs" | grep -q '"name"'; then
    echo "✅ 正常"
else
    echo "❌ 异常（Token 可能无效）"
    exit 1
fi

# 3. 写入测试
echo -n "[3/5] 写入测试: "
if curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${HOST}/api/v2/write?org=my-org&bucket=metrics&precision=s" \
    -H "Authorization: Token ${TOKEN}" \
    --data-raw "health_check,source=script status=1" | grep -q "204"; then
    echo "✅ 正常"
else
    echo "❌ 异常"
    exit 1
fi

# 4. 查询测试
echo -n "[4/5] 查询测试: "
RESULT=$(curl -s -X POST "${HOST}/api/v2/query?org=my-org" \
    -H "Authorization: Token ${TOKEN}" \
    -H "Content-Type: application/vnd.flux" \
    --data 'from(bucket:"metrics") |> range(start:-1m) |> filter(fn:(r)=>r._measurement=="health_check")' | wc -l)
if [ "$RESULT" -gt 1 ]; then
    echo "✅ 正常（返回 $RESULT 行数据）"
else
    echo "❌ 异常"
    exit 1
fi

# 5. 磁盘空间
echo -n "[5/5] 磁盘空间: "
USAGE=$(df -h ~/influxdb-data 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//')
if [ -n "$USAGE" ] && [ "$USAGE" -lt 90 ]; then
    echo "✅ 正常（使用 ${USAGE}%）"
else
    echo "⚠️ 警告（使用 ${USAGE}%）"
fi

echo "=== 检查完成 ==="
```

赋予执行权限并运行：

```bash
chmod +x check-influxdb.sh
./check-influxdb.sh
```

---

## 常见问题与排查

### Q1: 容器启动后 Web UI 无法访问

排查步骤：

```bash
# 检查端口映射
docker port influxdb2

# 检查容器日志
docker logs influxdb2 --tail 50

# 检查防火墙/安全组（云服务器）
sudo lsof -i :8086
```

常见原因：端口被占用、防火墙拦截、Docker Desktop 网络配置问题。

### Q2: 写入返回 401 Unauthorized

Token 无效或过期。检查：

```bash
# 确认 Token 正确
echo $ADMIN_TOKEN

# 列出有效 Token
influx auth list
```

2.x 使用 `Authorization: Token YOUR_TOKEN` 格式（不是 `Bearer`）。

### Q3: 查询返回空结果

```bash
# 确认数据已写入
influx query 'from(bucket:"metrics") |> range(start:-1h)'

# 检查时间精度是否匹配（秒 vs 纳秒）
# 检查 Bucket 名称是否正确
# 检查时间范围是否覆盖写入时间
```

### Q4: 内存占用过高

```bash
# 查看内存限制
docker stats influxdb2 --no-stream

# 调整缓存限制（环境变量方式）
docker run -e INFLUXDB_STORAGE_CACHE_MAX_MEMORY_SIZE=512MB ...
```

---

## 小结

你现在应该已经：

1. ✅ 通过 Docker 成功启动了 InfluxDB 2.x
2. ✅ 完成了自动初始化（admin 账户、Org、Bucket）
3. ✅ 获取了 API Token 并配置了 CLI
4. ✅ 用 HTTP API + curl 写入了第一条时序数据
5. ✅ 用 Web UI 和 CLI 完成了第一条 Flux 查询
6. ✅ 掌握了一张端口/配置速查表和一个一键健康检查脚本

下一步：
- 探索 **Telegraf** 的数百种输入插件，自动化数据采集
- 在 **Grafana** 中配置 InfluxDB 数据源，搭建可视化仪表盘
- 学习 **Flux** 的高级语法（JOIN、透视、自定义函数），应对复杂分析需求

---

**延伸阅读**：
- [InfluxDB 概览]() — 了解 InfluxDB 的产品定位、版本演进和竞品对比
- [InfluxDB 核心概念与数据模型]() — 深入理解 Measurement、Tag、Field、Series 等核心抽象
