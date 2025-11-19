# AOP

# 一、Spring AOP 是什么？—— 解耦横切逻辑的利器

## 1.1 核心定位

AOP（Aspect-Oriented Programming，面向切面编程）是 Spring 框架的核心能力之一，是**对面向对象编程（OOP）的补充与完善**。它专注于解决“横切逻辑”的复用与解耦问题，通过将分散在多个业务模块的通用逻辑抽离并统一管理，让业务代码更聚焦于核心业务功能。

OOP 以“类”为核心，纵向封装业务逻辑；AOP 以“切面”为核心，横向覆盖多个业务模块，二者结合实现“纵向核心+横向通用”的完整编程体系。

## 1.2 解决的核心痛点

在传统开发中，日志记录、事务管理、权限校验等通用逻辑（横切逻辑）会分散在各个业务方法中，导致两大问题：

- **代码冗余**：相同的日志代码重复出现在几十个业务方法中，增加代码量；

- **维护困难**：若需修改日志格式或事务规则，需逐个修改所有业务方法，易出错且效率低。

AOP 解决方案：将横切逻辑抽离为“切面”，通过配置指定切入位置，由框架自动融入业务代码，实现“一次定义，多处复用”。

# 二、Spring AOP 核心概念：5个关键术语

理解 AOP 需先掌握5个核心术语，它们是 AOP 配置与实现的基础，缺一不可：

|术语|核心定义|通俗解释|实际案例|
|---|---|---|---|
|**切面（Aspect）**|封装横切逻辑的类，包含切入点和通知|存放通用逻辑的“工具类”，如日志切面、事务切面|LogAspect 类（封装所有日志逻辑）|
|**切入点（Pointcut）**|定义“切面要切入哪些业务方法”的表达式|指定“哪些业务方法需要执行通用逻辑”|所有 Service 层的 save 开头的方法|
|**通知（Advice）**|切面的具体逻辑+执行时机，是切面的核心|“什么时候执行”+“执行什么逻辑”|方法执行前记录日志（时机+逻辑）|
|**连接点（JoinPoint）**|业务代码中可能被切入的“位置”|所有可插入通用逻辑的“时机点”，是切入点的候选范围|方法执行前、执行后、抛出异常时|
|**织入（Weaving）**|将切面逻辑融入业务代码的过程|框架自动把通用逻辑“插入”到业务方法中的操作|Spring 容器启动时，将日志逻辑织入到 save 方法前|

> 关键区分：切入点是“选中的连接点”，连接点是“所有可能的位置”，比如“所有方法”是连接点，“Service 层 save 方法”是切入点。

# 三、Spring AOP 核心通知类型：5种执行时机

通知是切面的具体执行逻辑，Spring AOP 支持5种核心通知类型，覆盖不同的执行时机，可满足各类横切逻辑需求：

- **前置通知（@Before）**：业务方法**执行前**执行，如日志记录中的“方法开始执行”日志；

- **后置通知（@After）**：业务方法**执行后**执行（无论是否抛出异常），如释放资源；

- **返回通知（@AfterReturning）**：业务方法**正常返回后**执行，可获取方法返回值，如记录“方法执行结果”；

- **异常通知（@AfterThrowing）**：业务方法**抛出异常后**执行，可获取异常信息，如记录错误日志；

- **环绕通知（@Around）**：包裹业务方法，可在方法执行前、后自定义逻辑，甚至控制方法是否执行，是功能最强大的通知，如事务管理（开启事务→执行方法→提交/回滚事务）。

# 四、Spring AOP 实现原理：动态代理

Spring AOP 的核心实现机制是“动态代理”，通过在运行时创建业务类的代理对象，在代理对象中嵌入切面逻辑，从而实现对业务方法的增强。

## 4.1 **JDK 动态代理**

- 适用场景：业务类**实现了接口**（如 UserService 实现 UserService 接口）；

- 核心原理：基于 Java 原生的 Proxy 类和 InvocationHandler 接口，动态生成“实现相同接口”的代理类，代理类中调用业务方法并嵌入切面逻辑；

- 特点：仅能代理接口中的方法，不能代理类中的非接口方法。

## 4.2 **CGLIB 动态代理**

- 适用场景：业务类**未实现接口**（如普通的 UserService 类）；

- 核心原理：通过字节码技术动态生成业务类的“子类”作为代理类，重写父类方法并嵌入切面逻辑；

- 特点：可代理类中的所有方法（包括非接口方法），但不能代理 final 修饰的方法（子类无法重写）。

Spring AOP 自动适配：若目标类有接口则用 JDK 代理，无接口则用 CGLIB 代理；也可通过配置强制使用 CGLIB 代理。

# 五、Spring AOP 快速入门：实战案例

以“日志切面”为例，演示 Spring AOP 的核心使用流程（采用注解方式，主流开发模式）：

## 5.1 环境准备（Maven 依赖）

```xml

<!-- 核心依赖：spring-context 包含 AOP 基础能力 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.3.20</version>
</dependency>
<!-- AOP 注解支持依赖 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
    <version>5.3.20</version>
</dependency>
```

## 5.2 代码实现

**1. 编写业务类（被增强的类）**

```Java

// 业务层接口
public interface UserService {
    void saveUser(String username);
    String getUserById(Integer id);
}

// 业务层实现类（目标类）
@Service // 标记为 Spring Bean，交给容器管理
public class UserServiceImpl implements UserService {
    @Override
    public void saveUser(String username) {
        System.out.println("执行保存用户：" + username);
        // 模拟异常：int i = 1/0;
    }

    @Override
    public String getUserById(Integer id) {
        System.out.println("执行查询用户，ID：" + id);
        return "用户" + id;
    }
}
```

