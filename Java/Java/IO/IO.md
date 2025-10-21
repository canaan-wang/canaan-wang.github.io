# Java IO 操作详解

## 定义与作用
Java IO（Input/Output）是Java语言中处理输入输出的核心API，提供了与外部系统（文件系统、网络、内存等）进行数据交互的能力。IO操作是Java程序与外部世界沟通的桥梁，广泛应用于文件读写、网络通信、数据序列化等场景。

## IO 发展历程

### 传统IO（BIO - Blocking IO）
Java 1.0引入的基于流的IO模型，采用阻塞式同步处理。

#### 字节流（Byte Streams）
```java
// 文件读取示例
FileInputStream fis = null;
try {
    fis = new FileInputStream("example.txt");
    int data;
    while ((data = fis.read()) != -1) {
        System.out.print((char) data);
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 字符流（Character Streams）
```java
// 使用BufferedReader提高读取效率
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("example.txt"));
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) {
        try {
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### NIO（New IO）
Java 1.4引入的非阻塞IO模型，提供更高效的IO处理能力。

#### 核心组件

**Buffer（缓冲区）**
- 数据容器，提供统一的读写接口
- 支持直接内存访问，减少数据拷贝
- 常用实现：ByteBuffer、CharBuffer、IntBuffer等

```java
// Buffer使用示例
ByteBuffer buffer = ByteBuffer.allocate(1024);

// 写入数据
buffer.put("Hello, NIO!".getBytes());

// 切换到读模式
buffer.flip();

// 读取数据
while (buffer.hasRemaining()) {
    System.out.print((char) buffer.get());
}
```

**Channel（通道）**
- 双向数据传输管道
- 支持文件、网络等多种数据源
- 常用实现：FileChannel、SocketChannel、ServerSocketChannel

```java
// FileChannel示例
try (FileChannel channel = FileChannel.open(
    Paths.get("example.txt"), 
    StandardOpenOption.READ)) {
    
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    while (channel.read(buffer) > 0) {
        buffer.flip();
        // 处理数据
        while (buffer.hasRemaining()) {
            System.out.print((char) buffer.get());
        }
        buffer.clear();
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

**Selector（选择器）**
- 多路复用器，监控多个Channel状态
- 基于事件驱动，提高并发处理能力
- 底层使用epoll（Linux）或kqueue（Mac）等系统调用

```java
// Selector使用示例
Selector selector = Selector.open();
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false);
serverChannel.socket().bind(new InetSocketAddress(8080));
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();
    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    Iterator<SelectionKey> iter = selectedKeys.iterator();
    
    while (iter.hasNext()) {
        SelectionKey key = iter.next();
        
        if (key.isAcceptable()) {
            // 处理连接请求
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel client = server.accept();
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
            // 处理读事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            client.read(buffer);
            // 处理接收到的数据
        }
        iter.remove();
    }
}
```

### NIO.2（Java 7+）
Java 7引入的增强IO API，提供更现代化的文件操作接口。

#### Files 和 Paths 类
```java
// 使用Files类简化文件操作
Path path = Paths.get("example.txt");

// 读取文件内容
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);

// 写入文件
Files.write(path, "Hello, NIO.2!".getBytes(), StandardOpenOption.CREATE);

// 文件复制
Files.copy(Paths.get("source.txt"), Paths.get("target.txt"), 
    StandardCopyOption.REPLACE_EXISTING);
```

#### 异步文件操作
```java
// 异步文件读取
AsynchronousFileChannel asyncChannel = AsynchronousFileChannel.open(
    Paths.get("example.txt"), StandardOpenOption.READ);

ByteBuffer buffer = ByteBuffer.allocate(1024);
asyncChannel.read(buffer, 0, buffer, new CompletionHandler<Integer, ByteBuffer>() {
    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        attachment.flip();
        byte[] data = new byte[attachment.limit()];
        attachment.get(data);
        System.out.println(new String(data));
    }
    
    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        exc.printStackTrace();
    }
});
```

## IO 模型对比分析

| 特性 | BIO | NIO | NIO.2 |
|------|-----|-----|-------|
| 阻塞方式 | 阻塞 | 非阻塞 | 非阻塞/异步 |
| 线程模型 | 一线程一连接 | 多路复用 | 多路复用/异步 |
| 性能 | 较低 | 较高 | 最高 |
| 复杂度 | 简单 | 复杂 | 中等 |
| 适用场景 | 连接数少 | 连接数多 | 高并发场景 |

## 最佳实践

### 1. 资源管理
```java
// 使用try-with-resources自动关闭资源
try (FileInputStream fis = new FileInputStream("file.txt");
     BufferedReader reader = new BufferedReader(new InputStreamReader(fis))) {
    // 处理文件
} catch (IOException e) {
    e.printStackTrace();
}
```

### 2. 缓冲区优化
```java
// 使用合适的缓冲区大小
int bufferSize = 8192; // 8KB缓冲区
byte[] buffer = new byte[bufferSize];
int bytesRead;
while ((bytesRead = inputStream.read(buffer)) != -1) {
    outputStream.write(buffer, 0, bytesRead);
}
```

### 3. 文件操作优化
```java
// 使用Files类进行批量操作
Path sourceDir = Paths.get("source");
Path targetDir = Paths.get("target");

Files.walk(sourceDir)
    .forEach(sourcePath -> {
        Path targetPath = targetDir.resolve(sourceDir.relativize(sourcePath));
        try {
            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            e.printStackTrace();
        }
    });
```

## 总结
Java IO体系经历了从BIO到NIO再到NIO.2的演进，提供了不同层次的IO处理能力。选择合适的IO模型和API对于构建高性能、可扩展的Java应用至关重要。在实际开发中，应根据具体场景选择最合适的IO方案，并遵循最佳实践来确保代码的效率和可靠性。

最后更新时间：2024-01-15