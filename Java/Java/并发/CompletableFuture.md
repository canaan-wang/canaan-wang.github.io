# CompletableFuture 异步编排

- 核心能力：
  - 任务组合：thenApply、thenCompose（扁平化）、thenCombine、allOf/anyOf。
  - 异常处理：exceptionally、handle。
  - 并行执行：supplyAsync/runAsync 及自定义线程池。
  - 超时与取消：orTimeout、completeOnTimeout、cancel。
- 示例：
```
CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> "B");
String r = a.thenCombine(b, (x, y) -> x + y).join();
```
- 最佳实践：
  - 使用自定义线程池，避免默认 ForkJoinPool 任务干扰。
  - 明确异常处理链，避免隐性阻塞或吞掉异常。