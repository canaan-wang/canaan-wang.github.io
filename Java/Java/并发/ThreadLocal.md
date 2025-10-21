# ThreadLocal 线程本地变量

## 定义与作用

ThreadLocal 是 Java 提供的一种线程本地存储机制，它为每个使用该变量的线程提供独立的变量副本，从而实现线程隔离，避免共享状态竞争。ThreadLocal 适用于需要在线程生命周期内保持状态信息的场景。

## 核心原理

### 数据结构

ThreadLocal 内部使用 ThreadLocalMap 来存储线程本地变量：

```java
public class ThreadLocal<T> {
    // ThreadLocal 的哈希码，用于在 ThreadLocalMap 中定位
    private final int threadLocalHashCode = nextHashCode();
    
    // ThreadLocalMap 是 Thread 类的成员变量
    static class ThreadLocalMap {
        static class Entry extends WeakReference<ThreadLocal<?>> {
            Object value;
            Entry(ThreadLocal<?> k, Object v) {
                super(k);
                value = v;
            }
        }
        
        private Entry[] table;
        // ... 其他方法
    }
}
```

### 存储机制

每个 Thread 对象内部维护一个 ThreadLocalMap：

```java
public class Thread implements Runnable {
    ThreadLocal.ThreadLocalMap threadLocals = null;
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;
}
```

## 基本用法

### 创建和设置 ThreadLocal

```java
public class ThreadLocalExample {
    // 创建 ThreadLocal 变量
    private static final ThreadLocal<String> userContext = new ThreadLocal<>();
    private static final ThreadLocal<Integer> transactionId = ThreadLocal.withInitial(() -> 0);
    
    public void processRequest(String userId) {
        // 设置线程本地变量
        userContext.set(userId);
        transactionId.set(generateTransactionId());
        
        try {
            // 执行业务逻辑
            processBusinessLogic();
        } finally {
            // 清理线程本地变量
            userContext.remove();
            transactionId.remove();
        }
    }
    
    private void processBusinessLogic() {
        // 获取线程本地变量
        String currentUser = userContext.get();
        Integer currentTxId = transactionId.get();
        
        System.out.println("Processing for user: " + currentUser + ", transaction: " + currentTxId);
    }
    
    private int generateTransactionId() {
        return (int) (System.currentTimeMillis() % 1000000);
    }
}
```

### 使用初始值

```java
public class ThreadLocalWithInitial {
    // 使用 withInitial 提供默认值
    private static final ThreadLocal<SimpleDateFormat> dateFormat = 
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
    
    private static final ThreadLocal<List<String>> messageBuffer = 
        ThreadLocal.withInitial(ArrayList::new);
    
    public void logMessage(String message) {
        List<String> buffer = messageBuffer.get();
        buffer.add(message);
        
        if (buffer.size() >= 10) {
            flushMessages();
        }
    }
    
    private void flushMessages() {
        List<String> buffer = messageBuffer.get();
        System.out.println("Flushing messages: " + buffer);
        buffer.clear();
    }
}
```

## 应用场景

### 1. 用户上下文管理

```java
public class UserContextHolder {
    private static final ThreadLocal<UserContext> userContext = new ThreadLocal<>();
    
    public static void setUserContext(UserContext context) {
        userContext.set(context);
    }
    
    public static UserContext getUserContext() {
        return userContext.get();
    }
    
    public static void clear() {
        userContext.remove();
    }
    
    // 用户上下文对象
    public static class UserContext {
        private final String userId;
        private final String userName;
        private final String tenantId;
        
        public UserContext(String userId, String userName, String tenantId) {
            this.userId = userId;
            this.userName = userName;
            this.tenantId = tenantId;
        }
        
        // getter 方法
        public String getUserId() { return userId; }
        public String getUserName() { return userName; }
        public String getTenantId() { return tenantId; }
    }
}

// 在 Web 应用中使用
public class AuthenticationFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                         FilterChain chain) throws IOException, ServletException {
        try {
            // 从请求中提取用户信息
            String userId = extractUserId(request);
            String userName = extractUserName(request);
            String tenantId = extractTenantId(request);
            
            // 设置用户上下文
            UserContextHolder.setUserContext(
                new UserContextHolder.UserContext(userId, userName, tenantId)
            );
            
            chain.doFilter(request, response);
        } finally {
            // 清理用户上下文
            UserContextHolder.clear();
        }
    }
    
    // 业务服务中直接使用
    public class BusinessService {
        public void processBusiness() {
            UserContextHolder.UserContext context = UserContextHolder.getUserContext();
            System.out.println("Processing business for user: " + context.getUserName());
        }
    }
}
```

