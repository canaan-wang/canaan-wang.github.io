# Runnable 与 Callable

## 定义与作用

Runnable 和 Callable 是 Java 并发编程中用于定义异步任务的两种核心接口。它们为多线程编程提供了标准化的任务定义方式，是 Java 并发框架的基础。

## Runnable 接口

### 基本定义

```java
@FunctionalInterface
public interface Runnable {
    void run();
}
```

### 特性分析

1. **无返回值**：run() 方法返回 void
2. **不能抛出受检异常**：只能抛出 RuntimeException
3. **函数式接口**：可以使用 Lambda 表达式
4. **简单轻量**：适合不需要返回结果的简单任务

### 使用示例

```java
public class RunnableExamples {
    // 基础用法
    public static void basicUsage() {
        // 匿名内部类方式
        Runnable task1 = new Runnable() {
            @Override
            public void run() {
                System.out.println("Task 1 executed by " + Thread.currentThread().getName());
            }
        };
        
        // Lambda 表达式方式
        Runnable task2 = () -> {
            System.out.println("Task 2 executed by " + Thread.currentThread().getName());
        };
        
        // 方法引用方式
        Runnable task3 = RunnableExamples::staticMethod;
        
        // 执行任务
        new Thread(task1).start();
        new Thread(task2).start();
        new Thread(task3).start();
    }
    
    private static void staticMethod() {
        System.out.println("Static method executed by " + Thread.currentThread().getName());
    }
    
    // 实用场景：日志记录
    public class LoggingTask implements Runnable {
        private final String message;
        private final Logger logger;
        
        public LoggingTask(String message, Logger logger) {
            this.message = message;
            this.logger = logger;
        }
        
        @Override
        public void run() {
            try {
                logger.log(Level.INFO, "Processing: " + message);
                // 模拟处理时间
                Thread.sleep(100);
                logger.log(Level.INFO, "Completed: " + message);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.log(Level.WARNING, "Task interrupted: " + message, e);
            }
        }
    }
    
    // 实用场景：文件处理
    public class FileProcessor implements Runnable {
        private final File file;
        private final String outputDir;
        
        public FileProcessor(File file, String outputDir) {
            this.file = file;
            this.outputDir = outputDir;
        }
        
        @Override
        public void run() {
            try {
                processFile(file, outputDir);
            } catch (IOException e) {
                throw new RuntimeException("Failed to process file: " + file.getName(), e);
            }
        }
        
        private void processFile(File file, String outputDir) throws IOException {
            // 文件处理逻辑
            System.out.println("Processing file: " + file.getName() + " on thread: " + 
                             Thread.currentThread().getName());
        }
    }
}
```

### 与线程池配合使用

```java
import java.util.concurrent.*;

public class RunnableWithExecutor {
    public static void demonstrateExecutorUsage() {
        // 创建线程池
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        try {
            // 提交多个 Runnable 任务
            for (int i = 0; i < 10; i++) {
                final int taskId = i;
                executor.submit(() -> {
                    System.out.println("Task " + taskId + " executed by " + 
                                     Thread.currentThread().getName());
                    try {
                        Thread.sleep(100); // 模拟工作
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
            }
        } finally {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(1, TimeUnit.MINUTES)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
    
    // 定时任务
    public class ScheduledTask implements Runnable {
        private final String taskName;
        
        public ScheduledTask(String taskName) {
            this.taskName = taskName;
        }
        
        @Override
        public void run() {
            System.out.println("Scheduled task '" + taskName + "' executed at: " + 
                             System.currentTimeMillis());
        }
    }
    
    public static void demonstrateScheduledExecutor() {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
        
        ScheduledTask task1 = new ScheduledTask("Task 1");
        ScheduledTask task2 = new ScheduledTask("Task 2");
        
        // 延迟执行
        scheduler.schedule(task1, 1, TimeUnit.SECONDS);
        
        // 周期性执行
        scheduler.scheduleAtFixedRate(task2, 0, 2, TimeUnit.SECONDS);
        
        // 固定延迟执行
        scheduler.scheduleWithFixedDelay(task1, 0, 3, TimeUnit.SECONDS);
        
        // 10秒后关闭
        scheduler.schedule(() -> scheduler.shutdown(), 10, TimeUnit.SECONDS);
    }
}
```

