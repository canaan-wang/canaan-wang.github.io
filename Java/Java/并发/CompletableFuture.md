# Java CompletableFuture 详解

## 定义与作用

### 什么是 CompletableFuture
CompletableFuture 是 Java 8 引入的异步编程工具，实现了 `Future` 和 `CompletionStage` 接口。它提供了丰富的异步编程能力，支持函数式编程风格的任务编排。

### CompletableFuture 的主要作用
1. **异步任务编排**：支持复杂的异步任务依赖关系
2. **函数式编程**：提供链式调用和组合操作
3. **异常处理**：内置完善的异常处理机制
4. **超时控制**：支持任务超时和取消操作
5. **线程池管理**：可以指定自定义线程池执行任务

## 核心概念

### 1. 创建 CompletableFuture
```java
// 1. 创建已完成的 CompletableFuture
CompletableFuture<String> completedFuture = CompletableFuture.completedFuture("Hello");

// 2. 异步执行任务（无返回值）
CompletableFuture<Void> runAsyncFuture = CompletableFuture.runAsync(() -> {
    System.out.println("异步执行任务");
});

// 3. 异步执行任务（有返回值）
CompletableFuture<String> supplyAsyncFuture = CompletableFuture.supplyAsync(() -> {
    return "异步执行结果";
});

// 4. 使用自定义线程池
ExecutorService customExecutor = Executors.newFixedThreadPool(5);
CompletableFuture<String> customFuture = CompletableFuture.supplyAsync(() -> {
    return "使用自定义线程池";
}, customExecutor);
```

### 2. 任务状态
CompletableFuture 有三种状态：
- **未完成**：任务正在执行或等待执行
- **已完成**：任务正常完成
- **异常完成**：任务执行过程中发生异常

## 核心操作方法

### 1. 转换操作（thenApply / thenApplyAsync）
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "Hello");

// 同步转换
CompletableFuture<String> result1 = future.thenApply(s -> s + " World");

// 异步转换
CompletableFuture<String> result2 = future.thenApplyAsync(s -> s + " World");

// 使用自定义线程池
CompletableFuture<String> result3 = future.thenApplyAsync(s -> s + " World", customExecutor);
```

### 2. 消费操作（thenAccept / thenAcceptAsync）
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "Hello");

// 同步消费
CompletableFuture<Void> result1 = future.thenAccept(s -> System.out.println(s));

// 异步消费
CompletableFuture<Void> result2 = future.thenAcceptAsync(s -> System.out.println(s));
```

### 3. 组合操作（thenCompose / thenComposeAsync）
```java
// 扁平化组合（避免嵌套）
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> result = future1.thenCompose(s -> 
    CompletableFuture.supplyAsync(() -> s + " World")
);
```

### 4. 合并操作（thenCombine / thenCombineAsync）
```java
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

// 合并两个 Future 的结果
CompletableFuture<String> result = future1.thenCombine(future2, (s1, s2) -> s1 + " " + s2);
```

### 5. 多任务组合（allOf / anyOf）
```java
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Task1");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "Task2");
CompletableFuture<String> future3 = CompletableFuture.supplyAsync(() -> "Task3");

// 等待所有任务完成
CompletableFuture<Void> allOfFuture = CompletableFuture.allOf(future1, future2, future3);

// 等待任意一个任务完成
CompletableFuture<Object> anyOfFuture = CompletableFuture.anyOf(future1, future2, future3);
```

## 异常处理

### 1. exceptionally - 异常恢复
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    if (Math.random() > 0.5) {
        throw new RuntimeException("随机异常");
    }
    return "正常结果";
});

// 异常恢复
CompletableFuture<String> recovered = future.exceptionally(ex -> {
    System.out.println("捕获异常: " + ex.getMessage());
    return "默认结果";
});
```

### 2. handle - 统一处理结果和异常
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    if (Math.random() > 0.5) {
        throw new RuntimeException("随机异常");
    }
    return "正常结果";
});

// 统一处理
CompletableFuture<String> handled = future.handle((result, ex) -> {
    if (ex != null) {
        return "异常处理结果";
    }
    return result.toUpperCase();
});
```

### 3. whenComplete - 完成时回调
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "Hello");

