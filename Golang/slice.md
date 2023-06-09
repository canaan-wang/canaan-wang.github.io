## 模型
- 包含一个底层数组指针、slice 当前长度、容量的结构体

## 创建
```go
s1 := make(type, 0, 10)// type、len、cap
```
- 使用 make 内置函数创建切片，Go 编译器不允许 append 的返回值不被使用
- 在 slice 所需容量已知的情况下，尽可能设置 cap

```go
s1 = append(s1, 1)
```
- 使用 append 为切片追加元素
- 切片为 nil 时，append 时会创建一个切片然后追加元素
- Go 编译后 append 会被修改为 runtime.growslice -> runtime.convTslice 的调用

## 获取容量
```go
cap1 := cap(s1)
```
- 使用 cap 获取切片容量
- 切片为 nil 时返回 0

## 获取长度
```go
len1 := len(s1)
```
- 使用 len 获取切片的当前长度
- 切片为 nil 时返回 0

## 深拷贝
```gp
copy(srcSlice, dstSlice)
```
- 使用 copy 可从 srcSlice 深拷贝元素到 dstSlice
- copy 数量为 src、dst 的 len 最小值
- src 为 string，dst 为 byte 时，可将字符串中的字节复制到切片中

## 扩容
- 扩容规律：
    - 所需 cap 大于 slice cap 的两倍时，new slice cap 等于所需 cap
    - 小于 2 倍，且原 slice 元素 len 小于 1024 时，new slice cap 为原 slice cap 的两倍
    - 小于 2 倍，且原 slice 元素 len 大于等于 1024 时，new slice cap 为 原 slice cap 不断做 1.25 扩容直到大于所需 cap 时的结果
- 扩容值得到后，还需要做内存对齐，最后 slice 的 new cap 为内存对齐后的 cap，相近于计算后的扩容值
- slice 扩容后，原数组相关的 slice 并不受到影响