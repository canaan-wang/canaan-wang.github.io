# bufio

## 概览
- 为 `io.Reader/Writer` 提供缓冲，提高小块读写效率。

## 常用用法
```go
r := bufio.NewReader(os.Stdin)
s := bufio.NewScanner(file)
w := bufio.NewWriter(os.Stdout)
```
- `Scanner`：逐行/逐 token 读取（默认按行）。
- `Reader`：`Peek`/`ReadLine`/`ReadString`。
- `Writer`：`WriteString` 后 `Flush()`。

## 技术原理
- 减少系统调用次数，通过内部缓冲区批量读写。
- `Scanner` 使用分词器；注意行长与 token 大小限制（可通过 `Buffer` 调整）。

## 最佳实践
- 读大文件时优先 `Reader.Read`；对行文本用 `Scanner`。
- 写入后确保 `Flush()`；或包裹在 `defer w.Flush()`。