**2. 编写切面类（封装横切逻辑）**

```Java

@Aspect // 标记为切面类
@Component // 交给 Spring 容器管理
public class LogAspect {
    // 1. 定义切入点：所有 Service 层的所有方法
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void servicePointcut() {}

    // 2. 前置通知：切入点方法执行前执行
    @Before("servicePointcut()")
    public void beforeLog(JoinPoint joinPoint) {
        // 获取方法名和参数
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        System.out.println("前置日志：方法 " + methodName + " 开始执行，参数：" + Arrays.toString(args));
    }
        // 3. 返回通知：方法正常返回后执行，获取返回值
    @AfterReturning(value = "servicePointcut()", returning = "result")
    public void afterReturningLog(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("返回日志：方法 " + methodName + " 执行成功，返回值：" + result);
    }

    // 4. 异常通知：方法抛出异常后执行，获取异常信息
    @AfterThrowing(value = "servicePointcut()", throwing = "e")
    public void afterThrowingLog(JoinPoint joinPoint, Exception e) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("异常日志：方法 " + methodName + " 执行失败，异常：" + e.getMessage());
    }
    // 5. 后置通知：方法执行后执行（无论是否异常）
    @After("servicePointcut()")
    public void afterLog(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        System.out.println("后置日志：方法 " + methodName + " 执行结束\n");
    }
}
```

**3. 编写配置类（开启 AOP 自动代理）**

```Java

@Configuration // 标记为配置类
@ComponentScan("com.example") // 扫描包下的 Bean（业务类、切面类）
@EnableAspectJAutoProxy // 开启 Spring AOP 自动代理（核心注解）
public class SpringAopConfig {
}
```

**4. 测试类（验证 AOP 效果）**

```Java

public class AopDemo {
    public static void main(String[] args) {
        // 启动 Spring 容器
        ApplicationContext context = new AnnotationConfigApplicationContext(SpringAopConfig.class);
        // 获取业务 Bean（实际是代理对象）
        UserService userService = context.getBean(UserService.class);
        
        // 调用业务方法
        userService.saveUser("张三");
        userService.getUserById(1);
    }
}
```

## 5.3 执行结果

```text

前置日志：方法 saveUser 开始执行，参数：[张三]
执行保存用户：张三
返回日志：方法 saveUser 执行成功，返回值：null
后置日志：方法 saveUser 执行结束

前置日志：方法 getUserById 开始执行，参数：[1]
执行查询用户，ID：1
返回日志：方法 getUserById 执行成功，返回值：用户1
后置日志：方法 getUserById 执行结束
```

结果分析：业务方法执行时，切面的日志逻辑自动执行，业务类中无任何日志代码，实现了横切逻辑与业务逻辑的解耦。

# 六、Spring AOP 核心使用场景

AOP 是企业级开发的核心技术之一，主要应用于以下场景：

- **日志记录**：统一记录方法调用日志、请求参数、返回值、执行耗时等；

- **事务管理**：通过环绕通知实现事务的开启、提交（正常返回）、回滚（异常时）；

- **权限校验**：前置通知中校验用户权限，无权限则抛出异常，阻止方法执行；

- **性能监控**：环绕通知中记录方法开始和结束时间，计算执行耗时；

- **异常处理**：异常通知中统一捕获异常，记录错误日志并进行告警；

- **缓存控制**：前置通知查询缓存，有缓存则直接返回，无缓存则执行方法后存入缓存。

# 七、常见问题与注意事项

## 7.1 切入点表达式怎么写？

切入点表达式用于定位目标方法，核心格式：`execution(访问修饰符 返回值 包名.类名.方法名(参数类型))`

- 通配符：`*` 匹配任意字符（如任意方法、任意参数），`..` 匹配任意层级的包或任意个数的参数；

- 示例1：`execution(* com.example.service.*.*(..))` → 匹配 service 包下所有类的所有方法；

- 示例2：`execution(public String com.example.service.UserService.save*(String))` → 匹配 UserService 中 public 修饰、返回 String、save 开头且参数为 String 的方法。

## 7.2 为什么私有方法无法被增强？

动态代理只能代理“可被访问”的方法：JDK 代理只能代理接口的公有方法，CGLIB 代理只能代理非 final 的公有/保护方法；私有方法无法被代理，因此 AOP 无法增强。

## 7.3 环绕通知与其他通知的区别？

环绕通知通过 `ProceedingJoinPoint.proceed()` 手动调用目标方法，可控制方法是否执行、修改参数和返回值；其他通知无法控制方法执行，仅能在方法执行前后附加逻辑。

# 八、总结

1. **定位**：AOP 是 OOP 的补充，核心解决横切逻辑的复用与解耦问题；
2. **核心概念**：切面（逻辑封装）、切入点（切入位置）、通知（执行逻辑+时机）是核心三要素；
3. **实现原理**：基于动态代理（JDK 代理+CGIB 代理），运行时生成代理对象嵌入切面逻辑；
4. **使用流程**：定义业务类 → 编写切面类（切入点+通知） → 开启 AOP 自动代理 → 调用业务方法；
5. **核心价值**：让业务代码专注核心逻辑，横切逻辑统一管理，提升代码可维护性和复用性。