### 2. 数据库事务管理

```java
public class TransactionContext {
    private static final ThreadLocal<Connection> connectionHolder = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> transactionActive = ThreadLocal.withInitial(() -> false);
    
    public static void beginTransaction() throws SQLException {
        if (transactionActive.get()) {
            throw new IllegalStateException("Transaction already active");
        }
        
        Connection conn = DataSourceUtils.getConnection();
        conn.setAutoCommit(false);
        connectionHolder.set(conn);
        transactionActive.set(true);
    }
    
    public static Connection getConnection() {
        Connection conn = connectionHolder.get();
        if (conn == null) {
            throw new IllegalStateException("No active transaction");
        }
        return conn;
    }
    
    public static void commit() throws SQLException {
        Connection conn = connectionHolder.get();
        if (conn != null) {
            conn.commit();
            conn.close();
        }
        cleanup();
    }
    
    public static void rollback() {
        Connection conn = connectionHolder.get();
        if (conn != null) {
            try {
                conn.rollback();
                conn.close();
            } catch (SQLException e) {
                // 记录日志
            }
        }
        cleanup();
    }
    
    private static void cleanup() {
        connectionHolder.remove();
        transactionActive.set(false);
    }
}
```

### 3. 日志 TraceId 跟踪

```java
public class TraceContext {
    private static final ThreadLocal<String> traceId = new ThreadLocal<>();
    
    public static void setTraceId(String id) {
        traceId.set(id);
    }
    
    public static String getTraceId() {
        String id = traceId.get();
        if (id == null) {
            id = generateTraceId();
            traceId.set(id);
        }
        return id;
    }
    
    public static void clear() {
        traceId.remove();
    }
    
    private static String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}

// 在日志中使用
public class TraceLogger {
    public void log(String message) {
        String traceId = TraceContext.getTraceId();
        System.out.println("[" + traceId + "] " + message);
    }
    
    public void logWithLevel(String level, String message) {
        String traceId = TraceContext.getTraceId();
        System.out.println("[" + traceId + "][" + level + "] " + message);
    }
}

// 在 Web 拦截器中使用
public class TraceInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, Object handler) {
        String traceId = request.getHeader("X-Trace-Id");
        if (traceId == null) {
            traceId = TraceContext.generateTraceId();
        }
        TraceContext.setTraceId(traceId);
        response.setHeader("X-Trace-Id", traceId);
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request,
                              HttpServletResponse response, Object handler, Exception ex) {
        TraceContext.clear();
    }
}
```

### 4. 性能优化 - 对象池

