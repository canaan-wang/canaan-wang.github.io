# RabbitMQ

RabbitMQ 是一个开源的**消息中间件**（Message Broker），基于 AMQP 0-9-1 协议实现，用 Erlang 开发。它的核心作用是**帮不同的系统之间异步传递消息**。

## 文章导航

本系列将 RabbitMQ 的知识点拆分为三篇文章，由浅入深：

| 文章 | 内容 | 适合人群 |
|---|---|---|
| [RabbitMQ 入门与核心概念](RabbitMQ入门与核心概念) | 什么是 MQ、四个核心角色、Exchange 四种路由、Binding、Connection/Channel、选型对比 | 刚接触 RabbitMQ，想快速理解核心概念 |
| [RabbitMQ 进阶：存储原理与高可用](RabbitMQ进阶：存储原理与高可用) | 队列类型（Classic/Quorum/Stream）、持久化三要素、Raft 复制、vhost、管理后台监控 | 已在用 RabbitMQ，想了解底层存储和集群机制 |
| [RabbitMQ 进阶：消息可靠性与高级特性](RabbitMQ进阶：消息可靠性与高级特性) | 生产端 Confirm/Return、消费端 Manual Ack、幂等、死信队列、延迟队列、Prefetch 背压 | 负责线上 RabbitMQ 运维或需要保障消息不丢 |

## 一句话定位

RabbitMQ 的核心优势是**路由灵活、延迟低、可靠性高、管理界面完善**，适合订单、支付、事件驱动这类对消息不能丢、路由规则复杂的业务场景。

## 核心特性

- **灵活路由**：通过 Exchange + Binding + Routing Key 组合，支持广播、点对点、按主题订阅等多种路由模式
- **可靠投递**：支持发布确认、消费确认、消息持久化、Quorum Queue 复制，消息不易丢
- **低延迟**：消息默认走内存，微秒级延迟，适合实时性要求高的业务
- **丰富消息模式**：原生支持死信队列、延迟队列、优先级队列
- **管理界面**：自带 Web UI，可视化查看队列状态、消息堆积、消费者情况

## 延伸阅读

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [AMQP 0-9-1 协议规范](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
- [Spring AMQP 参考文档](https://docs.spring.io/spring-amqp/reference/)
- [Quorum Queue 设计文档](https://www.rabbitmq.com/quorum-queues.html)
