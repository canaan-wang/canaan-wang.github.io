# Golang 接入 Kafka

# 一、前置准备

## 1.1 环境要求

- Kafka 集群：推荐 2.8.0+ 版本（支持 KRaft 模式，无 ZK 依赖）

- Golang：1.16+ 版本（支持 Go Modules 依赖管理）

- 客户端库：sarama v1.38.1+（稳定版，兼容主流 Kafka 版本）

## 1.2 依赖安装

在项目根目录执行以下命令，引入 sarama 依赖：

```bash

# 初始化模块（首次创建项目时执行）
go mod init kafka-demo
# 安装 sarama 客户端
go get github.com/Shopify/sarama@v1.38.1
```

# 二、核心概念适配（Golang视角）

需明确 Kafka 核心概念与 sarama 库的对应关系，避免配置混淆：

|Kafka 概念|sarama 库对应对象/配置|核心作用|
|---|---|---|
|Broker 集群|配置中的 `Net.DialTimeout` 等网络参数|指定集群节点地址，控制连接超时|
|Topic 主题|生产者 `SendMessage` 时指定|消息的分类容器，需提前创建|
|Partition 分区|生产者 `Msg.Partition` 或分区器|控制消息发送到的分区，实现并行|
|Consumer Group 消费者组|消费者 `NewConsumerGroup` 时指定|组内消费者分摊消费分区，避免重复消费|
# 三、生产者实现（发送消息）

## 3.1 核心逻辑

1. 配置生产者参数（重点：ACK 级别、重试机制）；

2. 创建生产者实例；

3. 构造消息并发送；

4. 关闭资源。

## 3.2 精简代码

```go

package main

import (
	"fmt"
	"log"

	"github.com/Shopify/sarama"
)

// 全局配置（可根据环境调整）
const (
	KafkaBrokers = "192.168.1.100:9092,192.168.1.101:9092" // 集群地址
	TopicName    = "user-login-topic"                       // 主题（需提前创建）
)

func main() {
	// 1. 配置生产者参数
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll // ACK级别：等待所有副本确认（最可靠）
	config.Producer.Retry.Max = 3                    // 重试次数：失败后重试3次
	config.Producer.Return.Successes = true          // 启用成功消息回调
	config.Version = sarama.V2_8_0_0                 // 适配Kafka版本

	// 2. 创建生产者实例
	producer, err := sarama.NewSyncProducer(strings.Split(KafkaBrokers, ","), config)
	if err != nil {
		log.Fatalf("创建生产者失败：%v", err)
	}
	defer producer.Close() // 退出时关闭资源

	// 3. 构造并发送消息
	msg := &sarama.ProducerMessage{
		Topic: TopicName,
		Key:   sarama.StringEncoder("user_1001"), // 消息Key：用于分区路由（同Key走同分区）
		Value: sarama.StringEncoder("用户1001登录成功"),  // 消息内容
	}

	// 同步发送消息（返回分区和偏移量）
	partition, offset, err := producer.SendMessage(msg)
	if err != nil {
		log.Printf("发送消息失败：%v", err)
		return
	}

	fmt.Printf("消息发送成功：分区=%d, 偏移量=%d\n", partition, offset)
}
```

## 3.3 关键配置说明

- `RequiredAcks`：ACK级别决定可靠性与吞吐量平衡，`WaitForAll`（生产环境推荐）、`WaitForLocal`（仅主副本确认）、`NoResponse`（不确认，最快但不可靠）。

- `Retry.Max`：网络抖动时自动重试，建议设置 3-5 次。

- `Version`：必须与 Kafka 集群版本匹配，否则可能出现兼容性问题。

# 四、消费者实现（消费消息）

## 4.1 核心逻辑

1. 配置消费者参数（重点：消费起始位置、重平衡策略）；

2. 创建消费者组实例；

3. 实现消息处理回调；

4. 启动消费循环。

## 4.2 精简代码（基础串行版）

