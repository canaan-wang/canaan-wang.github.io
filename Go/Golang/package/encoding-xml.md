# encoding/xml

## 概览
- XML 编解码，支持标签与嵌套结构。

## 常用用法
```go
var v Value
_ = xml.Unmarshal(data, &v)
out, _ := xml.Marshal(v)
```
- 标签：`xml:"name,attr"`、`xml:"parent>child"`。

## 技术原理
- 基于标记解析器与反射；支持命名空间与属性。

## 最佳实践
- 明确结构标签与命名空间；避免深层嵌套造成性能问题。