## Callable 接口

### 基本定义

```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

### 特性分析

1. **有返回值**：call() 方法返回泛型类型 V
2. **可抛出受检异常**：可以抛出任何 Exception
3. **函数式接口**：可以使用 Lambda 表达式
4. **适合复杂任务**：需要返回结果或处理异常的场景

### 使用示例

```java
import java.util.concurrent.*;

public class CallableExamples {
    // 基础用法
    public static void basicUsage() throws Exception {
        // 匿名内部类方式
        Callable<String> task1 = new Callable<String>() {
            @Override
            public String call() throws Exception {
                return "Task 1 result from " + Thread.currentThread().getName();
            }
        };
        
        // Lambda 表达式方式
        Callable<Integer> task2 = () -> {
            Thread.sleep(100); // 模拟计算
            return 42;
        };
        
        // 方法引用方式
        Callable<Double> task3 = CallableExamples::computeValue;
        
        // 使用 FutureTask
        FutureTask<String> futureTask = new FutureTask<>(task1);
        new Thread(futureTask).start();
        
        // 获取结果
        String result = futureTask.get();
        System.out.println("Result: " + result);
    }
    
    private static Double computeValue() {
        return Math.random() * 100;
    }
    
    // 实用场景：数据查询
    public class DatabaseQuery implements Callable<List<String>> {
        private final String query;
        private final DatabaseConnection connection;
        
        public DatabaseQuery(String query, DatabaseConnection connection) {
            this.query = query;
            this.connection = connection;
        }
        
        @Override
        public List<String> call() throws SQLException {
            try (PreparedStatement stmt = connection.prepareStatement(query);
                 ResultSet rs = stmt.executeQuery()) {
                
                List<String> results = new ArrayList<>();
                while (rs.next()) {
                    results.add(rs.getString(1));
                }
                return results;
            }
        }
    }
    
    // 实用场景：复杂计算
    public class PrimeCalculator implements Callable<List<Integer>> {
        private final int start;
        private final int end;
        
        public PrimeCalculator(int start, int end) {
            this.start = start;
            this.end = end;
        }
        
        @Override
        public List<Integer> call() {
            List<Integer> primes = new ArrayList<>();
            for (int i = start; i <= end; i++) {
                if (isPrime(i)) {
                    primes.add(i);
                }
            }
            return primes;
        }
        
        private boolean isPrime(int n) {
            if (n <= 1) return false;
            if (n <= 3) return true;
            if (n % 2 == 0 || n % 3 == 0) return false;
            
            for (int i = 5; i * i <= n; i += 6) {
                if (n % i == 0 || n % (i + 2) == 0) {
                    return false;
                }
            }
            return true;
        }
    }
}
```

### 与线程池配合使用

```java
import java.util.concurrent.*;
import java.util.*;

public class CallableWithExecutor {
    public static void demonstrateExecutorUsage() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        try {
            // 提交多个 Callable 任务
            List<Callable<Integer>> tasks = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                final int taskId = i;
                tasks.add(() -> {
                    System.out.println("Task " + taskId + " executed by " + 
                                     Thread.currentThread().getName());
                    Thread.sleep(100); // 模拟工作
                    return taskId * 10;
                });
            }
            
            // 批量提交并获取结果
            List<Future<Integer>> futures = executor.invokeAll(tasks);
            