```Plain Text


package main

import (
	"context"
	"log"
	"strings"

	"github.com/Shopify/sarama"
)

// 全局配置
const (
	KafkaBrokers = "192.168.1.100:9092,192.168.1.101:9092"
	TopicName    = "user-login-topic"
	ConsumerGroup = "user-login-group" // 消费者组名称
)

// 自定义消息处理器（实现sarama.ConsumerGroupHandler接口）
type LoginMsgHandler struct{}

// 消费消息的核心方法
func (h *LoginMsgHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	// 循环获取消息
	for msg := range claim.Messages() {
		log.Printf(
			"收到消息：主题=%s, 分区=%d, 偏移量=%d, Key=%s, 内容=%s",
			msg.Topic, msg.Partition, msg.Offset, string(msg.Key), string(msg.Value),
		)
		sess.MarkMessage(msg, "") // 标记消息已消费（提交偏移量）
	}
	return nil
}

// 以下两个方法为接口必填，默认实现即可
func (h *LoginMsgHandler) Setup(sess sarama.ConsumerGroupSession) error { return nil }
func (h *LoginMsgHandler) Cleanup(sess sarama.ConsumerGroupSession) error { return nil }

func main() {
	// 1. 配置消费者参数
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange // 重平衡策略：范围分配
	config.Consumer.Offsets.Initial = sarama.OffsetNewest                  // 起始消费位置：最新消息
	config.Consumer.Offsets.CommitInterval = 1 * time.Second               // 偏移量提交间隔
	config.Version = sarama.V2_8_0_0

	// 2. 创建消费者组实例
	consumerGroup, err := sarama.NewConsumerGroup(strings.Split(KafkaBrokers, ","), ConsumerGroup, config)
	if err != nil {
		log.Fatalf("创建消费者组失败：%v", err)
	}
	defer consumerGroup.Close()

	// 3. 启动消费循环（持续监听消息）
	handler := &LoginMsgHandler{}
	ctx := context.Background()

	for {
		// 订阅主题并消费（出错后重试）
		err := consumerGroup.Consume(ctx, []string{TopicName}, handler)
		if err != nil {
			log.Printf("消费出错：%v，重试中...", err)
			time.Sleep(3 * time.Second)
		}
	}
}
```

## 4.3 单个消费者并发消费实现（进阶版）

sarama 本身支持单个消费者实例内通过“多协程+通道分发”实现并发消费，核心是在 ConsumeClaim 中启动协程池处理消息，需注意偏移量提交的线程安全。

### 4.3.1 并发消费代码

```Plain Text


package main

import (
	"context"
	"log"
	"strings
	"sync"
	"time"

	"github.com/Shopify/sarama"
)

// 全局配置
const (
	KafkaBrokers   = "192.168.1.100:9092,192.168.1.101:9092"
	TopicName      = "user-login-topic"
	ConsumerGroup  = "user-login-group"
	GoroutineCount = 5 // 协程池大小，控制并发度
)

// ConcurrentMsgHandler 并发消息处理器
type ConcurrentMsgHandler struct {
	wg *sync.WaitGroup
}

// 初始化协程池
func (h *ConcurrentMsgHandler) Setup(sess sarama.ConsumerGroupSession) error {
	h.wg = &sync.WaitGroup{}
	return nil
}

// 消费消息：分发到协程池处理
func (h *ConcurrentMsgHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	// 创建带缓冲通道，用于分发消息
	msgChan := make(chan *sarama.ConsumerMessage, GoroutineCount*2)

	// 启动协程池
	for i := 0; i < GoroutineCount; i++ {
		h.wg.Add(1)
		go h.processMsg(sess, msgChan)
	}

	// 从claim获取消息并发送到通道
	for msg := range claim.Messages() {
		msgChan <- msg
	}

	// 关闭通道并等待所有协程处理完成
	close(msgChan)
	h.wg.Wait()
	return nil
}

// processMsg 协程处理消息逻辑
func (h *ConcurrentMsgHandler) processMsg(sess sarama.ConsumerGroupSession, msgChan <-chan *sarama.ConsumerMessage) {
	defer h.wg.Done()
	for msg := range msgChan {
		// 模拟业务处理（如数据库写入、接口调用）
		err := h.handleBusiness(msg)
		if err != nil {
			log.Printf("处理消息失败：offset=%d, err=%v", msg.Offset, err)
			// 可根据业务配置重试机制
			continue
		}
		// 处理成功后提交偏移量（线程安全）
		sess.MarkMessage(msg, "")
		log.Printf(
			"并发处理消息成功：协程ID=%d, 分区=%d, 偏移量=%d",
			goroutineID(), msg.Partition, msg.Offset,
		)
	}
}
	
// handleBusiness 模拟业务逻辑
func (h *ConcurrentMsgHandler) handleBusiness(msg *sarama.ConsumerMessage) error {
	time.Sleep(100 * time.Millisecond) // 模拟耗时处理
	log.Printf("处理消息内容：Key=%s, Value=%s", string(msg.Key), string(msg.Value))
	return nil
}

// goroutineID 模拟获取协程ID（仅用于日志展示）
func goroutineID() uint64 {
	// 实际生产可使用runtime包获取，此处简化处理
	var id uint64
	_ = id
	// runtime.ReadGoroutineID(&id) // Go 1.21+支持
	return id
}

// Cleanup 消费结束清理资源
func (h *ConcurrentMsgHandler) Cleanup(sess sarama.ConsumerGroupSession) error {
	return nil
}

func main() {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Offsets.CommitInterval = 1 * time.Second
	config.Version = sarama.V2_8_0_0

	// 关键配置：关闭自动提交，确保手动提交线程安全
	config.Consumer.Offsets.AutoCommit.Enable = false

	consumerGroup, err := sarama.NewConsumerGroup(strings.Split(KafkaBrokers, ","), ConsumerGroup, config)
	if err != nil {
		log.Fatalf("创建消费者组失败：%v", err)
	}
	defer consumerGroup.Close()

	handler := &ConcurrentMsgHandler{}
	ctx := context.Background()

	for {
		err := consumerGroup.Consume(ctx, []string{TopicName}, handler)
		if err != nil {
			log.Printf("消费出错：%v，重试中...", err)
			time.Sleep(3 * time.Second)
		}
	}
}
```