// 完成时回调（不改变结果）
CompletableFuture<String> completed = future.whenComplete((result, ex) -> {
    if (ex != null) {
        System.out.println("任务异常: " + ex.getMessage());
    } else {
        System.out.println("任务完成: " + result);
    }
});
```

## 超时与取消

### 1. orTimeout - 超时控制
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(5000); // 模拟耗时操作
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    return "结果";
});

// 设置超时（2秒）
CompletableFuture<String> timeoutFuture = future.orTimeout(2, TimeUnit.SECONDS);

try {
    String result = timeoutFuture.get();
} catch (TimeoutException e) {
    System.out.println("任务超时");
} catch (Exception e) {
    System.out.println("其他异常: " + e.getMessage());
}
```

### 2. completeOnTimeout - 超时默认值
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(5000);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    return "结果";
});

// 超时时返回默认值
CompletableFuture<String> defaultFuture = future.completeOnTimeout("默认值", 2, TimeUnit.SECONDS);
```

### 3. cancel - 取消任务
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(5000);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return "被中断";
    }
    return "正常完成";
});

// 取消任务
boolean cancelled = future.cancel(true);
if (cancelled) {
    System.out.println("任务已取消");
}
```

## 实际应用示例

### 1. 异步任务编排
```java
public CompletableFuture<String> processOrder(String orderId) {
    return CompletableFuture.supplyAsync(() -> {
        // 1. 验证订单
        return validateOrder(orderId);
    }).thenApplyAsync(validatedOrder -> {
        // 2. 处理支付
        return processPayment(validatedOrder);
    }).thenApplyAsync(paidOrder -> {
        // 3. 发货
        return shipOrder(paidOrder);
    }).thenApplyAsync(shippedOrder -> {
        // 4. 发送通知
        return sendNotification(shippedOrder);
    }).exceptionally(ex -> {
        // 异常处理
        System.out.println("订单处理异常: " + ex.getMessage());
        return "订单处理失败";
    });
}
```

### 2. 并行任务处理
```java
public CompletableFuture<Map<String, Object>> getUserDashboard(String userId) {
    // 并行获取用户信息
    CompletableFuture<UserInfo> userInfoFuture = CompletableFuture.supplyAsync(() -> 
        getUserInfo(userId)
    );
    
    CompletableFuture<List<Order>> ordersFuture = CompletableFuture.supplyAsync(() -> 
        getUserOrders(userId)
    );
    
    CompletableFuture<List<Notification>> notificationsFuture = CompletableFuture.supplyAsync(() -> 
        getUserNotifications(userId)
    );
    
    // 等待所有任务完成
    return CompletableFuture.allOf(userInfoFuture, ordersFuture, notificationsFuture)
        .thenApply(v -> {
            Map<String, Object> dashboard = new HashMap<>();
            try {
                dashboard.put("userInfo", userInfoFuture.get());
                dashboard.put("orders", ordersFuture.get());
                dashboard.put("notifications", notificationsFuture.get());
            } catch (Exception e) {
                throw new CompletionException(e);
            }
            return dashboard;
        });
}
```

### 3. 超时和重试机制
```java
public CompletableFuture<String> callExternalServiceWithRetry(String request, int maxRetries) {
    return CompletableFuture.supplyAsync(() -> {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // 设置超时
                CompletableFuture<String> serviceCall = callExternalService(request)
                    .orTimeout(5, TimeUnit.SECONDS);
                
                return serviceCall.get();
            } catch (TimeoutException e) {
                System.out.println("第" + attempt + "次调用超时");
                if (attempt == maxRetries) {
                    throw new RuntimeException("服务调用失败，已达到最大重试次数");
                }
            } catch (Exception e) {
                System.out.println("第" + attempt + "次调用异常: " + e.getMessage());
                if (attempt == maxRetries) {
                    throw new RuntimeException("服务调用失败");
                }
            }
            
            // 等待一段时间后重试
            try {
                Thread.sleep(1000 * attempt);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("重试被中断");
            }
        }
        throw new RuntimeException("未知错误");
    });
}
```

## 实现原理

### 1. 内部结构
CompletableFuture 内部维护了以下关键组件：
- **result**：存储任务执行结果
- **stack**：存储依赖此 Future 的其他任务（Completion 链）
- **executor**：执行任务的线程池