            // 处理结果
            for (Future<Integer> future : futures) {
                try {
                    Integer result = future.get();
                    System.out.println("Task result: " + result);
                } catch (ExecutionException e) {
                    System.err.println("Task failed: " + e.getCause().getMessage());
                }
            }
            
        } finally {
            executor.shutdown();
        }
    }
    
    // 使用 CompletionService
    public static void demonstrateCompletionService() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        CompletionService<Integer> completionService = 
            new ExecutorCompletionService<>(executor);
        
        try {
            // 提交任务
            for (int i = 0; i < 10; i++) {
                final int taskId = i;
                completionService.submit(() -> {
                    int sleepTime = (int) (Math.random() * 1000);
                    Thread.sleep(sleepTime);
                    return taskId;
                });
            }
            
            // 按完成顺序获取结果
            for (int i = 0; i < 10; i++) {
                Future<Integer> future = completionService.take();
                Integer result = future.get();
                System.out.println("Completed task: " + result);
            }
            
        } finally {
            executor.shutdown();
        }
    }
    
    // 超时控制
    public static void demonstrateTimeout() {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        
        Callable<String> longRunningTask = () -> {
            Thread.sleep(5000); // 模拟长时间运行
            return "Result";
        };
        
        Future<String> future = executor.submit(longRunningTask);
        
        try {
            // 设置超时时间
            String result = future.get(2, TimeUnit.SECONDS);
            System.out.println("Result: " + result);
        } catch (TimeoutException e) {
            System.out.println("Task timed out");
            future.cancel(true); // 中断任务
        } catch (Exception e) {
            System.err.println("Task failed: " + e.getMessage());
        } finally {
            executor.shutdown();
        }
    }
}
```

## Future 和 FutureTask

### Future 接口

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit) 
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

### FutureTask 实现

```java
public class FutureTaskExamples {
    // 基础用法
    public static void basicUsage() throws Exception {
        Callable<String> callable = () -> {
            Thread.sleep(1000);
            return "Task completed";
        };
        
        FutureTask<String> futureTask = new FutureTask<>(callable);
        
        // 启动任务
        new Thread(futureTask).start();
        
        // 检查状态
        System.out.println("Is done: " + futureTask.isDone());
        System.out.println("Is cancelled: " + futureTask.isCancelled());
        
        // 获取结果（阻塞）
        String result = futureTask.get();
        System.out.println("Result: " + result);
        
        System.out.println("Is done: " + futureTask.isDone());
    }
    
    // 取消任务
    public static void demonstrateCancellation() {
        FutureTask<String> futureTask = new FutureTask<>(() -> {
            Thread.sleep(5000);
            return "This should not be reached";
        });
        
        new Thread(futureTask).start();
        
        // 立即取消
        boolean cancelled = futureTask.cancel(true);
        System.out.println("Cancellation successful: " + cancelled);
        System.out.println("Is cancelled: " + futureTask.isCancelled());
        
        try {
            futureTask.get(); // 会抛出 CancellationException
        } catch (Exception e) {
            System.out.println("Expected exception: " + e.getClass().getSimpleName());
        }
    }
    
    // 组合多个 Future
    public static void demonstrateFutureCombination() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        Callable<Integer> task1 = () -> { Thread.sleep(100); return 10; };
        Callable<Integer> task2 = () -> { Thread.sleep(200); return 20; };
        Callable<Integer> task3 = () -> { Thread.sleep(300); return 30; };
        
        Future<Integer> future1 = executor.submit(task1);
        Future<Integer> future2 = executor.submit(task2);
        Future<Integer> future3 = executor.submit(task3);
        
        // 等待所有任务完成
        int total = future1.get() + future2.get() + future3.get();
        System.out.println("Total: " + total);
        
        executor.shutdown();
    }
}
```

## 对比分析

### 功能对比

| 特性 | Runnable | Callable |
|------|----------|----------|
| 返回值 | void | 泛型类型 V |
| 异常处理 | 只能抛出 RuntimeException | 可以抛出任何 Exception |
| 使用场景 | 简单任务，不需要结果 | 复杂任务，需要返回结果 |
| 线程池支持 | ExecutorService.submit(Runnable) | ExecutorService.submit(Callable) |
| Future 支持 | 返回 Future<?> | 返回 Future<V> |

### 性能考虑

1. **Runnable 优势**：
   - 更轻量，无返回值开销
   - 适合 I/O 密集型任务
   - 简单任务性能更好

2. **Callable 优势**：
   - 支持结果返回
   - 更好的错误处理
   - 适合计算密集型任务

### 选择指南

```java
public class TaskSelectionGuide {
    // 选择 Runnable 的场景
    public void whenToUseRunnable() {
        // 1. 不需要返回结果
        Runnable logTask = () -> System.out.println("Log message");
        
        // 2. 简单异步操作
        Runnable cleanupTask = () -> cleanupResources();
        
        // 3. 事件处理
        Runnable eventHandler = () -> handleEvent();
    }
    