### 4.3.2 核心实现要点

- **协程池设计**：通过固定大小的协程池（GoroutineCount）控制并发度，避免协程泛滥导致资源耗尽，通道缓冲大小建议设为协程数的2倍，平衡消息分发效率。

- **偏移量安全**：必须关闭自动提交（`AutoCommit.Enable = false`），在消息处理成功后手动调用 `MarkMessage`，sarama 会保证偏移量提交的线程安全。

- **资源同步**：使用 `sync.WaitGroup` 等待所有协程处理完成后再退出 ConsumeClaim，避免消息未处理完就触发重平衡。

- **故障处理**：业务处理失败时需添加重试机制（如有限次重试后放入死信队列），避免单条坏消息阻塞整个协程。

```go

package main

import (
	"context"
	"log"
	"strings"

	"github.com/Shopify/sarama"
)

// 全局配置
const (
	KafkaBrokers = "192.168.1.100:9092,192.168.1.101:9092"
	TopicName    = "user-login-topic"
	ConsumerGroup = "user-login-group" // 消费者组名称
)

// 自定义消息处理器（实现sarama.ConsumerGroupHandler接口）
type LoginMsgHandler struct{}

// 消费消息的核心方法
func (h *LoginMsgHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	// 循环获取消息
	for msg := range claim.Messages() {
		log.Printf(
			"收到消息：主题=%s, 分区=%d, 偏移量=%d, Key=%s, 内容=%s",
			msg.Topic, msg.Partition, msg.Offset, string(msg.Key), string(msg.Value),
		)
		sess.MarkMessage(msg, "") // 标记消息已消费（提交偏移量）
	}
	return nil
}

// 以下两个方法为接口必填，默认实现即可
func (h *LoginMsgHandler) Setup(sess sarama.ConsumerGroupSession) error { return nil }
func (h *LoginMsgHandler) Cleanup(sess sarama.ConsumerGroupSession) error { return nil }

func main() {
	// 1. 配置消费者参数
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRange // 重平衡策略：范围分配
	config.Consumer.Offsets.Initial = sarama.OffsetNewest                  // 起始消费位置：最新消息
	config.Consumer.Offsets.CommitInterval = 1 * time.Second               // 偏移量提交间隔
	config.Version = sarama.V2_8_0_0

	// 2. 创建消费者组实例
	consumerGroup, err := sarama.NewConsumerGroup(strings.Split(KafkaBrokers, ","), ConsumerGroup, config)
	if err != nil {
		log.Fatalf("创建消费者组失败：%v", err)
	}
	defer consumerGroup.Close()

	// 3. 启动消费循环（持续监听消息）
	handler := &LoginMsgHandler{}
	ctx := context.Background()

	for {
		// 订阅主题并消费（出错后重试）
		err := consumerGroup.Consume(ctx, []string{TopicName}, handler)
		if err != nil {
			log.Printf("消费出错：%v，重试中...", err)
			time.Sleep(3 * time.Second)
		}
	}
}
```