### 2. 任务依赖管理
```java
// 简化的依赖管理逻辑
public <U> CompletableFuture<U> thenApply(
    Function<? super T,? extends U> fn) {
    return uniApplyStage(null, fn);
}

private <V> CompletableFuture<V> uniApplyStage(
    Executor e, Function<? super T,? extends V> f) {
    if (f == null) throw new NullPointerException();
    CompletableFuture<V> d = new CompletableFuture<V>();
    if (e != null || !d.uniApply(this, f, null)) {
        UniApply<T,V> c = new UniApply<T,V>(e, d, this, f);
        push(c);
        c.tryFire(SYNC);
    }
    return d;
}
```

### 3. 异步执行机制
```java
// 异步执行的核心逻辑
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier,
                                                   Executor executor) {
    if (supplier == null || executor == null)
        throw new NullPointerException();
    CompletableFuture<U> f = new CompletableFuture<U>();
    executor.execute(new AsyncSupply<U>(f, supplier));
    return f;
}

static final class AsyncSupply<T> extends ForkJoinTask<T>
    implements Runnable, AsynchronousCompletionTask {
    final CompletableFuture<T> dep;
    final Supplier<T> fn;
    
    AsyncSupply(CompletableFuture<T> dep, Supplier<T> fn) {
        this.dep = dep; this.fn = fn;
    }
    
    public final void run() {
        CompletableFuture<T> d; Supplier<T> f;
        if ((d = dep) != null && (f = fn) != null) {
            dep = null; fn = null;
            if (d.result == null) {
                try {
                    d.completeValue(f.get());
                } catch (Throwable ex) {
                    d.completeThrowable(ex);
                }
            }
            d.postComplete();
        }
    }
}
```

## 优缺点分析

### 优点
1. **强大的异步编排能力**：支持复杂的任务依赖关系
2. **函数式编程风格**：链式调用，代码简洁
3. **完善的异常处理**：内置多种异常处理机制
4. **灵活的线程池管理**：支持自定义线程池
5. **超时和取消支持**：提供任务控制能力

### 缺点
1. **学习曲线较陡**：API 较多，需要时间掌握
2. **调试困难**：异步调用栈难以追踪
3. **内存泄漏风险**：不当使用可能导致对象无法回收
4. **性能开销**：相比直接调用有一定性能损失

## 最佳实践

### 1. 使用自定义线程池
```java
// 创建专用的线程池
ExecutorService customExecutor = new ThreadPoolExecutor(
    10, 50, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),
    new ThreadFactory() {
        private final AtomicInteger counter = new AtomicInteger(1);
        
        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "completable-pool-" + counter.getAndIncrement());
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 使用自定义线程池
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // 业务逻辑
    return "结果";
}, customExecutor);
```

### 2. 避免阻塞操作
```java
// 不推荐：在主线程中阻塞等待
String result = future.get();

// 推荐：使用回调处理结果
future.thenAccept(result -> {
    // 处理结果
    System.out.println("异步结果: " + result);
});
```

### 3. 合理处理异常
```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // 业务逻辑
    return "结果";
}).exceptionally(ex -> {
    // 记录日志
    logger.error("任务执行异常", ex);
    // 返回默认值或重新抛出异常
    return "默认值";
}).whenComplete((result, ex) -> {
    // 清理资源
    if (ex != null) {
        // 异常处理
    } else {
        // 正常处理
    }
});
```

### 4. 避免内存泄漏
```java
// 及时取消不再需要的任务
CompletableFuture<String> future = ...;

// 设置超时
future.orTimeout(30, TimeUnit.SECONDS);

// 必要时手动取消
if (future.isDone() && !future.isCompletedExceptionally()) {
    // 正常处理
} else {
    future.cancel(true);
}
```

### 5. 监控和调试
```java
// 添加调试信息
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    System.out.println("开始执行任务，线程: " + Thread.currentThread().getName());
    try {
        return "结果";
    } finally {
        System.out.println("任务执行完成");
    }
}).whenComplete((result, ex) -> {
    System.out.println("任务完成，结果: " + result + ", 异常: " + ex);
});
```

## 总结

CompletableFuture 是 Java 异步编程的重要工具，提供了强大的任务编排能力。通过合理使用其丰富的 API，可以编写出高效、健壮的异步代码。

在实际开发中，应注意线程池管理、异常处理、资源清理等最佳实践，避免常见的陷阱。随着对 CompletableFuture 的深入理解，可以更好地利用其优势构建复杂的异步系统。

最后更新时间：2024-01-15