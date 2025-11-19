# IOC

# 一、什么是 Spring IOC？

## 1.1 核心定义

IOC（Inversion of Control，控制反转）是 Spring 框架的核心思想之一，指**将对象的创建、依赖管理、生命周期控制等权力从业务代码中转移到 Spring 容器**，实现对象之间的解耦。

传统开发模式：业务代码主动 new 对象、管理依赖（如 Service 中直接 new Dao），耦合度高；
IOC 模式：Spring 容器统一创建对象（Bean），并注入依赖，业务代码仅需“被动接收”即可使用。

## 1.2 关键本质

控制反转的“反转”体现在：
- 反转对象创建权：从“开发者主动创建”反转到“容器主动创建”；
- 反转依赖管理：从“开发者手动维护依赖关系”反转到“容器自动注入依赖”。

核心价值：解耦，降低代码间依赖，提升可维护性、可测试性。

# 二、IOC 的核心组件

Spring IOC 核心通过“容器”实现，核心组件包括 BeanFactory 和 ApplicationContext，以及描述 Bean 的 BeanDefinition。

## 2.1 Bean：容器管理的对象

Bean 是 Spring 容器管理的“Java 对象”，本质是符合特定规范的普通 Java 类（如无参构造器、setter 方法等）。
容器中的 Bean 具有统一的生命周期，由容器全程管控。

## 2.2 BeanDefinition：Bean 的“说明书”

BeanDefinition 是 Spring 内部对 Bean 的“元数据描述”，包含 Bean 的核心信息：
- 类名（全限定类名）；
- 作用域（单例/多例等）；
- 依赖关系（需要注入的其他 Bean）；
- 初始化方法、销毁方法；
- 其他属性（如延迟加载、是否为主要 Bean 等）。
Spring 容器通过解析 BeanDefinition 来创建和管理 Bean。

## 2.3 BeanFactory：IOC 容器的“基础接口”

BeanFactory 是 Spring IOC 容器的最顶层接口，定义了容器的核心能力：
- 获取 Bean（getBean(String name/Class<T> type)）；
- 判断 Bean 是否存在（containsBean(String name)）；
- 判断 Bean 是否为单例（isSingleton(String name)）等。
特点：**懒加载**（仅当调用 getBean 时才创建 Bean），轻量，适合资源受限场景（如移动端）。
常见实现类：DefaultListableBeanFactory（Spring 内部核心实现）。

## 2.4 ApplicationContext：BeanFactory 的“增强实现”

ApplicationContext 是 BeanFactory 的子接口，在其基础上扩展了更多企业级功能，是实际开发中最常用的容器：
- 非懒加载（容器启动时主动创建所有单例 Bean）；
- 支持国际化（MessageSource）；
- 支持事件发布/订阅（ApplicationEvent）；
- 支持资源加载（如加载配置文件、ClassPath 资源）。
常见实现类：
- ClassPathXmlApplicationContext：加载类路径下的 XML 配置文件；
- AnnotationConfigApplicationContext：加载注解配置类（如 @Configuration）；
- FileSystemXmlApplicationContext：加载文件系统中的 XML 配置文件。

# 三、IOC 容器的工作流程（核心原理）

## 3.1 **容器启动初始化（关键步骤）**

   ① 资源定位：容器加载配置信息（如 XML 文件、注解类、properties 文件）；

   ② 解析配置：将配置信息解析为 BeanDefinition，注册到 BeanDefinitionRegistry（注册表）；

   ③ Bean 实例化准备：容器根据 BeanDefinition 检查依赖关系，规划实例化顺序；
   
   ④ 实例化 Bean：对单例 Bean 进行预初始化（非懒加载场景），通过构造器创建对象；
   
   ⑤ 依赖注入（DI）：将容器中的依赖 Bean 注入到当前 Bean 中（如 set 注入、构造器注入）；
   
   ⑥ 初始化 Bean：执行初始化方法（如 @PostConstruct、init-method）；
   
   ⑦ AOP 代理创建：若 Bean 被 AOP 增强，创建代理对象（JDK 动态代理或 CGLIB 代理）；
   > AOP 代理必须基于 “完全初始化的原始 Bean” 创建
   
   ⑧ 注册到容器：将初始化完成的 Bean（或代理对象）存入容器缓存，供后续使用。

   ⑨ Bean 使用：开发者通过 getBean 从容器获取 Bean，直接使用（无需关心创建和依赖）；

   10 容器关闭：容器关闭时，执行所有 Bean 的销毁方法（如 @PreDestroy、destroy-method），释放资源。
## 3.2 **Bean 使用阶段**

开发者通过 getBean 从容器获取 Bean，直接使用（无需关心创建和依赖）；

容器关闭时，执行 Bean 销毁方法（如 @PreDestroy、destroy-method）。

> 关键提醒：依赖注入（DI）是 IOC 的具体实现方式，IOC 是思想，DI 是手段。

# 四、Bean 的核心配置方式

Spring 支持 3 种核心配置方式，从传统 XML 到注解再到 Java 配置，逐步简化。

## 4.1 XML 配置（传统方式，了解即可）

通过 xml 文件定义 Bean 和依赖关系，适合早期复杂配置场景：