## 4.3 关键配置说明

- `Rebalance.Strategy`：重平衡策略决定分区分配方式，`BalanceStrategyRange`（范围分配，默认）、`BalanceStrategyRoundRobin`（轮询分配）。

- `Offsets.Initial`：首次消费时的起始位置，`OffsetNewest`（最新消息，默认）、`OffsetOldest`（从头消费，用于数据回溯）。

- `MarkMessage`：手动提交偏移量的核心方法，必须在消息处理完成后调用。不建议用自动提交（`config.Consumer.Offsets.AutoCommit.Enable = true`），因自动提交按固定间隔执行，可能出现“消息未处理完就提交”导致数据丢失，或“处理完未提交就故障”导致重复消费。手动提交可精准控制提交时机，适配复杂业务场景。

# 五、安全认证配置（生产环境必备）

若 Kafka 集群启用 SASL 认证（如 PLAIN 用户名密码）或 TLS 加密，需补充以下配置，生产者和消费者配置逻辑一致。

## 5.1 SASL 认证（PLAIN 机制）

```go

// 在创建config后添加以下配置
config.Net.SASL.Enable = true
config.Net.SASL.Mechanism = sarama.SASLTypePlaintext
config.Net.SASL.User = "kafka-user"      // 认证用户名
config.Net.SASL.Password = "kafka-pass"  // 认证密码
```

## 5.2 TLS 加密传输

```go

import "crypto/tls"

// 在创建config后添加以下配置
config.Net.TLS.Enable = true
config.Net.TLS.Config = &tls.Config{
	InsecureSkipVerify: false, // 生产环境禁用跳过证书验证
	RootCAs:            x509.NewCertPool(), // 加载根证书（需替换为实际证书路径）
}
// 加载根证书（示例：从文件加载）
certBytes, _ := os.ReadFile("ca.crt")
config.Net.TLS.Config.RootCAs.AppendCertsFromPEM(certBytes)
```

# 六、避坑指南（团队分享重点）

1. **版本兼容性**：`config.Version` 必须与 Kafka 集群版本一致，否则可能出现“消息发送失败”“重平衡异常”等问题。

2. **分区路由**：若需同类型消息有序消费，需指定 `Msg.Key`（同 Key 会路由到同一分区），但需避免 Key 分布不均导致分区负载失衡。

3. **资源关闭**：生产者和消费者必须调用 `Close()` 关闭，否则会导致连接泄漏，集群压力增大。

4. **偏移量管理**：优先选择手动提交偏移量（`MarkMessage`），而非自动提交。自动提交的核心问题：① 按固定间隔提交（如配置的1秒），若消息处理耗时超过间隔，会出现“未处理完就提交”，故障后消息丢失；② 若处理完未到提交间隔就故障，会导致重复消费。手动提交在“消息处理完成后”主动提交，精准控制提交时机，完全规避上述问题，尤其适配数据库写入、接口调用等耗时场景。

5. **集群地址配置**：需填写所有 Broker 节点地址，而非仅主节点，否则节点故障时无法自动切换。

6. **消费顺序控制**：单个应用的单个消费者实例中，同一分区的消息默认串行消费（按偏移量顺序处理）。若需并行消费同一主题，需通过“增加分区数+启动多个消费者实例”实现；单个实例内不建议并行处理同一分区消息，会破坏消息有序性。若业务允许乱序且需提升单实例消费能力，可采用“协程池+通道”方案（见4.3节），但需确保偏移量提交安全。

# 七、快速测试流程

1. 创建主题：`kafka-topics.sh --bootstrap-server 192.168.1.100:9092 --create --topic user-login-topic --partitions 3 --replication-factor 2`

2. 启动消费者：`go run consumer.go`

3. 启动生产者：`go run producer.go`

4. 查看结果：消费者控制台打印收到的消息，生产者控制台打印发送成功的分区和偏移量。
> （注：文档部分内容可能由 AI 生成）