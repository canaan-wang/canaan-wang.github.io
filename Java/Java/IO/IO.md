## IOIO
### NIO
- 提供高速、面向块的 IO，通过定义包含数据的类以及块的形式处理数据，由 Buffer、Channel、Selector 组成
- Buffer：包含要写入、读出的数据，任何时候访问 NIO 的数据，都是通过 Buffer 操作的
- Channel：用于读取、写入数据，与 stream 不同，它是双向的
- Selector：不断轮询注册的 Channel，底层使用 epoll