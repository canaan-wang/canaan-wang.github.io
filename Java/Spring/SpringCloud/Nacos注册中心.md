# Nacos 注册中心

# 一、Nacos 简介

## 1.1 基本定义

Nacos（Dynamic Naming and Configuration Service）是阿里开源的动态服务发现、配置管理和服务管理平台，致力于解决微服务架构中的服务治理问题，注册中心是其核心功能之一。

## 1.2 核心优势

- **双模式支持**：同时支持AP（可用性优先）和CP（一致性优先）模式，可根据业务场景切换；

- **易用性高**：提供可视化控制台，操作简单，支持服务CRUD、健康状态监控等；

- **扩展性强**：支持集群部署，满足高可用、高并发场景；

- **生态融合**：无缝集成Spring Cloud、Dubbo等主流微服务框架。

# 二、Nacos 注册中心核心功能

## 2.1 服务注册

微服务启动时，将自身信息（服务名、IP、端口、健康检查路径等）通过HTTP/GRPC协议提交至Nacos服务器，Nacos将服务信息存储在服务注册表中（基于内存+持久化）。

## 2.2 服务发现

消费者服务通过服务名向Nacos查询可用服务实例列表，Nacos返回健康的服务实例（支持负载均衡策略），消费者基于实例信息发起远程调用。

## 2.3 健康检查

Nacos定期通过心跳（默认5秒发送一次）或HTTP接口检查服务实例状态：

- 心跳正常：实例保持“健康”状态，可被消费者调用；

- 心跳超时（默认15秒）：实例标记为“不健康”，暂不提供服务；

- 连续3次超时（默认30秒）：实例从服务注册表中移除。

## 2.4 服务元数据管理

支持存储服务的自定义元数据（如版本号、环境标识、权重等），可在服务查询时过滤或携带元数据，实现灰度发布、环境隔离等场景。

# 三、Nacos 部署与启动（单机版）

## 3.1 环境准备

- JDK 1.8+（推荐1.8）；

- Maven 3.2+（编译源码用，直接下载安装包可省略）；

- Nacos 安装包（从官网[https://github.com/alibaba/nacos/releases](https://github.com/alibaba/nacos/releases)下载对应版本，如2.2.3）。

## 3.2 启动步骤

1. 解压安装包至指定目录；

2. 进入解压目录的`bin`文件夹；

3. 执行启动命令：
        Windows：`startup.cmd -m standalone`（standalone表示单机模式）；

4. Linux/Mac：`sh startup.sh -m standalone`。

5. 验证启动：访问[http://localhost:8848/nacos](http://localhost:8848/nacos)，默认账号密码均为`nacos`，登录后进入控制台。

# 四、Spring Cloud 集成 Nacos 注册中心

## 4.1 版本匹配（关键）

Spring Cloud、Spring Cloud Alibaba、Nacos 版本需对应，参考官方适配表，示例组合：

- Spring Boot：2.7.10；

- Spring Cloud：Spring Cloud Alibaba 2021.0.5.0；

- Nacos：2.2.3。

## 4.2 服务提供者配置

### 4.2.1 引入依赖

```xml

<!-- Spring Cloud Alibaba Nacos 注册中心依赖 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>

<!-- Spring Boot Web 依赖（模拟服务） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 4.2.2 配置application.yml

```yaml

spring:
  application:
    name: service-provider  # 服务名（核心，消费者通过此名发现服务）
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848  # Nacos 服务端地址
        namespace: public  # 命名空间（默认public，用于环境隔离）
        group: DEFAULT_GROUP  # 服务分组（默认DEFAULT_GROUP，用于服务分类）
server:
  port: 8081  # 服务端口
```

### 4.2.3 启动类加注解

```java

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient  // 开启服务注册发现功能（Spring Cloud 通用注解）
public class ServiceProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceProviderApplication.class, args);
    }
}
```

## 4.3 服务消费者配置

### 4.3.1 引入依赖

同服务提供者，需额外引入负载均衡依赖（Spring Cloud 2020+ 需手动引入）：

```xml

<!-- 负载均衡依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### 4.3.2 配置application.yml

```yaml

spring:
  application:
    name: service-consumer
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
server:
  port: 8082
```

### 4.3.3 启动类与远程调用

```java

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceConsumerApplication {

    // 注入RestTemplate，添加@LoadBalanced开启负载均衡
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public static void main(String[] args) {
        SpringApplication.run(ServiceConsumerApplication.class, args);
    }
}
```

编写控制器调用服务：

```java

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class ConsumerController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/call/{msg}")
    public String callProvider(@PathVariable String msg) {
        // 用服务名替代IP:端口，负载均衡自动选择实例
        String url = "http://service-provider/echo/" + msg;
        return restTemplate.getForObject(url, String.class);
    }
}
```

# 五、核心原理

## 5.1 注册中心架构

- **服务端**：Nacos Server 集群，维护服务注册表，提供注册、发现、健康检查接口；

- **客户端**：微服务中的 Nacos Discovery 客户端，负责向服务端注册服务、发送心跳、查询服务列表。

## 5.2 AP 与 CP 模式切换

- **AP 模式**：优先保证可用性和分区容错性，适用于服务发现场景（默认）。当集群中部分节点故障，剩余节点仍可提供服务，但可能存在短暂数据不一致；

- **CP 模式**：优先保证一致性和分区容错性，适用于配置管理或需要强一致性的服务场景。通过 Raft 算法实现数据同步，节点故障时需等待leader选举完成才能提供服务；

- **切换方式**：控制台修改或通过 API 调用，命令示例：`curl -X PUT 'http://localhost:8848/nacos/v1/ns/instance?serviceName=service-provider&ip=127.0.0.1&port=8081&ephemeral=false'`（ephemeral=false 表示CP模式）。

## 5.3 服务注册发现流程

1. 服务提供者启动，客户端向 Nacos Server 发送注册请求；

2. Nacos Server 存储服务信息并返回成功响应；

3. 服务提供者定期发送心跳至 Nacos Server，维持服务状态；

4. 服务消费者启动，客户端向 Nacos Server 订阅目标服务；

5. Nacos Server 返回目标服务的健康实例列表；

6. 当服务实例状态变化（如下线、不健康），Nacos Server 主动推送更新给订阅的消费者。

# 六、常见问题

- **服务注册失败**：检查Nacos Server是否启动、服务端地址配置是否正确、版本是否匹配、端口是否被占用；

- **消费者无法发现服务**：检查服务名是否正确、命名空间/分组是否一致、是否引入负载均衡依赖；

- **服务频繁上下线**：调整心跳间隔（`spring.cloud.nacos.discovery.heart-beat-interval`）和超时时间（`spring.cloud.nacos.discovery.heart-beat-timeout`），避免网络抖动导致误判。