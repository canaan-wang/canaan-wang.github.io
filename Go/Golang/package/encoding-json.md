# encoding/json

## 概览
- JSON 编码解码，支持结构体标签与自定义编解码器。

## 常用用法
```go
var u User
_ = json.Unmarshal(data, &u)
out, _ := json.Marshal(u)
```
- 标签：`json:"name,omitempty"` 控制字段名与省略。
- 流式：`json.Decoder`/`json.Encoder` 适合大数据量。

## 技术原理
- 反射驱动的编解码；`Marshaler`/`Unmarshaler` 接口可自定义逻辑。

## 最佳实践
- 大量吞吐场景考虑使用 `Encoder`/`Decoder`；避免多次 `Marshal` 复制。