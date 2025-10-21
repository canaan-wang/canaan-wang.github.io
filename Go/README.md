# Go 概览

## 背景
- 由 Rob Pike、Ken Thompson、Robert Griesemer 在 Google 于 2007 年设计，2009 年开源，2012 年发布 Go 1.0。
- 目标：简洁可读、快速编译、并发友好、强工程化与易部署（单一可执行文件、跨平台交叉编译）。
- 设计哲学：少即是多、组合优于继承、工具优先、通过通信共享内存、稳定的核心和向后兼容。

## 生态
- 标准库：`net/http`、`database/sql`、`encoding/*`、`crypto/*`、`context`、`sync` 等覆盖网络、存储、编码、并发与安全。
- 工具链：`go build`、`go test`、`go fmt`、`go vet`、`go mod`、`go generate` 等内置工具提升工程效率与一致性。
- 包管理：Go Modules（语义化版本、`proxy`、`sumdb`）、工作区 `go work` 支持多模块协作与可复现构建。
- 跨平台与部署：原生交叉编译，静态/半静态链接，容器与云环境友好。
- 常用框架与库：Web（Gin、Echo、Fiber）、RPC（gRPC）、ORM（GORM）、CLI（Cobra）、日志（Zap、Logrus）、消息（NATS、Kafka 客户端）、配置（Viper）、测试（Testify）。
- 云原生生态：Kubernetes、Docker、Prometheus、Etcd、Consul 等核心基础设施项目均以 Go 编写，形成强大生态圈。

## 架构
- 编译器/链接器：前端解析与类型检查，SSA 优化，中间表示到目标后端，最终链接可执行文件。
- 运行时：G/M/P 调度器；并发三色增量 GC；按需增长栈；tcmalloc 风格分配器；高效的系统调用封装。
- 并发模型：`goroutine`（轻量线程）、`channel`、`select`、`context` 取消机制；强调通过通信共享内存，避免锁竞争。
- 类型系统：结构体与接口（隐式实现），组合优先；自 Go 1.18 起支持范型（类型参数与约束）。
- 工程特性：模块化、格式化与静态分析内置、快速编译与稳定 ABI，适合中大型工程与团队协作。

## 版本演进（选摘）
- 1.0（2012）：稳定语言与标准库；并发原语与工具链成型。
- 1.5：移除 C 依赖，自举编译器；GC 大幅降低暂停时间。
- 1.11：引入 Go Modules（`go.mod`/`go.sum`），现代依赖管理。
- 1.13：错误包装 `%w`、`errors.Is/As`；数字字面量与常量改进。
- 1.16：`embed` 内嵌静态资源；默认启用 Modules。
- 1.17：新 ABI 与寄存器调用（register-based calling），性能提升。
- 1.18：范型（Generics）、原生模糊测试 `go test -fuzz`、`go work` 工作区。
- 1.19–1.20：运行时与工具稳定性优化，文档与安全改进（包括链接器、分析器）。
- 1.21：新增 `slices`、`maps` 包；`time`、`net/http` 等增强。
- 1.22：`for range` 语义修正，HTTP/2/3 改进与性能优化。
- 1.23（2024）：编译与运行时持续优化，Modules 与分析工具更稳健（概览）。
- 官方发布说明：https://go.dev/doc/devel/release
