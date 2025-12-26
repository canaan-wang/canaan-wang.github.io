基于 `context` 的核心原理与使用流程，我设计了 **5 个关键 Mermaid 图**，覆盖**上下文层级结构**、**取消信号传播**、**超时机制流程**、**WithValue 查找链路**、**HTTP 服务超时控制** 场景，可直接在 Mermaid Live Editor 或 VS Code 插件中渲染。

### 1. Context 层级结构与派生关系
展示根上下文、可取消上下文、超时上下文、带值上下文的层级派生关系。
```mermaid
graph TD
    A["context.Background()<br/>(emptyCtx 根上下文)"] --> B["WithCancel(parent)<br/>(cancelCtx 可取消)"]
    A --> C["WithValue(parent, key, val)<br/>(valueCtx 带值)"]
    B --> D["WithTimeout(parent, 5s)<br/>(timerCtx 超时)"]
    B --> E["WithValue(parent, key2, val2)<br/>(valueCtx 嵌套)"]
    D --> F["WithValue(parent, key3, val3)<br/>(valueCtx 多层嵌套)"]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#bfb,stroke:#333,stroke-width:2px
```

### 2. cancelCtx 取消信号传播流程
展示父上下文取消时，递归取消所有子上下文的核心逻辑。
```mermaid
graph TD
    A["调用 parentCtx.cancel()"] --> B["加锁 sync.Mutex"]
    B --> C{"判断是否已取消？<br/>c.err != nil?"}
    C -->|是| D["直接返回（幂等性）"]
    C -->|否| E["设置 c.err = Canceled"]
    E --> F["关闭 c.done 通道<br/>触发监听 Goroutine 退出"]
    F --> G["遍历 c.children 子上下文集合"]
    G --> H["调用 child1.cancel()"]
    G --> I["调用 child2.cancel()"]
    H --> J["child1 关闭自身 done 通道<br/>递归取消其子孙"]
    I --> K["child2 关闭自身 done 通道<br/>递归取消其子孙"]
    G --> L["清空 c.children 释放内存"]
    L --> M["从父上下文移除当前节点"]
    M --> N["解锁"]

    style F fill:#faa,stroke:#333,stroke-width:2px
```

### 3. timerCtx 超时机制执行流程
展示 `WithTimeout` 从创建到超时自动取消的完整步骤。
```mermaid
graph TD
    A["调用 WithTimeout(parent, 2s)"] --> B{"父上下文 deadline 更早？"}
    B -->|是| C["复用父上下文取消逻辑"]
    B -->|否| D["创建 timerCtx 嵌入 cancelCtx"]
    D --> E["注册到父上下文 children 集合"]
    E --> F["计算超时时间差 dur=2s"]
    F --> G{"dur <= 0?"}
    G -->|是| H["立即触发 cancel，错误=DeadlineExceeded"]
    G -->|否| I["创建 time.Timer，dur 后执行取消"]
    I --> J["返回 ctx 和 cancel 函数"]
    J --> K["超时触发 timer 回调"]
    K --> L["调用 timerCtx.cancel()"]
    L --> M["关闭 done 通道 + 取消子上下文"]
    L --> N["停止 timer 释放资源"]

    style I fill:#bfa,stroke:#333,stroke-width:2px
    style L fill:#faa,stroke:#333,stroke-width:2px
```

### 4. WithValue 键值对递归查找链路
展示多层 `valueCtx` 嵌套时，`Value(key)` 的查找流程。
```mermaid
graph TD
    A["调用 ctx.Value(targetKey)"] --> B["当前 ctx 是 valueCtx?"]
    B -->|否| C["是否到根 emptyCtx?"]
    C -->|是| D["返回 nil（未找到）"]
    B -->|是| E{"当前 ctx.key == targetKey?"}
    E -->|是| F["返回 ctx.val（找到）"]
    E -->|否| G["递归调用父上下文 Value(targetKey)"]
    G --> B

    style E fill:#ff9,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
```

### 5. HTTP 服务 Context 超时控制实战流程
展示实际业务中，HTTP 请求如何通过 `context` 实现超时控制。
```mermaid
graph TD
    A["客户端发起 HTTP 请求"] --> B["服务端 handler 获取 r.Context()"]
    B --> C["创建 5s 超时上下文 ctx, cancel"]
    C --> D["defer cancel() 兜底释放资源"]
    D --> E["启动 Goroutine 执行数据库查询"]
    E --> F{"监听 ctx.Done() 或查询完成?"}
    F -->|查询完成（3s）| G["返回查询结果给客户端"]
    F -->|超时触发（5s）| H["返回 504 超时错误"]
    G --> I["调用 cancel() 提前释放"]
    H --> J["ctx.Err() = DeadlineExceeded"]

    style C fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#ff9,stroke:#333,stroke-width:2px
```

### 渲染说明
1. 复制任意 Mermaid 代码，粘贴到 [Mermaid Live Editor](https://mermaid.live/)；
2. 点击 **Render** 按钮即可生成可视化图表；
3. 如需调整样式，可修改 `fill`（背景色）、`stroke`（边框色）等参数。

是否需要补充 **多 Goroutine 协同取消** 场景的 Mermaid 图？