```xml

<!-- 配置 Bean -->
<bean id="userDao" class="com.example.dao.impl.UserDaoImpl"/>

<!-- 配置 Service 并注入 Dao（set 注入） -->
<bean id="userService" class="com.example.service.impl.UserServiceImpl">
    <property name="userDao" ref="userDao"/>
</bean>
```

## 4.2 注解配置（主流方式）

通过注解快速标记 Bean 和依赖，简化配置，需开启组件扫描：

1. **核心注解**
- 标记 Bean：@Component（通用）、@Service（服务层）、@Dao（持久层）、@Controller（控制层）；
- 依赖注入：@Autowired（按类型注入）、@Qualifier（按名称注入，配合 @Autowired）、@Resource（按名称/类型注入，JDK 注解）；
- 生命周期：@PostConstruct（初始化）、@PreDestroy（销毁）。

2. **配置示例**
① 开启组件扫描（XML 或配置类）：
<context:component-scan base-package="com.example"/>（XML 方式）
@ComponentScan("com.example")（配置类方式）
② 业务类注解：

```java

// Dao 层 Bean
@Dao
public class UserDaoImpl implements UserDao {
    // 实现方法...
}

// Service 层 Bean，注入 Dao
@Service
public class UserServiceImpl implements UserService {
    // 按类型注入
    @Autowired
    private UserDao userDao;

    // 业务方法...
}
```

## 4.3 Java 配置（纯注解，用的比较少）

通过 @Configuration 标记配置类，@Bean 定义 Bean，完全脱离 XML：

```java

// 配置类（替代 XML）
@Configuration
@ComponentScan("com.example") // 开启组件扫描
public class SpringConfig {
    // 手动定义 Bean（适合第三方类，无法加@Component的场景）
    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }

    // 注入依赖（直接调用方法）
    @Bean
    public UserService userService() {
        UserServiceImpl service = new UserServiceImpl();
        service.setUserDao(userDao());
        return service;
    }
}
```

# 五、Bean 的核心特性

## 5.1 作用域（Scope）

定义 Bean 的创建模式，核心作用域有 5 种，常用前两种：

|作用域注解|说明|适用场景|
|---|---|---|
|@Scope("singleton")|单例（默认），容器中仅一个实例|无状态 Bean（如 Service、Dao）|
|@Scope("prototype")|多例，每次 getBean 新建实例|有状态 Bean（如 Controller 中的请求对象）|
|@Scope("request")|请求域，一次请求一个实例|Web 场景|
|@Scope("session")|会话域，一个会话一个实例|Web 场景|
|@Scope("application")|应用域，全局一个实例|Web 场景|
## 5.2 生命周期控制

可通过两种方式指定生命周期方法：

1. 注解 @PostConstruct、@PreDestroy；

2. 配置类中@Bean的initMethod和destroyMethod属性指定。

```Plain Text


// 方式1：通过注解指定生命周期方法
@Service
public class UserService {
    @PostConstruct // 初始化方法，容器创建后执行
    public void init() {
        System.out.println("UserService 初始化（注解方式）");
    }

    @PreDestroy // 销毁方法，容器关闭前执行
    public void destroy() {
        System.out.println("UserService 销毁（注解方式）");
    }
}
// 2. 配置类中通过@Bean指定生命周期方法
@Configuration
public class SpringConfig {
    @Bean(initMethod = "orderInit", destroyMethod = "orderDestroy")
    public OrderService orderService() {
        return new OrderService();
    }
}
```

## 5.3 延迟加载（Lazy Initialization）

仅对单例 Bean 有效，默认非懒加载（容器启动创建），可通过 @Lazy 开启懒加载（第一次使用时创建）：

```java

@Service
@Lazy // 开启延迟加载
public class UserService {
    // 实现方法...
}
```

# 六、常见问题与面试考点

## 6.1 @Autowired 和 @Resource 的区别？

- 来源不同：@Autowired 是 Spring 注解，@Resource 是 JDK 注解（javax.annotation.Resource）；

- 匹配方式不同：@Autowired 先按类型匹配，再按名称；@Resource 先按名称，再按类型；

- 扩展性不同：@Resource 支持更多属性（如 name、type），@Autowired 需配合 @Qualifier 指定名称。

## 6.2 单例 Bean 是线程安全的吗？

默认**不安全**！因为单例 Bean 是容器中唯一实例，多线程共享时，若存在可修改的成员变量，会引发线程安全问题。
解决方案：
- 避免定义可修改的成员变量（推荐，无状态设计）；
- 用 ThreadLocal 存储线程私有数据；
- 改用多例（@Scope("prototype")，不推荐，损耗性能）。

## 6.3 Bean 的生命周期流程？

简化流程：
容器启动 → 解析 BeanDefinition → 实例化 Bean（构造器）→ 依赖注入 → 初始化（@PostConstruct）→ 存入缓存 → 使用 → 销毁（@PreDestroy）→ 容器关闭。

# 七、总结

1. IOC 是 Spring 核心思想，核心是“控制反转、解耦”，DI 是其实现手段；
2. 容器（ApplicationContext）是核心载体，通过 BeanDefinition 管理 Bean 元数据；
3. 开发中推荐“注解+Java 配置”，简化配置，提升效率；
4. 重点掌握 Bean 配置、依赖注入、生命周期，理解循环依赖解决方案。