```java
public class ObjectPool<T> {
    private final ThreadLocal<LinkedList<T>> pool = ThreadLocal.withInitial(LinkedList::new);
    private final Supplier<T> objectFactory;
    private final int maxPoolSize;
    
    public ObjectPool(Supplier<T> objectFactory, int maxPoolSize) {
        this.objectFactory = objectFactory;
        this.maxPoolSize = maxPoolSize;
    }
    
    public T borrowObject() {
        LinkedList<T> localPool = pool.get();
        if (!localPool.isEmpty()) {
            return localPool.removeFirst();
        }
        return objectFactory.get();
    }
    
    public void returnObject(T obj) {
        LinkedList<T> localPool = pool.get();
        if (localPool.size() < maxPoolSize) {
            localPool.addFirst(obj);
        }
        // 如果池已满，让对象被 GC 回收
    }
    
    public void cleanup() {
        pool.remove();
    }
}

// 使用示例
public class JsonParserPool {
    private static final ObjectPool<JsonParser> parserPool = 
        new ObjectPool<>(() -> {
            try {
                return Json.createParser(new StringReader(""));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, 10);
    
    public static JsonParser borrowParser() {
        return parserPool.borrowObject();
    }
    
    public static void returnParser(JsonParser parser) {
        parserPool.returnObject(parser);
    }
}
```

## InheritableThreadLocal

### 父子线程数据传递

InheritableThreadLocal 允许子线程继承父线程的 ThreadLocal 值：

```java
public class InheritableThreadLocalExample {
    private static final InheritableThreadLocal<String> inheritableContext = 
        new InheritableThreadLocal<>();
    
    public static void main(String[] args) {
        inheritableContext.set("Parent Value");
        
        Thread childThread = new Thread(() -> {
            // 子线程可以获取父线程设置的值
            String value = inheritableContext.get();
            System.out.println("Child thread value: " + value); // 输出: Parent Value
            
            // 子线程修改不会影响父线程
            inheritableContext.set("Child Value");
            System.out.println("Child thread after modification: " + inheritableContext.get());
        });
        
        childThread.start();
        
        try {
            childThread.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 父线程的值保持不变
        System.out.println("Parent thread value: " + inheritableContext.get()); // 输出: Parent Value
    }
}
```

### 自定义 InheritableThreadLocal

```java
public class CustomInheritableThreadLocal<T> extends InheritableThreadLocal<T> {
    @Override
    protected T childValue(T parentValue) {
        // 自定义父子线程值传递逻辑
        if (parentValue instanceof Cloneable) {
            try {
                // 深度拷贝
                return deepCopy(parentValue);
            } catch (Exception e) {
                // 返回原始值
                return parentValue;
            }
        }
        return parentValue;
    }
    
    @SuppressWarnings("unchecked")
    private T deepCopy(T obj) {
        // 实现深度拷贝逻辑
        if (obj instanceof String) {
            return obj; // String 不可变
        }
        // 其他类型的深度拷贝实现
        return obj;
    }
}
```

## 内存泄漏问题

### 泄漏原因

ThreadLocal 可能引起内存泄漏的主要原因：

1. **ThreadLocal 被回收，但 Entry 的 value 未被回收**
2. **线程池中线程长期存活，ThreadLocalMap 不断积累**

### 泄漏示例

```java
public class MemoryLeakExample {
    private static final ThreadLocal<byte[]> localData = new ThreadLocal<>();
    
    public void processRequest() {
        // 设置大对象
        localData.set(new byte[1024 * 1024]); // 1MB
        
        // 忘记调用 remove()
        // localData.remove(); // 这行被注释掉了
    }
    
    // 在线程池中重复使用会导致内存泄漏
    public void processInThreadPool() {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        for (int i = 0; i < 1000; i++) {
            executor.execute(() -> {
                processRequest();
                // 每次请求都在线程的 ThreadLocalMap 中积累数据
            });
        }
        
        executor.shutdown();
    }
}
```

### 解决方案

#### 方案1：使用 try-finally 确保清理

```java
public class SafeThreadLocalUsage {
    private static final ThreadLocal<String> safeLocal = new ThreadLocal<>();
    
    public void safeMethod(String value) {
        safeLocal.set(value);
        
        try {
            // 执行业务逻辑
            doBusinessLogic();
        } finally {
            // 确保清理
            safeLocal.remove();
        }
    }
    
    private void doBusinessLogic() {
        String value = safeLocal.get();
        // 使用值
    }
}
```

