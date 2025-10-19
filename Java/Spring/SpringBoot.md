### Spring Boot
- Spring Boot 在 Spring 的基础上，完成了一些 Spring Bean 配置，本身不提供 Spring 的核心功能，作为 Spring 的脚手架，快速构建项目，开箱即用。
- 优点：
    项目可独立运行，不依赖 Servlet 容器
    提供运行时应用监控
    提高开发、部署效率
    与云计算集成
- 核心功能：
    自动配置 针对很多Spring应用程序常见的应用功能,Spring Boot能自动提供相关配置。
    起步依赖 Spring Boot通过起步依赖为项目的依赖管理提供帮助。起步依赖其实就是特殊的Maven依赖和Gradle依赖,利用了传递依赖解析,把常用库聚合在一起,组成了几个为特定功能而定制的依赖。
    端点监控 Spring Boot 可以对正在运行的项目提供监控。
- 启动流程（Application 类中的 mv 调用 run 方法 进行 SpringApplication 的实例化操作，并完成项目的初始化和启动）
    获取监听器配置参数
    打印 Banner 信息
    创建、初始化容器
    监听器发送通知
