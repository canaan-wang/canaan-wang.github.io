##  46.1. MVCMVC
- 基于 Java 实现的 MVC 架构模式的轻量级框架
- web 软件的一种设计模式，软件被分为 Model（模型）、View（视图）、Controller（控制器）
    Model：对象模型，封装数据与对数据的相关操作
    View：代表用户界面
    Controller：负责视图和模型之间的交互,控制对用户输入的响应、响应方式和流
- 服务端代码分层：表现层、业务层、数据访问层
- 经典 MVC：jsp + servlet + javabean
- 优点：降低软件系统耦合性
- 执行流程
    用户发起 Http request 请求，请求被提交到 DispatcherServlet
    DispatcherServlet 请求 HandlerMapping，返回执行器
    DispatcherServlet 将 Handler 信息发送给 HandlerAdapter
    HandlerAdapter 根据 Handler 信息执行对应的 Handler（Controller）
    Handler 执行后返回 ModelAndView（Spring MVC 对象，包括 Model、View 信息） 给 HandlerAdapter
    HandlerAdapter 将 ModelAndView 返回给 DispatcherServlet
    DispatcherServlet 通过 ViewResolver 对 ModelAndView 进行解析
    VIewResolver 将试图结果返回给 DispatchServlet
    DispatcherServlet 进行视图渲染，数据填充，生成 View
    View 返回到浏览器
- DispatcherServlet（前端控制器）
    所有请求都要经过 DispatcherServlet 统一分发。相当于一个转发器或中央处理器,控制整个流程的执行,对各个组件进行统一调度,降低组件之间的耦合性。 
- HandlerMapping（Handler 映射器）
    是根据请求的 URL 路径,通过注解或者 XML 配置,寻找匹配的处理器（Handler）信息。
- HandlerAdapter（Handler 适配器）
    根据映射器找到的处理器（Handler）信息,按照特定规则执行相关的处理器（Handler）
- Handler（处理器）
    执行相关的请求处理逻辑,并返回相应的数据和视图信息,将其封装至 ModelAndView 对象中
- VIewResolver（视图解析器）
    视图解析器,其作用是进行解析操作,通过 ModelAndView 对象中的 View 信息将逻辑视图名解析成真正的视图 View