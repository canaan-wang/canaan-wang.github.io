###  46.4. BeanBean
- 生命周期：定义、初始化、生存、销毁
- Bean 生命周期步骤：
    1. Spring 启动时进行 Bean 的实例化
    2. 将 Bean 的引用注入到对应 Bean 的属性中
    3. Bean 实现了 BeanNameAware 接口的情况下，将 Bean 的 Id 传递给 setBeanName 方法
    4. Bean 实现了 BeanFactoryAware 接口的情况下，调用 setBeanFactory 方法，将 BeanFactory 容器实例传染
    5. Bean 实现了 ApplicationContextAware 接口的情况下，调用 setApplicationContext 方法，将 bean 所在应用上下文传入
    6. Bean 实现了 BeanPostProcessor 接口，调用 Spring就将调用他们的postProcessBeforeInitialization 方法
    7. Bean 实现了 InitializingBean 接口，调用 afterPropertiesSet 方法，如果 Bean 使用 init-method 声明了初始化方法，该方法会被调用（PostConstruct 注解，同样功能）
    8. 如果 Bean 实现了 BeanPostProcessor 接口，调用 postProcessAfterInitialization 方法
    9. Bean 初始化结束，可以被使用
    10. Bean 实现了 DisposableBean 接口，销毁时调用 destory 接口，如果 Bean 使用了 destory-method 声明销毁方法,该方法也会被调用（@PreDestroy 注解，同样功能）
- 作用域（Bean 在 Spring 中默认为单例）：
    可以通过 @Scope 注解修改 Bean 的作用域
    singleton（Spring 中仅存在一个，单例）
    prototype（调用 getBean() 时，都会执行 new 操作，返回一个新的实例）
    request（每次 HTTP 请求都会创建一个新的 Bean）
    session（同一个 HTTP Session 共享一个 Bean）
    globalSession（同一个全局 Session 共享一个 Bean）