    // 选择 Callable 的场景
    public void whenToUseCallable() {
        // 1. 需要返回计算结果
        Callable<Integer> calculation = () -> complexCalculation();
        
        // 2. 需要异常处理
        Callable<String> riskyOperation = () -> {
            if (Math.random() > 0.5) {
                throw new Exception("Operation failed");
            }
            return "Success";
        };
        
        // 3. 数据查询
        Callable<List<Data>> dataQuery = () -> queryDatabase();
    }
    
    private void cleanupResources() { /* 实现 */ }
    private void handleEvent() { /* 实现 */ }
    private int complexCalculation() { return 42; }
    private List<Data> queryDatabase() { return new ArrayList<>(); }
}
```

## 最佳实践

### 1. 异常处理

```java
public class ExceptionHandlingBestPractices {
    public static void handleRunnableExceptions() {
        Runnable task = () -> {
            try {
                // 可能抛出受检异常的操作
                riskyOperation();
            } catch (Exception e) {
                // 转换为运行时异常或记录日志
                throw new RuntimeException("Task failed", e);
            }
        };
        
        // 使用线程池时捕获异常
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<?> future = executor.submit(task);
        
        try {
            future.get(); // 会抛出 ExecutionException
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            System.err.println("Task failed with: " + cause.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
    
    public static void handleCallableExceptions() throws Exception {
        Callable<String> task = () -> {
            if (Math.random() > 0.8) {
                throw new IOException("Simulated I/O error");
            }
            return "Success";
        };
        
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(task);
        
        try {
            String result = future.get();
            System.out.println("Result: " + result);
        } catch (ExecutionException e) {
            // 处理具体的异常类型
            if (e.getCause() instanceof IOException) {
                System.err.println("I/O error occurred");
            } else {
                System.err.println("Unexpected error: " + e.getCause().getMessage());
            }
        } finally {
            executor.shutdown();
        }
    }
    
    private static void riskyOperation() throws Exception {
        // 模拟可能失败的操作
    }
}
```

### 2. 资源管理

```java
public class ResourceManagement {
    // 使用 try-with-resources
    public static class DatabaseTask implements Callable<List<String>> {
        private final String query;
        
        public DatabaseTask(String query) {
            this.query = query;
        }
        
        @Override
        public List<String> call() throws Exception {
            // 自动资源管理
            try (Connection conn = DataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(query);
                 ResultSet rs = stmt.executeQuery()) {
                
                List<String> results = new ArrayList<>();
                while (rs.next()) {
                    results.add(rs.getString(1));
                }
                return results;
            }
        }
    }
    
    // 线程局部资源
    public static class ThreadLocalResourceTask implements Runnable {
        private static final ThreadLocal<SimpleDateFormat> dateFormat = 
            ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
        
        @Override
        public void run() {
            // 每个线程有自己的 SimpleDateFormat 实例
            String formattedDate = dateFormat.get().format(new Date());
            System.out.println("Formatted date: " + formattedDate);
        }
    }
}
```

### 3. 性能优化

```java
public class PerformanceOptimization {
    // 批量处理
    public static class BatchProcessor {
        public static <T> List<Future<T>> submitBatch(
                ExecutorService executor, 
                List<Callable<T>> tasks) {
            
            return tasks.stream()
                .map(executor::submit)
                .collect(Collectors.toList());
        }
        
        public static <T> List<T> waitForAll(List<Future<T>> futures) {
            return futures.stream()
                .map(future -> {
                    try {
                        return future.get();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
        }
    }
    
    // 任务分片
    public static class TaskSplitter {
        public static List<Callable<Integer>> splitTask(int total, int chunkSize) {
            List<Callable<Integer>> tasks = new ArrayList<>();
            
            for (int start = 0; start < total; start += chunkSize) {
                int end = Math.min(start + chunkSize, total);
                final int chunkStart = start;
                final int chunkEnd = end;
                
                tasks.add(() -> {
                    int sum = 0;
                    for (int i = chunkStart; i < chunkEnd; i++) {
                        sum += i;
                    }
                    return sum;
                });
            }
            
            return tasks;
        }
    }
}
```

## 常见问题与解决方案

### 问题1：任务饥饿

**症状：** 某些任务长时间得不到执行

**解决方案：**

```java
public class FairScheduling {
    // 使用公平的线程池
    public static ExecutorService createFairExecutor(int poolSize) {
        return new ThreadPoolExecutor(
            poolSize, poolSize, 0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>() // 公平队列
        );
    }
    
    // 使用优先级
    public static class PriorityTask implements Callable<String>, Comparable<PriorityTask> {
        private final int priority;
        private final String name;
        
        public PriorityTask(int priority, String name) {
            this.priority = priority;
            this.name = name;
        }
        
        @Override
        public String call() {
            return "Task " + name + " completed";
        }
        
        @Override
        public int compareTo(PriorityTask other) {
            return Integer.compare(other.priority, this.priority); // 降序
        }
    }
}
```

### 问题2：内存泄漏

**症状：** 任务持有大对象导致内存无法释放

**解决方案：**

```java
public class MemoryManagement {
    // 使用弱引用
    public static class WeakReferenceTask implements Runnable {
        private final WeakReference<LargeObject> weakRef;
        
        public WeakReferenceTask(LargeObject largeObject) {
            this.weakRef = new WeakReference<>(largeObject);
        }
        
        @Override
        public void run() {
            LargeObject obj = weakRef.get();
            if (obj != null) {
                // 使用对象
                obj.process();
            }
        }
    }
    
    // 及时清理资源
    public static class CleanupTask implements Runnable {
        private final AutoCloseable resource;
        
        public CleanupTask(AutoCloseable resource) {
            this.resource = resource;
        }
        
        @Override
        public void run() {
            try (resource) {
                // 使用资源
                performWork();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        
        private void performWork() {
            // 工作逻辑
        }
    }
}
```

### 问题3：死锁

**症状：** 任务相互等待导致程序挂起

**解决方案：**

```java
public class DeadlockPrevention {
    // 避免嵌套锁
    public static class SafeTask implements Runnable {
        private final Object lock1 = new Object();
        private final Object lock2 = new Object();
        
        @Override
        public void run() {
            // 总是以相同顺序获取锁
            synchronized (lock1) {
                synchronized (lock2) {
                    performWork();
                }
            }
        }
        
        private void performWork() {
            // 工作逻辑
        }
    }
    
    // 使用超时控制
    public static class TimeoutTask implements Callable<String> {
        private final long timeoutMs;
        
        public TimeoutTask(long timeoutMs) {
            this.timeoutMs = timeoutMs;
        }
        
        @Override
        public String call() throws Exception {
            long startTime = System.currentTimeMillis();
            
            while (System.currentTimeMillis() - startTime < timeoutMs) {
                if (tryAcquireLock()) {
                    return "Success";
                }
                Thread.sleep(100); // 避免忙等待
            }
            
            throw new TimeoutException("Failed to acquire lock within " + timeoutMs + "ms");
        }
        
        private boolean tryAcquireLock() {
            // 尝试获取锁的逻辑
            return Math.random() > 0.8; // 模拟
        }
    }
}
```

## 总结

Runnable 和 Callable 是 Java 并发编程的核心构建块：

1. **Runnable**：适合简单、无返回值的异步任务
2. **Callable**：适合需要返回结果或异常处理的复杂任务
3. **Future/FutureTask**：提供异步计算结果的管理

选择指南：
- 不需要结果 → Runnable
- 需要结果或异常处理 → Callable
- 需要任务控制 → Future/FutureTask

最佳实践：
- 合理处理异常
- 妥善管理资源
- 避免常见并发问题
- 根据场景选择合适的接口

掌握这些接口的使用，能够编写出更加健壮和高效的并发程序。

最后更新时间：2024-01-15