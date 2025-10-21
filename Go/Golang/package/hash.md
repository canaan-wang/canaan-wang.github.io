# hash

## 概览
- 非加密哈希家族与接口定义：`hash.Hash`、`Hash32`、`Hash64`。
- 常用子包：`hash/crc32`、`hash/adler32`、`hash/fnv` 等。

## 常用用法
```go
// CRC32 一次性校验
sum := crc32.ChecksumIEEE(data)

// FNV 增量计算
h := fnv.New32a()
h.Write([]byte("hello"))
h.Write([]byte(" world"))
fmt.Println(h.Sum32())
```
- 统一接口：`Write(p []byte)`、`Sum(b []byte)`、`Reset()`、`Size()`、`BlockSize()`。

## 技术原理
- 流式/增量处理：允许分块写入，适合大数据或流式场景。
- 多种算法与参数（如 CRC32 多项式）；实现注重速度与低开销。

## 最佳实践
- 非加密哈希不适合安全场景（请使用 `crypto/*`）。
- 根据用途选择算法：校验用 `crc32`，简单散列可用 `fnv`。