#### 方案2：使用 AutoCloseable 接口

```java
public class AutoCloseableThreadLocal<T> implements AutoCloseable {
    private final ThreadLocal<T> threadLocal;
    private final T value;
    
    private AutoCloseableThreadLocal(ThreadLocal<T> threadLocal, T value) {
        this.threadLocal = threadLocal;
        this.value = value;
    }
    
    public static <T> AutoCloseableThreadLocal<T> withValue(ThreadLocal<T> threadLocal, T value) {
        threadLocal.set(value);
        return new AutoCloseableThreadLocal<>(threadLocal, value);
    }
    
    @Override
    public void close() {
        threadLocal.remove();
    }
    
    public T get() {
        return threadLocal.get();
    }
}

// 使用示例
public class SafeUsageExample {
    private static final ThreadLocal<String> context = new ThreadLocal<>();
    
    public void processWithResource(String value) {
        try (AutoCloseableThreadLocal<String> resource = 
             AutoCloseableThreadLocal.withValue(context, value)) {
            
            // 自动管理资源
            String currentValue = resource.get();
            doWork(currentValue);
        } // 自动调用 close() 方法清理
    }
    
    private void doWork(String value) {
        // 业务逻辑
    }
}
```

#### 方案3：定期清理

```java
public class PeriodicCleanup {
    private static final ThreadLocal<Map<String, Object>> threadLocalMap = 
        ThreadLocal.withInitial(HashMap::new);
    
    private static final AtomicLong lastCleanupTime = new AtomicLong(System.currentTimeMillis());
    private static final long CLEANUP_INTERVAL = 30 * 60 * 1000; // 30分钟
    
    public void put(String key, Object value) {
        checkAndCleanup();
        threadLocalMap.get().put(key, value);
    }
    
    public Object get(String key) {
        checkAndCleanup();
        return threadLocalMap.get().get(key);
    }
    
    private void checkAndCleanup() {
        long currentTime = System.currentTimeMillis();
        long lastTime = lastCleanupTime.get();
        
        if (currentTime - lastTime > CLEANUP_INTERVAL) {
            if (lastCleanupTime.compareAndSet(lastTime, currentTime)) {
                // 执行清理
                threadLocalMap.get().clear();
            }
        }
    }
}
```

## 性能考虑

### 性能特点

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| get() | O(1) | 直接哈希查找 |
| set() | O(1) | 哈希插入/更新 |
| remove() | O(1) | 哈希删除 |
| 内存占用 | 每个线程独立 | 线程越多占用越大 |

### 性能优化建议

1. **避免过度使用**：只在真正需要线程隔离时使用
2. **及时清理**：使用后立即调用 remove()
3. **使用轻量级对象**：避免在 ThreadLocal 中存储大对象
4. **考虑使用对象池**：对于创建成本高的对象

## 最佳实践

### 1. 命名规范

```java
public class ThreadLocalNaming {
    // 好的命名：清晰表达用途
    private static final ThreadLocal<UserContext> USER_CONTEXT = new ThreadLocal<>();
    private static final ThreadLocal<Transaction> CURRENT_TRANSACTION = new ThreadLocal<>();
    
    // 避免的命名：含义不明确
    // private static final ThreadLocal<Object> local = new ThreadLocal<>();
}
```

### 2. 生命周期管理

```java
public class LifecycleManagement {
    private static final ThreadLocal<Connection> DB_CONNECTION = new ThreadLocal<>();
    
    public void executeInTransaction(Runnable task) {
        Connection conn = null;
        try {
            conn = DataSource.getConnection();
            conn.setAutoCommit(false);
            DB_CONNECTION.set(conn);
            
            task.run();
            
            conn.commit();
        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    // 处理异常
                }
            }
            throw new RuntimeException(e);
        } finally {
            // 确保清理
            cleanupConnection();
        }
    }
    
    private void cleanupConnection() {
        Connection conn = DB_CONNECTION.get();
        if (conn != null) {
            try {
                if (!conn.isClosed()) {
                    conn.close();
                }
            } catch (SQLException e) {
                // 记录日志
            } finally {
                DB_CONNECTION.remove();
            }
        }
    }
}
```

