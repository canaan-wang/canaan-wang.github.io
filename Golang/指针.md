## 指针（unsafe 包）
### Go 指针限制
- Go 指针不能进行数学运算
- 不同类型的指针不能相互转换
- 不同类型的指针不能进行等值计算
- 不同类型的指针变量不能相互赋值
### unsafe 包使用
- 任何类型的指针和 unsafe.Pointer 可以相互转换。
- uintptr 类型和 unsafe.Pointer 可以相互转换。
- pointer 不能直接进行数学运算，但可以把它转换成 uintptr，对 uintptr 类型进行数学运算，再转换成 pointer 类型。
- unsafe 包中 pointer uintptr 用来计算变量内存地址，非常危险，将内存地址转为变量相应类型的指针可直接修改其值。
- 同一个包内的私有成员变量，使用 unsafe.Offsetof 可获取其偏移量
- 不同包内的私有成员变量，使用 unsafe.Sizeof() 获取成员大小，进而计算内存地址
```go
func main() {
    p := Programmer{"stefno", 18, "go"}
    fmt.Println(p)
    lang := (*string)(unsafe.Pointer(uintptr(unsafe.Pointer(&p)) + unsafe.Sizeof(int(0)) + unsafe.Sizeof(string(""))))
    *lang = "Golang"
    fmt.Println(p)
}
```