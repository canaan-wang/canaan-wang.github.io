# SpringBoot概览
## 一、Spring Boot 基础认知

Spring Boot是由Pivotal团队（后并入VMware）开发的Spring生态子项目，**核心定位是“简化Spring应用开发”**，通过“约定优于配置”的设计理念，解决传统Spring开发中配置繁琐、依赖管理复杂等问题，让开发者能快速搭建独立运行、生产级别的Spring应用。

核心目标：降低Spring入门门槛，提升开发效率，实现“开箱即用”（Out-of-the-Box），同时支持按需定制配置。

## 二、Spring Boot 核心优势（核心知识点）

1. **自动配置（Auto-Configuration）**：最核心特性。Spring Boot会根据类路径中的依赖（如引入spring-boot-starter-web则默认配置Web环境）、配置文件等自动初始化Bean、配置组件（如Tomcat、数据源），无需手动编写大量XML或Java配置。

2. **起步依赖（Starter Dependencies）**：将常用依赖打包成统一的“ starter ”（如spring-boot-starter-data-jpa、spring-boot-starter-security），引入一个starter即可自动关联所需依赖，避免手动管理依赖版本冲突。

3. **嵌入式服务器（Embedded Servers）**：默认集成Tomcat、Jetty、Undertow等嵌入式服务器，无需单独部署服务器，可直接将应用打包为JAR包，通过`java -jar`命令运行，简化部署流程。

4. **自动配置的配置元数据与Actuator**：提供配置项的自动提示（基于元数据），方便开发调试；Actuator组件可监控应用运行状态（如健康检查、指标统计），支持生产级运维。

5. **无代码生成与XML配置**：无需通过代码生成或XML配置实现功能，基于注解和自动扫描即可完成大部分配置，简化代码结构。

## 三、Spring Boot 与 Spring 核心差异对比

|对比维度|Spring|Spring Boot|
|---|---|---|
|核心定位|轻量级Java EE开发框架，提供IOC、AOP等核心能力，是生态基础|基于Spring的“快速开发脚手架”，简化Spring应用构建与部署|
|配置复杂度|配置繁琐：需手动编写XML（如applicationContext.xml）或Java配置类，管理Bean依赖、组件初始化等|约定优于配置：自动配置核心组件，仅需通过application.yml/properties微调配置|
|依赖管理|需手动引入各模块依赖（如spring-core、spring-context），需手动协调版本避免冲突|起步依赖：一个starter集成相关依赖，Spring Boot管理版本适配，减少冲突|
|服务器部署|需手动配置外部服务器（如Tomcat），将应用打包为WAR包部署|内置嵌入式服务器，默认打包为JAR包，直接通过命令运行，支持WAR包部署|
|开发效率|入门门槛高，配置、依赖、部署等流程需手动操作，开发周期较长|开箱即用，自动配置+起步依赖+嵌入式服务器，大幅缩短开发与部署周期|
|生态兼容性|需手动整合生态组件（如MyBatis、Redis），配置整合逻辑|内置对主流生态组件的自动整合支持（如引入mybatis-spring-boot-starter即可快速整合MyBatis）|
## 四、关键总结

1. Spring Boot **不是替代Spring**，而是基于Spring的增强工具，核心是“简化配置、提升效率”；

2. 核心亮点：自动配置解决“配置繁琐”，起步依赖解决“依赖冲突”，嵌入式服务器解决“部署复杂”；

3. 适用场景：快速开发微服务、独立应用，生产级项目的快速落地。