### 3. 测试策略

```java
public class ThreadLocalTest {
    private static final ThreadLocal<String> TEST_CONTEXT = new ThreadLocal<>();
    
    @Test
    public void testThreadLocalIsolation() throws InterruptedException {
        TEST_CONTEXT.set("Main Thread");
        
        Thread otherThread = new Thread(() -> {
            // 新线程应该看不到主线程的值
            assertNull(TEST_CONTEXT.get());
            
            TEST_CONTEXT.set("Other Thread");
            assertEquals("Other Thread", TEST_CONTEXT.get());
        });
        
        otherThread.start();
        otherThread.join();
        
        // 主线程的值保持不变
        assertEquals("Main Thread", TEST_CONTEXT.get());
    }
    
    @After
    public void cleanup() {
        TEST_CONTEXT.remove();
    }
}
```

## 常见问题与解决方案

### 问题1：线程池中的值污染

**症状：** 线程池中不同任务看到相同的 ThreadLocal 值

**解决方案：**

```java
public class ThreadPoolSafe {
    private static final ThreadLocal<String> TASK_CONTEXT = new ThreadLocal<>();
    
    public void executeTaskInPool(String taskId) {
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        executor.execute(() -> {
            try {
                // 设置任务上下文
                TASK_CONTEXT.set(taskId);
                
                // 执行任务
                executeTask();
            } finally {
                // 确保清理
                TASK_CONTEXT.remove();
            }
        });
    }
    
    private void executeTask() {
        String taskId = TASK_CONTEXT.get();
        System.out.println("Executing task: " + taskId);
    }
}
```

### 问题2：Web 应用中的请求间污染

**症状：** 不同 HTTP 请求看到相同的用户上下文

**解决方案：**

```java
@WebFilter("/*")
public class ContextCleanupFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {
        try {
            // 设置请求上下文
            RequestContextHolder.setRequestAttributes(new ServletRequestAttributes((HttpServletRequest) request));
            
            chain.doFilter(request, response);
        } finally {
            // 清理请求上下文
            RequestContextHolder.resetRequestAttributes();
        }
    }
}
```

### 问题3：调试困难

**症状：** 难以跟踪 ThreadLocal 值的设置和传播

**解决方案：**

```java
public class DebuggableThreadLocal<T> extends ThreadLocal<T> {
    private final String name;
    
    public DebuggableThreadLocal(String name) {
        this.name = name;
    }
    
    @Override
    public void set(T value) {
        System.out.println("ThreadLocal[" + name + "] set in thread: " + 
                          Thread.currentThread().getName() + ", value: " + value);
        super.set(value);
    }
    
    @Override
    public T get() {
        T value = super.get();
        System.out.println("ThreadLocal[" + name + "] get in thread: " + 
                          Thread.currentThread().getName() + ", value: " + value);
        return value;
    }
    
    @Override
    public void remove() {
        System.out.println("ThreadLocal[" + name + "] removed from thread: " + 
                          Thread.currentThread().getName());
        super.remove();
    }
}
```

## 总结

ThreadLocal 是 Java 并发编程中非常重要的工具，正确使用可以：

1. **实现线程隔离**：避免共享状态竞争
2. **简化代码**：避免在方法参数中传递上下文
3. **提高性能**：减少对象创建和同步开销

使用 ThreadLocal 需要注意：
- 及时调用 remove() 避免内存泄漏
- 在线程池环境中特别小心
- 合理设计生命周期管理
- 考虑使用 InheritableThreadLocal 进行父子线程数据传递

掌握 ThreadLocal 的原理和最佳实践，对于开发高质量的多线程应用至关重要。

最后更新时间：2024-01-15